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

  // ✅ FIXED HERE
  const { posts, source, error } = await getFeedPosts({
    mode: "all",
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
      {/* --- UI remains SAME --- */}

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl border p-6 text-sm">
              You have not published anything yet.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
              interactive={source === "supabase"}
              />
            ))
          )}
        </div>

        <aside className="space-y-4">
          <div>
            {recentComments.map((comment) => (
              <div key={comment.id}>
                <p>{comment.content}</p>
                <span>{formatRelativeTime(comment.created_at)}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </AppShell>
  );
}