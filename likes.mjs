import fetch from "node-fetch";
import fs from "fs";
import { sleep } from "./utils.mjs";

if (!process.env.TWITTER_BEARER_TOKEN) {
  throw new Error('Missing "TWITTER_BEARER_TOKEN" environment variable.');
}

if (!process.env.TWITTER_USER_ID) {
  throw new Error('Missing "TWITTER_USER_ID" environment variable.');
}

const token = process.env.TWITTER_BEARER_TOKEN;
const id = process.env.TWITTER_USER_ID;

const endpointURL = `https://api.twitter.com/2/users/${id}/liked_tweets`;

async function getLikes() {
  let stop = false;
  let requests = 0;
  let nextToken = null;
  while (!stop) {
    const params = {
      ...(nextToken ? { pagination_token: nextToken } : {}),
      max_results: 100,
      // https://developer.twitter.com/en/docs/twitter-api/fields
      "tweet.fields":
        "lang,author_id,conversation_id,created_at,referenced_tweets",
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

      const path = `./archive/tweets${nextToken ? `-${nextToken}` : ""}.json`;
      fs.writeFile(path, JSON.stringify(response.data, null, 4), (error) => {
        if (error) {
          throw new Error(error);
        }
        console.log(`${path} written.`);
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.meta.next_token) {
        nextToken = response.meta.next_token;
      } else {
        stop = true;
      }

      // https://developer.twitter.com/en/docs/twitter-api/tweets/likes/migrate#:~:text=min%20(per%20App)-,75%20requests%20per%2015%20min%20(per%20user),-Requires%20the%20use
      // API allows for 75 requests per 15 minutes per user. So it gives 5 requests per minute, so one per 12 seconds.
      await sleep(12_000);
    } catch (error) {
      throw new Error(error);
    }
  }
}

(async () => {
  try {
    const response = await getLikes();
    console.dir(response, {
      depth: null,
    });
  } catch (error) {
    console.error(error);
    process.exit(-1);
  }
  process.exit();
})();
