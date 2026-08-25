import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Production-minded software projects by Jon Gerton, with architecture decisions, source code, tests, and delivery evidence.",
};

const technologies = [
  "Java 21",
  "Spring Boot 4.1",
  "PostgreSQL",
  "Flyway",
  "Docker",
  "GitHub Actions",
];

export default function ProjectsPage() {
  return (
    <>
      <section className="relative overflow-hidden py-3xl sm:py-[96px] lg:py-[112px]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,color-mix(in_srgb,var(--color-brand-teal)_10%,transparent),transparent)]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-md">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Engineering portfolio
          </p>
          <h1 className="mt-md font-heading text-h1 font-bold leading-tight tracking-tight text-foreground">
            Systems built to survive the interesting parts.
          </h1>
          <p className="mt-lg max-w-2xl text-base leading-relaxed text-muted-foreground">
            Case studies that show the decisions behind the code: business rules,
            concurrency, security, data integrity, testing, and repeatable delivery.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-muted/40 py-3xl sm:py-[88px]">
        <div className="mx-auto max-w-5xl px-md">
          <Link
            href="/projects/serviceflow"
            className="group block overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-base hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
              <div className="p-xl sm:p-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                    Featured project
                  </span>
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-brand-green" aria-hidden="true" />
                    Public · CI verified
                  </span>
                </div>

                <h2 className="mt-lg font-heading text-h2 font-bold leading-tight text-foreground">
                  ServiceFlow API
                </h2>
                <p className="mt-md max-w-2xl text-base leading-relaxed text-muted-foreground">
                  A production-minded field-service backend that manages customers,
                  technicians, work orders, qualification, scheduling, lifecycle, and
                  reporting—while preventing double-bookings under concurrent requests.
                </p>

                <ul className="mt-lg flex flex-wrap gap-2" aria-label="Technologies used">
                  {technologies.map((technology) => (
                    <li
                      key={technology}
                      className="rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground"
                    >
                      {technology}
                    </li>
                  ))}
                </ul>

                <span className="mt-xl inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary transition-all duration-base group-hover:gap-3">
                  Read the case study
                  <span aria-hidden="true">→</span>
                </span>
              </div>

              <div className="border-t border-border bg-brand-dark p-xl text-slate-100 lg:border-l lg:border-t-0 sm:p-2xl">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-brand-green">
                  Verified release
                </p>
                <dl className="mt-xl grid grid-cols-2 gap-x-lg gap-y-xl">
                  <div>
                    <dt className="font-mono text-xs text-slate-400">Tests</dt>
                    <dd className="mt-1 font-heading text-3xl font-bold">228</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs text-slate-400">Line coverage</dt>
                    <dd className="mt-1 font-heading text-3xl font-bold">95.5%</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs text-slate-400">Migrations</dt>
                    <dd className="mt-1 font-heading text-3xl font-bold">6</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs text-slate-400">Critical findings</dt>
                    <dd className="mt-1 font-heading text-3xl font-bold">0</dd>
                  </div>
                </dl>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
