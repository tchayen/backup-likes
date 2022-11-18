import { openDb } from "./utils.mjs";

const db = openDb();

/**
 * Returns size of liked table.
 */
async function getLikedCount() {
  new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) FROM liked", (error, row) => {
      if (error) {
        reject(error);
      } else {
        resolve(Object.entries(row)[0][1]);
      }
    });
  });
}

/**
 * Returns list of author IDs from the liked table.
 * @param {*} limit Users per page.
 * @param {*} offset Starting after how many users.
 */
async function getAuthors(limit, offset) {
  const result = new Promise((resolve, reject) => {
    db.all(
      "SELECT author_id FROM liked LIMIT ? OFFSET ?",
      [limit, offset],
      (error, rows) => {
        if (error) {
          reject(error);
        } else {
          const array = [];
          rows.forEach((row) => {
            array.push(Object.entries(row)[0][1]);
          });
          resolve(array);
        }
      }
    );
  });

  return result;
}

(async () => {
  const count = await getCount();

  const requests = 1; //Math.ceil(count / 100);

  for (let i = 0; i < requests; i++) {
    const offset = i * 100;
    const limit = 100;

    const authors = await getAuthors(limit, offset);
  }

  db.close();
})();
