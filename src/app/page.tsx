import { PaperUploadPanel } from "@/components/paper-upload-panel";

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

export default function Home() {
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
              <span className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
                Grounded on uploaded PDFs
              </span>
              <span className="text-sm text-slate-600">
                Reads papers, explains sections, and answers questions from the source
              </span>
            </div>
          </div>
        </header>

        <section id="main-content" className="grid flex-1 gap-6 py-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8 lg:py-8">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/75 bg-white/90 p-6 shadow-[0_16px_36px_rgba(91,67,33,0.08)] backdrop-blur sm:p-7">
              <span className="inline-flex w-fit items-center rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-900 shadow-sm">
                NLP + RAG + LLMs for research comprehension
              </span>
              <div className="mt-5 space-y-4">
                <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Turn dense research papers into a guided learning experience.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
                  This app lets you upload a research paper PDF, extract its
                  structure, generate section-wise summaries, highlight key ideas,
                  and ask questions that are answered only from the uploaded paper.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {paperSections.map((section) => (
                  <article
                    key={section.title}
                    className="rounded-3xl border border-white/75 bg-amber-50/80 p-4 shadow-[0_12px_24px_rgba(91,67,33,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(91,67,33,0.1)]"
                  >
                    <h3 className="text-base font-semibold text-slate-950">
                      {section.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {section.body}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <article className="rounded-[2rem] border border-slate-200/70 bg-slate-950 px-6 py-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
                <p className="text-xs uppercase tracking-[0.28em] text-amber-300/80">
                  What the app gives you
                </p>
                <div className="mt-4 space-y-3">
                  {deliverables.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] border border-white/75 bg-white/90 p-6 shadow-[0_16px_36px_rgba(91,67,33,0.08)] backdrop-blur sm:p-7">
                <p className="text-sm font-semibold text-slate-500">How to use it</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-950">
                  Ask questions after uploading a paper
                </h3>
                <div className="mt-4 space-y-3 rounded-3xl bg-slate-50 p-4">
                  {chatExamples.map((message) => (
                    <div
                      key={`${message.role}-${message.text}`}
                      className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        message.role === "User"
                          ? "ml-auto bg-slate-950 text-white"
                          : "bg-white text-slate-700 shadow-sm"
                      }`}
                    >
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
                        {message.role}
                      </p>
                      {message.text}
                    </div>
                  ))}
                </div>
              </article>
            </section>

          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/75 bg-white/90 p-6 shadow-[0_16px_36px_rgba(91,67,33,0.08)] backdrop-blur sm:p-7">
              <p className="text-sm font-semibold text-slate-500">What the app does</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">
                A simple explainer for research papers
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                The application reads a PDF in the browser, extracts the text,
                identifies important sections, creates readable summaries, and
                supports grounded question answering using snippets from the same
                document.
              </p>
            </section>
              <section className="rounded-[2rem] border border-white/75 bg-white/90 p-6 shadow-[0_16px_36px_rgba(91,67,33,0.08)] backdrop-blur sm:p-7">
                <p className="text-sm font-semibold text-slate-500">User flow</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-950">
                  What happens after you upload a PDF
                </h3>
                <ol className="mt-4 space-y-3">
                  {roadmap.map((step, index) => (
                    <li key={step} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-900">
                        {index + 1}
                      </span>
                      <span className="pt-1 leading-6">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

            <section className="rounded-[2rem] border border-white/75 bg-white/90 p-6 shadow-[0_16px_36px_rgba(91,67,33,0.08)] backdrop-blur sm:p-7">
              <p className="text-sm font-semibold text-slate-500">Accessibility</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">
                Designed to work on desktop and mobile
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                  Clear contrast, large type, and card-based sections keep the page
                  easy to scan on small screens.
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                  The layout stacks naturally on mobile and keeps the upload and Q&A
                  flow accessible with simple controls.
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
              <p className="text-xs uppercase tracking-[0.28em] text-amber-300/80">
                Why it works
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                It combines PDF text extraction, section-level summarization, and
                retrieval-based answering so the responses stay tied to the paper
                instead of drifting into generic AI output.
              </p>
            </section>
          </div>
        </section>

        <section className="mt-2 w-full pb-4 lg:pb-0">
          <PaperUploadPanel />
        </section>
      </div>
    </main>
  );
}
