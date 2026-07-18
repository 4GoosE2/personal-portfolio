import type { CollectionEntry } from "astro:content";
import { slugify } from "./categories";

type Project = CollectionEntry<"projects">;

export interface OriginNode {
  name: string;
  slug: string;
  count: number;
}

/**
 * The origin tree is derived from the projects themselves rather than from
 * taxonomy.json, so a page only exists where there is something to show.
 * taxonomy.json supplies the CMS suggestions; the projects supply the routes.
 */
function nodes(values: (string | undefined)[]): OriginNode[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    const name = value?.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const hasOrigin = (p: Project) => Boolean(p.data.track?.trim());

export const tracks = (projects: Project[]) => nodes(projects.map((p) => p.data.track));

export const inTrack = (projects: Project[], trackSlug: string) =>
  projects.filter((p) => p.data.track && slugify(p.data.track) === trackSlug);

export const sources = (projects: Project[]) => nodes(projects.map((p) => p.data.source));

export const inSource = (projects: Project[], sourceSlug: string) =>
  projects.filter((p) => p.data.source && slugify(p.data.source) === sourceSlug);

export const contexts = (projects: Project[]) => nodes(projects.map((p) => p.data.context));

export const inContext = (projects: Project[], contextSlug: string) =>
  projects.filter((p) => p.data.context && slugify(p.data.context) === contextSlug);

/** Path to the deepest origin page that exists for a project. */
export function originPath(p: Project): string | undefined {
  if (!p.data.track?.trim()) return undefined;
  const parts = ["/portfolio/from", slugify(p.data.track)];
  if (p.data.source?.trim()) parts.push(slugify(p.data.source));
  if (p.data.source?.trim() && p.data.context?.trim()) parts.push(slugify(p.data.context));
  return `${parts.join("/")}/`;
}
