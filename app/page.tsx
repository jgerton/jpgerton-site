import { siteConfig } from "@/lib/site-config";
import { Hero } from "@/components/hero";
import { CTABanner } from "@/components/cta-banner";

export default function Home() {
  return (
    <>
      <Hero />

      {/* Intent-based entry points */}
      <section className="py-3xl sm:py-[96px]">
        <div className="mx-auto max-w-6xl px-md">
          <div className="grid grid-cols-1 gap-lg lg:grid-cols-5">
            {/* Watch & Learn path - newcomers */}
            <a
              href={siteConfig.author.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative lg:col-span-2 rounded-lg border border-border p-xl transition-all duration-base hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                New to Claude Code?
              </span>
              <h2 className="mt-sm font-heading text-h4 font-bold text-foreground">
                Watch &amp; learn
              </h2>
              <p className="mt-sm text-sm leading-relaxed text-muted-foreground">
                Free tutorials on YouTube. Step-by-step walkthroughs, build
                logs showing real projects, and workflow breakdowns. Start
                here if you want to see how it works before you build.
              </p>
              <span className="mt-lg inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all duration-base">
                Subscribe on YouTube
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>

            {/* Install & Build path - practitioners */}
            <a
              href={siteConfig.author.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative lg:col-span-3 rounded-lg border border-primary/20 bg-primary/[0.03] p-xl transition-all duration-base hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Ready to build?
              </span>
              <h2 className="mt-sm font-heading text-h3 font-bold text-foreground">
                Install &amp; build
              </h2>
              <p className="mt-sm max-w-lg text-sm leading-relaxed text-muted-foreground">
                Plugins, skills, and agents you can install in Claude Code
                today. Built from real projects, tested in production
                workflows. Full source code on GitHub.
              </p>
              <ul className="mt-lg flex flex-wrap gap-2">
                {["Plugins", "Skills", "Agents", "Hooks"].map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
              <span className="mt-lg inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all duration-base">
                Browse on GitHub
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          </div>

          {/* Community mention - quiet, inline */}
          <div className="mt-xl flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <span>
              Or{" "}
              <a
                href={siteConfig.author.skool}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                join the community
              </a>
              {" "}and build alongside other practitioners
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <CTABanner
        headline="Ready to level up your Claude Code game?"
        description="Free tutorials on YouTube. Tools you can install today. A community of builders who share what they make."
        primaryCta={{
          text: "Join the Community",
          href: siteConfig.author.skool,
        }}
        secondaryCta={{
          text: "Watch on YouTube",
          href: siteConfig.author.youtube,
        }}
      />
    </>
  );
}
