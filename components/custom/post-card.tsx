import Link from "next/link";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";

import type { DemoPost } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type PostCardProps = {
  post: DemoPost;
  showFullBody?: boolean;
  interactive?: boolean; // ✅ added
};

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}...`;
}

function initialsFromName(name: string): string {
  const [first = "", last = ""] = name.split(" ");
  return `${first.slice(0, 1)}${last.slice(0, 1)}`.toUpperCase();
}

export function PostCard({
  post,
  showFullBody = false,
  interactive = true, // ✅ default true
}: PostCardProps) {
  const body = showFullBody ? post.body : truncate(post.body, 190);

  return (
    <article className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_12px_30px_rgba(15,23,42,0.04)] transition hover:bg-orange-100">
      
      {/* Header */}
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-xs font-semibold text-orange-700">
            {initialsFromName(post.author.name)}
          </div>

          <div>
            {interactive ? (
              <Link
                href={`/profile/${post.author.username}`}
                className="text-sm font-semibold text-slate-900 hover:text-orange-600"
              >
                {post.author.name}
              </Link>
            ) : (
              <p className="text-sm font-semibold text-slate-900">
                {post.author.name}
              </p>
            )}

            <p className="text-xs text-slate-500">
              @{post.author.username}
            </p>
          </div>
        </div>

        <p className="text-xs font-medium text-slate-500">
          {post.createdAt}
        </p>
      </header>

      {/* Body */}
      {interactive ? (
        <Link href={`/post/${post.id}`} className="mt-4 block">
          <p className="text-sm leading-7 text-slate-700">{body}</p>
        </Link>
      ) : (
        <div className="mt-4">
          <p className="text-sm leading-7 text-slate-700">{body}</p>
        </div>
      )}

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-orange-200 bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center gap-2 border-t border-orange-200 pt-4 text-xs">

        <button
          type="button"
          disabled={!interactive}
          className={cn(
            "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium transition",
            post.isLikedByViewer
              ? "bg-orange-200 text-orange-800"
              : "bg-orange-100 text-orange-700 hover:bg-orange-200",
            !interactive && "opacity-60 cursor-not-allowed"
          )}
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5",
              post.isLikedByViewer && "fill-current"
            )}
          />
          {post.likes}
        </button>

        {interactive ? (
          <Link
            href={`/post/${post.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-orange-100 px-2.5 py-1.5 font-medium text-orange-700 hover:bg-orange-200 transition"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {post.comments}
          </Link>
        ) : (
          <div className="inline-flex items-center gap-1 rounded-lg bg-orange-100 px-2.5 py-1.5 font-medium text-orange-700 opacity-60">
            <MessageCircle className="h-3.5 w-3.5" />
            {post.comments}
          </div>
        )}

        <button
          type="button"
          disabled={!interactive}
          className={cn(
            "inline-flex items-center gap-1 rounded-lg bg-orange-100 px-2.5 py-1.5 font-medium text-orange-700 hover:bg-orange-200 transition",
            !interactive && "opacity-60 cursor-not-allowed"
          )}
        >
          <Repeat2 className="h-3.5 w-3.5" />
          Share
        </button>

      </div>
    </article>
  );
}