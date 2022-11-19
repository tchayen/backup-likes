// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { sortedByDate } from "@/utils/sortedByDate";
import { exec } from "child_process";

async function getUrl(url: string) {
  return new Promise((resolve, reject) =>
    exec(
      `curl -Ls -o /dev/null -w %{url_effective} ${url}`,
      (error, stdout, stderr) => {
        resolve(stdout);
      }
    )
  );
}

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { number } = req.query;

  if (Array.isArray(number) || !number) {
    res.status(400).json({ error: "Bad Request" });
    return;
  }

  const directory = await sortedByDate();

  const file = JSON.parse(
    await fs.promises.readFile(`../likes/${directory[Number(number)]}`, "utf-8")
  );

  const tweets = await Promise.all(
    file.data.map(async (tweet) => {
      const urlsInText = [...tweet.text.matchAll(/(https?:\/\/[^\s]+)/g)].map(
        (m) => m[0]
      );

      const resolvedUrls = await Promise.all(
        urlsInText.map((url) => getUrl(url))
      );

      const mapping = {};
      for (let i = 0; i < urlsInText.length; i++) {
        mapping[urlsInText[i]] = resolvedUrls[i];
      }

      const replacedText = tweet.text.replace(/(https?:\/\/[^\s]+)/g, (url) => {
        return mapping[url];
      });

      return {
        id: tweet.id,
        text: replacedText,
        ...(tweet.attachments && tweet.attachments.media_keys
          ? {
              attachments: tweet.attachments.media_keys.map((attachment) => {
                return file.includes.media.find(
                  (media) => media.media_key === attachment
                );
              }),
            }
          : {}),
        ...(tweet.referenced_tweets
          ? {
              referenced_tweets: tweet.referenced_tweets.map(
                (referenced_tweet) => {
                  const referenced = file.includes.tweets.find(
                    (tweet) => tweet.id === referenced_tweet.id
                  );

                  if (!referenced) {
                    return referenced_tweet;
                  }

                  const author = file.includes.users.find(
                    (user) => user.id === referenced.author_id
                  );

                  return { ...referenced, author, type: referenced_tweet.type };
                }
              ),
            }
          : {}),
        user: file.includes.users.find((user) => user.id === tweet.author_id),
        created_at: tweet.created_at,
      };
    })
  );

  res.status(200).json(tweets);
}
