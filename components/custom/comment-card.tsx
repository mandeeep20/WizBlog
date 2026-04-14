import Link from "next/link";

import type { DemoComment } from "@/lib/mock-data";

type CommentCardProps = {
  comment: DemoComment;
};

function initialsFromName(name: string): string {
  const [first = "", last = ""] = name.split(" ");
  return `${first.slice(0, 1)}${last.slice(0, 1)}`.toUpperCase();
}

export function CommentCard({ comment }: CommentCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-700">
            {initialsFromName(comment.author.name)}
          </div>
          <Link
            href={`/profile/${comment.author.username}`}
            className="text-sm font-semibold text-slate-900 hover:text-sky-700"
          >
            {comment.author.name}
          </Link>
        </div>
        <p className="text-xs text-slate-500">{comment.createdAt}</p>
      </header>
      <p className="mt-3 text-sm leading-6 text-slate-700">{comment.body}</p>
    </article>
  );
}
