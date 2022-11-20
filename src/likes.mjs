import fetch from "node-fetch";
import fs from "fs";
import { exec } from "child_process";
import { sleep } from "./utils.mjs";

const saveTo = "likes_with_links";

async function getUrl(url) {
  return new Promise((resolve, reject) =>
    exec(
      `curl -Ls -o /dev/null -w %{url_effective} ${url}`,
      (error, stdout, stderr) => {
        resolve(stdout);
      }
    )
  );
}

if (!process.env.TWITTER_BEARER_TOKEN) {
  throw new Error('Missing "TWITTER_BEARER_TOKEN" environment variable.');
}

if (!process.env.TWITTER_USER_ID) {
  throw new Error('Missing "TWITTER_USER_ID" environment variable.');
}

const token = process.env.TWITTER_BEARER_TOKEN;
const id = process.env.TWITTER_USER_ID;

const endpointURL = `https://api.twitter.com/2/users/${id}/liked_tweets`;

async function resolveLinksInTweet(tweet) {
  const urlsInText = [...tweet.text.matchAll(/(https?:\/\/[^\s]+)/g)].map(
    (m) => m[0]
  );

  const resolvedUrls = await Promise.all(urlsInText.map((url) => getUrl(url)));

  const mapping = {};
  for (let i = 0; i < urlsInText.length; i++) {
    mapping[urlsInText[i]] = resolvedUrls[i];
  }

  const replacedText = tweet.text.replace(/(https?:\/\/[^\s]+)/g, (url) => {
    return mapping[url];
  });

  const replaced = {
    ...tweet,
    text: replacedText,
  };

  console.log(`Resolved links in tweet ${tweet.id}.`);

  return replaced;
}

async function resolveLinks(response) {
  const data = { ...response };

  for (let i = 0; i < data.data.length; i++) {
    data.data[i] = await resolveLinksInTweet(data.data[i]);
  }

  for (let i = 0; i < data.includes.tweets.length; i++) {
    data.includes.tweets[i] = await resolveLinksInTweet(
      data.includes.tweets[i]
    );
  }

  return data;
}

async function getLikes() {
  let stop = false;
  let requests = 0;
  let nextToken = null;
  while (!stop) {
    const params = {
      ...(nextToken ? { pagination_token: nextToken } : {}),
      max_results: 100,
      expansions:
        "attachments.media_keys,author_id,referenced_tweets.id,in_reply_to_user_id,entities.mentions.username,referenced_tweets.id.author_id",
      // https://developer.twitter.com/en/docs/twitter-api/fields
      "tweet.fields":
        "lang,author_id,conversation_id,created_at,referenced_tweets",
      "user.fields":
        "name,username,created_at,description,location,profile_image_url,url",
      "media.fields": "type,url,preview_image_url,alt_text",
    };

    try {
      const request = await fetch(
        `${endpointURL}?${new URLSearchParams(params).toString()}`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      requests += 1;

      const response = await request.json();
      console.log(response);
      const responseWithResolvedLinks = await resolveLinks(response);

      const path = `./${saveTo}/tweets${nextToken ? `-${nextToken}` : ""}.json`;
      fs.writeFile(
        path,
        JSON.stringify(responseWithResolvedLinks, null, 4),
        (error) => {
          if (error) {
            throw new Error(error);
          }
          console.log(`${path} written.`);
        }
      );

      if (response.meta.next_token) {
        nextToken = response.meta.next_token;
      } else {
        stop = true;
      }

      // No more waiting as resolving links is slow.
      // // https://developer.twitter.com/en/docs/twitter-api/tweets/likes/migrate#:~:text=min%20(per%20App)-,75%20requests%20per%2015%20min%20(per%20user),-Requires%20the%20use
      // // API allows for 75 requests per 15 minutes per user. So it gives 5 requests per minute, so one per 12 seconds.
      // await sleep(12_000);
    } catch (error) {
      throw new Error(error);
    }
  }
}

(async () => {
  try {
    await getLikes();
  } catch (error) {
    console.error(error);
    process.exit(-1);
  }
  process.exit();
})();
