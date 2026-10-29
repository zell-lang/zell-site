import { Link } from "react-router-dom";
import PageHead from "../components/PageHead";
import { usePageTitle } from "../components/Layout";
import { LATEST } from "../site";
import { SECTIONS } from "./nav";
import { DocsBanner } from "./DocsLayout";

const ICONS: Record<string, JSX.Element> = {
  "get-started": <path d="M5 12h14M13 6l6 6-6 6" />,
  learn: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />,
  guides: <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />,
  reference: <path d="M8 3H5v18h3M16 3h3v18h-3M9 8h6M9 12h6M9 16h4" />,
  concepts: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></>,
};

/** /docs: what is where, as on go.dev/doc and learn.microsoft.com. */
export default function DocsHome() {
  usePageTitle("Documentation");
  return (
    <>
      <DocsBanner />
      <PageHead eyebrow={`Documentation · Zell ${LATEST.version}`} title="Zell documentation">
        <p>
          Everything from installing the toolchain to how the scheduler works. New to Zell? Start with{" "}
          <Link to="/docs/get-started/install">Get started</Link>, then read <Link to="/docs/learn">Learn</Link> in order.
        </p>
      </PageHead>
      <section className="wrap docs-home">
        <div className="grid3 doc-cards">
          {SECTIONS.map(s => {
            const first = s.items.find(i => i.status !== "planned");
            const written = s.items.filter(i => i.status !== "planned").length;
            return (
              <div className="feat doc-card" key={s.id}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{ICONS[s.id]}</svg>
                <h3><Link to={`/docs/${s.id}`}>{s.title}</Link></h3>
                <p>{s.summary}</p>
                <ul>
                  {s.items.slice(0, 4).map(i => (
                    <li key={i.slug} className={i.status}><Link to={`/docs/${s.id}/${i.slug}`}>{i.title}</Link></li>
                  ))}
                  {s.items.length > 4 && <li className="more-items"><Link to={`/docs/${s.id}`}>All {s.items.length} pages →</Link></li>}
                </ul>
                <small>{written ? `${written} of ${s.items.length} written` : "Planned"}{first && <> · <Link to={`/docs/${s.id}/${first.slug}`}>Start</Link></>}</small>
              </div>
            );
          })}
          <div className="feat doc-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></svg>
            <h3><a href="https://github.com/zell-lang">Packages and examples</a></h3>
            <p>Showcase repositories with a web service, a CLI and a worker, and packages built on the standard library.</p>
            <ul>
              <li><a href="https://github.com/zell-lang/example-web-service">example-web-service</a></li>
              <li><a href="https://github.com/zell-lang/example-cli">example-cli</a></li>
              <li><a href="https://github.com/zell-lang/example-worker">example-worker</a></li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
