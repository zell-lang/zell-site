import { useMemo, useRef, useState, type ReactNode } from "react";
import { highlight } from "../../highlight";
import { CopyButton } from "../../components/Install";
import { getExample, mainFile } from "../examples";
import { CodeBlock } from "./CodeBlock";

interface Props {
  /** Directory under src/docs/examples, e.g. "errors/propagate". */
  id: string;
  /** Files to show as tabs, in order; by default the example's main file. */
  files?: string[];
  /** Which output to show under the code. */
  output?: "run" | "test" | "none";
  /** A sentence under the example. */
  children?: ReactNode;
}

/**
 * A checked Zell example: the source (one or more files), its real output, and whether the
 * sources are exactly what scripts/check-examples.mjs ran.
 */
export default function Example({ id, files, output = "run", children }: Props) {
  const ex = getExample(id);
  const tabs = files ?? [mainFile(ex)];
  const [active, setActive] = useState(tabs[0]);
  const code = ex.files[active] ?? "";
  const lang = active.endsWith(".toml") ? "toml" : "zell";
  const html = useMemo(() => (lang === "zell" ? highlight(code, "zell") : null), [code, lang]);
  const pre = useRef<HTMLElement>(null);
  const out = output === "test" ? ex.test : output === "run" ? ex.run : undefined;

  return (
    <figure className="example">
      <div className="example-bar">
        <div className="example-tabs" role={tabs.length > 1 ? "tablist" : undefined}>
          {tabs.map(f => (
            <button key={f} role={tabs.length > 1 ? "tab" : undefined} aria-selected={f === active} onClick={() => setActive(f)} disabled={tabs.length === 1}>
              {f}
            </button>
          ))}
        </div>
        {ex.checkedWith
          ? <span className="checked" title="This exact source was compiled and run, and printed the output below">✓ zell {ex.checkedWith}</span>
          : <span className="checked stale" title="Run scripts/check-examples.mjs">not checked</span>}
        <CopyButton text={code} target={pre} />
      </div>
      {html !== null
        ? <pre ref={pre as React.RefObject<HTMLPreElement>} dangerouslySetInnerHTML={{ __html: html }} />
        : <CodeBlock code={code} lang={lang} bare preRef={pre} />}
      {out !== undefined && (
        <div className="example-out">
          <span>{output === "test" ? "zell test -v" : "Output"}</span>
          <pre>{out}</pre>
        </div>
      )}
      {children && <figcaption>{children}</figcaption>}
    </figure>
  );
}
