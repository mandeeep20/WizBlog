import Link from "next/link";
import { MessageSquareText, PenSquare, ThumbsUp, Tags } from "lucide-react";

import { AppShell } from "@/components/custom/app-shell";
import { PostCard } from "@/components/custom/post-card";
import { getCurrentProfile, requireUser } from "@/lib/auth";
import { formatRelativeTime, getFeedPosts } from "@/lib/feed";
import { buildStudioStats } from "@/lib/studio";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RecentCommentRow = {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
};

export default async function StudioPage() {
  const user = await requireUser("/studio");
  const currentProfile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();
  const { posts, source, error } = await getFeedPosts({
    mode: "all",
    authorId: user.id,
    viewerId: user.id,
    limit: 50,
  });

  let commentsWritten = 0;
  let recentComments: RecentCommentRow[] = [];

  if (supabase) {
    const [{ count }, { data }] = await Promise.all([
      supabase
        .from("comments")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("author_id", user.id),
      supabase
        .from("comments")
        .select("id, post_id, content, created_at")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    commentsWritten = count ?? 0;
    recentComments = (data as RecentCommentRow[] | null) ?? [];
  }

  const stats = buildStudioStats(posts, commentsWritten);
  const statCards = [
    {
      label: "Published posts",
      value: String(stats.postsCount),
      icon: PenSquare,
    },
    {
      label: "Likes received",
      value: String(stats.likesReceived),
      icon: ThumbsUp,
    },
    {
      label: "Comments received",
      value: String(stats.commentsReceived),
      icon: MessageSquareText,
    },
    {
      label: "Comments written",
      value: String(stats.commentsWritten),
      icon: MessageSquareText,
    },
  ];

  return (
    <AppShell activePath="/studio">
      <section className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_20px_45px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              Creator studio
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Manage your content and inspect engagement
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              This page demonstrates authenticated server rendering, aggregate queries, and
              content management. It is the owner-facing control panel for BlogQiz.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/post/new"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Write new post
            </Link>
            {currentProfile ? (
              <Link
                href={`/profile/${encodeURIComponent(currentProfile.username)}`}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Open profile
              </Link>
            ) : null}
            <Link
              href="/annexure/project-blogqiz"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Study the capstone
            </Link>
          </div>
        </div>

        {source === "fallback" ? (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error ?? "Supabase feed unavailable. Showing sample posts in studio."}
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-center gap-2 text-slate-500">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                  {stat.label}
                </span>
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Your posts</h2>
                <p className="text-sm text-slate-600">
                  Edit or delete content directly from the list below.
                </p>
              </div>
              <Link
                href="/post/new"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                New post
              </Link>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-sm text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
              You have not published anything yet. Create your first post to exercise the full
              write path from form to server action to database to feed.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                interactive={source === "supabase"}
                returnPath="/studio"
                viewerId={user.id}
              />
            ))
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-2 text-slate-500">
              <Tags className="h-4 w-4" />
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Top tags
              </h2>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {stats.topTags.length === 0 ? (
                <p className="text-sm text-slate-500">No tags used yet.</p>
              ) : (
                stats.topTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/feed?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                  >
                    #{tag}
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Recent comments you wrote
            </h2>
            <div className="mt-4 space-y-3">
              {recentComments.length === 0 ? (
                <p className="text-sm text-slate-500">You have not written any comments yet.</p>
              ) : (
                recentComments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border border-slate-100 p-3">
                    <p className="text-sm leading-6 text-slate-700">{comment.content}</p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span>{formatRelativeTime(comment.created_at)}</span>
                      <Link
                        href={`/post/${encodeURIComponent(comment.post_id)}`}
                        className="font-semibold text-sky-700 hover:text-sky-800"
                      >
                        Open post
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-900 p-5 text-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
              Learning tie-in
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              Use this route while reading the annexure. It exercises authenticated SSR, database
              reads, aggregate metrics, protected mutations, and UI state after revalidation.
            </p>
            <Link
              href="/annexure/project-blogqiz"
              className="mt-4 inline-flex text-sm font-semibold text-sky-300 hover:text-sky-200"
            >
              Open the BlogQiz project guide
            </Link>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
