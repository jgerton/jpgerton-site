import { pilotsSource } from "@/lib/pilots-source";
import { createFromSource } from "fumadocs-core/search/server";

export const { GET } = createFromSource(pilotsSource, {
  language: "english",
});
