import { Link, useParams } from "react-router-dom";
import { usePageTitle } from "../components/Layout";
import NotFound from "../pages/NotFound";
import { findSection, STATUS_LABEL } from "./nav";

/** /docs/<section>: the section's pages with their summaries, generated from nav.json. */
export default function SectionIndex() {
  const { section = "" } = useParams();
  const s = findSection(section);
  usePageTitle(s?.title);
  if (!s) return <NotFound />;
  const written = s.items.filter(i => i.status !== "planned").length;

  return (
    <article className="doc doc-index">
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/docs">Docs</Link></nav>
      <h1>{s.title}</h1>
      <p className="doc-lead">{s.summary}</p>
      <p className="doc-progress">{written} of {s.items.length} pages written</p>
      <ol className="chapter-list">
        {s.items.map((i, n) => (
          <li key={i.slug} className={i.status}>
            <Link to={`/docs/${s.id}/${i.slug}`}>
              <span className="num">{String(n + 1).padStart(2, "0")}</span>
              <span className="body">
                <strong>{i.title}{i.status !== "ready" && <span className={`badge ${i.status}`}>{STATUS_LABEL[i.status]}</span>}</strong>
                <span>{i.summary}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}
