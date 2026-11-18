"use client";

import { Fragment, useState } from "react";

export const technicalGlossary: Record<string, string> = {
  abstract: "A short summary of the paper's purpose, method, findings, and conclusion.",
  accuracy: "How often the method gives the correct answer.",
  algorithm: "A step-by-step set of instructions used to solve a problem.",
  annotation: "Extra labels or notes added to data to help a model learn.",
  "artificial intelligence": "Computer systems designed to perform tasks that usually need human intelligence.",
  benchmark: "A standard test used to compare the performance of models or methods.",
  bias: "A repeated error or unfair tendency in data or a model.",
  corpus: "A large collection of texts or documents used for research.",
  dataset: "A collection of data used to train, test, or evaluate a system.",
  "deep learning": "A machine-learning method that uses many-layered networks.",
  encoder: "A component that converts input data into a compact numerical representation.",
  evaluation: "The process of measuring how well a method works.",
  experiment: "A controlled test used to check an idea or result.",
  feature: "A measurable property used by a model to make a decision.",
  framework: "A reusable structure that helps build and organize a solution.",
  "gradient descent": "A method that adjusts a model to reduce its errors step by step.",
  hyperparameter: "A setting chosen before training that controls how a model learns.",
  inference: "Using a trained model to produce an answer or prediction.",
  latent: "A hidden feature or pattern that a model learns from the data.",
  limitation: "A restriction or weakness that affects the paper's method or conclusions.",
  "machine learning": "A way for computers to learn patterns from examples instead of fixed rules.",
  methodology: "The research process, methods, and procedures used in the study.",
  metric: "A numerical measurement used to judge performance.",
  model: "A mathematical system that learns patterns or makes predictions.",
  "neural network": "A model inspired by the brain that learns patterns through connected units.",
  overfitting: "When a model learns the training examples too closely and performs poorly on new data.",
  pipeline: "A sequence of connected processing steps.",
  precision: "How many items identified as correct actually are correct.",
  recall: "How many of all relevant items the method successfully finds.",
  regression: "A method for predicting a continuous numerical value.",
  "reinforcement learning": "A learning method where an agent improves through rewards and penalties.",
  retrieval: "Finding and selecting relevant information from a collection.",
  sample: "One example or item from a larger dataset.",
  semantic: "Related to meaning rather than only word appearance.",
  "supervised learning": "Learning from examples that already include the correct answer.",
  token: "A small piece of text, such as a word or word part, used by language models.",
  transformer: "A neural-network design that uses attention to understand relationships in data.",
  "unsupervised learning": "Learning patterns from data without labels or known answers.",
  validation: "Testing a model on separate data to check its reliability during development.",
  "API": "A set of rules that lets software programs communicate with each other.",
  "CNN": "Convolutional Neural Network: a model commonly used to understand images.",
  "GPT": "Generative Pre-trained Transformer: a language model trained to generate text.",
  "LLM": "Large Language Model: an AI model trained to understand and produce language.",
  "NLP": "Natural Language Processing: computer methods for understanding and generating human language.",
  "RNN": "Recurrent Neural Network: a model designed to process sequences of information.",
  "TCP": "Transmission Control Protocol: rules that ensure data is delivered reliably across a network.",
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function TechnicalText({ text }: { text: string }) {
  const terms = Object.keys(technicalGlossary).sort((left, right) => right.length - left.length);
  const pattern = createTermPattern(terms);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 12 });
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  if (!pattern) {
    return <>{text}</>;
  }

  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) => {
        const key = part.toLowerCase();
        const definition = technicalGlossary[key]
          ?? Object.entries(technicalGlossary).find(([term]) => term.toLowerCase() === key)?.[1];

        if (!definition) {
          return <Fragment key={`${index}-${part}`}>{part}</Fragment>;
        }

        const tooltipId = `${index}-${key}`;
        const showTooltip = (element: HTMLElement) => {
          const rect = element.getBoundingClientRect();
          const tooltipWidth = Math.min(288, window.innerWidth - 24);
          const left = Math.max(
            12,
            Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 12),
          );
          const top = rect.top > 150
            ? rect.top - 8
            : rect.bottom + 8;
          setTooltipPosition({ top, left });
          setActiveTooltip(tooltipId);
        };

        return (
          <span
            key={`${index}-${part}`}
            tabIndex={0}
            className="cursor-help rounded-sm border-b border-dotted border-amber-700 font-semibold text-slate-950 outline-none"
            aria-label={`${part}: ${definition}`}
            onMouseEnter={(event) => showTooltip(event.currentTarget)}
            onMouseLeave={() => setActiveTooltip(null)}
            onFocus={(event) => showTooltip(event.currentTarget)}
            onBlur={() => setActiveTooltip(null)}
          >
            {part}
            {activeTooltip === tooltipId ? (
              <span
                role="tooltip"
                className="fixed z-[9999] w-[288px] max-w-[calc(100vw-24px)] rounded-xl border border-slate-200 bg-slate-950 px-3 py-2 text-sm font-normal leading-5 text-white shadow-2xl"
                style={{
                  left: tooltipPosition.left,
                  top: tooltipPosition.top,
                  transform: tooltipPosition.top < window.innerHeight / 2 ? "none" : "translateY(-100%)",
                }}
              >
                <span className="font-semibold">{part}</span>
                <span className="block text-slate-200">{definition}</span>
              </span>
            ) : null}
          </span>
        );
      })}
    </>
  );
}

function createTermPattern(terms: string[]) {
  if (terms.length === 0) {
    return null;
  }
  return new RegExp(`(${terms.map(escapeRegex).join("|")})`, "gi");
}
