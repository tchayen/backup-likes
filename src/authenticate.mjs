import crypto from "crypto";
import fetch from "node-fetch";
import OAuth from "oauth-1.0a";

import { paramsToObject, commandLineInput } from "./utils.mjs";

if (!process.env.TWITTER_CONSUMER_KEY) {
  throw new Error('Missing "TWITTER_CONSUMER_KEY" environment variable.');
}

if (!process.env.TWITTER_CONSUMER_SECRET) {
  throw new Error('Missing "TWITTER_CONSUMER_SECRET" environment variable.');
}

const consumerKey = process.env.TWITTER_CONSUMER_KEY;
const consumerSecret = process.env.TWITTER_CONSUMER_SECRET;

const requestTokenURL =
  "https://api.twitter.com/oauth/request_token?oauth_callback=oob";
const authorizeURL = new URL("https://api.twitter.com/oauth/authorize");
const accessTokenURL = "https://api.twitter.com/oauth/access_token";

export const oauth = OAuth({
  consumer: {
    key: consumerKey,
    secret: consumerSecret,
  },
  signature_method: "HMAC-SHA1",
  hash_function: (baseString, key) =>
    crypto.createHmac("sha1", key).update(baseString).digest("base64"),
});

async function getRequestToken() {
  const authHeader = oauth.toHeader(
    oauth.authorize({
      url: requestTokenURL,
      method: "POST",
    })
  );

  const request = await fetch(requestTokenURL, {
    method: "POST",
    headers: {
      Authorization: authHeader["Authorization"],
    },
  });

  const response = new URLSearchParams(await request.text());
  return paramsToObject(response.entries());
}

async function getAccessToken({ oauth_token, oauth_token_secret }, verifier) {
  const authHeader = oauth.toHeader(
    oauth.authorize({
      url: accessTokenURL,
      method: "POST",
    })
  );

  const path = `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauth_token}`;

  const request = await fetch(path, {
    method: "POST",
    headers: {
      Authorization: authHeader["Authorization"],
    },
  });

  const response = new URLSearchParams(await request.text());
  return paramsToObject(response.entries());
}

export async function authenticate() {
  const oAuthRequestToken = await getRequestToken();

  authorizeURL.searchParams.append(
    "oauth_token",
    oAuthRequestToken.oauth_token
  );
  console.log("Please go here and authorize:", authorizeURL.href);
  const pin = await commandLineInput("Paste the PIN here: ");

  const oAuthAccessToken = await getAccessToken(oAuthRequestToken, pin.trim());

  return oAuthAccessToken;
}
