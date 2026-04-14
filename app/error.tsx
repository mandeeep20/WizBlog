"use client";

import Link from "next/link";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_16px_35px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">Something Failed</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
          The app hit an unexpected error.
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {error.message || "Try the action again or return to the feed."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Retry
          </button>
          <Link
            href="/feed"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Back to feed
          </Link>
        </div>
      </div>
    </div>
  );
}
