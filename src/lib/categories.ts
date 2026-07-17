export interface Category {
  name: string;
  slug: string;
  blurb: string;
}

export const CATEGORIES: Category[] = [
  {
    name: "Valuation & Financial Modeling",
    slug: "valuation-financial-modeling",
    blurb: "DCF and multiples-based valuations, operating models, and investment memos.",
  },
  {
    name: "Commercial Due Diligence",
    slug: "commercial-due-diligence",
    blurb: "Market attractiveness, competitive position, and revenue-quality assessments.",
  },
  {
    name: "Market Sizing & Competitive Landscape",
    slug: "market-sizing-competitive-landscape",
    blurb: "TAM/SAM/SOM builds, segmentation, and competitor mapping.",
  },
  {
    name: "Data Analytics & BI",
    slug: "data-analytics-bi",
    blurb: "SQL, Python, and Power BI work — data models, dashboards, and analysis pipelines.",
  },
  {
    name: "Growth Strategy & Operations",
    slug: "growth-strategy-operations",
    blurb: "Go-to-market plans, pricing, and operational improvement cases.",
  },
  {
    name: "Post-Merger Integration",
    slug: "post-merger-integration",
    blurb: "Integration planning and management control — grounded in First Class dissertation research.",
  },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name) as [string, ...string[]];

export function categoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryByName(name: string): Category | undefined {
  return CATEGORIES.find((c) => c.name === name);
}
