import { User } from "@/types";
import Link from "next/link";
import { format } from "date-fns";

export function TopBar({
  user,
  created_at,
}: {
  user: User;
  created_at: string;
}) {
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
}
