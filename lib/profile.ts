import type { SupabaseClient, User } from "@supabase/supabase-js";

export type ProfileDefaults = {
  username: string;
  fullName: string;
  headline: string;
  bio: string;
  avatarUrl: string | null;
};

type ExistingProfileRow = {
  id: string;
};

export function normalizeUsername(value: string, fallback: string): string {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 30);

  if (cleaned.length >= 3) {
    return cleaned;
  }

  return fallback.slice(0, 30);
}

export function getUserMetadataString(user: User, key: string): string {
  const value = user.user_metadata?.[key];
  return typeof value === "string" ? value : "";
}

export function getProfileDefaults(user: User, overrides: Partial<ProfileDefaults> = {}): ProfileDefaults {
  const fallbackUsername = `user-${user.id.slice(0, 8)}`;
  const emailPrefix = user.email?.split("@")[0] ?? fallbackUsername;
  const username = normalizeUsername(
    overrides.username ?? getUserMetadataString(user, "username"),
    normalizeUsername(emailPrefix, fallbackUsername)
  );
  const fullName = (
    overrides.fullName ??
    getUserMetadataString(user, "full_name") ??
    getUserMetadataString(user, "name") ??
    username
  )
    .trim()
    .slice(0, 80);
  const headline = (overrides.headline ?? getUserMetadataString(user, "headline") ?? "")
    .trim()
    .slice(0, 120);
  const bio = (overrides.bio ?? getUserMetadataString(user, "bio") ?? "").trim().slice(0, 280);
  const rawAvatarUrl = (overrides.avatarUrl ?? getUserMetadataString(user, "avatar_url") ?? "")
    .toString()
    .trim();
  const avatarUrl = rawAvatarUrl.length > 0 ? rawAvatarUrl : null;

  return {
    username,
    fullName: fullName.length > 0 ? fullName : username,
    headline,
    bio,
    avatarUrl,
  };
}

export async function ensureProfileForUser(
  supabase: SupabaseClient,
  user: User,
  overrides: Partial<ProfileDefaults> = {}
): Promise<string | null> {
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfileError) {
    return existingProfileError.message;
  }

  if ((existingProfile as ExistingProfileRow | null)?.id) {
    return null;
  }

  const profile = getProfileDefaults(user, overrides);

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    username: profile.username,
    full_name: profile.fullName,
    headline: profile.headline,
    bio: profile.bio,
    avatar_url: profile.avatarUrl,
  });

  if (!error) {
    return null;
  }

  if (error.code === "23505" && error.message.includes("profiles_username")) {
    return "This username is already in use. Choose a different username.";
  }

  return error.message;
}
