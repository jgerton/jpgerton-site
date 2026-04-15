import { notFound } from "next/navigation";
import { pilotsSource } from "@/lib/pilots-source";
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from "fumadocs-ui/page";
import { getMDXComponents } from "@/mdx-components";
import { DocsPageWrapper } from "@/components/pilots/docs-page-wrapper";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = pilotsSource.getPage(slug);

  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <DocsPageWrapper>
          <MDX components={getMDXComponents()} />
        </DocsPageWrapper>
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return pilotsSource.generateParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = pilotsSource.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
