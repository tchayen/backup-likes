// RUN ONLY ONCE.
import fs from "fs";
import { openDb } from "./utils.mjs";

const db = openDb();

db.run(
  "CREATE TABLE IF NOT EXISTS liked(" +
    "text TEXT," +
    "author_id VARCHAR(128)," +
    "created_at DATETIME," +
    "lang VARCHAR(128)," +
    "conversation_id VARCHAR(128)" +
    ")"
);

const likedFiles = fs.readdirSync("./likes");

likedFiles.forEach((file) => {
  const liked = JSON.parse(fs.readFileSync(`./likes/${file}`, "utf8"));
  liked.forEach((tweet) => {
    db.run(
      "INSERT INTO liked (text, author_id, created_at, lang, conversation_id) VALUES (?, ?, ?, ?, ?)",
      [
        tweet.text,
        tweet.author_id,
        tweet.created_at,
        tweet.lang,
        tweet.conversation_id,
      ],
      (error) => {
        if (error) {
          console.error(error);
        }
      }
    );
  });
});

db.close();
