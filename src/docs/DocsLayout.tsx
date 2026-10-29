import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { SECTIONS, STATUS_LABEL } from "./nav";
import StdlibNav, { stdlibKeys } from "./stdlib/StdlibNav";

/** The section of a /docs/<section>/... path, if any. */
const sectionOf = (pathname: string) => pathname.match(/^\/docs\/([^/]+)/)?.[1];

/** The banner, the section tree on the left and the page; closes the mobile menu on navigation. */
export default function DocsLayout() {
  const { pathname } = useLocation();
  const current = sectionOf(pathname);
  const [open, setOpen] = useState(false);
  // Expanded sections: the current one always, plus whatever the reader opened.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([...(current ? [current] : []), ...stdlibKeys(pathname)]));

  useEffect(() => {
    setOpen(false);
    const want = [...(current ? [current] : []), ...stdlibKeys(pathname)];
    setExpanded(e => (want.every(k => e.has(k)) ? e : new Set([...e, ...want])));
  }, [pathname, current]);

  const toggle = (id: string) =>
    setExpanded(e => {
      const n = new Set(e);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <>
      <DocsBanner />
      <div className="wrap wide docs">
        <button className="docs-menu" aria-expanded={open} aria-controls="docs-nav" onClick={() => setOpen(o => !o)}>
          {open ? "Close" : "Documentation menu"}
        </button>
        <nav id="docs-nav" className={open ? "docs-nav open" : "docs-nav"} aria-label="Documentation">
          <NavLink end to="/docs" className="docs-nav-home">Documentation home</NavLink>
          {SECTIONS.map(s => {
            const isOpen = expanded.has(s.id);
            return (
              <div key={s.id} className={s.id === current ? "docs-nav-section current" : "docs-nav-section"}>
                <button className="docs-nav-title" aria-expanded={isOpen} aria-controls={`nav-${s.id}`} onClick={() => toggle(s.id)}>
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
                  {s.title}
                </button>
                <ul id={`nav-${s.id}`} hidden={!isOpen}>
                  <li><NavLink end to={`/docs/${s.id}`}>Overview</NavLink></li>
                  {s.items.map(i => s.id === "reference" && i.slug === "stdlib" ? <StdlibNav key={i.slug} expanded={expanded} toggle={toggle} /> : (
                    <li key={i.slug}>
                      <NavLink to={`/docs/${s.id}/${i.slug}`} className={i.status}>
                        {i.title}
                        {i.status !== "ready" && <span className="status-dot" title={STATUS_LABEL[i.status]} />}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
        <div className="docs-main">
          <Outlet />
        </div>
      </div>
    </>
  );
}

/** "Documentation in progress", above every docs page. */
export function DocsBanner() {
  return (
    <div className="docs-banner" role="status">
      <div className="wrap wide">
        <span className="badge warn">In progress</span>
        <span>
          This documentation is being written. Pages marked <em>Planned</em> show what they will cover; the language
          itself may still change before 1.0.
        </span>
      </div>
    </div>
  );
}
