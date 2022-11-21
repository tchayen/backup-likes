import { NextRouter } from "next/router";
import { Dispatch } from "react";

export function Pager({
  page,
  setPage,
  setData,
  pageCount,
  router,
}: {
  page: number;
  setPage: Dispatch<number>;
  setData: Dispatch<any[]>;
  pageCount: number;
  router: NextRouter;
}) {
  const updatePage = (page: number) => {
    setPage(page);
    setData([]);
    window.scrollTo(0, 0);
    router.push(`/page/${page + 1}`, undefined, { shallow: true });
  };

  return (
    <div className="flex items-center gap-4 p-4 text-white">
      <div>
        Current page: <strong>{page + 1}</strong> Total pages:{" "}
        <strong>{pageCount}</strong>
      </div>
      {page > 0 && (
        <button
          onClick={() => {
            updatePage(Math.max(page - 1, 0));
          }}
          className="h-8 rounded bg-slate-800 px-2 font-bold ring-sky-500 hover:bg-slate-700 focus:outline-none focus-visible:ring-2 active:bg-slate-600"
        >
          Previous
        </button>
      )}
      {page + 1 < pageCount && (
        <button
          onClick={() => {
            updatePage(Math.min(page + 1, pageCount - 1));
          }}
          className="h-8 rounded bg-slate-800 px-2 font-bold ring-sky-500 hover:bg-slate-700 focus:outline-none focus-visible:ring-2 active:bg-slate-600"
        >
          Next
        </button>
      )}
    </div>
  );
}
