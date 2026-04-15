import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import {
  KeyData,
  Insight,
  Action,
  Exercise,
  WatchOut,
  OpenQuestion,
} from "@/components/mdx/callouts";
import { PilotExerciseWrapper } from "@/components/pilots/pilot-exercise-wrapper";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    KeyData,
    Insight,
    Action,
    Exercise,
    WatchOut,
    OpenQuestion,
    PilotExercise: PilotExerciseWrapper,
    ...components,
  };
}
