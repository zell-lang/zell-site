// The documentation tree (nav.json) and lookups over it. A page's MDX file lives at
// src/docs/pages/<section>/<slug>.mdx; pages without a file render as "planned".
import nav from "./nav.json";

export type Status = "ready" | "draft" | "planned";

export interface DocItem { slug: string; title: string; status: Status; summary: string }
export interface DocSection { id: string; title: string; summary: string; items: DocItem[] }

/** A page in reading order, with its URL and section. */
export interface DocPage extends DocItem { path: string; section: DocSection }

export const SECTIONS = nav.sections as DocSection[];

export const PAGES: DocPage[] = SECTIONS.flatMap(section =>
  section.items.map(item => ({ ...item, section, path: `/docs/${section.id}/${item.slug}` })),
);

export const findSection = (id: string) => SECTIONS.find(s => s.id === id);
export const findPage = (section: string, slug: string) => PAGES.find(p => p.section.id === section && p.slug === slug);

/** The written pages before and after `page`, skipping planned ones. */
export function neighbours(page: DocPage) {
  const written = PAGES.filter(p => p.status !== "planned" || p === page);
  const i = written.indexOf(page);
  return { prev: written[i - 1], next: written[i + 1] };
}

export const STATUS_LABEL: Record<Status, string> = { ready: "", draft: "Draft", planned: "Planned" };
