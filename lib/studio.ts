import type { DemoPost } from "@/lib/mock-data";

export type StudioStats = {
  postsCount: number;
  likesReceived: number;
  commentsReceived: number;
  commentsWritten: number;
  topTags: string[];
};

export function getTopTagsFromPosts(posts: DemoPost[], limit = 5): string[] {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}

export function buildStudioStats(posts: DemoPost[], commentsWritten: number): StudioStats {
  return {
    postsCount: posts.length,
    likesReceived: posts.reduce((sum, post) => sum + post.likes, 0),
    commentsReceived: posts.reduce((sum, post) => sum + post.comments, 0),
    commentsWritten,
    topTags: getTopTagsFromPosts(posts),
  };

}
