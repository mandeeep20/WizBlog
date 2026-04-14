import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updatePostAction } from "@/app/post/actions";
import { AppShell } from "@/components/custom/app-shell";
import { PostCard } from "@/components/custom/post-card";
import { requireUser } from "@/lib/auth";
import { type FeedPostRow, mapFeedRowToPost } from "@/lib/feed";
import { serializeTags } from "@/lib/posts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

function readSearchParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function EditPostPage({ params, searchParams }: EditPostPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const normalizedId = decodeURIComponent(id);
  const errorMessage = readSearchParam(resolvedSearchParams.error);
  const user = await requireUser(`/post/${normalizedId}/edit`);
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(`/post/${encodeURIComponent(normalizedId)}?error=Supabase is not configured.`);
  }

  const { data, error } = await supabase
    .from("feed_posts")
    .select("*")
    .eq("id", normalizedId)
    .maybeSingle();

  if (error) {
    redirect(`/post/${encodeURIComponent(normalizedId)}?error=${encodeURIComponent(error.message)}`);
  }

  if (!data) {
    notFound();
  }

  const postRow = data as FeedPostRow;

  if (postRow.author_id !== user.id) {
    redirect(`/post/${encodeURIComponent(normalizedId)}?error=You can only edit your own posts.`);
  }

  const post = mapFeedRowToPost(postRow, false);

  return (
    <AppShell activePath="/post/new">
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.35fr_1fr]">
        <form
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_16px_35px_rgba(15,23,42,0.06)]"
          action={updatePostAction}
        >
          <input type="hidden" name="postId" value={normalizedId} />

          <h1 className="text-2xl font-semibold text-slate-900">Edit Post</h1>
          <p className="mt-2 text-sm text-slate-600">
            Update the post content and tags, then publish the new version.
          </p>

          {errorMessage ? (
            <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Post content
              <textarea
                name="content"
                rows={6}
                maxLength={280}
                defaultValue={post.body}
                required
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
              />
              <span className="mt-1 block text-xs text-slate-500">Maximum 280 characters</span>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Tags
              <input
                name="tags"
                type="text"
                defaultValue={serializeTags(post.tags)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/post/${encodeURIComponent(normalizedId)}`}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Save post
            </button>
          </div>
        </form>

        <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Current version
          </h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            This preview shows the post as currently stored before you save new changes.
          </p>
          <div className="mt-4">
            <PostCard post={post} showFullBody interactive={false} />
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
