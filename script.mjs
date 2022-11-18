import fetch from "node-fetch";
import fs from "fs";

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
      "tweet.fields":
        "lang,author_id,conversation_id,created_at,referenced_tweets",
      "user.fields": "id,name,username",
      "media.fields": "media_key,type,url,preview_image_url,alt_text",
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

      if (requests > 2) {
        stop = true;
      }
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
