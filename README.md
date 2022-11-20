Script for downloading Twitter likes with viewer app. Includes optional script to download images locally.

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

### Install deps of viewer app

```bash
cd viewer
yarn
```

### Fetch data

```bash
node src/likes.mjs # Download liked tweets.
node src/downloadImages.mjs # Download images locally.
```

## Run

```bash
yarn dev
```

Go to [localhost:3000](http://localhost:3000).

## TODO

- [ ] Fetch videos locally.
