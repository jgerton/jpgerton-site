"use client";

import { useState } from "react";

type ExerciseAlternativesProps = {
  exerciseId: string;
  exerciseTitle: string;
  prompt: string;
  emailBody: string;
  emailSubject: string;
};

function PromptModal({
  prompt,
  onClose,
}: {
  prompt: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-fd-card border border-fd-border rounded-xl max-w-lg w-full p-5 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Work through this exercise with Claude</h3>
          <button
            onClick={onClose}
            className="text-fd-muted-foreground hover:text-fd-foreground text-lg leading-none"
            aria-label="Close"
          >
            x
          </button>
        </div>

        {/* Steps */}
        <ol className="text-xs text-fd-muted-foreground space-y-1.5 list-decimal list-inside mb-4">
          <li>Copy the prompt below</li>
          <li>Paste into a text editor and fill in the <strong className="text-fd-foreground">[bracketed sections]</strong></li>
          <li>Paste the completed prompt into Claude (or any AI assistant)</li>
          <li>Work through the exercise conversationally, then paste your result back into the form above</li>
        </ol>

        {/* Prompt text */}
        <div className="flex-1 min-h-0 overflow-y-auto mb-4 rounded-md border border-fd-border bg-fd-background p-3">
          <pre className="text-xs text-fd-muted-foreground whitespace-pre-wrap break-words font-sans leading-relaxed">
            {prompt}
          </pre>
        </div>

        {/* Copy action */}
        <button
          onClick={copyPrompt}
          className="w-full px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
          style={{
            background: copied ? "#22C55E" : "#6366F1",
            color: "white",
          }}
        >
          {copied ? "Copied to clipboard!" : "Copy prompt"}
        </button>
      </div>
    </div>
  );
}

export function ExerciseAlternatives({
  exerciseId,
  exerciseTitle,
  prompt,
  emailBody,
  emailSubject,
}: ExerciseAlternativesProps) {
  const [showModal, setShowModal] = useState(false);
  void exerciseId;
  void exerciseTitle;

  const gmailHref = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent("jgerton.ai.assistant@gmail.com")}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  return (
    <div className="mt-4 pt-3 border-t border-indigo-500/10">
      {/* Featured: opens prompt modal */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full mb-3 flex items-center gap-2 px-3 py-2.5 rounded-md border border-indigo-500/20 bg-indigo-500/5 text-sm text-fd-foreground hover:bg-indigo-500/10 transition-colors"
      >
        <span>📋</span>
        <span className="font-medium">Use prompt for Claude</span>
        <span className="text-xs text-fd-muted-foreground ml-auto hidden sm:inline">
          Preview and copy
        </span>
      </button>

      {showModal && (
        <PromptModal prompt={prompt} onClose={() => setShowModal(false)} />
      )}

      {/* Secondary options */}
      <div className="flex gap-2 text-[11px]">
        <span className="text-fd-muted-foreground">Or:</span>
        <a
          href={gmailHref}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-1 rounded border border-fd-border text-fd-muted-foreground hover:text-fd-foreground flex items-center gap-1"
        >
          Email via Gmail
        </a>
        <span className="px-2 py-1 rounded border border-fd-border text-fd-muted-foreground flex items-center gap-1 opacity-50 cursor-not-allowed" title="Coming soon">
          Google Sheets
        </span>
      </div>
    </div>
  );
}
