import { demoPosts, type DemoPost } from "@/lib/mock-data";
import { normalizeSearchQuery, normalizeTag } from "@/lib/posts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FeedMode = "all" | "featured";

export type FeedPostRow = {
  id: string;
  author_id: string;
  username: string;
  full_name: string;
  headline: string;
  avatar_url: string | null;
  content: string;
  tags: string[] | null;
  created_at: string;
  likes_count: number | string | null;
  comments_count: number | string | null;
};

type FeedLikeRow = {
  post_id: string;
};

type GetFeedPostsOptions = {
  mode?: FeedMode;
  limit?: number;
  viewerId?: string | null;
  query?: string;
  authorId?: string;
  tag?: string;
};

type GetFeedPostsResult = {
  posts: DemoPost[];
  source: "supabase" | "fallback";
  error?: string;
};

const DEFAULT_LIMITS: Record<FeedMode, number> = {
  all: 20,
  featured: 3,
};

export function parseFeedMode(value: string | null | undefined): FeedMode | null {
  if (value === "all" || value === "featured") {
    return value;
  }

  return null;
}

export function getDefaultHomeFeedMode(): FeedMode {
  return parseFeedMode(process.env.HOME_FEED_MODE ?? null) ?? "featured";
}

export async function getFeedPosts(options: GetFeedPostsOptions = {}): Promise<GetFeedPostsResult> {
  const mode = options.mode ?? "all";
  const limit = options.limit ?? DEFAULT_LIMITS[mode];
  const searchQuery = normalizeSearchQuery(options.query ?? "");
  const activeTag = normalizeTag(options.tag ?? "");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      posts: getFallbackPosts(mode, limit, searchQuery, options.authorId, activeTag),
      source: "fallback",
      error:
        "Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    };
  }

  let query = supabase.from("feed_posts").select("*");

  if (options.authorId) {
    query = query.eq("author_id", options.authorId);
  }

  if (activeTag) {
    query = query.contains("tags", [activeTag]);
  }

  if (searchQuery) {
    query = query.or(
      `content.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`
    );
  }

  if (mode === "featured") {
    query = query
      .order("likes_count", { ascending: false })
      .order("comments_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.limit(limit);

  if (error || !data) {
    return {
      posts: getFallbackPosts(mode, limit, searchQuery, options.authorId, activeTag),
      source: "fallback",
      error: error?.message ?? "Failed to load feed data from Supabase.",
    };
  }

  const rows = data as FeedPostRow[];
  const likedPostIds = await getLikedPostIdsForViewer(supabase, rows, options.viewerId ?? null);

  return {
    posts: rows.map((row) => mapFeedRowToPost(row, likedPostIds.has(row.id))),
    source: "supabase",
  };
}

function getFallbackPosts(
  mode: FeedMode,
  limit: number,
  searchQuery = "",
  authorId?: string,
  activeTag = ""
): DemoPost[] {
  let posts = [...demoPosts];

  if (authorId) {
    posts = posts.filter((post) => post.author.id === authorId);
  }

  if (searchQuery) {
    const normalizedQuery = searchQuery.toLowerCase();
    posts = posts.filter(
      (post) =>
        post.body.toLowerCase().includes(normalizedQuery) ||
        post.author.name.toLowerCase().includes(normalizedQuery) ||
        post.author.username.toLowerCase().includes(normalizedQuery)
    );
  }

  if (activeTag) {
    posts = posts.filter((post) => post.tags.includes(activeTag));
  }

  if (mode === "featured") {
    return posts
      .sort((left, right) => right.likes + right.comments - (left.likes + left.comments))
      .slice(0, limit);
  }

  return posts.slice(0, limit);
}

async function getLikedPostIdsForViewer(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  rows: FeedPostRow[],
  viewerId: string | null
): Promise<Set<string>> {
  if (!viewerId || rows.length === 0) {
    return new Set();
  }

  const postIds = rows.map((row) => row.id);

  const { data, error } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", viewerId)
    .in("post_id", postIds);

  if (error || !data) {
    return new Set();
  }

  return new Set((data as FeedLikeRow[]).map((row) => row.post_id));
}

export function mapFeedRowToPost(row: FeedPostRow, isLikedByViewer = false): DemoPost {
  return {
    id: row.id,
    author: {
      id: row.author_id,
      name: row.full_name,
      username: row.username,
      headline: row.headline,
      bio: "",
      joinedOn: "",
    },
    body: row.content,
    createdAt: formatRelativeTime(row.created_at),
    likes: Number(row.likes_count ?? 0),
    comments: Number(row.comments_count ?? 0),
    isLikedByViewer,
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

export function formatRelativeTime(value: string): string {
  const postTime = Date.parse(value);

  if (!Number.isFinite(postTime)) {
    return "just now";
  }

  const elapsedMs = Date.now() - postTime;
  const elapsedSeconds = Math.max(1, Math.floor(elapsedMs / 1_000));

  if (elapsedSeconds < 60) {
    return "just now";
  }

  if (elapsedSeconds < 3_600) {
    return `${Math.floor(elapsedSeconds / 60)}m ago`;
  }

  if (elapsedSeconds < 86_400) {
    return `${Math.floor(elapsedSeconds / 3_600)}h ago`;
  }

  return `${Math.floor(elapsedSeconds / 86_400)}d ago`;
}
