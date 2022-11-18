import sqlite from "sqlite3";
import readline from "readline";

export function paramsToObject(entries) {
  const result = {};
  for (const [key, value] of entries) {
    result[key] = value;
  }
  return result;
}

export function openDb() {
  return new sqlite.Database("database.db", sqlite.OPEN_READWRITE, (error) => {
    if (error) {
      console.error(error);
    }
  });
}

const Readline = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export async function commandLineInput(prompt) {
  return new Promise(async (resolve, reject) => {
    Readline.question(prompt, (out) => {
      Readline.close();
      resolve(out);
    });
  });
}
