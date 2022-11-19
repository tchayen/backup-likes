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
  const [page, setPage] = useState(68);
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

  console.log(data);
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
                    </div>
                    <div
                      dangerouslySetInnerHTML={{
                        // TODO: find usernames.
                        __html: tweet.text.replaceAll(
                          /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim,
                          '<a href="$&" target="_blank" rel="noreferrer">$&</a>'
                        ),
                      }}
                    />
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