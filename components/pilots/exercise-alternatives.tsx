"use client";

import { useState } from "react";

type ExerciseAlternativesProps = {
  exerciseId: string;
  exerciseTitle: string;
  prompt: string;
  emailSubject: string;
};

export function ExerciseAlternatives({
  exerciseId,
  exerciseTitle,
  prompt,
  emailSubject,
}: ExerciseAlternativesProps) {
  const [copied, setCopied] = useState(false);
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
      <button
        onClick={copyPrompt}
        className="w-full mb-3 flex items-center gap-2 px-3 py-2.5 rounded-md border border-indigo-500/20 bg-indigo-500/5 text-sm text-foreground hover:bg-indigo-500/10 transition-colors"
      >
        <span>📋</span>
        <span className="font-medium">
          {copied ? "Copied!" : "Copy prompt for Claude"}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          Work through this exercise with AI
        </span>
      </button>

      {/* Secondary options */}
      <div className="flex gap-2 text-[11px]">
        <span className="text-muted-foreground">Or:</span>
        <a
          href={mailtoHref}
          className="px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          📧 Email response
        </a>
        <span className="px-2 py-1 rounded border border-border text-muted-foreground flex items-center gap-1 opacity-50 cursor-not-allowed" title="Coming soon">
          📊 Google Sheets
        </span>
      </div>
    </div>
  );
}
