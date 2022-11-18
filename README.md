It's all WIP. Currently downloads list of tweets divided into files.

## Install

Go to [Developer portal](https://developer.twitter.com/en/portal/projects/) and set up account if needed. Create a project etc. Generate access tokens. Copy all received tokens.

```bash
export export TWITTER_BEARER_TOKEN=$YOUR_TOKEN
export TWITTER_USER_ID=$YOUR_ID
git clone git@github.com:tchayen/backup-likes.git
cd backup-likes
mkdir archive
yarn
```

## Run

```bash
node scripts.mjs
```

## Info

Saves tweets to `archive/`.
