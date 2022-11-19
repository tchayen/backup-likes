import fetch from "node-fetch";
import { sleep, openDb } from "./utils.mjs";
import { oauth, authenticate } from "./authenticate.mjs";

const params = "tweet.fields=lang,author_id&user.fields=created_at"; // Edit optional query parameters here

// "expansions=attachments.media_keys&tweet.fields=id,author_id,text,created_at,lang,conversation_id&media.fields=media_key,preview_image_url,type,url,alt_text";

/**
 *
 * @param {*} ids Array of IDs.
 */
async function getTweets(ids, { oauth_token, oauth_token_secret }) {
  const token = {
    key: oauth_token,
    secret: oauth_token_secret,
  };

  const endpointURL = `https://api.twitter.com/2/tweets?ids=${ids.join(
    ","
  )}?${params}`;

  const authHeader = oauth.toHeader(
    oauth.authorize(
      {
        url: endpointURL,
        method: "GET",
      },
      token
    )
  );

  const request = await fetch(endpointURL, {
    method: "GET",
    headers: {
      Authorization: authHeader["Authorization"],
    },
  });

  const response = await request.json();
  return response;
}

(async () => {
  const db = openDb();
  const oAuthAccessToken = await authenticate();
  // const count = await getLikedCount(db);
  // const requests = Math.ceil(count / 100);

  // for (let i = 0; i < requests; i++) {
  //   const offset = i * 100;
  //   const limit = 100;

  //   const authors = await getAuthors(db, limit, offset);

  //   for await (const author of authors) {
  //     const user = await getUser(author, oAuthAccessToken);
  //     await addUserIfNotExists(db, author, user.data);
  //     console.log(user.data);

  //     // https://developer.twitter.com/en/docs/twitter-api/rate-limits
  //     // 300 per 15 minutes, 20 per minute, 1 per 3 seconds.
  //     await sleep(3_000);
  //   }
  // }
  const t = await getTweets(
    [1278747501642657792, 1275828087666679809],
    oAuthAccessToken
  );
  console.log(t);

  db.close();
})();
