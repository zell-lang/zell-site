import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <span>© 2026 Zell contributors · MIT License</span>
        <span className="spacer" />
        <nav aria-label="Footer">
          <Link to="/docs">Documentation</Link>
          <a href="https://github.com/zell-lang/zell/releases">Releases</a>
          <a href="https://github.com/zell-lang/zell">Source</a>
          <a href="https://github.com/zell-lang/zell-idea-plugin">IntelliJ plugin</a>
        </nav>
      </div>
    </footer>
  );
}
