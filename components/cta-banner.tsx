interface CTABannerProps {
  headline: string;
  description: string;
  primaryCta: { text: string; href: string };
  secondaryCta: { text: string; href: string };
}

export function CTABanner({
  headline,
  description,
  primaryCta,
  secondaryCta,
}: CTABannerProps) {
  const isExternal = (href: string) => href.startsWith("http");

  return (
    <section className="relative overflow-hidden py-3xl sm:py-[96px]">
      {/* Gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(13,148,136,0.08),transparent)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-3xl px-md text-center">
        <h2 className="font-heading text-h2 font-bold leading-tight text-foreground">
          {headline}
        </h2>
        <p className="mx-auto mt-md max-w-xl text-base leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-2xl flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={primaryCta.href}
            {...(isExternal(primaryCta.href) && {
              target: "_blank",
              rel: "noopener noreferrer",
            })}
            className="inline-flex min-w-[200px] items-center justify-center rounded-lg bg-accent-warm px-xl py-3 font-heading text-sm font-semibold text-accent-warm-foreground shadow-md transition-all duration-base hover:shadow-lg hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {primaryCta.text}
          </a>
          <a
            href={secondaryCta.href}
            {...(isExternal(secondaryCta.href) && {
              target: "_blank",
              rel: "noopener noreferrer",
            })}
            className="inline-flex min-w-[200px] items-center justify-center rounded-lg border border-border bg-transparent px-xl py-3 font-heading text-sm font-semibold text-foreground transition-all duration-base hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {secondaryCta.text}
          </a>
        </div>
      </div>
    </section>
  );
}
