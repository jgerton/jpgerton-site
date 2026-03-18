interface TerminalBlockProps {
  command: string;
  output?: string;
}

export function TerminalBlock({ command, output }: TerminalBlockProps) {
  return (
    <div className="group relative w-full max-w-xl mx-auto">
      {/* Glow effect behind terminal */}
      <div
        className="absolute -inset-1 rounded-xl bg-brand-teal/20 blur-lg opacity-0 transition-opacity duration-slow group-hover:opacity-100"
        aria-hidden="true"
      />

      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-brand-dark shadow-xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: "#EF4444" }}
            aria-hidden="true"
          />
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: "#EAB308" }}
            aria-hidden="true"
          />
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: "#22C55E" }}
            aria-hidden="true"
          />
          <span className="ml-2 font-mono text-xs text-white/30 select-none">
            terminal
          </span>
        </div>

        {/* Terminal body */}
        <div className="px-5 py-4 font-mono text-sm leading-relaxed sm:text-base">
          {/* Command line */}
          <div className="flex items-start gap-2">
            <span className="text-brand-green select-none" aria-hidden="true">
              &gt;
            </span>
            <span className="text-brand-green">{command}</span>
            {/* Blinking cursor */}
            <span
              className="inline-block h-4 w-2 translate-y-0.5 bg-brand-green/80"
              style={{
                animation: "terminal-blink 1.2s step-end infinite",
              }}
              aria-hidden="true"
            />
          </div>

          {/* Output line */}
          {output && (
            <div className="mt-2 flex items-start gap-2">
              <span className="select-none opacity-0" aria-hidden="true">
                &gt;
              </span>
              <span className="text-white/70">{output}</span>
            </div>
          )}
        </div>
      </div>

      {/* Inject blink keyframes */}
      <style>{`
        @keyframes terminal-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
