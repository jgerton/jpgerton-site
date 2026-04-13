"use client";

import { useState } from "react";

type ExerciseAlternativesProps = {
  exerciseId: string;
  exerciseTitle: string;
  prompt: string;
  emailSubject: string;
};

function PromptInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-fd-card border border-fd-border rounded-xl max-w-sm w-full p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">How "Copy prompt for Claude" works</h3>
          <button
            onClick={onClose}
            className="text-fd-muted-foreground hover:text-fd-foreground text-lg leading-none"
            aria-label="Close"
          >
            x
          </button>
        </div>

        <ol className="text-xs text-fd-muted-foreground space-y-2.5 list-decimal list-inside">
          <li>
            <strong className="text-fd-foreground">Copy</strong> the prompt using the button
          </li>
          <li>
            <strong className="text-fd-foreground">Paste</strong> it into a text editor or notes app
          </li>
          <li>
            <strong className="text-fd-foreground">Fill in</strong> the [bracketed sections] with your own details
          </li>
          <li>
            <strong className="text-fd-foreground">Paste</strong> the completed prompt into Claude (or any AI assistant)
          </li>
          <li>
            <strong className="text-fd-foreground">Work through</strong> the exercise conversationally, then paste your result back here
          </li>
        </ol>

        <p className="text-[11px] text-fd-muted-foreground mt-3 pt-3 border-t border-fd-border">
          The prompt gives Claude context about this exercise so it can help you think through your answer. It's a starting point, not a fill-in-the-blank template.
        </p>
      </div>
    </div>
  );
}

export function ExerciseAlternatives({
  exerciseId,
  exerciseTitle,
  prompt,
  emailSubject,
}: ExerciseAlternativesProps) {
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  void exerciseId;

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const mailtoHref = `mailto:jgerton.ai.assistant@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(`My response to ${exerciseTitle}:\n\n`)}`;

  return (
    <div className="mt-4 pt-3 border-t border-indigo-500/10">
      {/* Featured: Claude prompt */}
      <div className="flex items-center gap-1.5 mb-3">
        <button
          onClick={copyPrompt}
          className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-md border border-indigo-500/20 bg-indigo-500/5 text-sm text-fd-foreground hover:bg-indigo-500/10 transition-colors"
        >
          <span>{copied ? "✓" : "📋"}</span>
          <span className="font-medium">
            {copied ? "Copied!" : "Copy prompt for Claude"}
          </span>
          <span className="text-xs text-fd-muted-foreground ml-auto hidden sm:inline">
            Work through this with AI
          </span>
        </button>
        <button
          onClick={() => setShowInfo(true)}
          className="shrink-0 w-8 h-8 rounded-md border border-fd-border text-fd-muted-foreground hover:text-fd-foreground hover:border-fd-muted-foreground flex items-center justify-center text-xs transition-colors"
          aria-label="What is this?"
          title="What is this?"
        >
          ?
        </button>
      </div>

      {showInfo && <PromptInfoModal onClose={() => setShowInfo(false)} />}

      {/* Secondary options */}
      <div className="flex gap-2 text-[11px]">
        <span className="text-fd-muted-foreground">Or:</span>
        <a
          href={mailtoHref}
          className="px-2 py-1 rounded border border-fd-border text-fd-muted-foreground hover:text-fd-foreground flex items-center gap-1"
        >
          Email response
        </a>
        <span className="px-2 py-1 rounded border border-fd-border text-fd-muted-foreground flex items-center gap-1 opacity-50 cursor-not-allowed" title="Coming soon">
          Google Sheets
        </span>
      </div>
    </div>
  );
}
