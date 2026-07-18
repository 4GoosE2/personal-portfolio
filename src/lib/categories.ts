import taxonomy from "../data/taxonomy.json";

export interface Category {
  name: string;
  slug: string;
  blurb: string;
}

/** Lowercase, strip punctuation, collapse runs of non-alphanumerics to "-". */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Categories are edited in the CMS (Settings → Categories & Subcategories),
 * which writes src/data/taxonomy.json. Slug is optional there: leaving it
 * blank derives one from the name, so a new category needs no URL knowledge.
 */
export const CATEGORIES: Category[] = taxonomy.categories.map((c) => ({
  name: c.name,
  blurb: c.blurb ?? "",
  slug: c.slug?.trim() ? c.slug.trim() : slugify(c.name),
}));

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name) as [string, ...string[]];

/** Subcategory suggestions offered in the CMS; free text is still valid. */
export const SUBCATEGORIES: string[] = (taxonomy.subcategories ?? []).map((s) => s.name);

export function categoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryByName(name: string): Category | undefined {
  return CATEGORIES.find((c) => c.name === name);
}
