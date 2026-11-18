"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profession, setProfession] = useState("");
  const [showProfessionPrompt, setShowProfessionPrompt] = useState(false);
  const [savingProfession, setSavingProfession] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error ?? "Unable to create account.");
      setLoading(false);
      return;
    }
    setLoading(false);
    setShowProfessionPrompt(true);
  }

  async function saveProfession() {
    const value = profession.trim();
    if (!value) {
      setError("Please enter your profession.");
      return;
    }

    setSavingProfession(true);
    setError("");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profession: value }),
    });
    setSavingProfession(false);
    if (!response.ok) {
      setError("Unable to save your profession.");
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <>
      {showProfessionPrompt ? (
        <main className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="profession-title"
            className="w-full max-w-md rounded-[2rem] border border-white bg-white p-7 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">One-time profile setup</p>
            <h2 id="profession-title" className="mt-2 text-2xl font-semibold text-slate-950">What is your profession?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tell us your profession. This is saved once to your profile.
            </p>
            <input
              type="text"
              value={profession}
              onChange={(event) => setProfession(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void saveProfession();
                }
              }}
              placeholder="For example: Student, Engineer, or Researcher"
              className="mt-5 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-600"
            />
            {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
            <button
              type="button"
              onClick={() => void saveProfession()}
              disabled={savingProfession}
              className="mt-5 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {savingProfession ? "Saving..." : "Save and continue"}
            </button>
          </section>
        </main>
      ) : null}

    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_30%),#f7f1e6] px-4">
      <section className="w-full max-w-md rounded-[2rem] border border-white bg-white/95 p-7 shadow-[0_20px_60px_rgba(91,67,33,0.14)] sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">Get started</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">Save your papers, summaries, and conversations.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-semibold text-slate-700">Full name
            <input type="text" required value={name} onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-amber-600" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">Email
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-amber-600" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">Password
            <div className="mt-2 flex rounded-2xl border border-slate-300 focus-within:border-amber-600">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          Already registered? <Link className="font-semibold text-amber-800" href="/login">Sign in</Link>
        </p>
      </section>
    </main>
    </>
  );
}
