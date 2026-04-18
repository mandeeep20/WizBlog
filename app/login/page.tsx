import Link from "next/link";
import { LockKeyhole, Mail } from "lucide-react";

import { AppShell } from "@/components/custom/app-shell";
import { signInAction } from "../auth/actions";

export default function LoginPage() {
  return (
    <AppShell activePath="/login">
      <section className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_1.05fr]">
        
        {/* Left Side */}
        <div className="rounded-2xl border border-orange-300 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-7 text-white shadow-[0_18px_40px_rgba(249,115,22,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-100">
            Welcome back
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Login to WizBlog
          </h1>

          <p className="mt-3 text-sm leading-7 text-orange-100">
            Stay connected with your network, publish updates, and continue conversations.
          </p>
        </div>

        {/* Right Side */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_16px_35px_rgba(15,23,42,0.06)]">
          <h2 className="text-2xl font-semibold text-slate-900">
            Login
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Access your account in seconds.
          </p>

          {/* 🔥 IMPORTANT FIX HERE */}
          <form action={signInAction} className="mt-6 space-y-4">
            
            {/* Email */}
            <label className="block text-sm font-medium text-slate-700">
              Email
              <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:border-orange-500">
                <Mail className="h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="alex@example.com"
                  className="w-full text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
                />
              </span>
            </label>

            {/* Password */}
            <label className="block text-sm font-medium text-slate-700">
              Password
              <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:border-orange-500">
                <LockKeyhole className="h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  className="w-full text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
                />
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600"
            >
              Login
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            Don’t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-orange-600 hover:text-orange-700"
            >
              Create one
            </Link>
          </p>
        </div>

      </section>
    </AppShell>
  );
}