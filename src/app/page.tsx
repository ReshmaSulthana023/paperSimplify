import { PaperUploadPanel } from "@/components/paper-upload-panel";
import { LogoutButton } from "@/components/logout-button";
import { getSessionUser } from "@/lib/auth";
import Link from "next/link";

const paperSections = [
  {
    title: "Paper ingestion",
    body: "Upload a PDF and extract title, abstract, figures, tables, equations, and section structure into a searchable index.",
  },
  {
    title: "Simple explanations",
    body: "Generate plain-language summaries for each section, then expand technical terms and equations with intuitive examples.",
  },
  {
    title: "Grounded chat",
    body: "Ask questions about the uploaded paper and answer only from retrieved passages so the model stays anchored to the source.",
  },
];

const deliverables = [
  "Section-wise summaries in beginner-friendly language",
  "Key contributions, methodology, results, and limitations",
  "Equation breakdowns with step-by-step intuition",
  "Implementation roadmap and project ideas for newcomers",
];

const roadmap = [
  "Read the abstract and problem statement",
  "Trace the method and model architecture",
  "Study the evaluation metrics and results",
  "Compare limitations with related work",
  "Rebuild the core idea in a small prototype",
];

const chatExamples = [
  {
    role: "User",
    text: "What is the main contribution of the paper?",
  },
  {
    role: "Assistant",
    text: "The paper proposes a retrieval-guided explainer that turns dense research language into plain English while keeping answers tied to the uploaded PDF.",
  },
];

export default async function Home() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.22),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(15,118,110,0.14),_transparent_30%),linear-gradient(180deg,_#fffdf8_0%,_#f7f1e6_100%)] text-slate-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-slate-950 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">
            AI Research Paper Explainer
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold shadow-sm"
              style={{ color: "#ffffff" }}
            >
              Create account
            </Link>
          </div>
        </header>

        <section id="main-content" className="mx-auto grid w-full max-w-7xl gap-8 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:pt-16">
          <div>
            <p className="inline-flex rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm">
              PDF analysis + retrieval + Groq LLM
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl">
              Turn dense research papers into a guided learning experience.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Upload a research-paper PDF to extract text, study tables and figures,
              generate simple explanations, understand technical terms, and ask grounded questions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold shadow-lg"
                style={{ color: "#ffffff" }}
              >
                Create free account
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {paperSections.map((section) => (
              <article key={section.title} className="rounded-[2rem] border border-white/75 bg-white/90 p-6 shadow-[0_16px_36px_rgba(91,67,33,0.08)]">
                <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
                <p className="mt-2 leading-7 text-slate-600">{section.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 pb-16 sm:px-8 md:grid-cols-3">
          {deliverables.map((item) => (
            <article key={item} className="flex items-start gap-3 rounded-3xl border border-white/80 bg-white/90 p-5 text-sm leading-7 text-slate-700 shadow-[0_12px_30px_rgba(91,67,33,0.08)]">
              <span
                className="mt-1 h-3 w-3 flex-none rounded-full bg-amber-500"
                aria-hidden="true"
              />
              <span>{item}</span>
            </article>
          ))}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_26%),radial-gradient(circle_at_85%_15%,_rgba(15,118,110,0.12),_transparent_28%),linear-gradient(180deg,_#fffdf8_0%,_#f7f1e6_52%,_#efe4d0_100%)] text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-slate-950 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-10 lg:py-8">
        <header className="rounded-[2rem] border border-white/70 bg-white/85 px-5 py-4 shadow-[0_12px_30px_rgba(91,67,33,0.08)] backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-800">
                AI Research Paper Explainer
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Upload, explain, question, and learn.
              </h1>
            </div>
            <div className="grid gap-2 sm:text-right">
              <span
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium"
                style={{ color: "#ffffff" }}
              >
                Grounded on uploaded PDFs
              </span>
              <span className="text-sm text-slate-600">
                Reads papers, explains sections, and answers questions from the source
              </span>
              <div className="flex items-center justify-end gap-2 text-sm">
                <span className="text-slate-600">{user.name}</span>
                <Link href="/profile"
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Profile
                </Link>
                <Link href="/history"
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  History
                </Link>
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-[2rem] border border-amber-200/80 bg-amber-50 px-5 py-5 shadow-[0_16px_36px_rgba(91,67,33,0.06)] sm:px-7">
          <p className="text-sm font-semibold text-amber-900">How it works</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Understand a research paper in 3 steps
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <article className="flex gap-3 rounded-2xl bg-white/85 p-4 shadow-sm">
              <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-slate-950 text-sm font-bold" style={{ color: "#ffffff" }}>
                1
              </span>
              <div>
                <h3 className="font-semibold text-slate-950">Upload your paper</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Choose a PDF from your computer.</p>
              </div>
            </article>
            <article className="flex gap-3 rounded-2xl bg-white/85 p-4 shadow-sm">
              <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-slate-950 text-sm font-bold" style={{ color: "#ffffff" }}>
                2
              </span>
              <div>
                <h3 className="font-semibold text-slate-950">Start analysis</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Get simple sections, findings, and key ideas.</p>
              </div>
            </article>
            <article className="flex gap-3 rounded-2xl bg-white/85 p-4 shadow-sm">
              <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-slate-950 text-sm font-bold" style={{ color: "#ffffff" }}>
                3
              </span>
              <div>
                <h3 className="font-semibold text-slate-950">Ask questions</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Chat with the paper and study tables or figures.</p>
              </div>
            </article>
          </div>
        </section>

        <section id="main-content" className="grid flex-1 gap-6 py-6 lg:grid-cols-[1fr_280px] lg:gap-8 lg:py-8">
          <div className="min-w-0">
            <PaperUploadPanel />
          </div>
          <aside className="space-y-4">
            <section className="rounded-[2rem] border border-white/75 bg-white/90 p-5 shadow-[0_16px_36px_rgba(91,67,33,0.08)]">
              <p className="text-sm font-semibold text-slate-500">Account</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">{user.name}</h2>
              <p className="mt-1 break-all text-sm text-slate-600">{user.email}</p>
              <Link
                href="/profile"
                className="mt-4 block rounded-full border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800"
              >
                Open profile
              </Link>
            </section>
            <section className="rounded-[2rem] border border-white/75 bg-white/90 p-5 shadow-[0_16px_36px_rgba(91,67,33,0.08)]">
              <p className="text-sm font-semibold text-slate-500">Saved work</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">Paper history</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Reopen previous analyses and continue grounded chats.
              </p>
              <Link
                href="/history"
                className="mt-4 block rounded-full bg-slate-950 px-4 py-2.5 text-center text-sm font-semibold text-white"
                style={{ color: "#ffffff" }}
              >
                View history
              </Link>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
