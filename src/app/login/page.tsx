"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error ?? "Unable to sign in.");
      setLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_30%),#f7f1e6] px-4">
      <section className="w-full max-w-md rounded-[2rem] border border-white bg-white/95 p-7 shadow-[0_20px_60px_rgba(91,67,33,0.14)] sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">Welcome back</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Access your uploaded papers and chat history.</p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-semibold text-slate-700">
            Email
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-amber-600" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Password
            <div className="mt-2 flex rounded-2xl border border-slate-300 focus-within:border-amber-600">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-w-0 flex-1 rounded-l-2xl px-4 py-3 font-normal outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="rounded-r-2xl px-4 text-sm font-semibold text-amber-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          <button disabled={loading} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          New here? <Link className="font-semibold text-amber-800" href="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
