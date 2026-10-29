import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { usePageTitle } from "../../components/Layout";
import { highlight } from "../../highlight";
import NotFound from "../../pages/NotFound";
import { CodeBlock } from "../components/CodeBlock";
import { Toc } from "../DocArticle";
import DocText from "./DocText";
import { KIND_TITLES, loadNamespace, sourceUrl, STD_VERSION, type ApiExample, type ApiItem, type Namespace } from "./data";

/** /docs/reference/stdlib/<namespace>: constants, types with their members, functions. */
export default function StdlibNamespace() {
  const { ns = "" } = useParams();
  const { hash } = useLocation();
  const [data, setData] = useState<Namespace | null | undefined>(undefined);
  usePageTitle(ns);

  useEffect(() => {
    setData(undefined);
    const p = loadNamespace(ns);
    if (!p) { setData(null); return; }
    let alive = true;
    p.then(d => { if (alive) setData(d); });
    return () => { alive = false; };
  }, [ns]);

  // The page renders after its data arrives, so jump to #Symbol once it is there.
  useEffect(() => {
    if (data && hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [data, hash]);

  if (data === null) return <NotFound />;

  return (
    <div className="doc-grid">
      <article className="doc api">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/docs">Docs</Link> › <Link to="/docs/reference">Reference</Link> › <Link to="/docs/reference/stdlib">Standard library</Link>
        </nav>
        <h1><code>{ns}</code></h1>
        {data === undefined ? <p className="doc-loading">Loading…</p> : <NamespaceBody data={data} />}
      </article>
      {data && <Toc key={ns} />}
    </div>
  );
}

function NamespaceBody({ data }: { data: Namespace }) {
  const sections = useMemo(
    () => KIND_TITLES.map(([kinds, title]) => ({ title, items: data.items.filter(i => kinds.includes(i.kind)) })).filter(s => s.items.length),
    [data],
  );
  return (
    <>
      <div className="doc-lead"><DocText text={data.doc} /></div>
      <p className="api-meta">
        <code>import {data.name.split(".")[0]}</code> · generated from zell {STD_VERSION} ·{" "}
        {data.files.map((f, i) => <span key={f}>{i > 0 && ", "}<a href={sourceUrl(f, 1)}>{f.split("/").pop()}</a></span>)}
      </p>

      <nav className="api-index" aria-label="Index">
        {sections.map(s => (
          <div key={s.title}>
            <h4>{s.title}</h4>
            <ul>{s.items.map(i => <li key={i.name}><a href={`#${i.name}`}>{i.name}</a></li>)}</ul>
          </div>
        ))}
      </nav>

      {sections.map(s => (
        <section key={s.title}>
          <h2 id={s.title.toLowerCase()}>{s.title}</h2>
          {s.items.map(i => <Item key={i.name} item={i} />)}
        </section>
      ))}
    </>
  );
}

function Signature({ text }: { text: string }) {
  const html = useMemo(() => highlight(text.replace(/\s+/g, " "), "zell"), [text]);
  return <pre className="sig" dangerouslySetInnerHTML={{ __html: html }} />;
}

function Item({ item }: { item: ApiItem }) {
  const fields = item.members?.filter(m => m.kind === "field") ?? [];
  const variants = item.members?.filter(m => m.kind === "variant") ?? [];
  const methods = item.members?.filter(m => m.kind === "method") ?? [];
  return (
    <div className="api-item">
      <h3 id={item.name}>
        <span className={`kind ${item.kind}`}>{item.kind}</span>
        <code>{item.name}</code>
        <a className="src" href={sourceUrl(item.file, item.line)} title={`${item.file}:${item.line}`}>source</a>
      </h3>
      <Signature text={item.signature} />
      <DocText text={item.doc} />
      {item.examples?.map(e => <ApiExampleBlock key={e.name} ex={e} />)}

      {fields.length > 0 && (
        <dl className="members">
          {fields.map(f => (
            <div key={f.name}><dt><code>{f.signature.replace(/\s+/g, " ")}</code></dt>{f.doc && <dd><DocText text={f.doc} /></dd>}</div>
          ))}
        </dl>
      )}
      {variants.length > 0 && (
        <dl className="members">
          {variants.map(v => (
            <div key={v.name}><dt><code>{item.name}.{v.signature}</code></dt>{v.doc && <dd><DocText text={v.doc} /></dd>}</div>
          ))}
        </dl>
      )}
      {methods.map(m => (
        <div className="api-method" key={m.name}>
          <h4 id={`${item.name}.${m.name}`}>
            <code>{item.name}.{m.name}</code>
            <a className="src" href={sourceUrl(m.file, m.line)}>source</a>
          </h4>
          <Signature text={m.signature} />
          <DocText text={m.doc} />
          {m.examples?.map(e => <ApiExampleBlock key={e.name} ex={e} />)}
        </div>
      ))}
    </div>
  );
}

/** An example from the standard library's own tests: the test suite checks this output. */
function ApiExampleBlock({ ex }: { ex: ApiExample }) {
  return (
    <figure className="example api-example">
      <div className="example-bar">
        <div className="example-tabs"><button disabled>Example{ex.suffix ? ` (${ex.suffix})` : ""}</button></div>
        <span className="checked" title="Checked by the standard library's test suite">✓ zell test std</span>
      </div>
      <CodeBlock code={ex.code} lang="zell" bare />
      {ex.output && (
        <div className="example-out">
          <span>Output{ex.unordered ? " (in any order)" : ""}</span>
          <pre>{ex.output}</pre>
        </div>
      )}
    </figure>
  );
}
