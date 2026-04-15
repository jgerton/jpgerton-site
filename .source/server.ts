// @ts-nocheck
import * as __fd_glob_8 from "../content/pilots/freemium-playbook/build-1/module-4.mdx?collection=pilots"
import * as __fd_glob_7 from "../content/pilots/freemium-playbook/build-1/module-3.mdx?collection=pilots"
import * as __fd_glob_6 from "../content/pilots/freemium-playbook/build-1/module-2.mdx?collection=pilots"
import * as __fd_glob_5 from "../content/pilots/freemium-playbook/build-1/module-1.mdx?collection=pilots"
import * as __fd_glob_4 from "../content/pilots/freemium-playbook/build-1/index.mdx?collection=pilots"
import * as __fd_glob_3 from "../content/pilots/freemium-playbook/index.mdx?collection=pilots"
import { default as __fd_glob_2 } from "../content/pilots/freemium-playbook/build-1/meta.json?collection=pilots"
import { default as __fd_glob_1 } from "../content/pilots/freemium-playbook/meta.json?collection=pilots"
import { default as __fd_glob_0 } from "../content/pilots/meta.json?collection=pilots"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const pilots = await create.docs("pilots", "content/pilots", {"meta.json": __fd_glob_0, "freemium-playbook/meta.json": __fd_glob_1, "freemium-playbook/build-1/meta.json": __fd_glob_2, }, {"freemium-playbook/index.mdx": __fd_glob_3, "freemium-playbook/build-1/index.mdx": __fd_glob_4, "freemium-playbook/build-1/module-1.mdx": __fd_glob_5, "freemium-playbook/build-1/module-2.mdx": __fd_glob_6, "freemium-playbook/build-1/module-3.mdx": __fd_glob_7, "freemium-playbook/build-1/module-4.mdx": __fd_glob_8, });