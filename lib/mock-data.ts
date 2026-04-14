export type DemoUser = {
  id: string;
  name: string;
  username: string;
  headline: string;
  bio: string;
  joinedOn: string;
  avatar?: string; 
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
    name: "Mandeep Mutsuddy",
    username: "mandeeep.69",
    headline: "Product builder",
    bio: "wizblog!.",
    joinedOn: "Feb 26",
    avatar: "/avatars/mandeep.jpeg", 
  },
  {
    id: "u_2",
    name: "Dishan Sarma",
    username: "disham_sarma",
    headline: "UX engineer",
    bio: "Designing interfaces that feel fast, clear, and easy to navigate.",
    joinedOn: "Dec 2025",
    avatar: "/avatars/user2.jpeg",
  },
  {
    id: "u_3",
    name: "Khushi K",
    username: "khushiii",
    headline: "Backend developer",
    bio: "Focused on reliable APIs, schema design, and performance at scale.",
    joinedOn: "Nov 2025",
    avatar: "/avatars/user3.jpeg",
  },
];


export const demoPosts: DemoPost[] = [
  {
    id: "p_1",
    author: demoUsers[0],
    body: "Just worked on WizBlog UI today 🔥 Loving the orange fire aesthetic and smooth posting flow.",
    createdAt: "2h ago",
    likes: 24,
    comments: 5,
    isLikedByViewer: true,
    tags: ["wizblog", "nextjs", "shipping"],
  },
  {
    id: "p_2",
    author: demoUsers[1],
    body: "Moved post actions closer to content and reduced sidebar clutter — huge UX improvement.",
    createdAt: "5h ago",
    likes: 41,
    comments: 8,
    isLikedByViewer: false,
    tags: ["ui", "ux", "design"],
  },
  {
    id: "p_3",
    author: demoUsers[2],
    body: "Composite primary keys remove duplicate likes automatically. Clean backend win.",
    createdAt: "1d ago",
    likes: 33,
    comments: 3,
    isLikedByViewer: false,
    tags: ["sql", "backend", "supabase"],
  },
  {
    id: "p_4",
    author: demoUsers[0],
    body: "hope every one having a great day ahead.",
    createdAt: "2d ago",
    likes: 16,
    comments: 2,
    isLikedByViewer: true,
    tags: ["music", "product", "focus"],
  },
];



export const demoComments: DemoComment[] = [
  {
    id: "c_1",
    postId: "p_1",
    author: demoUsers[1],
    body: "The orange theme actually looks super clean 🔥",
    createdAt: "1h ago",
  },
  {
    id: "c_2",
    postId: "p_1",
    author: demoUsers[2],
    body: "Fire branding bro.",
    createdAt: "40m ago",
  },
  {
    id: "c_3",
    postId: "p_2",
    author: demoUsers[0],
    body: "Cleaner UI always wins.",
    createdAt: "3h ago",
  },
  {
    id: "c_4",
    postId: "p_3",
    author: demoUsers[1],
    body: "Backend simplicity saves headaches later.",
    createdAt: "20h ago",
  },
  {
    id: "c_5",
    postId: "p_4",
    author: demoUsers[2],
    body: "Music + coding combo is elite.",
    createdAt: "1d ago",
  },
];



export const trendingTags = [
  "wizblog",
  "nextjs",
  "supabase",
  "design",
  "frontend",
];

export const trendingTopic = [
  "wizblog",
  "nextjs",
  "supabase",
  "design",
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
