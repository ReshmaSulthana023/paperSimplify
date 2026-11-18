"use client";

import { useEffect, useState } from "react";

type SummaryReaderProps = {
  reportSections: Array<{ title: string; body: string }>;
  sectionSummaries: Array<{ title: string; simple: string }>;
  highlights: string[];
  keywords: string[];
};

export function SummaryReader({
  reportSections,
  sectionSummaries,
  highlights,
  keywords,
}: SummaryReaderProps) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const summaryText = [
    ...reportSections.map((section) => `${section.title}. ${section.body}`),
    ...(reportSections.length === 0
      ? sectionSummaries.map((section) => `${section.title}. ${section.simple}`)
      : []),
    ...(highlights.length > 0 ? ["Highlights.", ...highlights] : []),
    ...(keywords.length > 0 ? ["Detected topics.", keywords.join(", ")] : []),
  ].join("\n");

  function readSummary() {
    if (!("speechSynthesis" in window) || !summaryText.trim()) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(summaryText);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.onstart = () => {
      setSpeaking(true);
      setPaused(false);
    };
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    window.speechSynthesis.speak(utterance);
  }

  function pauseOrResume() {
    if (!("speechSynthesis" in window)) {
      return;
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function stopSummary() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    setPaused(false);
  }

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="mr-auto text-sm font-semibold text-slate-700">Listen to this summary</p>
      <button
        type="button"
        onClick={readSummary}
        disabled={speaking}
        className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        style={{ color: "#ffffff" }}
      >
        {speaking ? "Reading..." : "Read aloud"}
      </button>
      {speaking ? (
        <>
          <button
            type="button"
            onClick={pauseOrResume}
            className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800"
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={stopSummary}
            className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800"
          >
            Stop
          </button>
        </>
      ) : null}
    </div>
  );
}
