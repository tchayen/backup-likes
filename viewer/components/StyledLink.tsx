import Link from "next/link";
import { ReactNode } from "react";

export function StyledLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
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
}
