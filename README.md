# AI Research Paper Explainer

This app lets users upload a research-paper PDF, extract text in-browser, generate beginner-friendly summaries, and ask grounded questions. Chat answers are produced by a live external LLM API and streamed token-by-token in the UI.

## Features

- PDF ingestion with `pdfjs-dist`
- Section-wise summary and highlights
- Grounded Q&A using retrieved snippets from the uploaded paper
- Live LLM integration through backend API route
- Streaming responses rendered progressively in chat
- Responsive and accessible UI for desktop and mobile

## LLM API Setup

Create a `.env.local` file in the project root:

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
# Optional override for OpenAI-compatible providers
# OPENAI_API_BASE_URL=https://api.openai.com/v1
```

The backend route at `src/app/api/chat/route.ts` connects to the external model provider and streams text chunks to the frontend.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Docker

Build the image:

```bash
docker build -t paper-explainer-platform .
```

Run the container:

```bash
docker run --rm -p 3000:3000 \
	-e OPENAI_API_KEY=your_openai_api_key \
	-e OPENAI_MODEL=gpt-4o-mini \
	paper-explainer-platform
```

Then open `http://localhost:3000`.
