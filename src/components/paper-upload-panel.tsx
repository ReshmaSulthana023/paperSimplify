"use client";

import { useEffect, useRef, useState } from "react";
type SectionSummary = {
  title: string;
  simple: string;
};

type ReportSection = {
  title: string;
  body: string;
};

type AnalysisResult = {
  fileName: string;
  pageCount: number;
  summary: string;
  highlights: string[];
  keywords: string[];
  sectionSummaries: SectionSummary[];
  reportSections: ReportSection[];
  corpus: string[];
  visualPages: VisualPage[];
};

type VisualPage = {
  pageNumber: number;
  dataUrl: string;
  text: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: string[];
};

type SavedPaper = {
  _id: string;
  fileName: string;
  pageCount: number;
  summary: string;
  createdAt: string;
};

const SESSION_PAPERS_KEY = "paper-explainer-session-papers";

const missingInfoText = "Not discussed in the paper.";

const stopWords = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "this",
  "from",
  "into",
  "are",
  "was",
  "were",
  "have",
  "has",
  "had",
  "our",
  "their",
  "they",
  "them",
  "can",
  "will",
  "not",
  "use",
  "used",
  "using",
  "paper",
  "research",
  "study",
  "results",
  "method",
  "methods",
  "based",
  "also",
  "such",
  "through",
  "which",
  "these",
  "those",
  "more",
  "than",
  "been",
  "between",
  "over",
  "under",
  "within",
  "about",
  "when",
  "where",
  "what",
  "why",
  "how",
]);

const sectionDefinitions = [
  {
    title: "Problem and motivation",
    keywords: ["problem", "motivation", "challenge", "gap", "need", "objective"],
  },
  {
    title: "Methodology",
    keywords: ["method", "approach", "framework", "model", "algorithm", "pipeline"],
  },
  {
    title: "Results",
    keywords: ["results", "experiment", "performance", "accuracy", "benchmark", "evaluation"],
  },
  {
    title: "Limitations",
    keywords: ["limitation", "limitations", "however", "future work", "constraint", "trade-off"],
  },
];

function splitSentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 45);
}

function topKeywords(text: string) {
  const frequency = new Map<string, number>();
  for (const word of text.toLowerCase().match(/[a-z][a-z-]{2,}/g) ?? []) {
    if (stopWords.has(word)) {
      continue;
    }
    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  }

  return [...frequency.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([word]) => word);
}

function sentenceScore(sentence: string, keywords: string[]) {
  const lowered = sentence.toLowerCase();
  return keywords.reduce((score, keyword) => {
    return score + (lowered.includes(keyword) ? 1 : 0);
  }, 0);
}

function pickTopSentences(sentences: string[], keywords: string[], count: number) {
  return [...sentences]
    .map((sentence) => ({ sentence, score: sentenceScore(sentence, keywords) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, count)
    .map((item) => item.sentence);
}

function simplifySentence(sentence: string) {
  return sentence
    .replace(/\((.*?)\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toFriendlySentence(sentence: string) {
  return simplifySentence(sentence)
    .replace(/\bwe propose\b/gi, "the authors introduce")
    .replace(/\bwe present\b/gi, "the paper presents")
    .replace(/\bour model\b/gi, "the model")
    .replace(/\bstate-of-the-art\b/gi, "very strong")
    .replace(/\be.g\.\b/gi, "for example")
    .replace(/\bi\.e\.\b/gi, "that is")
    .replace(/\s+/g, " ");
}

function firstMeaningfulSentence(sentences: string[], keywords: string[]) {
  return pickTopSentences(sentences, keywords, 1)[0] ?? "";
}

function summarizeTopic(label: string, evidence: string, fallback: string) {
  if (!evidence) {
    return fallback;
  }

  const cleanEvidence = toFriendlySentence(evidence);
  if (!cleanEvidence) {
    return fallback;
  }

  return `${label}: ${cleanEvidence}`;
}

function summarizeAsPlainEnglish(evidence: string, fallback: string) {
  if (!evidence) {
    return fallback;
  }

  const cleanEvidence = toFriendlySentence(evidence)
    .replace(/^the paper /i, "It ")
    .replace(/^this study /i, "It ")
    .replace(/^we /i, "The paper ");

  if (!cleanEvidence) {
    return fallback;
  }

  return cleanEvidence.endsWith(".") ? cleanEvidence : `${cleanEvidence}.`;
}

function buildReportSections(sentences: string[], keywords: string[], pageCount: number) {
  const topic = keywords.slice(0, 3).join(", ");
  const problem = firstMeaningfulSentence(sentences, ["problem", "challenge", "gap", "motivation", "objective", "need"]);
  const objective = firstMeaningfulSentence(sentences, ["aim", "goal", "objective", "purpose", "study", "investigate"]);
  const method = firstMeaningfulSentence(sentences, ["method", "approach", "framework", "pipeline", "algorithm", "model"]);
  const findings = firstMeaningfulSentence(sentences, ["results", "finding", "findings", "performance", "experiment", "evaluation"]);
  const conclusion = firstMeaningfulSentence(sentences, ["conclusion", "conclude", "overall", "in summary", "therefore"]);
  const limitations = firstMeaningfulSentence(sentences, ["limitation", "limitations", "future work", "however", "constraint", "trade-off"]);
  const benefits = firstMeaningfulSentence(sentences, ["benefit", "advantages", "help", "improve", "support", "useful"]);

  return [
    {
      title: "1. What is this paper about?",
      body: topic
        ? `This paper studies ${topic}.`
        : missingInfoText,
    },
    {
      title: "2. Problem Statement",
      body: problem
        ? summarizeAsPlainEnglish(problem, missingInfoText)
        : missingInfoText,
    },
    {
      title: "3. Objective",
      body: objective
        ? summarizeAsPlainEnglish(objective, missingInfoText)
        : missingInfoText,
    },
    {
      title: "4. Participants / Data",
      body: pageCount > 0 && sentences.length > 0
        ? `${missingInfoText}`
        : missingInfoText,
    },
    {
      title: "5. Research Method",
      body: method
        ? summarizeAsPlainEnglish(method, missingInfoText)
        : missingInfoText,
    },
    {
      title: "6. Main Findings",
      body: findings
        ? summarizeAsPlainEnglish(findings, missingInfoText)
        : missingInfoText,
    },
    {
      title: "7. Conclusion",
      body: conclusion
        ? summarizeAsPlainEnglish(conclusion, missingInfoText)
        : missingInfoText,
    },
    {
      title: "8. Advantages",
      body: benefits
        ? summarizeAsPlainEnglish(benefits, missingInfoText)
        : missingInfoText,
    },
    {
      title: "9. Limitations",
      body: limitations
        ? summarizeAsPlainEnglish(limitations, missingInfoText)
        : missingInfoText,
    },
    {
      title: "10. One-Page Exam Notes",
      body:
        [
          topic ? `Topic: ${topic}.` : `Topic: ${missingInfoText}`,
          method ? `Method: ${summarizeAsPlainEnglish(method, missingInfoText)}` : `Method: ${missingInfoText}`,
          findings ? `Main point: ${summarizeAsPlainEnglish(findings, missingInfoText)}` : `Main point: ${missingInfoText}`,
          limitations ? `Limitation: ${summarizeAsPlainEnglish(limitations, missingInfoText)}` : `Limitation: ${missingInfoText}`,
        ].join(" "),
    },
  ];
}

function buildSectionSummaries(sentences: string[]) {
  return sectionDefinitions.map((definition) => {
    const picked = pickTopSentences(sentences, definition.keywords, 1).map(toFriendlySentence);
    return {
      title: definition.title,
      simple:
        picked.length > 0
          ? picked.join(" ")
          : missingInfoText,
    };
  });
}

function buildSummary(text: string, fileName: string, pageCount: number) {
  const cleanedText = text.replace(/\s+/g, " ").trim();
  const sentences = splitSentences(cleanedText);
  const chunks: string[] = [];
  for (let index = 0; index < cleanedText.length; index += 1200) {
    chunks.push(cleanedText.slice(index, index + 1200).trim());
  }
  const corpus = [...sentences, ...chunks]
    .filter((textChunk, index, all) => textChunk.length > 0 && all.indexOf(textChunk) === index)
    .slice(0, 400);
  const keywords = topKeywords(cleanedText);
  const problem = firstMeaningfulSentence(sentences, ["problem", "challenge", "gap", "motivation", "objective", "need"]);
  const method = firstMeaningfulSentence(sentences, ["method", "approach", "framework", "pipeline", "algorithm", "model"]);
  const results = firstMeaningfulSentence(sentences, ["results", "performance", "experiment", "accuracy", "evaluation", "benchmark"]);
  const limitations = firstMeaningfulSentence(sentences, ["limitation", "limitations", "future work", "however", "constraint", "trade-off"]);

  const summaryLines = [
    `This paper has ${pageCount} page${pageCount === 1 ? "" : "s"}.`,
    keywords.length > 0
      ? `Main topic: ${keywords.slice(0, 3).join(", ")}.`
      : `Main topic: ${missingInfoText}`,
    summarizeTopic("What the paper is about", problem, missingInfoText),
    summarizeTopic("How it works", method, missingInfoText),
    summarizeTopic("What the results say", results, missingInfoText),
    summarizeTopic("Limitations", limitations, missingInfoText),
  ];

  const plainSummary = summaryLines.filter((line, index) => index !== 0 || line.length > 0);

  return {
    summary: plainSummary.join("\n\n"),
    highlights: [
      keywords.length > 0
        ? `Main topics detected: ${keywords.map((word) => word.replace(/-/g, " ")).join(", ")}`
        : `Main topics detected: ${missingInfoText}`,
      "Read the section summaries below for a short, simple explanation.",
    ],
    keywords,
    sectionSummaries: buildSectionSummaries(sentences),
    reportSections: buildReportSections(sentences, keywords, pageCount),
    corpus,
  };
}

async function extractPdfText(
  file: File,
  onPageProcessed?: (current: number, total: number) => void,
) {
  const pdfjs = await import("pdfjs-dist");

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const buffer = await file.arrayBuffer();
  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pageTexts: string[] = [];
  const visualPages: VisualPage[] = [];
  const pagesToRead = Math.min(document.numPages, 12);

  for (let batchStart = 1; batchStart <= pagesToRead; batchStart += 8) {
    const batchEnd = Math.min(batchStart + 7, pagesToRead);
    const batch = await Promise.all(
      Array.from({ length: batchEnd - batchStart + 1 }, async (_, offset) => {
        const pageIndex = batchStart + offset;
        const page = await document.getPage(pageIndex);
        const content = await page.getTextContent();
        return {
          pageIndex,
          pageText: content.items.map((item) => ("str" in item ? item.str : "")).join(" "),
        };
      }),
    );

    for (const { pageIndex, pageText } of batch) {
      pageTexts.push(pageText);
      onPageProcessed?.(pageIndex, pagesToRead);
    }
  }

  return {
    text: pageTexts.join("\n\n"),
    pageCount: document.numPages,
    visualPages,
  };
}

function tokenizeQuery(input: string) {
  return input
    .toLowerCase()
    .match(/[a-z][a-z-]{2,}/g)
    ?.filter((word) => !stopWords.has(word)) ?? [];
}

function retrieveSnippets(corpus: string[], question: string) {
  const queryTerms = tokenizeQuery(question);
  if (queryTerms.length === 0) {
    return corpus.slice(0, 3);
  }

  return [...corpus]
    .map((sentence) => ({
      sentence,
      score: queryTerms.reduce((score, term) => score + (sentence.toLowerCase().includes(term) ? 1 : 0), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((item) => item.sentence);
}

function createMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildGroundedAnswer(question: string, snippets: string[]) {
  if (snippets.length === 0) {
    return missingInfoText;
  }

  const base = snippets[0] ? toFriendlySentence(snippets[0]) : "";
  const support = snippets[1] ? toFriendlySentence(snippets[1]) : "";
  const caution = snippets[2] ? toFriendlySentence(snippets[2]) : "";

  const answer = [
    base ? `Simple answer: ${base}` : missingInfoText,
    support ? `More context: ${support}` : missingInfoText,
    caution ? `Important note: ${caution}` : missingInfoText,
  ];

  return answer.filter((line) => line !== missingInfoText || answer.every((part) => part === missingInfoText)).join("\n\n");
}

export function PaperUploadPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState("");
  const [savedPapers, setSavedPapers] = useState<SavedPaper[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = window.sessionStorage.getItem(SESSION_PAPERS_KEY);
      return stored ? JSON.parse(stored) as SavedPaper[] : [];
    } catch {
      return [];
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [profession, setProfession] = useState<string | null>(null);
  const [professionInput, setProfessionInput] = useState("");
  const [showProfessionPrompt, setShowProfessionPrompt] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((response) => response.ok ? response.json() : null)
      .then((body) => {
        const value = body?.profile?.profession?.trim() ?? "";
        setProfession(value || null);
      })
      .catch(() => setProfession(null));

  }, []);

  const openFilePicker = () => inputRef.current?.click();

  const handleFileSelection = (files: FileList | null) => {
    const file = files?.[0] ?? null;
    if (!file) {
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const saveProfession = async () => {
    const value = professionInput.trim();
    if (!value) {
      setError("Please enter your profession.");
      return;
    }

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profession: value }),
    });
    if (!response.ok) {
      setError("Unable to save your profession.");
      return;
    }

    setProfession(value);
    setShowProfessionPrompt(false);
    setError(null);
    await analyzePaper(true);
  };

  const analyzePaper = async (professionConfirmed = false) => {
    if (!selectedFile) {
      setError("Choose a PDF first, then click Start analysis.");
      return;
    }
    if (!professionConfirmed && !profession) {
      setShowProfessionPrompt(true);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    const analysisWindow = window.open("about:blank", "_blank");
    if (analysisWindow) {
      analysisWindow.document.title = "Analyzing paper...";
      analysisWindow.document.body.innerHTML =
        '<main style="min-height:100vh;display:grid;place-items:center;font-family:Arial,sans-serif;background:#fffdf8;color:#334155">' +
        '<div style="text-align:center"><h1 style="margin:0 0 12px">Analyzing your paper</h1>' +
        '<p id="analysis-status" style="margin:0">Reading PDF...</p></div></main>';
    }

    try {
      setAnalysisProgress("Reading PDF...");
      if (analysisWindow) {
        analysisWindow.document.getElementById("analysis-status")?.replaceChildren(
          analysisWindow.document.createTextNode("Reading PDF...")
        );
      }

      const uploadForm = new FormData();
      uploadForm.append("file", selectedFile);
      void fetch("/api/papers/upload", {
        method: "POST",
        body: uploadForm,
      }).catch(() => undefined);

      const extracted = await extractPdfText(selectedFile, (current, total) => {
        const progress = `Reading page ${current} of ${total}...`;
        setAnalysisProgress(progress);
        if (analysisWindow) {
          analysisWindow.document.getElementById("analysis-status")?.replaceChildren(
            analysisWindow.document.createTextNode(progress)
          );
        }
      });

      setAnalysisProgress("Building summary...");
      if (analysisWindow) {
        analysisWindow.document.getElementById("analysis-status")?.replaceChildren(
          analysisWindow.document.createTextNode("Building structured report...")
        );
      }
      const result = buildSummary(extracted.text, selectedFile.name, extracted.pageCount);

      setAnalysisProgress("Saving analysis...");
      if (analysisWindow) {
        analysisWindow.document.getElementById("analysis-status")?.replaceChildren(
          analysisWindow.document.createTextNode("Saving analysis...")
        );
      }
      const saveResponse = await fetch("/api/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          pageCount: extracted.pageCount,
          summary: result.summary,
          highlights: result.highlights,
          keywords: result.keywords,
          sectionSummaries: result.sectionSummaries,
          reportSections: result.reportSections,
          corpus: result.corpus,
          visualPages: extracted.visualPages,
          blobName: "",
          blobContainer: "",
        }),
      });
      if (saveResponse.ok) {
        const saved = await saveResponse.json();
        const savedPaperId = String(saved.id);
        setSavedPapers(() => {
          const updated = [
            {
              _id: savedPaperId,
              fileName: selectedFile.name,
              pageCount: extracted.pageCount,
              summary: result.summary,
              createdAt: new Date().toISOString(),
            },
          ];
          window.sessionStorage.setItem(SESSION_PAPERS_KEY, JSON.stringify(updated));
          return updated;
        });
        if (analysisWindow) {
          analysisWindow.location.href = `/analysis/${savedPaperId}`;
        } else {
          window.location.href = `/analysis/${savedPaperId}`;
        }
      } else {
        analysisWindow?.close();
        setError("The analysis worked, but the paper could not be saved to your account.");
      }
    } catch (analysisError) {
      analysisWindow?.close();
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Unable to read that PDF. Please try another file.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dropZoneState = isDragging
    ? "border-amber-500 bg-amber-100/80"
    : "border-amber-300 bg-amber-50/70";

  return (
    <>
      {showProfessionPrompt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="profession-title"
            className="w-full max-w-md rounded-[2rem] border border-white bg-white p-7 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">One-time profile setup</p>
            <h2 id="profession-title" className="mt-2 text-2xl font-semibold text-slate-950">What is your profession?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This is saved once to personalize your profile.
            </p>
            <input
              type="text"
              value={professionInput}
              onChange={(event) => setProfessionInput(event.target.value)}
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
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setShowProfessionPrompt(false)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600">
                Cancel
              </button>
              <button type="button" onClick={() => void saveProfession()}
                className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white">
                Save and analyze
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-white/75 bg-white/90 p-6 shadow-[0_16px_36px_rgba(91,67,33,0.08)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">Upload paper</p>
          <h2 className="text-xl font-semibold text-slate-950">PDF ingestion queue</h2>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          OCR ready
        </span>
      </div>

      <div
        className={`mt-5 rounded-3xl border border-dashed p-6 text-center transition-colors ${dropZoneState}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFileSelection(event.dataTransfer.files);
        }}
      >
        <p className="text-base font-semibold text-amber-900">Drag and drop a paper PDF</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Or choose a PDF file, then click Start analysis to generate section-wise simple explanations.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => handleFileSelection(event.target.files)}
        />

        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={openFilePicker}
            className="rounded-full border border-slate-900/10 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Choose PDF
          </button>
          <button
            type="button"
            onClick={() => void analyzePaper()}
            disabled={!selectedFile || isAnalyzing}
            className="inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ color: "#ffffff" }}
          >
            {isAnalyzing ? "Analyzing..." : "Start analysis"}
          </button>
        </div>

        {isAnalyzing && analysisProgress ? (
          <p className="mt-4 text-sm font-medium text-amber-800" role="status" aria-live="polite">
            {analysisProgress}
          </p>
        ) : null}

        <div className="mt-4 space-y-2 text-sm">
          <p className="font-medium text-slate-700">
            {selectedFile ? `Selected file: ${selectedFile.name}` : "No PDF selected yet."}
          </p>
          <p className="leading-6 text-slate-500">
            The app reads text from your PDF in-browser, then builds simple summaries and grounded Q and A.
          </p>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="mt-6 border-t border-amber-200 pt-5 text-left">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-800">Uploaded papers</p>
            {savedPapers.length > 0 ? (
              <span className="text-xs font-medium text-slate-500">{savedPapers.length} saved</span>
            ) : null}
          </div>

          {savedPapers.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No uploaded papers yet.</p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {savedPapers.map((paper) => (
                <a
                  key={paper._id}
                  href={`/analysis/${paper._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-amber-400 hover:shadow-md"
                >
                  <p className="truncate text-sm font-semibold text-slate-900">{paper.fileName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {paper.pageCount} page{paper.pageCount === 1 ? "" : "s"}
                    {paper.createdAt ? ` · ${new Date(paper.createdAt).toLocaleDateString()}` : ""}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>

      </div>
      </section>
    </>
  );
}
