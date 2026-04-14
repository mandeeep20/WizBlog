type PageShellLoadingProps = {
  variant?: "feed" | "detail" | "profile" | "annexure" | "form";
};

function Block({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`}
    />
  );
}

export function PageShellLoading({
  variant = "feed",
}: PageShellLoadingProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(2,132,199,0.12),transparent_30%),radial-gradient(circle_at_90%_5%,rgba(249,115,22,0.12),transparent_35%),linear-gradient(to_bottom,rgba(248,250,252,0.95),rgba(241,245,249,0.9))]" />

      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Block className="h-8 w-28" />
          <div className="flex gap-2">
            <Block className="h-9 w-20" />
            <Block className="h-9 w-20" />
            <Block className="h-9 w-24" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {variant === "detail" && (
          <div className="mx-auto max-w-3xl space-y-5">
            <Block className="h-44 w-full" />
            <Block className="h-36 w-full" />
            <Block className="h-24 w-full" />
            <Block className="h-24 w-full" />
          </div>
        )}

        {variant === "profile" && (
          <div className="mx-auto max-w-4xl space-y-5">
            <Block className="h-48 w-full" />
            <Block className="h-40 w-full" />
            <Block className="h-32 w-full" />
          </div>
        )}

        {variant === "annexure" && (
          <div className="space-y-5">
            <Block className="h-32 w-full" />
            <Block className="h-24 w-full" />
            <Block className="h-64 w-full" />
          </div>
        )}

        {variant === "form" && (
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.35fr_1fr]">
            <Block className="h-[420px] w-full" />
            <Block className="h-[320px] w-full" />
          </div>
        )}

        {variant === "feed" && (
          <div className="grid gap-6 lg:grid-cols-[1.9fr_1fr]">
            <div className="space-y-4">
              <Block className="h-36 w-full" />
              <Block className="h-44 w-full" />
              <Block className="h-44 w-full" />
            </div>
            <div className="space-y-4">
              <Block className="h-32 w-full" />
              <Block className="h-44 w-full" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}