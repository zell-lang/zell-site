import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "../../components/Layout";
import Inline from "../../components/Inline";
import { groupOf, NAMESPACES, STD_VERSION } from "./data";

/** /docs/reference/stdlib: every namespace, grouped, with a search over namespaces and symbols. */
export default function StdlibIndex() {
  usePageTitle("Standard library");
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim().toLowerCase());
  const total = NAMESPACES.reduce((n, ns) => n + ns.symbols.length, 0);

  const hits = useMemo(() => {
    if (q.length < 2) return [];
    const out: { ns: string; name: string; kind: string; summary: string }[] = [];
    for (const ns of NAMESPACES) {
      for (const s of ns.symbols) {
        if (s.name.toLowerCase().includes(q) || `${ns.name}.${s.name}`.toLowerCase().includes(q)) out.push({ ns: ns.name, ...s });
      }
    }
    // exact names first, then prefix matches, then the rest
    const rank = (h: { name: string }) => (h.name.toLowerCase() === q ? 0 : h.name.toLowerCase().startsWith(q) ? 1 : 2);
    return out.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name)).slice(0, 60);
  }, [q]);

  const groups = useMemo(() => {
    const m = new Map<string, typeof NAMESPACES>();
    for (const ns of NAMESPACES) {
      if (q.length >= 2 && !ns.name.includes(q) && !ns.summary.toLowerCase().includes(q)) continue;
      const g = groupOf(ns.name);
      m.set(g, [...(m.get(g) ?? []), ns]);
    }
    return [...m.entries()];
  }, [q]);

  return (
    <article className="doc doc-index stdlib">
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/docs">Docs</Link> › <Link to="/docs/reference">Reference</Link></nav>
      <h1>Standard library</h1>
      <p className="doc-lead">
        {NAMESPACES.length} namespaces and {total.toLocaleString("en-US")} symbols, generated from the doc comments of
        zell {STD_VERSION}. The same reference is available offline: <code>zell doc strings.Split</code>.
      </p>

      <div className="std-search">
        <input
          type="search"
          placeholder="Search namespaces and symbols: Split, json.Parse, Mutex…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search the standard library"
          autoFocus
        />
      </div>

      {hits.length > 0 && (
        <section className="std-hits" aria-label="Matching symbols">
          <h2 id="symbols">Symbols</h2>
          <ul>
            {hits.map(h => (
              <li key={`${h.ns}.${h.name}`}>
                <Link to={`/docs/reference/stdlib/${h.ns}#${h.name}`}>
                  <code><span className="std-ns">{h.ns}.</span>{h.name}</code>
                  <span className={`kind ${h.kind}`}>{h.kind}</span>
                </Link>
                <span className="std-sum"><Inline text={h.summary} /></span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {groups.map(([g, list]) => (
        <section key={g} className="std-group">
          <h2 id={g}>{g}</h2>
          <ul className="std-list">
            {list.map(ns => (
              <li key={ns.name}>
                <Link to={`/docs/reference/stdlib/${ns.name}`}><code>{ns.name}</code></Link>
                <span className="std-count">{ns.symbols.length}</span>
                <span className="std-sum"><Inline text={ns.summary} /></span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {q.length >= 2 && groups.length === 0 && hits.length === 0 && <p className="empty">Nothing matches “{query}”.</p>}
    </article>
  );
}
