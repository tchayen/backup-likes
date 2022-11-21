// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { sortedByDate } from "@/utils/sortedByDate";
import { File, Media, ReferencedTweet, Tweet, User } from "@/types";

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

  const file: File = JSON.parse(
    await fs.promises.readFile(`../likes/${directory[Number(number)]}`, "utf-8")
  );

  const tweets = await Promise.all(
    file.data.map(async (tweet: Tweet) => {
      const user = file.includes.users.find(
        (user: User) => user.id === tweet.author_id
      );

      return {
        id: tweet.id,
        text: tweet.text,
        ...(tweet.attachments && tweet.attachments.media_keys
          ? {
              attachments: tweet.attachments.media_keys
                .map((id: string) => {
                  return file.includes.media.find(
                    (media: Media) => media.media_key === id
                  );
                })
                .filter(Boolean),
            }
          : {}),
        ...(tweet.referenced_tweets
          ? {
              referenced_tweets: tweet.referenced_tweets.map(
                (referenced_tweet: ReferencedTweet) => {
                  const referenced = file.includes.tweets.find(
                    (tweet: Tweet) => tweet.id === referenced_tweet.id
                  );

                  if (!referenced) {
                    return referenced_tweet;
                  }

                  const author = file.includes.users.find(
                    (user: User) => user.id === referenced.author_id
                  );

                  const attachments =
                    referenced.attachments && referenced.attachments.media_keys
                      ? referenced.attachments.media_keys
                          .map((id: string) => {
                            return file.includes.media.find(
                              (media: Media) => media.media_key === id
                            );
                          })
                          .filter(Boolean)
                      : [];

                  return {
                    ...referenced,
                    user: author,
                    type: referenced_tweet.type,
                    ...(attachments.length > 0 ? { attachments } : {}),
                  };
                }
              ),
            }
          : {}),
        user,
        created_at: tweet.created_at,
      };
    })
  );

  res.status(200).json(tweets);
}
