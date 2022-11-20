import { sortedByDate } from "@/utils/sortedByDate";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Media, ReferencedTweet, Tweet, User } from "@/types";
import { Attachments } from "@/components/Attachments";
import { Pager } from "@/components/Pager";
import { Avatar } from "@/components/Avatar";
import { TopBar } from "@/components/TopBar";
import { StyledLink } from "@/components/StyledLink";
import { FormattedTweet } from "@/components/FormattedTweet";

export const getStaticProps = async ({
  params,
}: {
  params: { page: string };
}) => {
  const directory = await sortedByDate();

  return {
    props: {
      directory,
      page: params.page,
    },
  };
};

export const getStaticPaths = async () => {
  const directory = await sortedByDate();

  return {
    paths: directory.map((_, i) => ({
      params: {
        page: `${i + 1}`,
      },
    })),
    fallback: false,
  };
};

export default function Index(
  props: Awaited<ReturnType<typeof getStaticProps>>["props"]
) {
  const router = useRouter();

  const pageCount = props.directory.length;
  const [page, setPage] = useState<number>(Number(props.page) - 1);
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

  useEffect(() => {
    router.events.on("routeChangeStart", (url) => {
      const page = url.split("/").pop();

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
    });
    // Following: https://nextjs.org/docs/api-reference/next/router#usage-6
    // eslint-disable-next-line
  }, []);

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
          router={router}
        />
        <div className="flex flex-col divide-y divide-slate-800 border-l border-t border-b border-r border-slate-800">
          {data?.map((tweet) => {
            return (
              <div key={tweet.id} className="flex flex-col p-4 text-slate-400">
                <div className="flex gap-3">
                  <Avatar user={tweet.user} />
                  <div className="flex w-full flex-col gap-2">
                    <TopBar user={tweet.user} created_at={tweet.created_at} />
                    <FormattedTweet tweet={tweet.text} />
                    <Attachments attachments={tweet.attachments} />
                    {tweet.referenced_tweets && (
                      <div className="flex w-full flex-col gap-2">
                        {tweet.referenced_tweets.map(
                          (
                            referenced_tweet: Tweet &
                              ReferencedTweet & {
                                user: User;
                                attachments: Media[];
                              }
                          ) => {
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
                                  {referenced_tweet.user && (
                                    <Avatar user={referenced_tweet.user} />
                                  )}
                                  <div className="flex flex-col gap-1">
                                    {referenced_tweet.user && (
                                      <TopBar
                                        user={referenced_tweet.user}
                                        created_at={referenced_tweet.created_at}
                                      />
                                    )}
                                    {referenced_tweet.text && (
                                      <FormattedTweet
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
          router={router}
        />
      </div>
    </div>
  );
}
