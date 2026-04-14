import Link from "next/link";
import { Search } from "lucide-react";

import { AppShell } from "@/components/custom/app-shell";
import { PostCard } from "@/components/custom/post-card";

import { demoPosts, demoUsers, trendingTags } from "@/lib/mock-data";

export default function FeedPage() {
  return (
    <AppShell activePath="/feed">
      <div className="grid gap-6 lg:grid-cols-[1.9fr_1fr]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Home Feed</h1>
                <p className="text-sm text-slate-600">Fresh updates from people you follow.</p>
              </div>
              <Link
                href="/post/new"
                className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Create post
              </Link>
            </div>

            <label className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <Search className="h-4 w-4" />
              <input
                type="text"
                placeholder="Search posts"
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
              />
            </label>
          </div>

          {demoPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Trending
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              People to follow
            </h2>

            <div className="mt-4 space-y-3">
              {demoUsers.map((user) => (
                <div key={user.id} className="rounded-xl border border-slate-100 p-3">
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">@{user.username}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{user.headline}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

