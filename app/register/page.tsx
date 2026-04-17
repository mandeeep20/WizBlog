import Link from "next/link";
import { redirect } from "next/navigation";
import { AtSign, Mail, User } from "lucide-react";

import { signUpAction } from "@/app/auth/actions";
import { AppShell } from "@/components/custom/app-shell";
import { getCurrentUser } from "@/lib/auth";

type RegisterPageProps = {
  searchParams: {
    error?: string;
    message?: string;
  };
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/feed");
  }

  const error = searchParams?.error;
  const message = searchParams?.message;

  return (
    <AppShell activePath="/register">
      <section className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_1.05fr]">
        <div className="rounded-2xl border border-orange-300 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-7 text-white">
          <h1 className="text-3xl font-semibold">
            Create your WizBlog account
          </h1>
          <p className="mt-3 text-sm">
            Set up your profile and start posting instantly.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-7">
          <h2 className="text-2xl font-semibold">Register</h2>

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {message}
            </p>
          )}

          <form className="mt-6 space-y-4" action={signUpAction}>
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input
                name="fullName"
                type="text"
                required
                className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Username
              <input
                name="username"
                type="text"
                required
                className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                name="email"
                type="email"
                required
                className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Headline
              <input
                name="headline"
                type="text"
                className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Bio
              <textarea
                name="bio"
                rows={3}
                className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Create account
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-orange-600">
              Login
            </Link>
          </p>
        </div>
      </section>
    </AppShell>
  );
}