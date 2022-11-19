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

export async function checkIfMediaExists(db, id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) FROM media WHERE id = ?", [id], (error, row) => {
      if (error) {
        reject(error);
      } else {
        resolve(Object.entries(row)[0][1] > 0);
      }
    });
  });
}

export async function addMedia(db, id, media) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO media (id, type, url, preview_image_url, alt_text) VALUES (?, ?, ?, ?, ?, ?)",
      [id, media.type, media.url, media.preview_image_url, media.alt_text],
      (error) => {
        if (error) {
          reject(error);
        }
        resolve();
      }
    );
  });
}

export async function addMediaIfNotExists(db, id, media) {
  if (await checkIfMediaExists(db, id)) {
    console.log("Media already exists.");
    return false;
  }

  await addMedia(db, id, media);

  return true;
}

export async function checkIfTweetExists(db, id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) FROM tweets WHERE id = ?", [id], (error, row) => {
      if (error) {
        reject(error);
      } else {
        resolve(Object.entries(row)[0][1] > 0);
      }
    });
  });
}

export async function addMention(db, id, mention) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO mentions (id, tweet_id, author_id) VALUES (?, ?, ?)",
      [id, mention.tweet_id, mention.author_id],
      (error) => {
        if (error) {
          reject(error);
        }
        resolve();
      }
    );
  });
}

export async function addAttachment(db, attachment) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO attachments (tweet_id, media_key) VALUES (?, ?)",
      [attachment.tweet_id, attachment.media_key],
      (error) => {
        if (error) {
          reject(error);
        }
        resolve();
      }
    );
  });
}

export async function addReferencedTweet(db, referencedTweet) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO referenced_tweets (tweet_id, type, id) VALUES (?, ?, ?)",
      [referencedTweet.tweet_id, referencedTweet.type, referencedTweet.id],
      (error) => {
        if (error) {
          reject(error);
        }
        resolve();
      }
    );
  });
}
