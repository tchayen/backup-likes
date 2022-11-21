import fs from "fs";
import fetch from "node-fetch";
import m3u8Parser from "m3u8-parser";
import util from "util";
import { spawn } from "child_process";

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

let mock = false;
const mockConfig = {
  track: {
    contentType: "media_entity",
    publisherId: "835209520200699909",
    contentId: "1352365796601831425",
    durationMs: 26150,
    playbackUrl:
      "https://video.twimg.com/ext_tw_video/1352365796601831425/pu/pl/lVct4W4jKZY0dBse.m3u8?tag=10",
    playbackType: "application/x-mpegURL",
    expandedUrl:
      "https://twitter.com/0xca0a/status/1352367448339730432/video/1",
    vmapUrl: null,
    cta: null,
    shouldLoop: false,
    viewCount: "5,204",
    isEventGeoblocked: false,
    is360: false,
    mediaAvailability: { status: "available", reason: null },
  },
  posterImage:
    "https://pbs.twimg.com/ext_tw_video_thumb/1352365796601831425/pu/img/LSuLWAGMkLndoj6A.jpg",
  features: {
    isEdgeEnabled: true,
    bitrateCap: null,
    isDebuggingEnabled: false,
    fatalErrorRetryMax: 3,
    isLiveTimecodeEnabled: true,
    isClientMediaEventScribingEnabled: true,
  },
  translations: {
    "Watch now at %{hostname}": "Watch now at %{hostname}",
    'We cannot play the video in this browser.  Please try a different web browser or <a href="https://t.co/livevideobrowsers" style="color: #1DA1F2" target="_blank">update your cookie settings.</a>':
      'We cannot play the video in this browser.  Please try a different web browser or <a href="https://t.co/livevideobrowsers" style="color: #1DA1F2" target="_blank">update your cookie settings.</a>',
    "This video is not available in your location.":
      "This video is not available in your location.",
    "Visit %{hostname}": "Visit %{hostname}",
    'Playing this requires cookies from another Twitter domain (twimg.com). Allowing this briefly opens a new window and sets the cookie necessary to view this video. <a href="https://t.co/livevideobrowsers" style="color: #1DA1F2" target="_blank">Learn more</a>':
      'Playing this requires cookies from another Twitter domain (twimg.com). Allowing this briefly opens a new window and sets the cookie necessary to view this video. <a href="https://t.co/livevideobrowsers" style="color: #1DA1F2" target="_blank">Learn more</a>',
    "The media could not be played.": "The media could not be played.",
    "View on Periscope with hearts and chats":
      "View on Periscope with hearts and chats",
    "Sorry, this video is restricted in certain areas, please wait a few seconds as we acquire your location. Make sure to enable location settings in your browser.":
      "Sorry, this video is restricted in certain areas, please wait a few seconds as we acquire your location. Make sure to enable location settings in your browser.",
    Allow: "Allow",
    Ad: "Ad",
    "Ad by %{advertiserName}": "Ad by %{advertiserName}",
    "Copy Video Address": "Copy Video Address",
    "Ad · %{timeRemaining}": "Ad · %{timeRemaining}",
    "This broadcast is not available in your location.":
      "This broadcast is not available in your location.",
    "This media has been disabled in response to a report by the copyright owner":
      "This media has been disabled in response to a report by the copyright owner",
    LIVE: "LIVE",
    "This broadcast is not available.": "This broadcast is not available.",
    "Video not available due to a copyright claim by %{holder}":
      "Video not available due to a copyright claim by %{holder}",
    "This broadcast has ended.": "This broadcast has ended.",
    "We cannot play the video in this browser.  Please try a different web browser.":
      "We cannot play the video in this browser.  Please try a different web browser.",
    "%{viewCount} views": "%{viewCount} views",
    Skip: "Skip",
    "This video has been deleted.": "This video has been deleted.",
    "%{viewerCount} viewers": "%{viewerCount} viewers",
    "Ad by %{advertiserName} · %{timeRemaining}":
      "Ad by %{advertiserName} · %{timeRemaining}",
  },
};
const mockPlaylists = `#EXTM3U
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-STREAM-INF:BANDWIDTH=256000,RESOLUTION=432x270,CODECS="avc1.4d001e"
/ext_tw_video/1352365796601831425/pu/pl/432x270/KCyV-MPhLaLzvaGe.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=832000,RESOLUTION=576x360,CODECS="avc1.4d001f"
/ext_tw_video/1352365796601831425/pu/pl/576x360/wc8xuzkf1O8ahJwt.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2176000,RESOLUTION=1152x720,CODECS="avc1.640020"
/ext_tw_video/1352365796601831425/pu/pl/1152x720/uK-YcFXIG5kgDh6d.m3u8
`;
const mockSinglePlaylist = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-TARGETDURATION:3
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-ALLOW-CACHE:YES
#EXTINF:3.000,
/ext_tw_video/1352365796601831425/pu/vid/0/3000/432x270/YGyd6TtSuT2y_ER_.ts
#EXTINF:3.000,
/ext_tw_video/1352365796601831425/pu/vid/3000/6000/432x270/IDX-E8D2cfURpfAr.ts
#EXTINF:3.000,
/ext_tw_video/1352365796601831425/pu/vid/6000/9000/432x270/cQvGNmvlzv7EqBKN.ts
#EXTINF:3.000,
/ext_tw_video/1352365796601831425/pu/vid/9000/12000/432x270/wbTYKYVx45EtB0Qt.ts
#EXTINF:3.000,
/ext_tw_video/1352365796601831425/pu/vid/12000/15000/432x270/jgGCchTDlQlKnxZH.ts
#EXTINF:3.000,
/ext_tw_video/1352365796601831425/pu/vid/15000/18000/432x270/M_0-UFVlJMUoEndw.ts
#EXTINF:3.000,
/ext_tw_video/1352365796601831425/pu/vid/18000/21000/432x270/Ua7LSQdcf8yDW8iA.ts
#EXTINF:3.000,
/ext_tw_video/1352365796601831425/pu/vid/21000/24000/432x270/zM-c0U2LWLrrjcbY.ts
#EXTINF:2.150,
/ext_tw_video/1352365796601831425/pu/vid/24000/26150/432x270/j73GdgwIY1HEXLC2.ts
#EXT-X-ENDLIST
`;

async function getTweetVideoConfig(tweetId) {
  if (mock) {
    return mockConfig;
  } else {
    const url = `https://api.twitter.com/1.1/videos/tweet/config/${tweetId}.json`;

    const request = await fetch(url, {
      method: "GET",
      headers: {
        authorization: `Bearer ${bearerToken}`,
      },
    });

    const response = await request.json();
    console.log(url, util.inspect(response));
    return response;
  }
}

async function getPlaylistsM3u8(url) {
  if (mock) {
    return mockPlaylists;
  } else {
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
}

async function getSinglePlaylistM3u8(videoHost, uri) {
  if (mock) {
    return mockSinglePlaylist;
  } else {
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function ifFileExists(filename) {
  try {
    fs.accessSync(filename);
    console.log(`${filename} already exists, skipping.`);
    return true;
  } catch {}
  return false;
}

async function downloadPlaylist(playbackUrl, tsFilePath) {
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
  const mp4FilePath = `./${saveTo}/${media_key}.mp4`;

  if (ifFileExists(mp4FilePath)) {
    return;
  }

  const response = await getTweetVideoConfig(tweetId);

  if (Array.isArray(response.errors)) {
    console.error(response.errors);

    if (response.errors[0].message === "Rate limit exceeded") {
      console.log("Rate limit exceeded, waiting 1 minute.");
      await sleep(60 * 1000);
      return downloadVideoFromTweet(tweetId, media_key);
    }

    return;
  }

  if (response.track.playbackUrl.split(".").pop() === "m3u8") {
    const tsFilePath = `./${saveTs}/${media_key}.ts`;
    await downloadPlaylist(response.track.playbackUrl, tsFilePath);
  } else {
    await downloadMp4(mp4FilePath, response.track.playbackUrl);
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

  for await (const file of directory) {
    console.log(`Processing file ${file}`);

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
