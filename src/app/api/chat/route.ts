import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDatabase, Paper } from "@/lib/db";

type ChatRequest = {
  question?: string;
  snippets?: string[];
  language?: string;
  paperId?: string;
};

type VisualPage = {
  pageNumber: number;
  dataUrl: string;
  text: string;
};

const GROQ_API_BASE_URL = process.env.GROQ_API_BASE_URL ?? "https://api.groq.com/openai/v1";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const GROQ_FALLBACK_MODELS = [
  GROQ_MODEL,
  "openai/gpt-oss-20b",
].filter((model, index, all) => model && all.indexOf(model) === index);

const stopWords = new Set([
  "a", "an", "and", "are", "about", "for", "from", "how", "is", "it", "many",
  "of", "on", "or", "paper", "research", "the", "this", "to", "what", "where",
  "which", "why", "with",
]);

function retrieveContext(corpus: string[], metadata: string[], question: string) {
  const lowerQuestion = question.toLowerCase();
  const abstractRequest = /\babstract\b|summary of (this |the )?paper|summarize (this |the )?paper/.test(lowerQuestion);

  if (abstractRequest) {
    const abstractMatches = corpus
      .filter((text) => /\babstract\b/i.test(text))
      .slice(0, 4);

    if (abstractMatches.length > 0) {
      return [...metadata, ...abstractMatches].filter((text, index, all) =>
        text.trim().length > 0 && all.indexOf(text) === index
      ).slice(0, 8);
    }

    const openingText = corpus.slice(0, 8).join("\n");
    return [...metadata, openingText].filter((text) => text.trim().length > 0).slice(0, 8);
  }

  const terms = question
    .toLowerCase()
    .match(/[a-z][a-z0-9-]{2,}/g)
    ?.filter((term) => !stopWords.has(term)) ?? [];

  if (terms.length === 0) {
    return [...metadata, ...corpus.slice(0, 8)].slice(0, 12);
  }

  const sources = [...corpus, ...metadata].map((text) => {
    const lowered = text.toLowerCase();
    const score = terms.reduce((total, term) => total + (lowered.includes(term) ? 2 : 0), 0);
    return { text, score };
  });

  const matched = sources
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 10)
    .map((item) => item.text);

  return matched.length > 0
    ? [...metadata, ...matched].filter((text, index, all) => all.indexOf(text) === index).slice(0, 12)
    : [...metadata, ...corpus.slice(0, 8)].slice(0, 12);
}

function retrieveVisualPages(visualPages: VisualPage[], question: string) {
  if (visualPages.length === 0) {
    return [];
  }

  const explicitPage = question.match(/\b(?:page|p\.?)\s*(\d{1,2})\b/i);
  if (explicitPage) {
    const pageNumber = Number(explicitPage[1]);
    const exact = visualPages.find((page) => page.pageNumber === pageNumber);
    if (exact) {
      return [exact];
    }
  }

  const terms = question
    .toLowerCase()
    .match(/[a-z][a-z0-9-]{2,}/g)
    ?.filter((term) => !stopWords.has(term) && !["figure", "table", "chart", "graph", "plot", "diagram"].includes(term)) ?? [];

  if (terms.length === 0) {
    return visualPages.slice(0, 4);
  }

  return [...visualPages]
    .map((page) => ({
      page,
      score: terms.reduce((total, term) => total + (page.text.toLowerCase().includes(term) ? 2 : 0), 0),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map((item) => item.page);
}

function isVisualQuestion(question: string) {
  return /\b(table|graph|chart|plot|figure|diagram|image|picture|visual|axis|legend|experiment result|bar chart)\b/i.test(question);
}

function buildPrompt(question: string, snippets: string[], language: string) {
  const context = snippets.map((snippet, index) => `${index + 1}. ${snippet}`).join("\n");

  return [
    "You are a research paper explainer assistant.",
    "Answer the user's question using only the paper metadata and snippets below.",
    "Write a complete, direct answer. Do not repeat the question or say that the snippets are partial.",
    "For an abstract request, synthesize the purpose, method, findings, and conclusion from the evidence.",
    "Use a short heading followed by 2-4 concise paragraphs or bullet points.",
    "Do not use phrases such as 'the snippets do not contain', 'partial sentence', or 'not enough context'.",
    "For a question asking for the number of pages, use the paper metadata page count.",
    "If the answer is not supported by the provided material, say exactly: Not discussed in the paper.",
    "Do not invent facts, citations, authors, data, or page numbers.",
    "If several snippets are relevant, synthesize a direct answer and preserve the paper's meaning.",
    "When page images are provided, analyze the tables, graphs, figures, axes, labels, legends, and trends visible in those images.",
    "For visual questions, identify the relevant table or figure and explain it in beginner-friendly terms.",
    "Quote numbers and technical terms exactly.",
    "Use simple, beginner-friendly wording and short paragraphs.",
    `Answer in ${language}.`,
    "",
    `Question: ${question}`,
    "",
    "Snippets:",
    context,
  ].join("\n");
}

async function streamGroqChatCompletion(
  question: string,
  snippets: string[],
  language: string,
  visualPages: VisualPage[] = [],
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured on the server.");
  }

  let upstream: Response | null = null;
  let lastError = "";

  for (const model of GROQ_FALLBACK_MODELS) {
    const userContent: unknown = visualPages.length > 0
      ? [
          {
            type: "text",
            text: buildPrompt(question, snippets, language),
          },
          ...visualPages.map((page) => ({
            type: "image_url",
            image_url: { url: page.dataUrl },
          })),
        ]
      : buildPrompt(question, snippets, language);

    const response = await fetch(`${GROQ_API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 900,
        stream: true,
        messages: [
          {
            role: "system",
            content: "You explain research papers in simple English and stay grounded to provided evidence.",
          },
          {
            role: "user",
            content: userContent,
          },
        ],
      }),
    });

    if (response.ok && response.body) {
      upstream = response;
      break;
    }

    lastError = await response.text();
  }

  if (!upstream?.ok || !upstream.body) {
    if (lastError.toLowerCase().includes("quota") || lastError.toLowerCase().includes("rate_limit")) {
      throw new Error("The Groq service quota or rate limit was reached. Please try again later.");
    }
    throw new Error("The AI model is unavailable right now. Please try again.");
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body?.getReader();
      if (!reader) {
        controller.error(new Error("No response stream from model provider."));
        return;
      }

      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) {
              continue;
            }

            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") {
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(payload);
              const chunk = parsed.choices?.[0]?.delta?.content;
              if (typeof chunk === "string" && chunk.length > 0) {
                controller.enqueue(encoder.encode(chunk));
              }
            } catch {
              // Ignore malformed SSE chunks from upstream provider.
            }
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as ChatRequest;
    const question = body.question?.trim();
    let snippets = body.snippets?.filter((snippet) => snippet.trim().length > 0) ?? [];
    let visualPages: VisualPage[] = [];
    const language = body.language?.trim() || "English";

    if (!question) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    if (body.paperId) {
      await connectDatabase();
      const paper = await Paper.findOne({ _id: body.paperId, userId: user.id }).lean();
      if (!paper) {
        return NextResponse.json({ error: "Paper not found." }, { status: 404 });
      }

      const corpus = Array.isArray(paper.corpus)
        ? paper.corpus.map((text: unknown) => String(text)).filter((text: string) => text.trim().length > 0)
        : [];
      const storedVisualPages = Array.isArray(paper.visualPages)
        ? paper.visualPages.map((page: unknown) => {
            const value = page as { pageNumber?: unknown; dataUrl?: unknown; text?: unknown };
            return {
              pageNumber: Number(value.pageNumber) || 0,
              dataUrl: String(value.dataUrl ?? ""),
              text: String(value.text ?? ""),
            };
          }).filter((page: VisualPage) => page.dataUrl.startsWith("data:image/"))
        : [];
      const sections = Array.isArray(paper.reportSections)
        ? paper.reportSections.map((section: unknown) => {
            const value = section as { title?: unknown; body?: unknown };
            return `${String(value.title ?? "")}: ${String(value.body ?? "")}`;
          })
        : [];
      const metadata = [
        `Paper title: ${String(paper.fileName ?? "")}`,
        `Page count: ${Number(paper.pageCount) || 0}`,
        `Summary: ${String(paper.summary ?? "")}`,
        ...sections,
      ];
      snippets = retrieveContext(corpus, metadata, question);
      if (isVisualQuestion(question)) {
        visualPages = retrieveVisualPages(storedVisualPages, question);
      }
    }

    const stream = await streamGroqChatCompletion(question, snippets, language, visualPages);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Unexpected server error while streaming response.",
      },
      { status: 500 },
    );
  }
}
