import Link from "next/link";
import { notFound } from "next/navigation";

import { createCommentAction } from "@/app/post/actions";
import { AppShell } from "@/components/custom/app-shell";
import { CommentCard } from "@/components/custom/comment-card";
import { PostCard } from "@/components/custom/post-card";
import { getCurrentUser } from "@/lib/auth";
import {
  type FeedPostRow,
  formatRelativeTime,
  mapFeedRowToPost,
} from "@/lib/feed";
import {
  demoPosts,
  findPostById,
  getCommentsForPost,
} from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PostDetailPageProps = {
  params: { id: string };
  searchParams?: {
    error?: string | string[];
    message?: string | string[];
  };
};

type CommentType = {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    username: string;
    headline: string;
    bio: string;
    joinedOn: string;
  };
  body: string;
  createdAt: string;
};

function readSearchParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function PostDetailPage({
  params,
  searchParams,
}: PostDetailPageProps) {
  const normalizedId = decodeURIComponent(params.id);
  const user = await getCurrentUser();

  const errorMessage = readSearchParam(searchParams?.error);
  const successMessage = readSearchParam(searchParams?.message);

  let selectedPost = findPostById(normalizedId) ?? demoPosts[0];

  let comments: CommentType[] =
    (getCommentsForPost(selectedPost.id) as CommentType[]) ?? [];

  let showingFallback = selectedPost.id !== normalizedId;

  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const { data: postRow, error: postError } = await supabase
      .from("feed_posts")
      .select("*")
      .eq("id", normalizedId)
      .maybeSingle();

    if (!postError && postRow) {
      let isLikedByViewer = false;

      if (user) {
        const { data: likeRow } = await supabase
          .from("likes")
          .select("post_id")
          .eq("post_id", normalizedId)
          .eq("user_id", user.id)
          .maybeSingle();

        isLikedByViewer = Boolean(likeRow);
      }

      selectedPost = mapFeedRowToPost(
        postRow as FeedPostRow,
        isLikedByViewer
      );

      showingFallback = false;

      const { data: commentRows, error: commentsError } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", normalizedId)
        .order("created_at", { ascending: true });

      if (!commentsError && commentRows) {
        comments = commentRows.map((comment: any) => ({
          id: comment.id,
          postId: comment.post_id,
          author: {
            id: comment.author_id,
            name: comment.full_name,
            username: comment.username,
            headline: "",
            bio: "",
            joinedOn: "",
          },
          body: comment.content,
          createdAt: formatRelativeTime(comment.created_at),
        }));
      }
    } else if (!postError && !postRow) {
      notFound();
    }
  }

  return (
    <AppShell activePath="/feed">
      <section className="mx-auto max-w-3xl space-y-5">
        {showingFallback && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Post <code>{normalizedId}</code> not found. Showing latest post instead.
          </div>
        )}

        {errorMessage && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        )}

        <PostCard
          post={selectedPost}
          showFullBody
        />

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Add Comment
          </h2>

          {user && !showingFallback ? (
            <form className="mt-3 space-y-3" action={createCommentAction}>
              <input type="hidden" name="postId" value={selectedPost.id} />
              <textarea
                name="content"
                rows={3}
                maxLength={280}
                required
                placeholder="Write a comment"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Post comment
              </button>
            </form>
          ) : showingFallback ? (
            <p className="mt-3 text-sm text-slate-600">
              Comments disabled for fallback post.
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              <Link
                href={`/login?next=${encodeURIComponent(
                  `/post/${selectedPost.id}`
                )}`}
                className="font-semibold text-sky-700 hover:text-sky-800"
              >
                Sign in
              </Link>{" "}
              to add a comment.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Comments
          </h2>

          {comments.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              No comments yet.
            </p>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
              />
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}