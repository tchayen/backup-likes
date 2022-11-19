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
```

Then fill the `.env` file with your information.

## Run

```bash
# 1. Download likes
node src/likes.mjs
# 2. Open viewer.
cd viewer
yarn
yarn dev
# 3. Go to localhost:3000
```

## Docs

### `src/likes.mjs`

Downloads all tweets liked by you to directory `likes/`. Likes will be divided into ~100 per file.

Downloaded tweets can contain mentions, referenced tweets and attachments.

### _CURRENTLY NOT USED_ `src/loadLikesToDb.mjs`

_Run only once, it doesn't check for uniqueness._

Loads likes to SQLite database. Creates users, referenced tweets and media too.

### _CURRENTLY NOT USED_ `src/fetchUsersForTweets.mjs`

Iterates `liked` table in DB, fetches author profiles, saves them to the DB.

## TODO

- [x] Long username can make tweet overflow.
- [x] Style replied and quoted tweets.
- [ ] Resolve URLs in referenced tweets.
- [ ] Images need some border, maybe.
- [ ] Make sure that referenced tweets have full width.
- [ ] Store resolved links locally, do it once.
- [ ] Fetch images (avatars, attachments) locally.
