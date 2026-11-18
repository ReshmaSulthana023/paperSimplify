"use client";

import { useEffect, useRef, useState } from "react";
import { TechnicalText } from "@/components/technical-text";

type ChatMessage = {
  id: number | string;
  role: "user" | "assistant";
  text: string;
  sources?: string[];
};

type SpeechLanguage = {
  name: string;
  code: string;
};

type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: {
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
  }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

const speechLanguages: SpeechLanguage[] = [
  { name: "English", code: "en-US" },
  { name: "Telugu", code: "te-IN" },
  { name: "Hindi", code: "hi-IN" },
  { name: "Marathi", code: "mr-IN" },
  { name: "Kannada", code: "kn-IN" },
  { name: "Tamil", code: "ta-IN" },
];

function retrieveSnippets(corpus: string[], question: string) {
  const terms = question
    .toLowerCase()
    .match(/[a-z][a-z-]{2,}/g)
    ?.filter((term) => !["the", "and", "for", "with", "what", "about", "paper"].includes(term)) ?? [];

  if (terms.length === 0) {
    return corpus.slice(0, 4);
  }

  return [...corpus]
    .map((sentence) => ({
      sentence,
      score: terms.reduce(
        (score, term) => score + (sentence.toLowerCase().includes(term) ? 1 : 0),
        0,
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map((item) => item.sentence);
}

function formatAnswer(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim());
}

export function PaperChat({
  paperId,
  corpus,
}: {
  paperId: string;
  corpus: string[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [answering, setAnswering] = useState(false);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechPaused, setSpeechPaused] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const voiceTimeoutRef = useRef<number | null>(null);
  const selectedLanguageName =
    speechLanguages.find((language) => language.code === selectedLanguage)?.name ?? "English";

  useEffect(() => {
    fetch(`/api/chat/messages?paperId=${paperId}`)
      .then((response) => response.ok ? response.json() : null)
      .then((body) => {
        if (body?.messages) {
          setMessages(body.messages);
        }
      })
      .catch(() => undefined);
  }, [paperId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (voiceTimeoutRef.current !== null) {
        window.clearTimeout(voiceTimeoutRef.current);
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function startVoiceInput() {
    const speechWindow = window as typeof window & {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setError("Voice input is not supported by this browser. Use Chrome or Edge.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setListening(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone access is not supported. Use Chrome or Edge on localhost or HTTPS.");
      return;
    }

    try {
      const microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStream.getTracks().forEach((track) => track.stop());
    } catch {
      setError("Microphone access is required. Allow microphone permission in your browser and try again.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = selectedLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => {
      setListening(true);
      setError("");
      if (voiceTimeoutRef.current !== null) {
        window.clearTimeout(voiceTimeoutRef.current);
      }
      voiceTimeoutRef.current = window.setTimeout(() => {
        recognition.stop();
      }, 15000);
    };
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript ?? "";
      }
      setQuestion((previous) => `${previous}${previous ? " " : ""}${transcript.trim()}`.trim());
      setError("");
    };
    recognition.onerror = (event) => {
      if (voiceTimeoutRef.current !== null) {
        window.clearTimeout(voiceTimeoutRef.current);
        voiceTimeoutRef.current = null;
      }

      if (event.error === "not-allowed") {
        setError("Microphone access was denied. Allow it in browser permissions and try again.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please speak clearly near the microphone and try again.");
      } else if (event.error === "audio-capture") {
        setError("No working microphone was found. Check your microphone connection.");
      } else if (event.error === "network") {
        setError("Voice recognition network error. Check your internet connection.");
      } else {
        setError("Voice input could not start. Please try again.");
      }
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      if (voiceTimeoutRef.current !== null) {
        window.clearTimeout(voiceTimeoutRef.current);
        voiceTimeoutRef.current = null;
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  }

  function readAnswer(text: string) {
    if (!("speechSynthesis" in window)) {
      setError("Text-to-speech is not supported by this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.rate = 0.95;
    utterance.onstart = () => {
      setSpeaking(true);
      setSpeechPaused(false);
    };
    utterance.onend = () => {
      setSpeaking(false);
      setSpeechPaused(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setSpeechPaused(false);
    };
    window.speechSynthesis.speak(utterance);
  }

  function pauseAnswer() {
    if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setSpeechPaused(true);
    }
  }

  function resumeAnswer() {
    if ("speechSynthesis" in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setSpeechPaused(false);
    }
  }

  function stopAnswer() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    setSpeechPaused(false);
  }

  async function askQuestion() {
    const trimmed = question.trim();
    if (!trimmed || answering) {
      return;
    }

    setQuestion("");
    setError("");
    setAnswering(true);

    const sources = retrieveSnippets(corpus, trimmed);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      text: "Thinking...",
      sources,
    };
    setMessages((previous) => [...previous, userMessage, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId,
          question: trimmed,
          snippets: sources,
          language: selectedLanguageName,
        }),
      });
      if (!response.ok || !response.body) {
        throw new Error(await response.text() || "Groq could not answer this question.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";

      while (true) {
        const chunk = await reader.read();
        if (chunk.done) {
          break;
        }
        answer += decoder.decode(chunk.value, { stream: true });
        setMessages((previous) => previous.map((message) =>
          message.id === assistantMessage.id
            ? { ...message, text: answer || "Thinking..." }
            : message,
        ));
      }

      answer = answer.trim();
      if (!answer) {
        answer = "Not discussed in the paper.";
      }

      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId,
          question: trimmed,
          answer,
          sources,
        }),
      });
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : "Unable to contact Groq.");
      setMessages((previous) => previous.map((message) =>
        message.id === assistantMessage.id
          ? { ...message, text: "The AI response could not be completed. Please try again." }
          : message,
      ));
    } finally {
      setAnswering(false);
    }
  }

  return (
    <section className="mt-12 border-t border-slate-200 pt-8">
      <h2 className="text-2xl font-semibold text-slate-950">Ask the AI chatbot</h2>
      <p className="mt-2 text-sm text-slate-600">
        Answers are grounded in this paper and generated through Groq.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          Language
          <select
            value={selectedLanguage}
            onChange={(event) => setSelectedLanguage(event.target.value)}
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none"
          >
            {speechLanguages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
          </select>
        </label>

      </div>

      <div className="mt-5 max-h-[520px] space-y-5 overflow-y-auto pr-2">
        {messages.length === 0 ? (
          <p className="text-base leading-7 text-slate-500">
            Start by asking about the problem, method, findings, or limitations.
          </p>
        ) : messages.map((message) => (
          <div key={message.id}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {message.role === "user" ? "You" : "Groq assistant"}
            </p>
            {message.role === "assistant" ? (
              <div className="mt-2 text-base leading-8 text-slate-800">
                {formatAnswer(message.text).map((line, index) => {
                  if (!line) {
                    return <div key={`${message.id}-blank-${index}`} className="h-2" />;
                  }
                  if (/^[-*]\s+/.test(line)) {
                    return (
                      <p key={`${message.id}-${index}`} className="ml-5 list-item marker:text-amber-700">
                        <TechnicalText text={line.replace(/^[-*]\s+/, "")} />
                      </p>
                    );
                  }
                  if (/^#{1,3}\s/.test(line)) {
                    return (
                      <p key={`${message.id}-${index}`} className="mt-2 font-semibold text-slate-950">
                        <TechnicalText text={line.replace(/^#{1,3}\s/, "")} />
                      </p>
                    );
                  }
                  return (
                    <p key={`${message.id}-${index}`}>
                      <TechnicalText text={line} />
                    </p>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-base leading-8 text-slate-800">
                {message.text}
              </p>
            )}
            {message.role === "assistant" && message.text !== "Thinking..." ? (
              <button
                type="button"
                onClick={() => readAnswer(message.text)}
                className="mt-2 text-sm font-semibold text-amber-800"
              >
                Read aloud
              </button>
            ) : null}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={startVoiceInput}
          aria-pressed={listening}
          className={`self-end rounded-full border px-5 py-3 text-sm font-semibold ${
            listening
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-slate-300 text-slate-800"
          }`}
        >
          {listening ? "Listening..." : "Speak"}
        </button>
        {speaking ? (
          <button
            type="button"
            onClick={speechPaused ? resumeAnswer : pauseAnswer}
            className="self-end rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800"
          >
            {speechPaused ? "Resume" : "Pause"}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="self-end rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-400"
          >
            Resume
          </button>
        )}
        <button
          type="button"
          onClick={stopAnswer}
          disabled={!speaking}
          className="self-end rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 disabled:border-slate-200 disabled:text-slate-400"
        >
          Stop
        </button>
        <textarea
          rows={2}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void askQuestion();
            }
          }}
          placeholder="Ask a question about this paper..."
          className="w-full resize-none border-b border-slate-300 bg-transparent px-1 py-3 text-base outline-none focus:border-amber-700"
        />
        <button
          type="button"
          onClick={() => void askQuestion()}
          disabled={!question.trim() || answering}
          className="self-end rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {answering ? "Thinking..." : "Ask"}
        </button>
      </div>
    </section>
  );
}
