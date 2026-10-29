import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { groupOf, NAMESPACES } from "./data";

const Chevron = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
);

/** Expansion keys used by the sidebar: "std" for the reference, "std:<group>" for a group. */
export function stdlibKeys(pathname: string): string[] {
  const m = pathname.match(/^\/docs\/reference\/stdlib(?:\/([^/]+))?/);
  if (!m) return [];
  return m[1] ? ["std", `std:${groupOf(decodeURIComponent(m[1]))}`] : ["std"];
}

/**
 * "Standard library" in the sidebar: the link, a toggle, and the namespaces grouped by their first
 * segment (crypto.aes and crypto.rsa under crypto). A group of one is shown as a plain link.
 */
export default function StdlibNav({ expanded, toggle }: { expanded: Set<string>; toggle: (key: string) => void }) {
  const groups = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const ns of NAMESPACES) m.set(groupOf(ns.name), [...(m.get(groupOf(ns.name)) ?? []), ns.name]);
    return [...m.entries()];
  }, []);
  const open = expanded.has("std");

  return (
    <li className="std-nav">
      <div className="nav-row">
        <NavLink end to="/docs/reference/stdlib">Standard library</NavLink>
        <button className="nav-toggle" aria-expanded={open} aria-controls="nav-std" aria-label="Show namespaces" onClick={() => toggle("std")}>
          <Chevron />
        </button>
      </div>
      <ul id="nav-std" className="nav-tree" hidden={!open}>
        {groups.map(([g, names]) => {
          if (names.length === 1 && names[0] === g) {
            return <li key={g}><NavLink to={`/docs/reference/stdlib/${g}`} className="mono">{g}</NavLink></li>;
          }
          const key = `std:${g}`;
          const gOpen = expanded.has(key);
          return (
            <li key={g}>
              <button className="nav-group mono" aria-expanded={gOpen} aria-controls={`nav-${key}`} onClick={() => toggle(key)}>
                <Chevron />{g}<span className="nav-count">{names.length}</span>
              </button>
              <ul id={`nav-${key}`} className="nav-tree" hidden={!gOpen}>
                {names.map(n => (
                  <li key={n}><NavLink to={`/docs/reference/stdlib/${n}`} className="mono">{n === g ? n : n.slice(g.length + 1)}</NavLink></li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </li>
  );
}
