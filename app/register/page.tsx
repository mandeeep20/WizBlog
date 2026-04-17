import Link from "next/link";
import { AtSign, Mail, User } from "lucide-react";
import { signUpAction } from "@/app/auth/actions";
import { AppShell } from "@/components/custom/app-shell";

export default function RegisterPage() {
  return (
    <AppShell activePath="/register">
      <section className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_1.05fr]">

        {/* Left Panel */}
        <div className="rounded-2xl border border-orange-300 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-7 text-white">
          <h1 className="text-3xl font-semibold">Create your WizBlog account</h1>
          <p className="mt-3 text-sm">
            Set up your profile and start posting instantly.
          </p>
        </div>

        {/* Right Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7">
          <h2 className="text-2xl font-semibold">Register</h2>

          {/* IMPORTANT: using action instead of onSubmit */}
          <form action={signUpAction} className="mt-6 space-y-4">

            {/* Full Name */}
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border px-3 py-2">
                <User className="h-4 w-4 text-slate-500" />
                <input
                  name="fullName"
                  type="text"
                  required
                  className="w-full text-sm focus:outline-none"
                />
              </div>
            </label>

            {/* Username */}
            <label className="block text-sm font-medium text-slate-700">
              Username
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border px-3 py-2">
                <AtSign className="h-4 w-4 text-slate-500" />
                <input
                  name="username"
                  type="text"
                  required
                  className="w-full text-sm focus:outline-none"
                />
              </div>
            </label>

            {/* Email */}
            <label className="block text-sm font-medium text-slate-700">
              Email
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border px-3 py-2">
                <Mail className="h-4 w-4 text-slate-500" />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full text-sm focus:outline-none"
                />
              </div>
            </label>

            {/* Password */}
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                name="password"
                type="password"
                required
                className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
              />
            </label>

            {/* Bio */}
            <label className="block text-sm font-medium text-slate-700">
              Bio
              <textarea
                name="bio"
                rows={3}
                className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
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