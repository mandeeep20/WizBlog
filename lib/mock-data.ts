export type DemoUser = {
  id: string;
  name: string;
  username: string;
  headline: string;
  bio: string;
  joinedOn: string;
  avatar?: string; // ✅ added
};

export type DemoPost = {
  id: string;
  author: DemoUser;
  body: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLikedByViewer: boolean;
  tags: string[];
};

export type DemoComment = {
  id: string;
  postId: string;
  author: DemoUser;
  body: string;
  createdAt: string;
};

export const demoUsers: DemoUser[] = [
  {
    id: "u_1",
    name: "Alex Rivera",
    username: "alex-rivera",
    headline: "Product engineer",
    bio: "Building focused web products with Next.js, TypeScript, and clean data models.",
    joinedOn: "Jan 2026",
    avatar: "/avatars/alex.jpeg", // ✅ added
  },
  {
    id: "u_2",
    name: "Mina Park",
    username: "mina-park",
    headline: "UX engineer",
    bio: "Designing interfaces that feel fast, clear, and easy to navigate.",
    joinedOn: "Dec 2025",
    avatar: "/avatars/mina.jpeg", // ✅ added
  },
  {
    id: "u_3",
    name: "Jordan Lee",
    username: "jordan-lee",
    headline: "Backend developer",
    bio: "Focused on reliable APIs, schema design, and performance at scale.",
    joinedOn: "Nov 2025",
    avatar: "/avatars/jordan.jpeg", // ✅ added
  },
];

export const demoPosts: DemoPost[] = [
  {
    id: "p_1",
    author: demoUsers[0],
    body: "Shipped a cleaner publishing flow today. Draft, preview, and publish now fit in a single route with minimal friction.",
    createdAt: "2h ago",
    likes: 24,
    comments: 5,
    isLikedByViewer: true,
    tags: ["product", "nextjs", "shipping"],
  },
  {
    id: "p_2",
    author: demoUsers[1],
    body: "Small UI decision that helped a lot: moved post actions closer to the content block and reduced visual noise in the sidebar.",
    createdAt: "5h ago",
    likes: 41,
    comments: 8,
    isLikedByViewer: false,
    tags: ["ui", "ux", "design-systems"],
  },
  {
    id: "p_3",
    author: demoUsers[2],
    body: "If your likes table uses a composite primary key (post_id, user_id), duplicate likes disappear as a data problem.",
    createdAt: "1d ago",
    likes: 33,
    comments: 3,
    isLikedByViewer: false,
    tags: ["sql", "supabase", "backend"],
  },
  {
    id: "p_4",
    author: demoUsers[0],
    body: "Keeping scope tight: short posts, comments, and likes. Shipping a clear v1 beats delaying for edge features.",
    createdAt: "2d ago",
    likes: 16,
    comments: 2,
    isLikedByViewer: true,
    tags: ["product", "focus", "mvp"],
  },
];

export const demoComments: DemoComment[] = [
  {
    id: "c_1",
    postId: "p_1",
    author: demoUsers[1],
    body: "The single-route publish flow feels much smoother now.",
    createdAt: "1h ago",
  },
  {
    id: "c_2",
    postId: "p_1",
    author: demoUsers[2],
    body: "Nice improvement. Simpler flows are easier to maintain too.",
    createdAt: "40m ago",
  },
  {
    id: "c_3",
    postId: "p_2",
    author: demoUsers[0],
    body: "Totally agree on reducing sidebar clutter.",
    createdAt: "3h ago",
  },
  {
    id: "c_4",
    postId: "p_3",
    author: demoUsers[1],
    body: "Composite keys save so many headaches over time.",
    createdAt: "20h ago",
  },
  {
    id: "c_5",
    postId: "p_4",
    author: demoUsers[2],
    body: "Clear scope is the best way to keep momentum.",
    createdAt: "1d ago",
  },
];

export const trendingTags = [
  "nextjs",
  "supabase",
  "product",
  "design",
  "sql",
  "frontend",
];

export function findPostById(id: string): DemoPost | undefined {
  return demoPosts.find((post) => post.id === id);
}

export function findUserByUsername(username: string): DemoUser | undefined {
  return demoUsers.find((user) => user.username === username);
}

export function getCommentsForPost(postId: string): DemoComment[] {
  return demoComments.filter((comment) => comment.postId === postId);
}

export function getPostsForUser(username: string): DemoPost[] {
  return demoPosts.filter((post) => post.author.username === username);
}