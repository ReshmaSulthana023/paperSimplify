"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PaperHistory = {
  _id: string;
  fileName: string;
  pageCount: number;
  summary: string;
  createdAt: string;
};

export default function HistoryPage() {
  const [papers, setPapers] = useState<PaperHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/papers")
      .then((response) => response.ok ? response.json() : null)
      .then((body) => setPapers(body?.papers ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#fffdf8] px-5 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-semibold text-amber-800">← Back to paper workspace</Link>
        <header className="mt-6 border-b border-slate-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">MongoDB history</p>
          <h1 className="mt-2 text-4xl font-semibold">Previous papers</h1>
          <p className="mt-2 text-slate-600">Open any paper to view its analysis and saved chat conversation.</p>
        </header>

        {loading ? (
          <p className="mt-8 text-slate-500">Loading history...</p>
        ) : papers.length === 0 ? (
          <p className="mt-8 text-slate-500">No analyzed papers are saved yet.</p>
        ) : (
          <div className="mt-8 space-y-4">
            {papers.map((paper) => (
              <Link
                key={paper._id}
                href={`/analysis/${paper._id}`}
                className="block border-b border-slate-200 py-5 transition hover:border-amber-600"
              >
                <h2 className="text-xl font-semibold">{paper.fileName}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {paper.pageCount} page{paper.pageCount === 1 ? "" : "s"}
                  {paper.createdAt ? ` · ${new Date(paper.createdAt).toLocaleDateString()}` : ""}
                </p>
                {paper.summary ? (
                  <p className="mt-3 line-clamp-2 leading-7 text-slate-700">{paper.summary}</p>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
