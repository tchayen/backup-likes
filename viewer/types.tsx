export type ReferencedTweet = {
  type: "replied_to" | "quoted";
  id: string;
};

export type Tweet = {
  edit_history_tweet_ids: string[];
  conversation_id: string;
  author_id: string;
  created_at: string;
  text: string;
  in_reply_to_user_id?: string;
  lang: string;
  id: string;
  entities?: {
    mentions: { start: number; end: number; username: string; id: string }[];
  };
  referenced_tweets?: ReferencedTweet[];
  attachments?: {
    media_keys: string[];
  };
};

export type User = {
  name: string;
  username: string;
  id: string;
  created_at: string;
  profile_image_url: string;
  location: string;
  description: string;
};

export type Photo = {
  media_key: string;
  type: "photo";
  url: string;
  alt_text?: string;
};

export type Video = {
  type: "video";
  preview_image_url: string;
  media_key: string;
};

export type Media = Photo | Video;

export type File = {
  data: Tweet[];
  includes: {
    users: User[];
    tweets: Tweet[];
    media: Media[];
  };
  errors: any[];
  meta: {
    result_count: number;
    next_token?: string;
    previous_token?: string;
  };
};
