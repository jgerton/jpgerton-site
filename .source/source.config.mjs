// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
var pilots = defineDocs({
  dir: "content/pilots"
});
var source_config_default = defineConfig();
export {
  source_config_default as default,
  pilots
};
