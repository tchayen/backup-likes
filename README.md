It's all WIP. Currently downloads list of tweets divided into files.

Inspired by code from [Twitter API V2 Sample Code](https://github.com/twitterdev/Twitter-API-v2-sample-code).

## Install

Go to [Developer portal](https://developer.twitter.com/en/portal/projects/) and set up account if needed. Create a project etc. Generate access tokens. Copy all received tokens.

```bash
git clone git@github.com:tchayen/backup-likes.git
cd backup-likes
mv .env.template .env
mkdir archive
yarn
```

Then fill the `.env` file with your information.

## Run

```bash
node scripts.mjs
```

## Info

Saves tweets to `archive/`.

## TODO

- [x] Download list of liked tweets.
- [ ] Resolve tweet details (attachments, media).
- [ ] Resolve authors (username, name, avatar).
- [ ] Resolve shortened URLs (https://t.co/XXXXXXXXXX -> full link).
