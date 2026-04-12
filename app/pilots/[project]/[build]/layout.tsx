import { readFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import { PilotLayout } from "@/components/pilots/pilot-layout";

type LayoutProps = {
  params: Promise<{ project: string; build: string }>;
  children: React.ReactNode;
};

export default async function BuildLayout({ params, children }: LayoutProps) {
  const { project, build } = await params;
  const indexPath = join(
    process.cwd(),
    "content",
    "pilots",
    project,
    build,
    "index.mdx"
  );

  const raw = await readFile(indexPath, "utf-8");
  const { data } = matter(raw);

  return (
    <PilotLayout
      projectSlug={project}
      buildSlug={build}
      buildTitle={data.title}
      modules={data.modules}
    >
      {children}
    </PilotLayout>
  );
}
