import fs from "fs";
import fetch from "node-fetch";

const savedTo = "likes";
const saveTo = "viewer/public/videos";

const videoAPI = "https://api.twitter.com/1.1/videos/tweet/config/";

if (!process.env.TWITTER_BEARER_TOKEN) {
  throw new Error('Missing "TWITTER_BEARER_TOKEN" environment variable.');
}

const bearerToken = process.env.TWITTER_BEARER_TOKEN;

// [
//   ...tweet.text.matchAll(
//     new RegExp(
//       `(https:\/\/twitter.com\/${user?.username}\/status\/${tweet.id}\/[^\s]+)`,
//       "g"
//     )
//   ),
// ]
//   .map((m) => m[0])
//   .forEach((url) => {
//     console.log(url);
//   });

let runOnce = false;

async function downloadVideoFromTweet(media) {
  if (runOnce) {
    return;
  }

  runOnce = true;

  const tweetId = "1352367448339730432";

  const request = await fetch(
    `https://api.twitter.com/1.1/videos/tweet/config/${tweetId}.json`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${bearerToken}`,
      },
    }
  );

  const response = await request.json();

  console.log(response);

  const m3u8Url = response.track.playbackUrl;

  const m3u8Request = await fetch(m3u8Url);
  const m3u8Response = await m3u8Request.text();

  console.log(m3u8Response);
}

async function getGuestToken() {
  const request = await fetch(
    "https://api.twitter.com/1.1/guest/activate.json",
    { method: "POST" }
  );

  const response = await request.json();
}
//

(async () => {
  const directory = fs.readdirSync(savedTo);

  for await (const file of directory) {
    // console.log(`Processing file ${file}`);

    const content = fs.readFileSync(`${savedTo}/${file}`, "utf8");
    const json = JSON.parse(content);
    for await (const media of json.includes.media) {
      if (media.type === "video") {
        await downloadVideoFromTweet(media);
      }
    }
  }
})();
