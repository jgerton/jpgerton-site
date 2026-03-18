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
        {/* Radial gradient from top center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(13,148,136,0.12),transparent)]" />
        {/* Grid texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(13,148,136,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-md text-center">
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
        <h1
          className="font-heading text-hero font-bold leading-tight tracking-tight text-foreground animate-fade-up"
        >
          Tools you can install.
          <br />
          <span className="text-primary">Skills you can build.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="mx-auto mt-lg max-w-2xl text-base leading-relaxed text-muted-foreground animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          I build open-source Claude Code plugins and teach you how to build
          your own. Free content, real process, no gatekeeping.
        </p>

        {/* Terminal Block */}
        <div
          className="mt-2xl animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          <TerminalBlock
            command="claude plugin install brand-toolkit"
            output="Plugin installed successfully"
          />
        </div>

        {/* CTAs */}
        <div
          className="mt-2xl flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-up"
          style={{ animationDelay: "300ms" }}
        >
          <a
            href={siteConfig.author.skool}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-[200px] items-center justify-center rounded-lg bg-accent-warm px-xl py-3 font-heading text-sm font-semibold text-accent-warm-foreground shadow-md transition-all duration-base hover:shadow-lg hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Join the Community
          </a>
          <a
            href={siteConfig.author.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-[200px] items-center justify-center rounded-lg border border-border bg-transparent px-xl py-3 font-heading text-sm font-semibold text-foreground transition-all duration-base hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Watch on YouTube
          </a>
        </div>
      </div>

      {/* Inject blink keyframes for the chip dot */}
      <style>{`
        @keyframes terminal-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
