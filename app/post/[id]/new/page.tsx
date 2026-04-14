import Link from "next/link";

import { createPostAction } from "@/app/post/actions";
import { AppShell } from "@/components/custom/app-shell";
import { PostCard } from "@/components/custom/post-card";
import { requireUser } from "@/lib/auth";
import { demoPosts } from "@/lib/mock-data";

type NewPostPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
  }>;
};

function readSearchParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function NewPostPage({ searchParams }: NewPostPageProps) {
  await requireUser("/post/new");
  const resolvedSearchParams = await searchParams;
  const error = readSearchParam(resolvedSearchParams.error);
  const message = readSearchParam(resolvedSearchParams.message);

  return (
    <AppShell activePath="/post/new">
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.35fr_1fr]">
        <form
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_16px_35px_rgba(15,23,42,0.06)]"
          action={createPostAction}
        >
          <h1 className="text-2xl font-semibold text-slate-900">Create Post</h1>
          <p className="mt-2 text-sm text-slate-600">
            Publish a concise update to your followers.
          </p>

          {error ? (
            <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Post content
              <textarea
                name="content"
                rows={6}
                maxLength={280}
                placeholder="Share what you are working on."
                required
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-600 focus:outline-none"
              />
              <span className="mt-1 block text-xs text-slate-500">Maximum 280 characters</span>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Tags
              <input
                name="tags"
                type="text"
                placeholder="product,design,frontend"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-600 focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/feed"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Publish post
            </button>
          </div>
        </form>

        <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Preview</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Static preview example. The live post will appear in feed and profile after publish.
          </p>
          <div className="mt-4">
            <PostCard post={demoPosts[0]} showFullBody interactive={false} />
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
