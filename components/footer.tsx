import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} {siteConfig.author.name}. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a
            href={siteConfig.author.youtube}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            YouTube
          </a>
          <a
            href={siteConfig.author.x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (formerly Twitter)"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            X
          </a>
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <a
            href={siteConfig.author.skool}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Community"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Community
          </a>
        </div>
      </div>
    </footer>
  );
}
