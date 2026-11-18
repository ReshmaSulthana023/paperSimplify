"use client";

import { useRef, useState } from "react";

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
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: string[];
};

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
    corpus: sentences.slice(0, 300),
  };
}

async function extractPdfText(file: File) {
  const pdfjs = await import("pdfjs-dist");

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const buffer = await file.arrayBuffer();
  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pageTexts: string[] = [];

  for (let pageIndex = 1; pageIndex <= document.numPages; pageIndex += 1) {
    const page = await document.getPage(pageIndex);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    pageTexts.push(pageText);
  }

  return {
    text: pageTexts.join("\n\n"),
    pageCount: document.numPages,
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
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);

  const openFilePicker = () => inputRef.current?.click();

  const handleFileSelection = (files: FileList | null) => {
    const file = files?.[0] ?? null;
    if (!file) {
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      setSelectedFile(null);
      setAnalysis(null);
      setChatMessages([]);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setAnalysis(null);
    setChatMessages([]);
  };

  const analyzePaper = async () => {
    if (!selectedFile) {
      setError("Choose a PDF first, then click Start analysis.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const extracted = await extractPdfText(selectedFile);
      const result = buildSummary(extracted.text, selectedFile.name, extracted.pageCount);
      setAnalysis({
        fileName: selectedFile.name,
        pageCount: extracted.pageCount,
        summary: result.summary,
        highlights: result.highlights,
        keywords: result.keywords,
        sectionSummaries: result.sectionSummaries,
        reportSections: result.reportSections,
        corpus: result.corpus,
      });
      setChatMessages([
        {
          id: createMessageId(),
          role: "assistant",
          text: "The paper is ready. Ask a clear question about the problem, method, results, or limitations.",
        },
      ]);
    } catch (analysisError) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Unable to read that PDF. Please try another file.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const askQuestion = async () => {
    if (!analysis) {
      setError("Analyze a paper first, then ask questions.");
      return;
    }

    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }

    setError(null);
    setIsAnswering(true);
    const userMessageId = createMessageId();
    const assistantMessageId = createMessageId();
    const userMessage: ChatMessage = { id: userMessageId, role: "user", text: trimmed };
    const snippets = retrieveSnippets(analysis.corpus, trimmed);
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      text: "Thinking...",
      sources: snippets,
    };

    setChatMessages((previous) => [...previous, userMessage, assistantMessage]);
    setQuestion("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmed,
          snippets,
        }),
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(errorText || "The AI service is unavailable right now.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let generated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        generated += decoder.decode(value, { stream: true });
        setChatMessages((previous) => previous.map((message) => (
          message.id === assistantMessageId
            ? { ...message, text: generated.trimStart() || "Thinking..." }
            : message
        )));
      }

      if (!generated.trim()) {
        const fallback = buildGroundedAnswer(trimmed, snippets);
        setChatMessages((previous) => previous.map((message) => (
          message.id === assistantMessageId
            ? { ...message, text: fallback }
            : message
        )));
      }
    } catch (chatError) {
      const fallback = buildGroundedAnswer(trimmed, snippets);
      setChatMessages((previous) => previous.map((message) => (
        message.id === assistantMessageId
          ? { ...message, text: fallback }
          : message
      )));
      setError(
        chatError instanceof Error
          ? chatError.message
          : "Unable to stream a live AI response. Showing local grounded answer instead.",
      );
    } finally {
      setIsAnswering(false);
    }
  };

  const dropZoneState = isDragging
    ? "border-amber-500 bg-amber-100/80"
    : "border-amber-300 bg-amber-50/70";

  const safeSectionSummaries = analysis?.sectionSummaries ?? [];
  const safeReportSections = analysis?.reportSections ?? [];
  const safeHighlights = analysis?.highlights ?? [];
  const safeKeywords = analysis?.keywords ?? [];

  return (
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
            onClick={analyzePaper}
            disabled={!selectedFile || isAnalyzing}
            className="inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAnalyzing ? "Analyzing..." : "Start analysis"}
          </button>
        </div>

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

        {analysis ? (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Analysis result</p>
                <h3 className="text-base font-semibold text-slate-950">
                  Simple explanation for {analysis.fileName}
                </h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {analysis.pageCount} page{analysis.pageCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-4 space-y-5">
              <div>
                <p className="text-sm font-semibold text-amber-900">Easy Summary of the Research Paper</p>
                <div className="mt-2 space-y-3">
                  {safeReportSections.length > 0 ? safeReportSections.map((section) => (
                    <article key={section.title} className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">{section.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{section.body}</p>
                    </article>
                  )) : safeSectionSummaries.map((section) => (
                    <article key={section.title} className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">{section.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{section.simple}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-amber-900">Highlights</p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                  {safeHighlights.map((highlight) => (
                    <li key={highlight} className="rounded-2xl bg-slate-50 px-3 py-2">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              {safeKeywords.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-amber-900">Detected topics</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {safeKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <p className="text-sm font-semibold text-amber-900">Ask about this paper</p>
                <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-inner">
                  <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                    {chatMessages.map((message) => (
                      <article
                        key={message.id}
                        className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                          message.role === "user"
                            ? "ml-8 bg-slate-950 text-white"
                            : "mr-8 bg-white text-slate-700"
                        }`}
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
                          {message.role}
                        </p>
                        <p className="mt-1 whitespace-pre-line">{message.text}</p>
                        {message.sources && message.sources.length > 0 ? (
                          <details className="mt-2 text-xs">
                            <summary className="cursor-pointer font-semibold">View retrieved source snippets</summary>
                            <ul className="mt-2 space-y-1">
                              {message.sources.map((source) => (
                                <li key={source} className="rounded-md bg-slate-100 px-2 py-1 leading-5 text-slate-700">
                                  {source}
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : null}
                      </article>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          askQuestion();
                        }
                      }}
                      placeholder="Ask: What is the core contribution of this paper?"
                      className="w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-amber-300 placeholder:text-slate-400 focus:ring"
                    />
                    <button
                      type="button"
                      onClick={askQuestion}
                      disabled={!analysis || !question.trim() || isAnswering}
                      className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Ask
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
