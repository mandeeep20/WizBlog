import Link from "next/link";
import { ArrowRight, ChartNoAxesColumn, MessageCircleMore, ThumbsUp } from "lucide-react";

import { AppShell } from "@/components/custom/app-shell";
import { PostCard } from "@/components/custom/post-card";
import { demoPosts } from "@/lib/mock-data";

const totalLikes = demoPosts.reduce((sum, post) => sum + post.likes, 0);
const totalComments = demoPosts.reduce((sum, post) => sum + post.comments, 0);

const productStats = [
  {
    label: "Posts",
    value: String(demoPosts.length),
    icon: ChartNoAxesColumn,
  },
  {
    label: "Comments",
    value: String(totalComments),
    icon: MessageCircleMore,
  },
  {
    label: "Likes",
    value: String(totalLikes),
    icon: ThumbsUp,
  },
];

export default function HomePage() {
  return (
    <AppShell activePath="/">
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        
        
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_16px_35px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
            Welcome to Wiz Blog.
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Share your thoughts with your community.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
            A focused mini-blog experience with short posts, likes, and comments. Clean routes
            and clear structure, ready for backend integration.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/feed"
              className="inline-flex items-center gap-2 rounded-xl border border-orange-300 bg-white px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100"
            >
              Explore feed
            </Link>
          </div>
        </div>
      </section>

     
      <section className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            Latest Posts
          </h2>

          <Link
            href="/feed"
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            View all
          </Link>
        </div>

        {demoPosts.slice(0, 3).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
    </AppShell>
  );
}
