import fs from "fs";
import { exec } from "child_process";

const savedTo = "likes";
const saveTo = "viewer/public/images";

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const targetPath = `${saveTo}/${url.replace("https://pbs.twimg.com/", "")}`;

    try {
      fs.accessSync(targetPath);
      resolve();
      return;
    } catch {}

    console.log(`  Downloading ${url}`);

    exec(
      `curl -Ls --create-dirs -o ${targetPath} ${url}`,
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
}

(async () => {
  // Make sure directory exists.
  if (!fs.existsSync(saveTo)) {
    fs.mkdirSync(saveTo, { recursive: true });
  }

  const directory = fs.readdirSync(savedTo);
  for (let i = 0; i < directory.length; i++) {
    const file = directory[i];
    console.log(`Processing file ${file} (${i + 1}/${directory.length})`);

    const content = fs.readFileSync(`${savedTo}/${file}`, "utf8");
    const json = JSON.parse(content);
    for await (const media of json.includes.media) {
      if (media.url) {
        await downloadImage(media.url);
      }

      if (media.preview_image_url) {
        await downloadImage(media.preview_image_url);
      }
    }

    for await (const user of json.includes.users) {
      await downloadImage(user.profile_image_url);
    }
  }
})();
