import { Link, NavLink, useLocation } from "react-router-dom";
import { REPO, VERSION } from "../site";
import { GitHubIcon, Logo } from "./icons";

export default function Header() {
  // Documentation uses the full width (sidebar, article, table of contents); so does its header.
  const wide = useLocation().pathname.startsWith("/docs");
  return (
    <header className="top">
      <div className={wide ? "wrap wide" : "wrap"}>
        <Link className="brand" to="/" aria-label="Zell home">
          <Logo />
          Zell
        </Link>
        <nav className="links" aria-label="Main">
          <NavLink to="/docs">Docs</NavLink>
          <NavLink to="/download">Download</NavLink>
          <NavLink to="/why">Why Zell</NavLink>
          <NavLink to="/performance">Performance</NavLink>
          <a href="https://github.com/zell-lang">Packages</a>
        </nav>
        <span className="spacer" />
        <Link className="ver" to="/download">v{VERSION}</Link>
        <a className="btn ghost" href={REPO} style={{ padding: "7px 14px" }}>
          <GitHubIcon />
          GitHub
        </a>
      </div>
    </header>
  );
}
