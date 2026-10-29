import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { SECTIONS, STATUS_LABEL } from "./nav";

/** The banner, the section tree on the left and the page; closes the mobile menu on navigation. */
export default function DocsLayout() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <DocsBanner />
      <div className="wrap wide docs">
        <button className="docs-menu" aria-expanded={open} aria-controls="docs-nav" onClick={() => setOpen(o => !o)}>
          {open ? "Close" : "Documentation menu"}
        </button>
        <nav id="docs-nav" className={open ? "docs-nav open" : "docs-nav"} aria-label="Documentation">
          <NavLink end to="/docs" className="docs-nav-home">Overview</NavLink>
          {SECTIONS.map(s => (
            <div key={s.id} className="docs-nav-section">
              <NavLink end to={`/docs/${s.id}`} className="docs-nav-title">{s.title}</NavLink>
              <ul>
                {s.items.map(i => (
                  <li key={i.slug}>
                    <NavLink to={`/docs/${s.id}/${i.slug}`} className={i.status}>
                      {i.title}
                      {i.status !== "ready" && <span className="status-dot" title={STATUS_LABEL[i.status]} />}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
