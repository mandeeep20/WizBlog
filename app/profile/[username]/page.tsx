import Image from "next/image";
import { AppShell } from "@/components/custom/app-shell";
import { PostCard } from "@/components/custom/post-card";
import {
  ChartNoAxesColumn,
  MessageCircleMore,
  ThumbsUp,
} from "lucide-react";

import {
  demoUsers,
  findUserByUsername,
  getPostsForUser,
} from "@/lib/mock-data";

type ProfilePageProps = {
  params: Promise<{ username: string }>;  // ✅ Fixed: Promise wrapper
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  // ✅ Await the params
  const { username } = await params;
  
  const normalizedUsername = decodeURIComponent(username)
    .replace(/^@/, "")
    .toLowerCase();

  const profile = findUserByUsername(normalizedUsername) ?? demoUsers[0];

  const posts = getPostsForUser(profile.username) ?? [];

  const totalLikes = posts.reduce((sum, post) => sum + (post.likes ?? 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comments ?? 0), 0);

  const stats = [
    { label: "Posts", value: posts.length, icon: ChartNoAxesColumn },
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
                  src={profile.avatar || "/avatars/mandeep.jpeg"}
                  alt={profile.name}
                  width={72}
                  height={72}
                  className="rounded-full border border-orange-200 object-cover"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">
                    @{profile.username}
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                    {profile.name}
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
              <span>Joined {profile.joinedOn}</span>
              <span>{posts.length} posts</span>
            </div>
          </header>
          
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
        
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
