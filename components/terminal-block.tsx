"use client";

import { useState, useCallback } from "react";

interface TerminalBlockProps {
  commands: { command: string; output?: string }[];
}

export function TerminalBlock({ commands }: TerminalBlockProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCommand = useCallback(async (command: string, index: number) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // Clipboard API not available
    }
  }, []);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-brand-dark shadow-xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-red-500" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-yellow-500" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-green-500" aria-hidden="true" />
          <span className="ml-2 font-mono text-xs text-white/30 select-none">
            terminal
          </span>
        </div>

        {/* Terminal body */}
        <div className="px-5 py-4 font-mono text-sm leading-relaxed sm:text-base">
          {commands.map((line, i) => (
            <div key={i}>
              {/* Command line - clickable to copy */}
              <button
                type="button"
                onClick={() => void copyCommand(line.command, i)}
                className="group/cmd flex w-full items-start gap-2 text-left rounded px-1 -mx-1 transition-colors duration-fast hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-green/50"
                title="Click to copy"
              >
                <span className="text-brand-green select-none shrink-0" aria-hidden="true">
                  &gt;
                </span>
                <span className="text-brand-green break-all">{line.command}</span>
                {/* Copy indicator */}
                <span
                  className={`ml-auto shrink-0 text-xs transition-opacity duration-fast ${
                    copiedIndex === i
                      ? "text-brand-green opacity-100"
                      : "text-white/30 opacity-0 group-hover/cmd:opacity-100"
                  }`}
                  aria-hidden="true"
                >
                  {copiedIndex === i ? "copied" : "copy"}
                </span>
                {/* Blinking cursor on last command only */}
                {i === commands.length - 1 && !line.output && copiedIndex !== i && (
                  <span
                    className="inline-block h-4 w-2 translate-y-0.5 shrink-0 bg-brand-green/80"
                    style={{
                      animation: "terminal-blink 1.2s step-end infinite",
                    }}
                    aria-hidden="true"
                  />
                )}
              </button>

              {/* Output line */}
              {line.output && (
                <div className="mt-1 flex items-start gap-2 px-1">
                  <span className="select-none opacity-0 shrink-0" aria-hidden="true">
                    &gt;
                  </span>
                  <span className="text-white/70">{line.output}</span>
                </div>
              )}

              {/* Spacing between command groups */}
              {i < commands.length - 1 && <div className="mt-2" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
