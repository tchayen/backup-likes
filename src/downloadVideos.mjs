import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import util from "util";
import { spawn } from "child_process";
import fetch from "node-fetch";
import m3u8Parser from "m3u8-parser";
import { getTime, sleep } from "./utils.mjs";

const savedTo = "likes";
const saveTs = "videos";
const saveTo = "viewer/public/videos";

if (!process.env.TWITTER_BEARER_TOKEN) {
  throw new Error('Missing "TWITTER_BEARER_TOKEN" environment variable.');
}

const bearerToken = process.env.TWITTER_BEARER_TOKEN;

function parseM3u8(m3u8) {
  const parser = new m3u8Parser.Parser();
  parser.push(m3u8);
  parser.end();
  return parser.manifest;
}

async function getTweetVideoConfig(tweetId) {
  const url = `https://api.twitter.com/1.1/videos/tweet/config/${tweetId}.json`;

  const request = await fetch(url, {
    method: "GET",
    headers: {
      authorization: `Bearer ${bearerToken}`,
    },
  });
  const response = await request.json();
  console.log(url);
  // console.log(url, util.inspect(response));
  return response;
}

async function getPlaylistsM3u8(url) {
  const request = await fetch(url, {
    headers: {
      headers: {
        authorization: `Bearer ${bearerToken}`,
      },
    },
  });
  const response = await request.text();
  console.log(url);
  return response;
}

async function getSinglePlaylistM3u8(videoHost, uri) {
  const playlistUrl = `${videoHost}${uri}`;
  const request = await fetch(playlistUrl, {
    headers: {
      headers: {
        authorization: `Bearer ${bearerToken}`,
      },
    },
  });
  const response = await request.text();
  console.log(playlistUrl);
  return response;
}

async function getTsFile(url) {
  const request = await fetch(url, {
    headers: {
      headers: {
        authorization: `Bearer ${bearerToken}`,
      },
    },
  });
  const response = await request.arrayBuffer();
  return Buffer.from(response);
}

async function processVideo(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    const process = spawn("ffmpeg", [
      "-y",
      "-i",
      inputFile,
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      outputFile,
    ]);
    process.stdout.on("data", (data) => {
      console.log(data);
    });

    process.stderr.setEncoding("utf8");
    process.stderr.on("data", (data) => {
      console.log(data);
    });

    process.on("close", (code) => {
      resolve(code);
    });
  });
}

function ifFileExists(filename) {
  try {
    fs.accessSync(filename);
    console.log(`${filename} already exists, skipping.`);
    return true;
  } catch {}
  return false;
}

async function downloadPlaylist(playbackUrl, tsFilePath, mp4FilePath) {
  const videoHost = new URL(playbackUrl).origin;
  const playlist = await getPlaylistsM3u8(playbackUrl);

  if (playlist.startsWith('{"error_code"')) {
    console.error(playlist);
    return;
  }

  const manifest = parseM3u8(playlist);

  // I download only biggest available size.
  const biggest = manifest.playlists.sort(
    (a, b) => b.attributes.BANDWIDTH - a.attributes.BANDWIDTH
  )[0];

  const singlePlaylist = await getSinglePlaylistM3u8(videoHost, biggest.uri);
  if (singlePlaylist.startsWith('{"error_code"')) {
    console.error(playlist);
    return;
  }

  const singlePlaylistManifest = parseM3u8(singlePlaylist);

  try {
    for await (const segment of singlePlaylistManifest.segments) {
      const tsUrl = `${videoHost}${segment.uri}`;
      console.log(`Downloading ${tsUrl}`);
      const ts = await getTsFile(tsUrl);
      fs.appendFileSync(tsFilePath, ts, "binary");
    }
  } catch (error) {
    // If something went wrong for whatever reason, delete the incomplete *.ts file.
    console.error(error);
    try {
      fs.statSync(tsFilePath); // Check if exists. If it errors - no file, no problem.
      fs.unlinkSync(tsFilePath);
    } catch {}
  }

  await processVideo(tsFilePath, mp4FilePath);
}

async function downloadMp4(gifFilePath, url) {
  if (ifFileExists(gifFilePath)) {
    return;
  }

  const request = await fetch(url);
  const response = await request.arrayBuffer();

  fs.writeFileSync(
    gifFilePath,
    Buffer.from(response, "binary"),
    "binary",
    (error) => {
      if (error) {
        console.error(error);
      }
    }
  );
}

async function downloadVideoFromTweet(tweetId, media_key) {
  console.log(getTime());

  const mp4FilePath = `./${saveTo}/${media_key}.mp4`;

  if (ifFileExists(mp4FilePath)) {
    return;
  }

  try {
    const response = await getTweetVideoConfig(tweetId);

    if (Array.isArray(response.errors)) {
      console.error(response.errors);

      if (response.errors[0].message === "Rate limit exceeded") {
        console.log("Rate limit exceeded, waiting 5 minutes.");
        await sleep(5 * 60 * 1000);
        return downloadVideoFromTweet(tweetId, media_key);
      }

      return;
    }

    if (response.track.playbackUrl.split(".").pop() === "m3u8") {
      const tsFilePath = `./${saveTs}/${media_key}.ts`;
      await downloadPlaylist(
        response.track.playbackUrl,
        tsFilePath,
        mp4FilePath
      );
    } else {
      await downloadMp4(mp4FilePath, response.track.playbackUrl);
    }
  } catch (error) {
    console.error(error);
  }
}

(async () => {
  // Make sure directories exists.
  if (!fs.existsSync(saveTs)) {
    fs.mkdirSync(saveTs);
  }

  if (!fs.existsSync(saveTo)) {
    fs.mkdirSync(saveTo, { recursive: true });
  }

  const directory = fs.readdirSync(savedTo);

  for (let i = 0; i < directory.length; i++) {
    const file = directory[i];
    console.log(`Processing file ${file} (${i + 1}/${directory.length})`);

    const content = fs.readFileSync(`${savedTo}/${file}`, "utf8");
    const json = JSON.parse(content);
    for await (const media of json.includes.media) {
      if (!["video", "animated_gif"].includes(media.type)) {
        continue;
      }

      const tweet = [...json.data, ...json.includes.tweets].find((tweet) => {
        if (!tweet.attachments || !tweet.attachments.media_keys) {
          return;
        }
        return tweet.attachments.media_keys.includes(media.media_key);
      });

      if (!tweet) {
        console.error(`Could not find tweet for media ${media.media_key}`);
        continue;
      }

      await downloadVideoFromTweet(tweet.id, media.media_key);
    }
  }
})();
