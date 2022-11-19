/**
 * @param {*} tweet with id, text, author_id, created_at, lang, conversation_id
 */
export async function addLikedTweet(db, tweet) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO liked (id, text, author_id, created_at, lang, conversation_id) VALUES (?, ?, ?, ?, ?, ?)",
      [
        tweet.id,
        tweet.text,
        tweet.author_id,
        tweet.created_at,
        tweet.lang,
        tweet.conversation_id,
      ],
      (error) => {
        if (error) {
          reject(error);
        }
        resolve();
      }
    );
  });
}

/**
 * Returns size of liked table.
 */
export async function getLikedCount(db) {
  return new Promise((resolve, reject) => {
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
 * @param {*} db Datase.
 * @param {*} limit Users per page.
 * @param {*} offset Starting after how many users.
 */
export async function getAuthors(db, limit, offset) {
  return new Promise((resolve, reject) => {
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
}

async function checkIfAuthorExists(db, authorId) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT COUNT(*) FROM users WHERE id = ?",
      [authorId],
      (error, row) => {
        if (error) {
          reject(error);
        } else {
          resolve(Object.entries(row)[0][1] > 0);
        }
      }
    );
  });
}

async function addUser(db, id, user) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (id, name, username, created_at, description, location, profile_image_url, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        user.name,
        user.username,
        user.created_at,
        user.description,
        user.location,
        user.profile_image_url,
        user.url,
      ],
      (error) => {
        if (error) {
          reject(error);
        }
        resolve();
      }
    );
  });
}

/**
 * @returns false if user already exists, true if user was added.
 */
export async function addUserIfNotExists(db, id, user) {
  if (await checkIfAuthorExists(db, id)) {
    console.log("Author already exists.");
    return false;
  }

  await addUser(db, id, user);

  return true;
}
