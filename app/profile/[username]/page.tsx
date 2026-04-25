import Image from "next/image";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/custom/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ChartNoAxesColumn,
  MessageCircleMore,
  ThumbsUp,
} from "lucide-react";

type ProfilePageProps = {
  params: { username: string };
};

export default async function ProfilePage({
  params,
}: ProfilePageProps) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) return notFound();

  const normalizedUsername = decodeURIComponent(params.username)
    .replace(/^@/, "")
    .toLowerCase();

  // 🔥 Fetch profile from Supabase
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", normalizedUsername)
    .single();

  if (error || !profile) {
    return notFound();
  }

  // 🔥 Fetch posts for this user (if you have posts table)
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false });

  const totalLikes =
    posts?.reduce((sum, post) => sum + (post.likes ?? 0), 0) ?? 0;

  const totalComments =
    posts?.reduce((sum, post) => sum + (post.comments ?? 0), 0) ?? 0;

  const stats = [
    { label: "Posts", value: posts?.length ?? 0, icon: ChartNoAxesColumn },
    { label: "Comments", value: totalComments, icon: MessageCircleMore },
    { label: "Likes", value: totalLikes, icon: ThumbsUp },
  ];

  return (
    <AppShell activePath={`/profile/${profile.username}`}>
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.6fr_0.8fr]">
        
        <div className="space-y-5">
          <header className="rounded-2xl border border-orange-200 bg-orange-50 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src={profile.avatar_url || "/avatars/mandeep.jpeg"}
                  alt={profile.full_name}
                  width={72}
                  height={72}
                  className="rounded-full border border-orange-200 object-cover"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">
                    @{profile.username}
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                    {profile.full_name}
                  </h1>
                  <p className="text-sm font-medium text-orange-600">
                    {profile.headline}
                  </p>
                </div>
              </div>

              <button className="rounded-xl border border-orange-300 bg-white px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100">
                Follow
              </button>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              {profile.bio}
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
              <span>
                Joined{" "}
                {new Date(profile.created_at).toLocaleDateString()}
              </span>
              <span>{posts?.length ?? 0} posts</span>
            </div>
          </header>

          {/* Posts */}
          <div className="space-y-4">
            {posts?.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border p-4 bg-white shadow-sm"
              >
                <p>{post.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <aside className="grid h-fit gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 text-orange-600">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-[0.12em]">
                    {stat.label}
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </aside>
      </section>
    </AppShell>
  );
}