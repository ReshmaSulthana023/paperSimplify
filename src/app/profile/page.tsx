"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Profile = {
  name: string;
  email: string;
  profession: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((response) => response.ok ? response.json() : null)
      .then((body) => {
        if (body?.profile) {
          setProfile(body.profile);
          setName(body.profile.name);
          setProfession(body.profile.profession ?? "");
        }
      });
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, profession }),
    });
    setStatus(response.ok ? "Profile updated." : "Unable to update profile.");
  }

  return (
    <main className="min-h-screen bg-[#f7f1e6] px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-amber-800">← Back to paper workspace</Link>
        <h1 className="mt-5 text-4xl font-semibold">Profile</h1>
        <p className="mt-2 text-slate-600">Manage the personal details associated with your account.</p>

        <form onSubmit={save} className="mt-8 max-w-xl space-y-5">
          <label className="block text-sm font-semibold">
            Full name
            <input value={name} onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full border-b border-slate-300 bg-transparent px-1 py-3 font-normal outline-none focus:border-amber-700" />
          </label>
          <label className="block text-sm font-semibold">
            Email
            <input value={profile?.email ?? ""} readOnly
              className="mt-2 w-full border-b border-slate-300 bg-transparent px-1 py-3 font-normal text-slate-500" />
          </label>
          <label className="block text-sm font-semibold">
            Profession
            <input value={profession} onChange={(event) => setProfession(event.target.value)}
              className="mt-2 w-full border-b border-slate-300 bg-transparent px-1 py-3 font-normal outline-none focus:border-amber-700" />
          </label>
          {status ? <p className="text-sm text-slate-700">{status}</p> : null}
          <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
            Save profile
          </button>
        </form>
      </div>
    </main>
  );
}
