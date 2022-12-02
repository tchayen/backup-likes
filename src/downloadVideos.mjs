import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import { spawn } from "child_process";
import fetch from "node-fetch";
import m3u8Parser from "m3u8-parser";
import { getTime, sleep } from "./utils.mjs";

// Initially based on https://github.com/h4ckninja/twitter-video-downloader/blob/master/twitter-dl.py,
// extended to support GIFs and newer video format.

const savedTo = "likes";
const saveTs = "videos";
const saveTo = "viewer/public/videos";

if (!process.env.TWITTER_BEARER_TOKEN) {
  throw new Error('Missing "TWITTER_BEARER_TOKEN" environment variable.');
}

const bearerToken = process.env.TWITTER_BEARER_TOKEN;

const headers = {
  Authorization: `Bearer ${bearerToken}`,
  Accept: "application/json",
};

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
    headers,
  });
  const copy = request.clone();
  try {
    const response = await request.json();
    // console.log(url, util.inspect(response));
    console.log(url);
    return response;
  } catch (error) {
    console.error(`Error. Not a JSON: ${await copy.text()}`);
    return;
  }
}

async function getPlaylistsM3u8(url) {
  const request = await fetch(url);
  const response = await request.text();
  console.log(url);
  return response;
}

async function getSinglePlaylistM3u8(videoHost, uri) {
  const playlistUrl = `${videoHost}${uri}`;
  const request = await fetch(playlistUrl);
  const response = await request.text();
  console.log(playlistUrl);
  return response;
}

async function getBlobFile(url) {
  const request = await fetch(url);
  const response = await request.arrayBuffer();
  return Buffer.from(response);
}

async function processTsVideo(inputFile, outputFile) {
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

async function processM4sVideo(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    const process = spawn("ffmpeg", [
      "-y",
      "-i",
      inputFile,
      "-vcodec",
      "copy",
      "-strict",
      "-2",
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

function cleanUpTsFile(blobFilePath) {
  try {
    fs.statSync(blobFilePath); // Check if exists. If it errors - no file, no problem.
    fs.unlinkSync(blobFilePath);
  } catch {}
}

async function downloadPlaylist(playbackUrl, media_key, mp4FilePath) {
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

  const extension = singlePlaylistManifest.segments[0].uri.split(".").pop();
  const blobFilePath = `./${saveTs}/${media_key}.${
    extension === "ts" ? "ts" : "mp4"
  }`;

  // Make sure that file doesn't exist.
  cleanUpTsFile(blobFilePath);

  try {
    // Download init file if applicable. They are used with *.m4s files.
    const line = singlePlaylist
      .split("\n")
      .filter((line) => line.startsWith("#EXT-X-MAP:URI"));
    if (line.length === 1) {
      const url = line[0].split("=")[1].split('"')[1];
      const fileName = `${videoHost}${url}`;
      console.log(`Downloading init file ${fileName}`);
      const blob = await getBlobFile(fileName);
      fs.appendFileSync(blobFilePath, blob, "binary");
    }

    for await (const segment of singlePlaylistManifest.segments) {
      const blobUrl = `${videoHost}${segment.uri}`;
      console.log(`Downloading ${blobUrl}`);
      const blob = await getBlobFile(blobUrl);
      fs.appendFileSync(blobFilePath, blob, "binary");
    }
  } catch (error) {
    // If something went wrong for whatever reason, delete the incomplete *.ts/*.m4s file.
    console.error(error);
    cleanUpTsFile(blobFilePath);
  }

  if (extension === "ts") {
    await processTsVideo(blobFilePath, mp4FilePath);
  } else if (extension === "m4s") {
    await processM4sVideo(blobFilePath, mp4FilePath);
  }
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

    if (response.track.playbackUrl.split(".").pop().startsWith("m3u8")) {
      await downloadPlaylist(
        response.track.playbackUrl,
        media_key,
        mp4FilePath
      );
    } else if (response.track.playbackUrl.split(".").pop().startsWith("mp4")) {
      await downloadMp4(mp4FilePath, response.track.playbackUrl);
    } else {
      console.error(`Unexpected file: ${response.track.playbackUrl}`);
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
