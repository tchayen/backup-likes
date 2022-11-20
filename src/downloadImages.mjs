import fs from "fs";

const savedTo = "likes";

async function downloadImage(url) {
  return new Promise((resolve, reject) =>
    // TODO: recreate original path of directories to make it easier to replace URLs and avoid duplicates.
    exec(
      `curl
        -Ls
        -o ${savedTo}/${url.split("/").pop()}
        ${url}`,
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    )
  );
}

(async () => {
  const directory = fs.readdirSync(savedTo);
  for await (const file of directory) {
    const content = fs.readFileSync(`${savedTo}/${file}`, "utf8");
    const json = JSON.parse(content);
    for await (const tweet of json.data) {
      const mediaLinks = tweet.text
        .matchAll(/(https:\/\/pbs.twimg.com\/media[^\s]+)/g)
        .map((m) => m[0]);

      for await (const link of mediaLinks) {
        await downloadImage(link);
      }
    }
  }
})();
