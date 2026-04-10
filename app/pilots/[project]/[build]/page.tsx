import { serialize } from "next-mdx-remote/serialize";
import { MDXRenderer } from "@/components/mdx-renderer";
import { readFile } from "fs/promises";
import { join } from "path";
import { notFound } from "next/navigation";
import Link from "next/link";

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
    `${build}.mdx`
  );

  let source;
  try {
    const raw = await readFile(contentPath, "utf-8");
    source = await serialize(raw);
  } catch {
    notFound();
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/pilots/${project}`}
            className="text-sm text-muted-foreground hover:text-accent"
          >
            &larr; Back to project
          </Link>
        </div>
        <MDXRenderer source={source} />
      </div>
    </section>
  );
}
