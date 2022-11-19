import fetch from "node-fetch";
import { sleep, openDb } from "./utils.mjs";
import { oauth, authenticate } from "./authenticate.mjs";
import { getAuthors, getLikedCount, addUserIfNotExists } from "./db.mjs";

const params =
  "user.fields=name,username,created_at,description,location,profile_image_url,url";

async function getUser(userId, { oauth_token, oauth_token_secret }) {
  const token = {
    key: oauth_token,
    secret: oauth_token_secret,
  };

  const endpointURL = `https://api.twitter.com/2/users/${userId}?${params}`;

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

  db.run(
    "CREATE TABLE IF NOT EXISTS users(" +
      "id TEXT PRIMARY KEY," +
      "name VARCHAR(128)," +
      "username VARCHAR(128)," +
      "created_at DATETIME," +
      "description TEXT," +
      "location TEXT," +
      "profile_image_url TEXT," +
      "url TEXT" +
      ")"
  );

  const oAuthAccessToken = await authenticate();
  const count = await getLikedCount(db);
  const requests = Math.ceil(count / 100);

  for (let i = 0; i < requests; i++) {
    const offset = i * 100;
    const limit = 100;

    const authors = await getAuthors(db, limit, offset);

    for await (const author of authors) {
      const user = await getUser(author, oAuthAccessToken);

      if (!user.data) {
        console.error(user);
        return;
      }

      const added = await addUserIfNotExists(db, author, user.data);
      if (added) {
        console.log(user.data);

        // https://developer.twitter.com/en/docs/twitter-api/rate-limits
        // 300 per 15 minutes, 20 per minute, 1 per 3 seconds.
        await sleep(6_000);
      }
    }
  }

  db.close();
})();
