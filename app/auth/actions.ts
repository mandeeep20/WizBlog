"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ensureProfileForUser, normalizeUsername } from "@/lib/profile";
import { readFormString } from "@/lib/posts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectWith(path: string, params: Record<string, string>): never {
  const search = new URLSearchParams(params);
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}${search.toString()}`);
}

function normalizeNextPath(value: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/feed";
  }

  return value;
}

export async function signInAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectWith("/login", {
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    });
  }

  const email = readFormString(formData.get("email"));
  const password = readFormString(formData.get("password"));
  const nextPath = normalizeNextPath(readFormString(formData.get("next")));

  if (!email || !password) {
    redirectWith("/login", {
      next: nextPath,
      error: "Email and password are required.",
    });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirectWith("/login", {
      next: nextPath,
      error: error.message,
    });
  }

  if (data.user) {
    const profileError = await ensureProfileForUser(supabase, data.user);

    if (profileError) {
      redirectWith("/login", {
        next: nextPath,
        error: profileError,
      });
    }
  }

  redirect(nextPath);
}

export async function signUpAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectWith("/register", {
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    });
  }

  const fullName = readFormString(formData.get("fullName"));
  const rawUsername = readFormString(formData.get("username"));
  const email = readFormString(formData.get("email"));
  const password = readFormString(formData.get("password"));
  const headline = readFormString(formData.get("headline"));
  const bio = readFormString(formData.get("bio"));
  const safeUsername = normalizeUsername(rawUsername, `user-${Date.now().toString().slice(-6)}`);

  if (safeUsername.length < 3 || fullName.length < 1 || !email || !password) {
    redirectWith("/register", {
      error: "Full name, username, email, and password are required.",
    });
  }

  const headerStore = await headers();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? headerStore.get("origin") ?? "";
  const emailRedirectTo = siteUrl ? `${siteUrl}/auth/confirm?next=/feed` : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        username: safeUsername,
        full_name: fullName,
        headline,
        bio,
      },
    },
  });

  if (error) {
    redirectWith("/register", {
      error: error.message,
    });
  }

  if (data.user && data.session) {
    const profileError = await ensureProfileForUser(supabase, data.user, {
      username: safeUsername,
      fullName,
      headline,
      bio,
    });

    if (profileError) {
      redirectWith("/register", {
        error: profileError,
      });
    }

    redirect("/feed");
  }

  redirectWith("/login", {
    message: "Check your email and confirm your account before signing in.",
  });
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
