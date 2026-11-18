import { NextResponse } from "next/server";
import { connectDatabase, Paper } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  await connectDatabase();
  const papers = await Paper.find({ userId: user.id }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({ papers });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const fileName = String(body.fileName ?? "").trim();
    if (!fileName) {
      return NextResponse.json({ error: "File name is required." }, { status: 400 });
    }

    await connectDatabase();
    const paper = await Paper.create({
      userId: user.id,
      fileName,
      pageCount: Number(body.pageCount) || 0,
      summary: String(body.summary ?? ""),
      highlights: body.highlights ?? [],
      keywords: body.keywords ?? [],
      sectionSummaries: body.sectionSummaries ?? [],
      reportSections: body.reportSections ?? [],
      corpus: body.corpus ?? [],
      visualPages: body.visualPages ?? [],
      blobName: String(body.blobName ?? "").trim() || null,
      blobContainer: String(body.blobContainer ?? "").trim() || null,
    });

    return NextResponse.json({ id: String(paper._id) });
  } catch {
    return NextResponse.json({ error: "Unable to save paper." }, { status: 500 });
  }
}
