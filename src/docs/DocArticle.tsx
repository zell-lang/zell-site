import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { Link, useParams } from "react-router-dom";
import type { MDXProps } from "mdx/types";
import { usePageTitle } from "../components/Layout";
import NotFound from "../pages/NotFound";
import { findPage, neighbours, STATUS_LABEL, type DocPage } from "./nav";
import { mdxComponents } from "./components/mdx";
import Callout from "./components/Callout";

const files = import.meta.glob<{ default: ComponentType<MDXProps> }>("./pages/**/*.mdx");
const cache = new Map<string, ComponentType<MDXProps>>();

/** The lazily loaded MDX component of a page, or null when the page has no file yet. */
function pageComponent(page: DocPage) {
  const key = `./pages/${page.section.id}/${page.slug}.mdx`;
  if (!files[key]) return null;
  if (!cache.has(key)) cache.set(key, lazy(files[key]));
  return cache.get(key)!;
}

export default function DocArticle() {
  const { section = "", slug = "" } = useParams();
  const page = findPage(section, slug);
  usePageTitle(page?.title);
  if (!page) return <NotFound />;

  const Content = pageComponent(page);
  const { prev, next } = neighbours(page);

  return (
    <div className="doc-grid">
      <article className="doc">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/docs">Docs</Link> › <Link to={`/docs/${page.section.id}`}>{page.section.title}</Link>
        </nav>
        <h1>
          {page.title}
          {page.status !== "ready" && <span className={`badge ${page.status}`}>{STATUS_LABEL[page.status]}</span>}
        </h1>
        <p className="doc-lead">{page.summary}</p>
        {Content ? (
          <Suspense fallback={<p className="doc-loading">Loading…</p>}>
            <Content components={mdxComponents} />
          </Suspense>
        ) : (
          <Callout type="planned">
            This page is planned but not written yet. It will cover: {page.summary.charAt(0).toLowerCase() + page.summary.slice(1)}{" "}
            Until then, the <a href="https://github.com/zell-lang/zell/tree/master/docs">documents in the repository</a>{" "}
            describe it.
          </Callout>
        )}
        <nav className="pager" aria-label="Pages">
          {prev ? <Link className="prev" to={prev.path}><small>Previous</small>{prev.title}</Link> : <span />}
          {next ? <Link className="next" to={next.path}><small>Next</small>{next.title}</Link> : <span />}
        </nav>
      </article>
      <Toc key={page.path} />
    </div>
  );
}

/** "On this page": the article's h2/h3 headings, the one in view highlighted. */
function Toc() {
  const [items, setItems] = useState<{ id: string; text: string; level: number }[]>([]);
  const [current, setCurrent] = useState("");
  const observer = useRef<IntersectionObserver>();

  useEffect(() => {
    const article = document.querySelector("article.doc");
    if (!article) return;
    const collect = () => {
      const hs = [...article.querySelectorAll<HTMLElement>("h2[id], h3[id]")];
      setItems(hs.map(h => ({ id: h.id, text: h.textContent ?? "", level: h.tagName === "H2" ? 2 : 3 })));
      observer.current?.disconnect();
      observer.current = new IntersectionObserver(
        es => { const e = es.find(x => x.isIntersecting); if (e) setCurrent(e.target.id); },
        { rootMargin: "-80px 0px -70% 0px" },
      );
      hs.forEach(h => observer.current!.observe(h));
    };
    collect();
    // MDX pages load lazily: collect again when their content arrives.
    const mo = new MutationObserver(collect);
    mo.observe(article, { childList: true, subtree: true });
    return () => { mo.disconnect(); observer.current?.disconnect(); };
  }, []);

  const list = useMemo(() => items, [items]);
  if (list.length < 2) return <aside className="toc-side" />;
  return (
    <aside className="toc-side" aria-label="On this page">
      <p>On this page</p>
      <ul>
        {list.map(i => (
          <li key={i.id} className={`l${i.level}${i.id === current ? " current" : ""}`}>
            <a href={`#${i.id}`}>{i.text}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
