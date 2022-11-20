import { sortedByDate } from "@/utils/sortedByDate";
import Link from "next/link";
import { Dispatch, ReactNode, useEffect, useState } from "react";
import { format } from "date-fns";

type User = {
  name: string;
  username: string;
  id: string;
  created_at: string;
  profile_image_url: string;
  location: string;
  description: string;
};

const Avatar = ({ user }: { user: User }) => {
  return (
    <div className="h-12 w-12 flex-shrink-0 rounded-full bg-slate-900">
      <img
        className="h-12 w-12 rounded-full"
        src={user.profile_image_url.replace(
          "https://pbs.twimg.com/",
          "/assets/"
        )}
        alt={`Avatar of ${user.name}`}
      />
    </div>
  );
};

const TopBar = ({ user, created_at }: { user: User; created_at: string }) => {
  return (
    <div className="flex flex-wrap gap-1" style={{ width: 400 }}>
      <div className="overflow-hidden text-ellipsis whitespace-nowrap font-bold text-white">
        {user.name}
      </div>
      <div>
        <Link
          target="_blank"
          rel="noreferrer"
          href={`https://twitter.com/${user.username}`}
          className="rounded decoration-slate-600 decoration-2 underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          @{user.username}
        </Link>
      </div>
      ·
      <div className="whitespace-nowrap">
        {format(new Date(created_at), "do MMM yyyy")}
      </div>
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
      className="break-words break-all rounded text-slate-100 decoration-slate-600 decoration-2 underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-sky-500"
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

function Pager({
  page,
  setPage,
  setData,
  pageCount,
}: {
  page: number;
  setPage: Dispatch<number>;
  setData: Dispatch<any[]>;
  pageCount: number;
}) {
  const after = () => {
    setData([]);
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex items-center gap-4 p-4 text-white">
      <div>
        Current page: <strong>{page + 1}</strong> Total pages:{" "}
        <strong>{pageCount}</strong>
      </div>
      <button
        disabled={page === 0}
        onClick={() => {
          setPage(Math.max(page - 1, 0));
          after();
        }}
        className="h-8 rounded bg-slate-800 px-2 font-bold"
      >
        Previous
      </button>
      <button
        disabled={page + 1 === pageCount}
        onClick={() => {
          setPage(Math.min(page + 1, pageCount - 1));
          after();
        }}
        className="h-8 rounded bg-slate-800 px-2 font-bold"
      >
        Next
      </button>
    </div>
  );
}

function Attachments({ attachments }: { attachments: any[] }) {
  if (!Array.isArray(attachments)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {attachments.map((attachment: any) => {
        if (attachment.type === "photo") {
          return (
            <img
              key={attachment.media_key}
              className="overflow-hidden rounded-xl"
              src={attachment.url.replace("https://pbs.twimg.com/", "/assets/")}
              alt="Tweet attachment"
            />
          );
        }
      })}
    </div>
  );
}

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
  const [page, setPage] = useState<number>(180);
  const [data, setData] = useState<any[]>([]);

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

  return (
    <div className="flex justify-center">
      <div className="flex w-600px flex-col">
        <Pager
          page={page}
          setPage={setPage}
          setData={setData}
          pageCount={pageCount}
        />
        <div className="flex flex-col divide-y divide-slate-800 border-l border-t border-b border-r border-slate-800">
          {data?.map((tweet) => {
            return (
              <div key={tweet.id} className="flex flex-col p-4 text-slate-400">
                <div className="flex gap-3">
                  <Avatar user={tweet.user} />
                  <div className="flex w-full flex-col gap-2">
                    <TopBar user={tweet.user} created_at={tweet.created_at} />
                    <FormatTweet tweet={tweet.text} />
                    <Attachments attachments={tweet.attachments} />
                    {tweet.referenced_tweets && (
                      <div className="flex w-full flex-col gap-2">
                        {tweet.referenced_tweets.map(
                          (referenced_tweet: any) => {
                            return (
                              <div
                                key={referenced_tweet.id}
                                className="flex w-full flex-col gap-2"
                              >
                                <div className="italic">
                                  {
                                    mapReferencedTypeToLabel[
                                      referenced_tweet.type as keyof typeof mapReferencedTypeToLabel
                                    ]
                                  }
                                  :
                                </div>
                                <div className="flex gap-3 rounded-xl border border-slate-800 p-4">
                                  {referenced_tweet.author && (
                                    <Avatar user={referenced_tweet.author} />
                                  )}
                                  <div className="flex flex-col gap-1">
                                    {referenced_tweet.author && (
                                      <TopBar
                                        user={referenced_tweet.author}
                                        created_at={referenced_tweet.created_at}
                                      />
                                    )}
                                    {referenced_tweet.text && (
                                      <FormatTweet
                                        tweet={referenced_tweet.text}
                                      />
                                    )}
                                    <Attachments
                                      attachments={referenced_tweet.attachments}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
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
            );
          })}
        </div>
        <Pager
          page={page}
          setPage={setPage}
          setData={setData}
          pageCount={pageCount}
        />
      </div>
    </div>
  );
}
