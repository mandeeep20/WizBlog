"use server";

import type { User } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ensureProfileForUser, getProfileDefaults } from "@/lib/profile";
import {
  normalizeSearchQuery,
  normalizeTag,
  parseTags,
  readFormString,
  validateCommentContent,
  validatePostContent,
} from "@/lib/posts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileUsernameRow = {
  username: string;
};

type OwnedPostRow = {
  id: string;
  author_id: string;
  tags: string[] | null;
};

type OwnedCommentRow = {
  id: string;
  post_id: string;
  author_id: string;
};

function redirectWith(path: string, params: Record<string, string>): never {
  const search = new URLSearchParams(params);
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}${search.toString()}`);
}

async function getAuthenticatedUserOrRedirect(nextPath: string): Promise<{
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;
  user: User;
  profileUsername: string;
}> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectWith("/login", {
      next: nextPath,
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirectWith("/login", {
      next: nextPath,
      error: "Please sign in to continue.",
    });
  }

  const profileError = await ensureProfileForUser(supabase, user);

  if (profileError) {
    redirectWith("/login", {
      next: nextPath,
      error: profileError,
    });
  }

  const { data: profileRow, error: profileLookupError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (profileLookupError) {
    redirectWith("/login", {
      next: nextPath,
      error: profileLookupError.message,
    });
  }

  return {
    supabase,
    user,
    profileUsername:
      (profileRow as ProfileUsernameRow | null)?.username ?? getProfileDefaults(user).username,
  };
}

function revalidateSharedPaths(postId?: string, authorUsername?: string) {
  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/studio");

  if (postId) {
    revalidatePath(`/post/${encodeURIComponent(postId)}`);
  }

  if (authorUsername) {
    revalidatePath(`/profile/${encodeURIComponent(authorUsername)}`);
  }
}

async function getOwnedPostOrRedirect(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  postId: string,
  userId: string,
  nextPath: string
): Promise<OwnedPostRow> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, author_id, tags")
    .eq("id", postId)
    .maybeSingle();

  if (error) {
    redirectWith(nextPath, {
      error: error.message,
    });
  }

  if (!data) {
    redirectWith("/feed", {
      error: "Post not found.",
    });
  }

  const post = data as OwnedPostRow;

  if (post.author_id !== userId) {
    redirectWith(`/post/${encodeURIComponent(postId)}`, {
      error: "You can only manage your own posts.",
    });
  }

  return post;
}

async function getOwnedCommentOrRedirect(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  commentId: string,
  userId: string
): Promise<OwnedCommentRow> {
  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, author_id")
    .eq("id", commentId)
    .maybeSingle();

  if (error) {
    redirectWith("/feed", {
      error: error.message,
    });
  }

  if (!data) {
    redirectWith("/feed", {
      error: "Comment not found.",
    });
  }

  const comment = data as OwnedCommentRow;

  if (comment.author_id !== userId) {
    redirectWith(`/post/${encodeURIComponent(comment.post_id)}`, {
      error: "You can only manage your own comments.",
    });
  }

  return comment;
}

export async function createPostAction(formData: FormData) {
  const { supabase, user, profileUsername } = await getAuthenticatedUserOrRedirect("/post/new");
  const content = readFormString(formData.get("content"));
  const tags = parseTags(readFormString(formData.get("tags")));
  const contentError = validatePostContent(content);

  if (contentError) {
    redirectWith("/post/new", {
      error: contentError,
    });
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      content,
      tags,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirectWith("/post/new", {
      error: error?.message ?? "Failed to publish post.",
    });
  }

  const postId = String(data.id);

  revalidateSharedPaths(postId, profileUsername);

  const search = new URLSearchParams({
    message: "Post published successfully.",
  });

  redirect(`/post/${encodeURIComponent(postId)}?${search.toString()}`);
}

export async function createCommentAction(formData: FormData) {
  const postId = readFormString(formData.get("postId"));

  if (!postId) {
    redirectWith("/feed", {
      error: "Missing post identifier.",
    });
  }

  const { supabase, user } = await getAuthenticatedUserOrRedirect(`/post/${postId}`);
  const content = readFormString(formData.get("content"));
  const contentError = validateCommentContent(content);

  if (contentError) {
    redirectWith(`/post/${encodeURIComponent(postId)}`, {
      error: contentError,
    });
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    content,
  });

  if (error) {
    redirectWith(`/post/${encodeURIComponent(postId)}`, {
      error: error.message,
    });
  }

  revalidateSharedPaths(postId);

  redirectWith(`/post/${encodeURIComponent(postId)}`, {
    message: "Comment added successfully.",
  });
}

export async function toggleLikeAction(formData: FormData) {
  const postId = readFormString(formData.get("postId"));
  const nextPath = readFormString(formData.get("next")) || "/feed";
  const authorUsername = readFormString(formData.get("authorUsername"));

  if (!postId) {
    redirectWith(nextPath, {
      error: "Missing post identifier.",
    });
  }

  const { supabase, user } = await getAuthenticatedUserOrRedirect(nextPath);
  const { data: existingLike, error: likeLookupError } = await supabase
    .from("likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (likeLookupError) {
    redirectWith(nextPath, {
      error: likeLookupError.message,
    });
  }

  if (existingLike) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    if (error) {
      redirectWith(nextPath, {
        error: error.message,
      });
    }
  } else {
    const { error } = await supabase.from("likes").insert({
      post_id: postId,
      user_id: user.id,
    });

    if (error) {
      redirectWith(nextPath, {
        error: error.message,
      });
    }
  }

  revalidateSharedPaths(postId, authorUsername || undefined);

  redirect(nextPath);
}

export async function updateProfileAction(formData: FormData) {
  const { supabase, user, profileUsername } = await getAuthenticatedUserOrRedirect("/feed");
  const existingProfile = getProfileDefaults(user, { username: profileUsername });
  const username = getProfileDefaults(user, {
    username: readFormString(formData.get("username")),
  }).username;
  const fullName = readFormString(formData.get("fullName")).slice(0, 80);
  const headline = readFormString(formData.get("headline")).slice(0, 120);
  const bio = readFormString(formData.get("bio")).slice(0, 280);

  if (username.length < 3 || fullName.length < 1) {
    redirectWith(`/profile/${encodeURIComponent(existingProfile.username)}?edit=1`, {
      error: "Username and full name are required.",
    });
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      full_name: fullName,
      headline,
      bio,
    })
    .eq("id", user.id);

  if (error) {
    redirectWith(`/profile/${encodeURIComponent(existingProfile.username)}?edit=1`, {
      error: error.message,
    });
  }

  revalidateSharedPaths(undefined, existingProfile.username);
  revalidatePath(`/profile/${encodeURIComponent(username)}`);

  redirectWith(`/profile/${encodeURIComponent(username)}`, {
    message: "Profile updated successfully.",
  });
}

export async function updatePostAction(formData: FormData) {
  const postId = readFormString(formData.get("postId"));

  if (!postId) {
    redirectWith("/feed", {
      error: "Missing post identifier.",
    });
  }

  const { supabase, user, profileUsername } = await getAuthenticatedUserOrRedirect(
    `/post/${postId}/edit`
  );
  const content = readFormString(formData.get("content"));
  const tags = parseTags(readFormString(formData.get("tags")));
  const contentError = validatePostContent(content);

  if (contentError) {
    redirectWith(`/post/${encodeURIComponent(postId)}/edit`, {
      error: contentError,
    });
  }

  await getOwnedPostOrRedirect(supabase, postId, user.id, `/post/${encodeURIComponent(postId)}/edit`);

  const { error } = await supabase
    .from("posts")
    .update({
      content,
      tags,
    })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) {
    redirectWith(`/post/${encodeURIComponent(postId)}/edit`, {
      error: error.message,
    });
  }

  revalidateSharedPaths(postId, profileUsername);

  redirectWith(`/post/${encodeURIComponent(postId)}`, {
    message: "Post updated successfully.",
  });
}

export async function deletePostAction(formData: FormData) {
  const postId = readFormString(formData.get("postId"));
  const requestedNextPath = readFormString(formData.get("next"));

  if (!postId) {
    redirectWith("/feed", {
      error: "Missing post identifier.",
    });
  }

  const { supabase, user, profileUsername } = await getAuthenticatedUserOrRedirect("/feed");
  await getOwnedPostOrRedirect(supabase, postId, user.id, "/feed");

  const { error } = await supabase.from("posts").delete().eq("id", postId).eq("author_id", user.id);

  if (error) {
    redirectWith("/feed", {
      error: error.message,
    });
  }

  revalidateSharedPaths(postId, profileUsername);

  const redirectPath =
    requestedNextPath && requestedNextPath !== `/post/${postId}` ? requestedNextPath : "/feed";

  redirectWith(redirectPath, {
    message: "Post deleted successfully.",
  });
}

export async function updateCommentAction(formData: FormData) {
  const commentId = readFormString(formData.get("commentId"));

  if (!commentId) {
    redirectWith("/feed", {
      error: "Missing comment identifier.",
    });
  }

  const { supabase, user } = await getAuthenticatedUserOrRedirect("/feed");
  const content = readFormString(formData.get("content"));
  const contentError = validateCommentContent(content);

  if (contentError) {
    const postId = readFormString(formData.get("postId"));

    redirectWith(`/post/${encodeURIComponent(postId)}?editComment=${encodeURIComponent(commentId)}`, {
      error: contentError,
    });
  }

  const comment = await getOwnedCommentOrRedirect(supabase, commentId, user.id);

  const { error } = await supabase
    .from("comments")
    .update({
      content,
    })
    .eq("id", commentId)
    .eq("author_id", user.id);

  if (error) {
    redirectWith(
      `/post/${encodeURIComponent(comment.post_id)}?editComment=${encodeURIComponent(commentId)}`,
      {
        error: error.message,
      }
    );
  }

  revalidateSharedPaths(comment.post_id);

  redirectWith(`/post/${encodeURIComponent(comment.post_id)}`, {
    message: "Comment updated successfully.",
  });
}

export async function deleteCommentAction(formData: FormData) {
  const commentId = readFormString(formData.get("commentId"));

  if (!commentId) {
    redirectWith("/feed", {
      error: "Missing comment identifier.",
    });
  }

  const { supabase, user } = await getAuthenticatedUserOrRedirect("/feed");
  const comment = await getOwnedCommentOrRedirect(supabase, commentId, user.id);

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", user.id);

  if (error) {
    redirectWith(`/post/${encodeURIComponent(comment.post_id)}`, {
      error: error.message,
    });
  }

  revalidateSharedPaths(comment.post_id);

  redirectWith(`/post/${encodeURIComponent(comment.post_id)}`, {
    message: "Comment deleted successfully.",
  });
}

export async function searchFeedAction(formData: FormData) {
  const rawQuery = readFormString(formData.get("query"));
  const tag = normalizeTag(readFormString(formData.get("tag")));
  const query = normalizeSearchQuery(rawQuery);
  const search = new URLSearchParams();

  if (tag) {
    search.set("tag", tag);
  }

  if (!query) {
    redirect(search.size > 0 ? `/feed?${search.toString()}` : "/feed");
  }

  search.set("q", query);

  redirect(`/feed?${search.toString()}`);
}
