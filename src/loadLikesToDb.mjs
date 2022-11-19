// RUN ONLY ONCE.
import fs from "fs";
import { openDb } from "./utils.mjs";
import { addLikedTweet } from "./db.mjs";

const db = openDb();

db.run(
  "CREATE TABLE IF NOT EXISTS liked(" +
    "id TEXT PRIMARY KEY NOT NULL," +
    "text TEXT NOT NULL," +
    "author_id TEXT NOT NULL," +
    "created_at DATETIME NOT NULL," +
    "lang TEXT NOT NULL," +
    "conversation_id TEXT NOT NULL," +
    "in_reply_to_user_id TEXT DEFAULT NULL" +
    ")"
);

db.run(
  "CREATE TABLE IF NOT EXISTS users(" +
    "id TEXT PRIMARY KEY," +
    "name TEXT NOT NULL," +
    "username TEXT NOT NULL," +
    "created_at DATETIME NOT NULL," +
    "description TEXT," +
    "location TEXT," +
    "profile_image_url TEXT," +
    "url TEXT" +
    ")"
);

db.run(
  "CREATE TABLE IF NOT EXISTS media(" +
    "id TEXT PRIMARY KEY," +
    "type TEXT NOT NULL," +
    "url TEXT," +
    "preview_image_url TEXT," +
    "alt_text TEXT" +
    ")"
);

db.run(
  "CREATE TABLE IF NOT EXISTS referenced_tweets(" +
    "id TEXT PRIMARY KEY," +
    "tweet_id TEXT NOT NULL," +
    "type TEXT NOT NULL" +
    ")"
);

db.run(
  "CREATE TABLE IF NOT EXISTS attachments(" +
    "tweet_id TEXT NOT NULL," +
    "media_key TEXT NOT NULL" +
    ")"
);

db.run(
  "CREATE TABLE IF NOT EXISTS mentions(" +
    "tweet_id TEXT," +
    "author_id TEXT," +
    "username TEXT" +
    ")"
);

const likedFiles = fs.readdirSync("./likes");

for await (const file of likedFiles) {
  const liked = JSON.parse(fs.readFileSync(`./likes/${file}`, "utf8"));
  for await (const tweet of liked.data) {
    await addLikedTweet(db, tweet);
  }

  // TODO: add other.
}

// TODO: this script hangs, I am unsure why.

db.close();
