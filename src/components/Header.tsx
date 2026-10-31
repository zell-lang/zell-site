import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { REPO, VERSION } from "../site";
import { GitHubIcon, Logo, MenuIcon } from "./icons";

const LINKS = [
  { to: "/docs", label: "Docs" },
  { to: "/download", label: "Download" },
  { to: "/why", label: "Why Zell" },
  { to: "/performance", label: "Performance" },
];
const PACKAGES = "https://github.com/zell-lang";

export default function Header() {
  const { pathname } = useLocation();
  // Documentation uses the full width (sidebar, article, table of contents); so does its header.
  const wide = pathname.startsWith("/docs");
  const [open, setOpen] = useState(false);

  // The mobile menu closes on navigation and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="top">
      <div className={wide ? "wrap wide" : "wrap"}>
        <Link className="brand" to="/" aria-label="Zell home">
          <Logo />
          Zell
        </Link>
        <nav className="links" aria-label="Main">
          {LINKS.map(l => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
          <a href={PACKAGES}>Packages</a>
        </nav>
        <span className="spacer" />
        <Link className="ver" to="/download">v{VERSION}</Link>
        <a className="btn ghost gh" href={REPO}>
          <GitHubIcon />
          <span>GitHub</span>
        </a>
        <button
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(o => !o)}
        >
          <MenuIcon open={open} />
        </button>
      </div>
      <nav id="mobile-nav" className={open ? "mobile-nav open" : "mobile-nav"} aria-label="Main">
        <div className={wide ? "wrap wide" : "wrap"}>
          {LINKS.map(l => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
          <a href={PACKAGES}>Packages</a>
          <Link className="mobile-ver" to="/download">Current release · v{VERSION}</Link>
        </div>
      </nav>
    </header>
  );
}
