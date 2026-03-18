import { siteConfig } from "@/lib/site-config";
import { Hero } from "@/components/hero";
import { Pillars } from "@/components/pillars";
import { CTABanner } from "@/components/cta-banner";

const stats = [
  { value: "27+", label: "Years in Tech" },
  { value: "Daily", label: "Claude Code Practitioner" },
  { value: "Free", label: "Core Content & Tools" },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Pillars section */}
      <section className="py-3xl sm:py-[96px]">
        <div className="mx-auto max-w-6xl px-md">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-h2 font-bold leading-tight text-foreground">
              What I Build
            </h2>
            <p className="mt-md text-base leading-relaxed text-muted-foreground">
              Open-source tools, tutorials, and a community for people who want
              to get more out of Claude Code.
            </p>
          </div>
          <div className="mt-2xl">
            <Pillars />
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="border-y border-border bg-muted/50 py-3xl">
        <div className="mx-auto max-w-4xl px-md">
          <div className="grid grid-cols-1 gap-2xl sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-heading text-h2 font-bold text-primary">
                  {stat.value}
                </div>
                <div className="mt-sm text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
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
