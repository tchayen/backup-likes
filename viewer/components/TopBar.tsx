import { User } from "@/types";
import Link from "next/link";
import { format } from "date-fns";

function ProtectedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-label="Protected account"
      role="img"
      className="h-5 w-5 fill-white"
    >
      <path d="M17.5 7H17v-.25c0-2.76-2.24-5-5-5s-5 2.24-5 5V7h-.5C5.12 7 4 8.12 4 9.5v9C4 19.88 5.12 21 6.5 21h11c1.39 0 2.5-1.12 2.5-2.5v-9C20 8.12 18.89 7 17.5 7zM13 14.73V17h-2v-2.27c-.59-.34-1-.99-1-1.73 0-1.1.9-2 2-2 1.11 0 2 .9 2 2 0 .74-.4 1.39-1 1.73zM15 7H9v-.25c0-1.66 1.35-3 3-3 1.66 0 3 1.34 3 3V7z"></path>
    </svg>
  );
}

export function TopBar({
  user,
  created_at,
}: {
  user: User;
  created_at: string;
}) {
  return (
    <div className="flex flex-wrap gap-1" style={{ width: 400 }}>
      <div className="flex items-center gap-1 font-bold text-white">
        {user.name}
        {user.protected && <ProtectedIcon />}
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
}
