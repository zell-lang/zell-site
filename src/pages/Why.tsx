import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHead from "../components/PageHead";
import SectionHead from "../components/SectionHead";
import Inline from "../components/Inline";
import FinalCta from "../components/FinalCta";
import { usePageTitle } from "../components/Layout";
import { highlight } from "../highlight";
import { GLANCE, LANG_OF, RIVALS, TOPICS, type Rival, type Topic, type Version } from "../data/why";

const KEY = "zell-site.rival";

function loadRival(): Rival {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "go" || v === "csharp" || v === "rust") return v;
  } catch { /* storage unavailable: use the default */ }
  return "go";
}

export default function Why() {
  usePageTitle("Why Zell");
  const [rival, setRival] = useState<Rival>(loadRival);

  useEffect(() => {
    try { localStorage.setItem(KEY, rival); } catch { /* not persisted */ }
  }, [rival]);

  return (
    <>
      <PageHead eyebrow="Why Zell" title="The same tasks, side by side">
        <p>
          Four things every service does: handle errors, cancel work, read and write JSON, release resources. Each is
          written in Zell and in Go, C# or Rust, so you can judge the difference on code rather than on adjectives.
          Where another language does as well, the notes say so.
        </p>
        <nav className="toc" aria-label="Topics">
          {TOPICS.map(t => <a key={t.id} href={`#${t.id}`}>{t.eyebrow}</a>)}
          <a href="#glance">At a glance</a>
        </nav>
      </PageHead>

      {TOPICS.map((t, i) => (
        <TopicBand key={t.id} topic={t} alt={i % 2 === 0} rival={rival} onRival={setRival} />
      ))}

      <section className={TOPICS.length % 2 === 0 ? "band alt" : "band"} id="glance">
        <div className="wrap">
          <SectionHead eyebrow="At a glance" title="Zell, Go, C# and Rust">
            The short version. Numbers are on the <Link to="/performance">performance page</Link>, including the places
            where Zell is slower.
          </SectionHead>
          <div className="table-scroll">
            <table className="cmp glance">
              <thead>
                <tr><th /><th className="zell">Zell</th><th>Go</th><th>C# / .NET</th><th>Rust</th></tr>
              </thead>
              <tbody>
                {GLANCE.map(g => (
                  <tr key={g.row}>
                    <th>{g.row}</th>
                    <td className="zell"><Inline text={g.zell} /></td>
                    <td><Inline text={g.go} /></td>
                    <td><Inline text={g.csharp} /></td>
                    <td><Inline text={g.rust} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}

function TopicBand({ topic, alt, rival, onRival }: { topic: Topic; alt: boolean; rival: Rival; onRival: (r: Rival) => void }) {
  const other = topic.rivals[rival];
  const name = RIVALS.find(r => r.id === rival)!.name;
  return (
    <section className={alt ? "band alt" : "band"} id={topic.id}>
      <div className="wrap">
        <SectionHead eyebrow={topic.eyebrow} title={topic.title}>
          <strong>The task:</strong> {topic.task}
        </SectionHead>
        <div className="argument">
          {topic.argument.map((p, i) => <p key={i}><Inline text={p} /></p>)}
        </div>

        <div className="vs-bar">
          <span>Zell next to</span>
          <div className="seg" role="radiogroup" aria-label={`Compare ${topic.eyebrow.toLowerCase()} with`}>
            {RIVALS.map(r => (
              <button key={r.id} role="radio" aria-checked={r.id === rival} onClick={() => onRival(r.id)}>{r.name}</button>
            ))}
          </div>
        </div>

        <div className="vs">
          <Pane lang="Zell" version={topic.zell} hl="zell" primary />
          <Pane lang={name} version={other} hl={LANG_OF[rival]} />
        </div>

        <div className="output">
          <p>{topic.outputLabel}</p>
          <pre>{topic.output}</pre>
        </div>
      </div>
    </section>
  );
}

function Pane({ lang, version, hl, primary }: { lang: string; version: Version; hl: Parameters<typeof highlight>[1]; primary?: boolean }) {
  const html = useMemo(() => highlight(version.code, hl), [version.code, hl]);
  const lines = version.code.split("\n").length;
  return (
    <figure className={primary ? "pane zell" : "pane"}>
      <figcaption>
        <strong>{lang}</strong>
        <span>{lines} lines</span>
      </figcaption>
      <pre dangerouslySetInnerHTML={{ __html: html }} />
      <ul className="notes">
        {version.notes.map((n, i) => <li key={i}><Inline text={n} /></li>)}
      </ul>
    </figure>
  );
}
