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

## Docs

### `likes.mjs`

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

### `loadLikesToDb.mjs`

Run only once!

Loads likes to SQLite database. Skips `edit_history_tweet_ids`.

### `fetchUsersForTweets.mjs`

Iterates `liked` table in DB and fetches author profiles.

## TODO

- [x] Download list of liked tweets.
- [ ] Resolve tweet details (attachments, media).
- [ ] Resolve authors (username, name, avatar).
- [ ] Resolve shortened URLs (https://t.co/XXXXXXXXXX -> full link).

```

```
