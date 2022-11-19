It's all WIP.

Inspired by code from [Twitter API V2 Sample Code](https://github.com/twitterdev/Twitter-API-v2-sample-code).

## Install

### Requirements

- Go to [Developer portal](https://developer.twitter.com/en/portal/projects/) and set up account if needed. Create a project etc. Generate access tokens. Copy all received tokens.
- Install SQLite.

Then run:

```bash
git clone git@github.com:tchayen/backup-likes.git
cd backup-likes
mv .env.template .env
mkdir archive
yarn
sqlite3 database.db
```

Then fill the `.env` file with your information.

## Run

```bash
# 1. Download likes
node src/likes.mjs
# 2. Store them in DB.
node src/loadLikesToDb.mjs
# 3. Fetch tweet authors.
node src/fetchUsersForTweets.mjs
# WIP
```

## Docs

### `src/likes.mjs`

Downloads all tweets liked by you to directory `likes/`. Likes will be divided into ~100 per file.

Shape of received files:

```ts
{
  text: string, // Tweet content.
  author_id: string, // User ID.
  created_at: string, // 2019-04-30T09:43:33.000Z
  lang: string, // en
  conversation_id: string, // Tweet ID
  edit_history_tweet_ids: string[] // Tweet IDs.
},
```

### `src/loadLikesToDb.mjs`

Run only once!

Loads likes to SQLite database. Skips `edit_history_tweet_ids`.

### `src/fetchUsersForTweets.mjs`

Iterates `liked` table in DB, fetches author profiles, saves them to the DB.

### `src/fetchTweetDetails.mjs` WIP

Not working for now. Figuring out some problem with authentication.

Iterates `liked` table in DB, fetches tweet details and populates them to the db.

## TODO

- [x] Download list of liked tweets.
- [ ] Resolve tweet details (attachments, media).
- [x] Resolve authors (username, name, avatar).
- [ ] Resolve shortened URLs (https://t.co/XXXXXXXXXX -> full link).

```

```
