import { Link } from "react-router-dom";

export default function FinalCta() {
  return (
    <section className="band">
      <div className="wrap final">
        <div>
          <h2>Write your first program in five minutes</h2>
          <p>Install the toolchain, then follow the tour of the language.</p>
        </div>
        <div className="cta" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn primary" to="/docs/get-started/install">Get started</Link>
          <Link className="btn ghost" to="/docs/learn">Learn the language</Link>
        </div>
      </div>
    </section>
  );
}
