// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  pilots: create.doc("pilots", {"freemium-playbook/build-1.mdx": () => import("../content/pilots/freemium-playbook/build-1.mdx?collection=pilots"), "freemium-playbook/build-1/index.mdx": () => import("../content/pilots/freemium-playbook/build-1/index.mdx?collection=pilots"), "freemium-playbook/build-1/module-1.mdx": () => import("../content/pilots/freemium-playbook/build-1/module-1.mdx?collection=pilots"), "freemium-playbook/build-1/module-2.mdx": () => import("../content/pilots/freemium-playbook/build-1/module-2.mdx?collection=pilots"), "freemium-playbook/build-1/module-3.mdx": () => import("../content/pilots/freemium-playbook/build-1/module-3.mdx?collection=pilots"), "freemium-playbook/build-1/module-4.mdx": () => import("../content/pilots/freemium-playbook/build-1/module-4.mdx?collection=pilots"), }),
};
export default browserCollections;