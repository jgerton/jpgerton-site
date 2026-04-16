"use client";

import { useState, useEffect, useRef } from "react";

type Module = {
  slug: string;
  title: string;
  sections: { id: string; title: string }[];
  exercises: { id: string; title: string }[];
};

type WelcomeModalProps = {
  preferredName?: string;
  modules: Module[];
  onComplete: () => void;
  onSkip: () => void;
  onScreenChange: (screen: number) => void;
};

export function WelcomeModal({
  preferredName,
  modules,
  onComplete,
  onSkip,
  onScreenChange,
}: WelcomeModalProps) {
  const [screen, setScreen] = useState(1);
  const dialogRef = useRef<HTMLDivElement>(null);

  function goTo(s: number) {
    setScreen(s);
    onScreenChange(s);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Focus the dialog on mount
    dialog.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onSkip();
        return;
      }
      if (e.key === "Tab" && dialog) {
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onSkip]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        tabIndex={-1}
        className="bg-card border border-border rounded-xl max-w-lg w-full mx-4 p-4 sm:p-8 outline-none"
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-6 h-0.5 rounded-full ${s <= screen ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>

        {screen === 1 && (
          <div className="text-center">
            <h2 id="welcome-modal-title" className="text-2xl font-heading font-bold mb-3">
              Welcome{preferredName ? `, ${preferredName}` : ", pilot"}.
            </h2>
            <div className="text-sm text-muted-foreground leading-relaxed text-left space-y-3">
              <p>
                You&apos;re one of the first people testing this playbook. That means
                your experience, your results, and your honest feedback directly
                shape what this becomes.
              </p>
              <p>
                This isn&apos;t a finished course. It&apos;s a build-in-public experiment,
                and you&apos;re part of the team building it.
              </p>
            </div>
          </div>
        )}

        {screen === 2 && (
          <div>
            <h2 className="text-xl font-heading font-bold mb-4 text-center">
              What you&apos;re signing up for
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0 bg-code-accent/15">📖</div>
                <div>
                  <div className="font-medium">Read each build as it ships</div>
                  <div className="text-muted-foreground">Research-backed modules with exercises you run on your own community</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0 bg-callout-exercise/15">🔨</div>
                <div>
                  <div className="font-medium">Do the exercises</div>
                  <div className="text-muted-foreground">Each one has a clear deliverable. Share your results if you want.</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0 bg-accent-warm/15">💬</div>
                <div>
                  <div className="font-medium">Share feedback</div>
                  <div className="text-muted-foreground">Your input shapes the playbook. We&apos;ll ask at the end of each module.</div>
                </div>
              </div>
              <div className="pt-3 border-t border-border text-muted-foreground">
                <strong className="text-foreground">No pressure.</strong> No weekly meetings. No deadlines. No obligation to share anything you&apos;re not comfortable sharing. Go at your own pace.
              </div>
            </div>
          </div>
        )}

        {screen === 3 && (
          <div className="text-center">
            <h2 className="text-xl font-heading font-bold mb-2">
              You&apos;re all set.
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Build 1 has {modules.length} modules. Start with Module 1 and work through at your own pace.
            </p>
            <div className="grid grid-cols-2 gap-2 text-left mb-6">
              {modules.map((mod, i) => (
                <div
                  key={mod.slug}
                  className={`rounded-lg p-3 border ${
                    i === 0
                      ? "border-primary/30 bg-primary/5"
                      : "border-border opacity-60"
                  }`}
                >
                  <div className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                    Module {i + 1}
                  </div>
                  <div className="text-xs font-medium">{mod.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {mod.sections.length} sections · {mod.exercises.length} exercises
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={onComplete}
              className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Start Module 1
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              You can revisit this welcome anytime from the <strong>?</strong> in the sidebar
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
          {screen < 3 && (
            <div className="flex gap-2">
              {screen > 1 && (
                <button
                  onClick={() => goTo(screen - 1)}
                  className="px-4 py-2 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => goTo(screen + 1)}
                className="px-6 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
