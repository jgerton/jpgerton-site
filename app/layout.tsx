import type { Metadata } from "next";
import { inter, spaceGrotesk, jetbrainsMono } from "@/lib/fonts";
import { siteConfig } from "@/lib/site-config";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/convex-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ConvexAuthNextjsServerProvider>
          <ConvexClientProvider>
            <Nav />
            <main>{children}</main>
            <Footer />
          </ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
