import { siteConfig } from "@/lib/site-config";
import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with Jon Gerton. Questions about Claude Code tools, tutorials, or the community.",
};

const socialLinks = [
  {
    label: "YouTube",
    handle: "@jgerton",
    href: siteConfig.author.youtube,
  },
  {
    label: "X / Twitter",
    handle: "@jgerton",
    href: siteConfig.author.x,
  },
  {
    label: "GitHub",
    handle: "@jgerton",
    href: siteConfig.author.github,
  },
  {
    label: "Email",
    handle: "jon@jpgerton.com",
    href: "mailto:jon@jpgerton.com",
  },
  {
    label: "LinkedIn",
    handle: "Jon Gerton",
    href: siteConfig.author.linkedin,
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-3xl sm:py-[96px]">
        {/* Background decoration */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,color-mix(in_srgb,var(--color-brand-teal)_8%,transparent),transparent)]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-md text-center">
          <h1 className="font-heading text-h1 font-bold leading-tight tracking-tight text-foreground animate-fade-up">
            Get in touch
          </h1>
          <p
            className="mx-auto mt-lg max-w-2xl text-base leading-relaxed text-muted-foreground animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            Have a question, want to collaborate, or just want to say hi? I read
            everything.
          </p>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="pb-3xl sm:pb-[96px]">
        <div className="mx-auto max-w-6xl px-md">
          <div className="grid grid-cols-1 gap-2xl lg:grid-cols-2">
            {/* Left column: Contact form */}
            <div>
              <h2 className="font-heading text-h4 font-bold text-foreground">
                Send a Message
              </h2>
              <p className="mt-sm text-sm leading-relaxed text-muted-foreground">
                Questions about tools, tutorials, the community, or anything
                else. I&apos;ll get back to you within 1 business day.
              </p>
              <div className="mt-xl">
                <ContactForm />
              </div>
            </div>

            {/* Right column: Community + social links */}
            <div className="flex flex-col gap-2xl">
              {/* Community section */}
              <div className="rounded-lg bg-primary/5 p-xl">
                <h2 className="font-heading text-h4 font-bold text-foreground">
                  Join the Community
                </h2>
                <p className="mt-sm text-sm leading-relaxed text-muted-foreground">
                  The fastest way to connect. Ask questions, share your builds,
                  and learn alongside other practitioners.
                </p>
                <a
                  href={siteConfig.author.skool}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-xl block w-full rounded-lg bg-accent-warm px-xl py-3 text-center font-heading text-sm font-semibold text-accent-warm-foreground shadow-md transition-all duration-base hover:shadow-lg hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Join on Skool
                </a>
              </div>

              {/* Social links */}
              <div>
                <h2 className="font-heading text-h4 font-bold text-foreground">
                  Other ways to connect
                </h2>
                <ul className="mt-lg space-y-md">
                  {socialLinks.map((link) => (
                    <li key={link.label} className="flex items-baseline justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {link.label}
                      </span>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary transition-colors duration-fast hover:underline"
                      >
                        {link.handle}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
