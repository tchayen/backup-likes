import { sortedByDate } from "@/utils/sortedByDate";
import Link from "next/link";
import { useEffect, useState } from "react";

export const getStaticProps = async () => {
  const directory = await sortedByDate();

  return {
    props: {
      hello: "world",
      directory,
    },
  };
};

// Read and set page in the URL bar.
export default function Index(
  props: Awaited<ReturnType<typeof getStaticProps>>["props"]
) {
  const pageCount = props.directory.length;
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/page?number=${page}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data);
      });
  }, [page]);

  const formatTweet = (tweet: string) => {
    return tweet
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
      .replace(
        /(^|\s)@(\w+)/g,
        '$1<a href="https://twitter.com/$2" target="_blank">@$2</a>'
      )
      .replace(
        /(^|\s)#(\w+)/g,
        '$1<a href="https://twitter.com/hashtag/$2" target="_blank">#$2</a>'
      );
  };

  const mapReferencedTypeToLabel = {
    replied_to: "Replied to",
    quoted: "Quoted",
  };

  return (
    <div className="flex justify-center bg-black">
      <div className="flex flex-col w-600px">
        <div className="flex items-center gap-4 p-4 text-white border-l border-r border-slate-900">
          <div>
            Current page: <strong>{page}</strong> Total pages:{" "}
          </div>
          <div>
            <strong>{pageCount}</strong>
          </div>
          <button
            onClick={() => setPage(page - 1)}
            className="bg-slate-800 font-bold rounded px-2 h-8"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            className="bg-slate-800 font-bold rounded px-2 h-8"
          >
            Next
          </button>
        </div>
        <div className="flex flex-col divide-y border-l border-t border-r border-slate-900 divide-slate-900">
          {data?.map((tweet) => {
            return (
              <div key={tweet.id} className="text-slate-400 flex flex-col p-4">
                <div className="flex gap-3">
                  <img
                    className="rounded-full w-12 h-12"
                    src={tweet.user.profile_image_url}
                    alt={`Avatar of ${tweet.user.name}`}
                  />
                  <div className="flex flex-col">
                    <div className="flex gap-1 whitespace-nowrap break-keep">
                      <div className="text-white font-bold ">
                        {tweet.user.name}
                      </div>
                      <div>
                        <Link
                          target="_blank"
                          rel="noreferrer"
                          href={`https://twitter.com/${tweet.user.username}`}
                        >
                          @{tweet.user.username}
                        </Link>
                      </div>
                      <div>{tweet.created_at}</div>
                      <div>
                        <Link
                          target="_blank"
                          rel="noreferrer"
                          href={`https://twitter.com/${tweet.user.username}/status/${tweet.id}`}
                        >
                          Tweet
                        </Link>
                      </div>
                    </div>
                    <div
                      dangerouslySetInnerHTML={{
                        // TODO: find usernames.
                        __html: formatTweet(tweet.text),
                      }}
                    />
                    {tweet.attachments && (
                      <div className="mt-4 flex flex-col gap-4">
                        {tweet.attachments.map((attachment) => {
                          if (attachment.type === "photo") {
                            return (
                              <img
                                className="rounded overflow-hidden"
                                src={attachment.url}
                                alt="Tweet attachment"
                              />
                            );
                          }
                        })}
                      </div>
                    )}
                    {tweet.referenced_tweets && (
                      <div className="mt-4 flex flex-col gap-4">
                        {tweet.referenced_tweets.map((referenced_tweet) => {
                          return (
                            <div
                              key={referenced_tweet.id}
                              className="flex flex-col gap-2"
                            >
                              <div>
                                Type:{" "}
                                {
                                  mapReferencedTypeToLabel[
                                    referenced_tweet.type
                                  ]
                                }
                              </div>
                              <div
                                className="p-4 rounded bg-slate-900"
                                dangerouslySetInnerHTML={{
                                  __html: formatTweet(referenced_tweet.text),
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* <div>{JSON.stringify(tweet.attachments)}</div> */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
