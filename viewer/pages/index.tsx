import { sortedByDate } from "@/utils/sortedByDate";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { format } from "date-fns";

const Avatar = ({ user }) => {
  return (
    <img
      className="rounded-full w-12 h-12"
      src={user.profile_image_url}
      alt={`Avatar of ${user.name}`}
    />
  );
};

const TopBar = ({ user, created_at }) => {
  return (
    <div className="flex gap-1 break-keep">
      <div className="text-white font-bold whitespace-nowrap text-ellipsis overflow-hidden">
        {user.name}
      </div>
      <div>
        <Link
          target="_blank"
          rel="noreferrer"
          href={`https://twitter.com/${user.username}`}
        >
          @{user.username}
        </Link>
      </div>
      ·<div>{format(new Date(created_at), "do MMM yyyy")}</div>
    </div>
  );
};

const StyledLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => {
  return (
    <Link
      target="_blank"
      rel="noreferrer"
      href={href}
      className="rounded text-slate-100 decoration-slate-300 decoration-2 underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-sky-500 dark:decoration-slate-600"
    >
      {children}
    </Link>
  );
};

const FormatTweet = ({ tweet }: { tweet: string }) => {
  const split = tweet
    .replace(/(https?:\/\/[^\s]+)/g, "§$1§")
    .replace(/(^|\s)@(\w+)/g, "$1§@$2§")
    .replace(/(^|\s)#(\w+)/g, "$1§#$2§");

  return (
    <div>
      {split.split("§").map((part, i) => {
        if (part.startsWith("http")) {
          return (
            <StyledLink key={i} href={part}>
              {part}
            </StyledLink>
          );
        }

        if (part.startsWith("@")) {
          return (
            <StyledLink key={i} href={`https://twitter.com/${part.slice(1)}`}>
              {part}
            </StyledLink>
          );
        }

        if (part.startsWith("#")) {
          return (
            <StyledLink
              key={i}
              href={`https://twitter.com/hashtag/${part.slice(1)}`}
            >
              {part}
            </StyledLink>
          );
        }

        return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
      })}
    </div>
  );
};

export const getStaticProps = async () => {
  const directory = await sortedByDate();

  return {
    props: {
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

  const mapReferencedTypeToLabel = {
    replied_to: "Replied to",
    quoted: "Quoted",
  };

  // TODO:
  // - Images need some border, maybe.
  // - Long username can make tweet overflow.
  // - Style replied and quoted tweets.
  // - Make sure that referenced tweets have full width.

  return (
    <div className="flex justify-center bg-black">
      <div className="flex flex-col w-600px">
        <div className="flex items-center gap-4 p-4 text-white border-l border-r border-slate-800">
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
        <div className="flex flex-col divide-y border-l border-t border-r border-slate-800 divide-slate-800">
          {data?.map((tweet) => {
            return (
              <div key={tweet.id} className="text-slate-400 flex flex-col p-4">
                <div className="flex gap-3">
                  <Avatar user={tweet.user} />
                  <div className="flex flex-col">
                    <TopBar user={tweet.user} created_at={tweet.created_at} />
                    <FormatTweet tweet={tweet.text} />
                    <div className="mt-4 flex flex-col gap-4">
                      {tweet.attachments && (
                        <div className="flex flex-col gap-4">
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
                        <div className="flex flex-col gap-4">
                          {tweet.referenced_tweets.map((referenced_tweet) => {
                            return (
                              <div
                                key={referenced_tweet.id}
                                className="flex flex-col gap-2"
                              >
                                <div>
                                  {
                                    mapReferencedTypeToLabel[
                                      referenced_tweet.type
                                    ]
                                  }
                                  :
                                </div>
                                <div className="p-4 rounded bg-slate-900 flex gap-4">
                                  <Avatar user={referenced_tweet.author} />
                                  <div className="flex flex-col gap-2">
                                    {referenced_tweet.author && (
                                      <TopBar
                                        user={referenced_tweet.author}
                                        created_at={referenced_tweet.created_at}
                                      />
                                    )}
                                    <FormatTweet
                                      tweet={referenced_tweet.text}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div>
                        <StyledLink
                          href={`https://twitter.com/${tweet.user.username}/status/${tweet.id}`}
                        >
                          Go to tweet{" "}
                          <span className="text-slate-500">-&gt;</span>
                        </StyledLink>
                      </div>
                    </div>
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
