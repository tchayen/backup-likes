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
mkdir likes
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

Downloaded tweets can contain mentions, referenced tweets and attachments.

### `src/loadLikesToDb.mjs`

Run only once!

Loads likes to SQLite database. Creates users, referenced tweets and media too.

### _DO NOT USE_ `src/fetchUsersForTweets.mjs`

Iterates `liked` table in DB, fetches author profiles, saves them to the DB.

Will be replaced by just `src/likes.mjs`.

## TODO

- [x] Download list of liked tweets.
- [ ] Rebuild the script to populate DB from the liked tweets.
- [ ] Resolve shortened URLs (https://t.co/XXXXXXXXXX -> full link).
- [ ] Resolve media?
