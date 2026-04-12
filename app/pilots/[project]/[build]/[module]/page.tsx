import { serialize } from "next-mdx-remote/serialize";
import { MDXRenderer } from "@/components/mdx-renderer";
import { ModuleHeader } from "@/components/pilots/module-header";
import { readFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ project: string; build: string; module: string }>;
};

export default async function ModulePage({ params }: PageProps) {
  const { project, build, module: moduleSlug } = await params;

  const modulePath = join(
    process.cwd(),
    "content",
    "pilots",
    project,
    build,
    `${moduleSlug}.mdx`
  );

  let source;
  let frontmatter;
  try {
    const raw = await readFile(modulePath, "utf-8");
    const { content, data } = matter(raw);
    frontmatter = data;
    source = await serialize(content);
  } catch {
    notFound();
  }

  const indexPath = join(
    process.cwd(),
    "content",
    "pilots",
    project,
    build,
    "index.mdx"
  );
  const indexRaw = await readFile(indexPath, "utf-8");
  const { data: buildData } = matter(indexRaw);
  const moduleInfo = buildData.modules?.find(
    (m: { slug: string }) => m.slug === moduleSlug
  );

  if (!moduleInfo) notFound();

  const moduleIndex = buildData.modules.indexOf(moduleInfo);
  const totalModules = buildData.modules.length;

  const wordCount = source.compiledSource.split(/\s+/).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <div>
      <ModuleHeader
        moduleNumber={moduleIndex + 1}
        totalModules={totalModules}
        title={frontmatter.title || moduleInfo.title}
        sectionCount={moduleInfo.sections?.length ?? 0}
        exerciseCount={moduleInfo.exercises?.length ?? 0}
        readTimeMinutes={readTime}
      />
      <MDXRenderer source={source} />
    </div>
  );
}
