import fs from "fs";

export async function sortedByDate() {
  const directory = (await fs.promises.readdir("../likes"))
    .map((fileName) => {
      return {
        name: fileName,
        time: fs.statSync(`../likes/${fileName}`).mtime.getTime(),
      };
    })
    .sort((a, b) => a.time - b.time)
    .map((file) => file.name);

  return directory;
}
