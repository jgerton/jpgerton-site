import { siteConfig } from "@/lib/site-config";
import { CTABanner } from "@/components/cta-banner";

export const metadata = {
  title: "About",
  description:
    "How Jon Gerton teaches Claude Code development. 27 years in tech, building tools and teaching the craft.",
};

const steps = [
  {
    number: 1,
    title: "Watch",
    description:
      "Free tutorials on YouTube. See how things work, learn the concepts, watch real builds happen.",
  },
  {
    number: 2,
    title: "Install",
    description:
      "Grab an open-source plugin or skill. Try it in your own Claude Code setup. See what it does for your workflow.",
  },
  {
    number: 3,
    title: "Build",
    description:
      "Start creating your own skills, plugins, and agents. The meta-skill tutorials teach you how.",
  },
  {
    number: 4,
    title: "Join",
    description:
      "Connect with other builders in the community. Share what you make, get feedback, level up together.",
  },
];

const values = [
  {
    title: "Anti-Gatekeeping",
    description:
      "The core content is free. No $200 paywalls to learn the basics. No FOMO pricing. The paid tier exists for people who want depth and early access, not to lock away fundamentals.",
  },
  {
    title: "Real Process",
    description:
      "You see the rough edges, the mistakes, the dead ends. Polished demos look great on YouTube but don't teach you what to do when things break.",
  },
  {
    title: "Tools Over Tutorials",
    description:
      "A tutorial you watched is knowledge. A plugin you installed is capability. I ship things you can use today, not just things you can watch.",
  },
  {
    title: "Open Source First",
    description:
      "The tools are on GitHub. Read the code, fork it, break it, improve it. That's how you learn to build your own.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-3xl sm:py-[96px] lg:py-[128px]">
        {/* Background decoration */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,color-mix(in_srgb,var(--color-brand-teal)_8%,transparent),transparent)]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-md text-center">
          <h1 className="font-heading text-h1 font-bold leading-tight tracking-tight text-foreground animate-fade-up">
            How this works
          </h1>
          <p
            className="mx-auto mt-lg max-w-2xl text-base leading-relaxed text-muted-foreground animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            From watching a tutorial to building your own Claude Code plugins.
            Here&apos;s the path.
          </p>
        </div>
      </section>

      {/* Practitioner Path */}
      <section className="border-y border-border bg-muted/50 py-3xl sm:py-[96px]">
        <div className="mx-auto max-w-6xl px-md">
          <h2 className="text-center font-heading text-h2 font-bold leading-tight text-foreground">
            The practitioner path
          </h2>

          <div className="mt-2xl grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.title}
                className="flex flex-col items-center text-center"
              >
                {/* Numbered circle */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {step.number}
                </div>

                {/* Title */}
                <h3 className="mt-md font-heading text-h5 font-bold text-foreground">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-sm text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-3xl sm:py-[96px]">
        <div className="mx-auto max-w-4xl px-md">
          <h2 className="text-center font-heading text-h2 font-bold leading-tight text-foreground">
            What I believe
          </h2>

          <div className="mt-2xl grid grid-cols-1 gap-lg sm:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="border-t border-border pt-lg"
              >
                <h3 className="font-heading text-h5 font-bold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-sm text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="border-y border-border bg-muted/50 py-3xl sm:py-[96px]">
        <div className="mx-auto max-w-3xl px-md">
          <h2 className="font-heading text-h2 font-bold leading-tight text-foreground">
            About Jon
          </h2>

          <div className="mt-xl max-w-[65ch] space-y-md text-base leading-relaxed text-muted-foreground">
            <p>
              27 years in tech. Started as a Systems Administrator in 1998,
              moved into full-stack development, spent 13 years at software
              agencies shipping projects across dozens of industries.
            </p>
            <p>
              When Claude Code launched, I picked it up on day one and started
              building with it. Not reviewing it, not making reaction videos.
              Building real projects. The more I used it, the more I realized the
              real power wasn&apos;t in prompting. It was in extending it:
              skills, plugins, hooks, agent orchestration.
            </p>
            <p>
              So I started building tools and sharing them. Open-source plugins
              anyone can install. Tutorials showing the real process, not
              polished demos. A community where practitioners share what they
              build and help each other level up.
            </p>
            <p>
              The gap I saw: plenty of people teaching you to use Claude Code,
              nobody teaching you to extend it. That&apos;s the space I&apos;m
              in. Building the tools, teaching the craft, sharing everything.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        headline="Ready to start building?"
        description="Pick your entry point. Watch a tutorial, install a tool, or jump into the community."
        primaryCta={{
          text: "Join the Community",
          href: siteConfig.author.skool,
        }}
        secondaryCta={{
          text: "Watch on YouTube",
          href: siteConfig.author.youtube,
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Jon Gerton",
            jobTitle: "Claude Code Educator & Toolsmith",
            url: "https://jpgerton.com",
            sameAs: [
              "https://github.com/jgerton",
              "https://x.com/jgerton",
              "https://youtube.com/@jgerton",
              "https://www.linkedin.com/in/jon-gerton-8009a9393/",
            ],
          }),
        }}
      />
    </>
  );
}
