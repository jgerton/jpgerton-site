import { siteConfig } from "@/lib/site-config";
import { TerminalBlock } from "./terminal-block";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-3xl sm:py-[96px] lg:py-[128px]">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,color-mix(in_srgb,var(--color-brand-teal)_12%,transparent),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(color-mix(in srgb, var(--color-brand-teal) 50%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-brand-teal) 50%, transparent) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-md">
        <div className="grid grid-cols-1 items-center gap-2xl lg:grid-cols-2">
          {/* Left: text content */}
          <div>
            {/* Small intro chip */}
            <div className="mb-lg inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent/50 px-4 py-1.5 text-xs font-medium text-primary animate-fade-in">
              <span
                className="inline-block h-2 w-2 rounded-full bg-brand-green"
                style={{
                  animation: "terminal-blink 2s ease-in-out infinite",
                }}
                aria-hidden="true"
              />
              Claude Code Educator &amp; Toolsmith
            </div>

            {/* Headline */}
            <h1 className="font-heading text-hero font-bold leading-tight tracking-tight text-foreground animate-fade-up">
              Tools you can install.
              <br />
              <span className="text-primary">Skills you can build.</span>
            </h1>

            {/* Subheadline */}
            <p
              className="mt-lg max-w-xl text-base leading-relaxed text-muted-foreground animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              Open-source Claude Code plugins, honest tutorials, and a community
              of practitioners. Free content, real process, no gatekeeping.
            </p>

            {/* CTAs */}
            <div
              className="mt-xl flex flex-col gap-3 sm:flex-row animate-fade-up"
              style={{ animationDelay: "200ms" }}
            >
              <a
                href={siteConfig.author.skool}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-accent-warm px-xl py-3 font-heading text-sm font-semibold text-accent-warm-foreground shadow-md transition-all duration-base hover:shadow-lg hover:opacity-90 press-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Join the Community
              </a>
              <a
                href={siteConfig.author.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-xl py-3 font-heading text-sm font-semibold text-foreground transition-all duration-base hover:bg-accent hover:text-accent-foreground press-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Watch on YouTube
              </a>
            </div>
          </div>

          {/* Right: terminal block */}
          <div
            className="animate-fade-up lg:pl-lg"
            style={{ animationDelay: "300ms" }}
          >
            <TerminalBlock
              commands={[
                { command: "git clone https://github.com/jgerton/brand-toolkit", output: "Cloning into 'brand-toolkit'..." },
                { command: "claude --plugin-dir ./brand-toolkit" },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
