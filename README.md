Script for downloading Twitter likes with viewer app.

![Screenshot of the viewer app](screenshots/1.png)

## Install

### Set up Twitter Developer Account

- Go to [Developer portal](https://developer.twitter.com/en/portal/projects/) and set up account if needed. Create a project etc. Generate access tokens. Copy all received tokens.
- Install SQLite.

### Download repository

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

## TODO

- [x] Long username can make tweet overflow.
- [x] Style replied and quoted tweets.
- [x] Resolve URLs in referenced tweets.
- [x] Store resolved links locally, do it once.
- [x] Make sure that referenced tweets have full width.
- [x] Fetch images (avatars, attachments) locally.
- [ ] Move `/assets` to `/viewer/public/assets`.
- [ ] Fetch videos locally.
