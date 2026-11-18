import Link from "next/link";
import { redirect } from "next/navigation";
import { connectDatabase, Paper } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PaperChat } from "@/components/paper-chat";
import { SummaryReader } from "@/components/summary-reader";
import mongoose from "mongoose";

function parseJson(value: unknown, fallback: unknown[] = []) {
  if (typeof value !== "string") {
    return fallback;
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    redirect("/");
  }
  await connectDatabase();
  const paper = await Paper.findOne({ _id: id, userId: user.id }).lean();

  if (!paper) {
    redirect("/");
  }

  const highlights = paper.highlights as string[];
  const keywords = paper.keywords as string[];
  const reportSections = paper.reportSections as Array<{ title: string; body: string }>;
  const sectionSummaries = paper.sectionSummaries as Array<{ title: string; simple: string }>;
  const corpus = paper.corpus as string[];

  return (
    <main className="min-h-screen bg-[#fffdf8] px-5 py-8 text-slate-900 sm:px-8 lg:px-12">
      <article className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-semibold text-amber-800">← Back to paper workspace</Link>
        <header className="mt-6 border-b border-slate-200 pb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">Paper analysis</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-5xl">{paper.fileName}</h1>
          <p className="mt-3 text-sm text-slate-500">{paper.pageCount} page{paper.pageCount === 1 ? "" : "s"} · Grounded summary</p>
        </header>

        <div className="mt-8">
          <SummaryReader
            reportSections={reportSections}
            sectionSummaries={sectionSummaries}
            highlights={highlights}
            keywords={keywords}
          />
        </div>

        <div className="space-y-10">
          {reportSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
              <p className="mt-3 text-base leading-8 text-slate-700">{section.body}</p>
            </section>
          ))}

          {reportSections.length === 0 && sectionSummaries.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
              <p className="mt-3 text-base leading-8 text-slate-700">{section.simple}</p>
            </section>
          ))}

          {highlights.length > 0 ? (
            <section>
              <h2 className="text-xl font-semibold text-slate-950">Highlights</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-7 text-slate-700">
                {highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
              </ul>
            </section>
          ) : null}

          {keywords.length > 0 ? (
            <section>
              <h2 className="text-xl font-semibold text-slate-950">Detected topics</h2>
              <p className="mt-3 leading-8 text-slate-700">{keywords.join(" · ")}</p>
            </section>
          ) : null}
        </div>

        <PaperChat paperId={id} corpus={corpus} />
      </article>
    </main>
  );
}
