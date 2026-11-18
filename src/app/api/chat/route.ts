import { NextResponse } from "next/server";

type ChatRequest = {
  question?: string;
  snippets?: string[];
};

const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL ?? "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

function buildPrompt(question: string, snippets: string[]) {
  const context = snippets.length > 0
    ? snippets.map((snippet, index) => `${index + 1}. ${snippet}`).join("\n")
    : "No relevant snippets were retrieved.";

  return [
    "You are a research paper explainer assistant.",
    "Answer only from the provided snippets.",
    "If the answer is not present, say: Not discussed in the paper.",
    "Use simple, beginner-friendly wording and short paragraphs.",
    "",
    `Question: ${question}`,
    "",
    "Snippets:",
    context,
  ].join("\n");
}

async function streamOpenAIChatCompletion(question: string, snippets: string[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }

  const upstream = await fetch(`${OPENAI_API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      stream: true,
      messages: [
        {
          role: "system",
          content: "You explain research papers in simple English and stay grounded to provided evidence.",
        },
        {
          role: "user",
          content: buildPrompt(question, snippets),
        },
      ],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const details = await upstream.text();
    throw new Error(details || "Failed to fetch a streaming response from the model provider.");
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
  try {
    const body = (await request.json()) as ChatRequest;
    const question = body.question?.trim();
    const snippets = body.snippets?.filter((snippet) => snippet.trim().length > 0) ?? [];

    if (!question) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    const stream = await streamOpenAIChatCompletion(question, snippets);

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
