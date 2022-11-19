// RUN ONLY ONCE.
import fs from "fs";
import { openDb } from "./utils.mjs";
import { addLikedTweet } from "./db.mjs";

const db = openDb();

db.run(
  "CREATE TABLE IF NOT EXISTS liked(" +
    "id TEXT PRIMARY KEY," +
    "text TEXT," +
    "author_id VARCHAR(128)," +
    "created_at DATETIME," +
    "lang VARCHAR(128)," +
    "conversation_id VARCHAR(128)" +
    ")"
);

const likedFiles = fs.readdirSync("./likes");

for await (const file of likedFiles) {
  const liked = JSON.parse(fs.readFileSync(`./likes/${file}`, "utf8"));
  for await (const tweet of liked.data) {
    await addLikedTweet(db, tweet);
  }

  // TODO: handle authors too.
}

// TODO: this script hangs, I am unsure why.

db.close();
