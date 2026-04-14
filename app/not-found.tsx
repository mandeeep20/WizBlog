import Link from "next/link";

import { AppShell } from "@/components/custom/app-shell";

export default function NotFoundPage() {
  return (
    <AppShell activePath="">
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06),0_16px_35px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Not Found</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
          The page you requested does not exist.
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          The post, profile, or document may have been removed or the URL may be incorrect.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/feed"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Back to feed
          </Link>
          <Link
            href="/annexure"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Open annexure
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
