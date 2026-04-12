import { serialize } from "next-mdx-remote/serialize";
import { MDXRenderer } from "@/components/mdx-renderer";
import { readFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ project: string; build: string }>;
};

export default async function BuildPage({ params }: PageProps) {
  const { project, build } = await params;
  const contentPath = join(
    process.cwd(),
    "content",
    "pilots",
    project,
    build,
    "index.mdx"
  );

  let source;
  try {
    const raw = await readFile(contentPath, "utf-8");
    const { content } = matter(raw);
    source = await serialize(content);
  } catch {
    notFound();
  }

  return (
    <div>
      <MDXRenderer source={source} />
    </div>
  );
}
