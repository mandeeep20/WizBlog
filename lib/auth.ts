import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getProfileDefaults } from "@/lib/profile";
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

  const defaults = getProfileDefaults(user);
  const supabase = await createSupabaseServerClient();
  const fallbackProfile: CurrentProfile = {
    id: user.id,
    username: defaults.username,
    fullName: defaults.fullName || "BlogQiz User",
    headline: defaults.headline,
    avatarUrl: defaults.avatarUrl,
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
