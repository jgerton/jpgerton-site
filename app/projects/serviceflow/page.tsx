import type { Metadata } from "next";
import Link from "next/link";

const repositoryUrl = "https://github.com/jgerton/service-flow";
const actionsUrl = `${repositoryUrl}/actions`;

export const metadata: Metadata = {
  title: "ServiceFlow API — Java & Spring Boot Case Study",
  description:
    "How Jon Gerton built a production-minded Spring Boot and PostgreSQL API with concurrency-safe scheduling, JWT authorization, integration tests, and verified delivery.",
  alternates: {
    canonical: "/projects/serviceflow",
  },
  openGraph: {
    title: "ServiceFlow API — Java & Spring Boot Case Study",
    description:
      "A production-minded field-service API with concurrency-safe scheduling, durable PostgreSQL constraints, JWT authorization, and 228 automated tests.",
    url: "/projects/serviceflow",
    type: "article",
  },
};

const stack = [
  "Java 21",
  "Spring Boot 4.1",
  "Spring Security",
  "PostgreSQL",
  "Flyway",
  "Testcontainers",
  "Docker",
  "OpenAPI",
  "GitHub Actions",
];

const outcomes = [
  {
    title: "Concurrency-safe scheduling",
    description:
      "Application checks produce useful conflicts while a PostgreSQL exclusion constraint closes the race between simultaneous requests.",
  },
  {
    title: "Security at two boundaries",
    description:
      "JWT roles and technician ownership are enforced at HTTP and application-service boundaries, with active users revalidated from persistence.",
  },
  {
    title: "Schema under source control",
    description:
      "Six forward-only Flyway migrations define the production schema. Hibernate validates it; application startup never invents it.",
  },
  {
    title: "Evidence, not assertions",
    description:
      "Unit, architecture, HTTP, repository, concurrency, clean-copy, container, vulnerability, and secret-scan checks all run against the release.",
  },
];

const metrics = [
  { value: "140", label: "unit & architecture tests" },
  { value: "88", label: "PostgreSQL integration tests" },
  { value: "95.5%", label: "line coverage" },
  { value: "0", label: "fixed high/critical findings" },
];

export default function ServiceFlowPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "ServiceFlow API",
    description:
      "Production-minded Spring Boot REST API for field-service operations, scheduling, and reporting.",
    codeRepository: repositoryUrl,
    programmingLanguage: "Java",
    runtimePlatform: "Java 21",
    author: {
      "@type": "Person",
      name: "Jon Gerton",
      url: "https://jpgerton.com",
    },
  };

  return (
    <>
      <article>
        <header className="relative overflow-hidden border-b border-border py-3xl sm:py-[96px] lg:py-[120px]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,color-mix(in_srgb,var(--color-brand-teal)_14%,transparent),transparent)]" />
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(color-mix(in srgb, var(--color-brand-teal) 50%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-brand-teal) 50%, transparent) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-5xl px-md">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span aria-hidden="true">←</span>
              Engineering projects
            </Link>

            <div className="mt-xl grid gap-2xl lg:grid-cols-[1fr_0.7fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
                  <span className="h-2 w-2 rounded-full bg-brand-green" aria-hidden="true" />
                  Open source · Hosted CI green
                </div>
                <h1 className="mt-lg font-heading text-h1 font-bold leading-tight tracking-tight text-foreground">
                  ServiceFlow API
                </h1>
                <p className="mt-md max-w-2xl font-heading text-h5 leading-snug text-foreground">
                  Field-service operations are straightforward—until two dispatchers
                  schedule the same technician at the same time.
                </p>
                <p className="mt-md max-w-2xl text-base leading-relaxed text-muted-foreground">
                  I built ServiceFlow as a production-minded Java backend where the
                  business rules remain correct under concurrency, authorization is
                  explicit, and every delivery claim has executable evidence.
                </p>

                <div className="mt-xl flex flex-col gap-3 sm:flex-row">
                  <a
                    href={repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-xl py-3 font-heading text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-base hover:opacity-90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    View source on GitHub
                  </a>
                  <a
                    href={actionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-border px-xl py-3 font-heading text-sm font-semibold text-foreground transition-colors duration-base hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Inspect CI evidence
                  </a>
                </div>

                <ul className="mt-lg flex flex-wrap gap-2" aria-label="ServiceFlow technology stack">
                  {stack.map((technology) => (
                    <li
                      key={technology}
                      className="rounded-md border border-border bg-background/70 px-2.5 py-1 font-mono text-xs text-muted-foreground"
                    >
                      {technology}
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                {metrics.map((metric, index) => (
                  <div
                    key={metric.label}
                    className={`border-border p-md sm:p-lg ${index < 2 ? "border-b" : ""} ${index % 2 === 0 ? "border-r" : ""}`}
                  >
                    <dt className="text-xs leading-snug text-muted-foreground">
                      {metric.label}
                    </dt>
                    <dd className="mt-1 font-heading text-2xl font-bold text-foreground sm:text-3xl">
                      {metric.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </header>

        <section className="py-3xl sm:py-[88px]">
          <div className="mx-auto grid max-w-5xl gap-2xl px-md lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                The brief
              </p>
              <h2 className="mt-md font-heading text-h3 font-bold leading-tight text-foreground">
                Model the operational truth, not just CRUD screens.
              </h2>
            </div>
            <div className="space-y-md text-base leading-relaxed text-muted-foreground">
              <p>
                Dispatchers need to manage customers and technicians, qualify work by
                skill, assign appointments, advance jobs through a controlled lifecycle,
                and understand current workload. Technicians should see only their own
                assignments. Invalid state must fail predictably.
              </p>
              <p>
                The subtle requirement is scheduling integrity. An application-level
                “check then insert” looks correct in a single request but can fail when
                two requests race. ServiceFlow treats PostgreSQL as the final authority
                for that invariant while retaining a useful API response.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/40 py-3xl sm:py-[88px]">
          <div className="mx-auto max-w-5xl px-md">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Architecture
              </p>
              <h2 className="mt-md font-heading text-h3 font-bold leading-tight text-foreground">
                One deployable application. Deliberate internal boundaries.
              </h2>
              <p className="mt-md text-base leading-relaxed text-muted-foreground">
                A modular monolith keeps operations simple while feature packages own
                their API, application, domain, and persistence concerns. ArchUnit tests
                prevent controllers and entities from leaking across those boundaries.
              </p>
            </div>

            <div className="mt-2xl overflow-hidden rounded-lg border border-slate-700 bg-brand-dark p-lg shadow-lg sm:p-xl">
              <div className="flex items-center gap-2 border-b border-slate-700 pb-md font-mono text-xs text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-brand-green" />
                <span className="ml-2">authenticated request path</span>
              </div>
              <div className="mt-lg flex flex-col gap-3 font-mono text-xs leading-relaxed text-slate-200 sm:flex-row sm:items-center sm:text-center">
                {[
                  "HTTP / JWT",
                  "Controllers",
                  "Application services",
                  "Repositories",
                  "PostgreSQL",
                ].map((item, index) => (
                  <div key={item} className="contents">
                    <div className="flex-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-3">
                      {item}
                    </div>
                    {index < 4 && (
                      <span className="self-center text-brand-green" aria-hidden="true">
                        <span className="sm:hidden">↓</span>
                        <span className="hidden sm:inline">→</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-lg border-t border-slate-700 pt-md font-mono text-xs leading-relaxed text-slate-400">
                auth · customer · technician · workorder · reporting · common
              </p>
            </div>
          </div>
        </section>

        <section className="py-3xl sm:py-[88px]">
          <div className="mx-auto max-w-5xl px-md">
            <div className="grid gap-2xl lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  The hard part
                </p>
                <h2 className="mt-md font-heading text-h3 font-bold leading-tight text-foreground">
                  Make double-booking impossible, even during a race.
                </h2>
                <p className="mt-md text-base leading-relaxed text-muted-foreground">
                  The service first checks for an overlap so normal conflicts can name
                  the existing work order. PostgreSQL independently guards the same rule
                  with a half-open timestamp range, allowing adjacent appointments while
                  rejecting true overlap.
                </p>
                <p className="mt-md text-base leading-relaxed text-muted-foreground">
                  If simultaneous requests both pass the friendly check, the database
                  accepts one and rejects the other. The constraint violation is
                  translated into the same stable HTTP 409 contract.
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-700 bg-brand-dark shadow-lg">
                <div className="border-b border-slate-700 px-lg py-md font-mono text-xs text-slate-400">
                  V5__prevent_technician_schedule_overlaps.sql
                </div>
                <pre className="overflow-x-auto p-lg font-mono text-xs leading-relaxed text-slate-200">
                  <code>{`EXCLUDE USING gist (
  technician_id WITH =,
  tstzrange(
    scheduled_start,
    scheduled_end,
    '[)'
  ) WITH &&
)
WHERE (
  status <> 'CANCELLED'
  AND scheduled_start IS NOT NULL
  AND scheduled_end IS NOT NULL
);`}</code>
                </pre>
              </div>
            </div>

            <div className="mt-xl rounded-lg border border-border bg-card p-lg sm:p-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Stable conflict contract
                </span>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 font-mono text-xs text-amber-700 dark:text-amber-300">
                  HTTP 409
                </span>
              </div>
              <pre className="mt-md overflow-x-auto rounded-md bg-muted p-md font-mono text-xs leading-relaxed text-foreground">
                <code>{`{
  "status": 409,
  "code": "TECHNICIAN_SCHEDULE_CONFLICT",
  "detail": "The technician is already assigned during the requested time.",
  "conflictingWorkOrderId": "40000000-...-0003"
}`}</code>
              </pre>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/40 py-3xl sm:py-[88px]">
          <div className="mx-auto max-w-5xl px-md">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Engineering outcomes
              </p>
              <h2 className="mt-md font-heading text-h3 font-bold leading-tight text-foreground">
                The portfolio value is in the guarantees.
              </h2>
            </div>

            <div className="mt-2xl grid gap-lg sm:grid-cols-2">
              {outcomes.map((outcome, index) => (
                <div key={outcome.title} className="rounded-lg border border-border bg-card p-xl shadow-xs">
                  <span className="font-mono text-xs font-semibold text-primary">
                    0{index + 1}
                  </span>
                  <h3 className="mt-md font-heading text-h5 font-bold text-foreground">
                    {outcome.title}
                  </h3>
                  <p className="mt-sm text-sm leading-relaxed text-muted-foreground">
                    {outcome.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-3xl sm:py-[88px]">
          <div className="mx-auto grid max-w-5xl gap-2xl px-md lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Delivery evidence
              </p>
              <h2 className="mt-md font-heading text-h3 font-bold leading-tight text-foreground">
                Reproducible from a clean checkout.
              </h2>
            </div>
            <div>
              <ul className="grid gap-3 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
                {[
                  "Java 21 and Maven verification",
                  "Real PostgreSQL integration suite",
                  "Architecture boundary enforcement",
                  "Production-profile startup and restart",
                  "Non-root multi-stage container",
                  "OpenAPI and authenticated smoke test",
                  "Trivy image vulnerability scan",
                  "Gitleaks full-history secret scan",
                ].map((item) => (
                  <li key={item} className="flex gap-3 rounded-md border border-border bg-card p-md">
                    <span className="font-mono font-bold text-code-accent" aria-hidden="true">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-xl flex flex-col gap-3 sm:flex-row">
                <a
                  href={`${repositoryUrl}/blob/main/README.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-xl py-3 font-heading text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Run ServiceFlow locally
                </a>
                <a
                  href={`${repositoryUrl}/tree/main/docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-border px-xl py-3 font-heading text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Read the project records
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-brand-dark py-3xl text-slate-100 sm:py-[88px]">
          <div className="mx-auto max-w-4xl px-md text-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-brand-green">
              Inspect the implementation
            </p>
            <h2 className="mt-md font-heading text-h2 font-bold leading-tight">
              Every claim links back to working code.
            </h2>
            <p className="mx-auto mt-md max-w-2xl text-base leading-relaxed text-slate-300">
              The repository includes the complete source, database migrations, API
              contract, architecture decisions, security policy, demo script, and CI
              workflow.
            </p>
            <a
              href={repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-xl inline-flex items-center justify-center rounded-lg bg-brand-green px-xl py-3 font-heading text-sm font-semibold text-brand-dark transition-all duration-base hover:opacity-90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
            >
              Explore jgerton/service-flow
            </a>
          </div>
        </section>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
