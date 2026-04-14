import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  id: string;
  username: string;
  fullName: string;
  headline: string;
  avatarUrl: string | null;
};

type ProfileRow = {
  username: string;
  full_name: string;
  headline: string;
  avatar_url: string | null;
};

function getMetadataString(user: User, key: string): string {
  const value = user.user_metadata?.[key];
  return typeof value === "string" ? value : "";
}

function getFallbackUsername(user: User): string {
  const metadataUsername = getMetadataString(user, "username").trim().toLowerCase();

  if (metadataUsername.length >= 3) {
    return metadataUsername;
  }

  const emailPrefix = user.email?.split("@")[0]?.toLowerCase().trim() ?? "";

  if (emailPrefix.length >= 3) {
    return emailPrefix;
  }

  return `user-${user.id.slice(0, 8)}`;
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
});

export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const fallbackProfile: CurrentProfile = {
    id: user.id,
    username: getFallbackUsername(user),
    fullName:
      getMetadataString(user, "full_name") || getMetadataString(user, "name") || "BlogQiz User",
    headline: getMetadataString(user, "headline"),
    avatarUrl: getMetadataString(user, "avatar_url") || null,
  };

  if (!supabase) {
    return fallbackProfile;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("username, full_name, headline, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return fallbackProfile;
  }

  const profile = data as ProfileRow;

  return {
    id: user.id,
    username: profile.username || fallbackProfile.username,
    fullName: profile.full_name || fallbackProfile.fullName,
    headline: profile.headline || "",
    avatarUrl: profile.avatar_url,
  };
});

export async function requireUser(nextPath = "/feed"): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    const search = new URLSearchParams({
      next: nextPath,
      error: "Please sign in to continue.",
    });

    redirect(`/login?${search.toString()}`);
  }

  return user;
}
