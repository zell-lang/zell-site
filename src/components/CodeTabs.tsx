import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { EXAMPLES } from "../examples";
import { highlight } from "../highlight";
import SectionHead from "./SectionHead";

export default function CodeTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const ex = EXAMPLES[active];
  const html = useMemo(() => highlight(ex.src), [ex]);

  function onKey(e: KeyboardEvent) {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (active + d + EXAMPLES.length) % EXAMPLES.length;
    setActive(n);
    tabs.current[n]?.focus();
  }

  return (
    <section className="band" id="code">
      <div className="wrap">
        <SectionHead eyebrow="The language" title="Code that reads like Go and says more">
          A small core you can learn in a weekend, with the features Go makes you write by hand. Every example below
          compiles with the current toolchain.
        </SectionHead>
        <div className="code-tabs">
          <div role="tablist" aria-label="Examples" onKeyDown={onKey}>
            {EXAMPLES.map((x, i) => (
              <button
                key={x.id}
                ref={el => { tabs.current[i] = el; }}
                role="tab"
                aria-selected={i === active}
                aria-controls="ex-panel"
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
              >
                <strong>{x.title}</strong>
                <small>{x.hint}</small>
              </button>
            ))}
          </div>
          <div className="panel" role="tabpanel" id="ex-panel" tabIndex={0}>
            <pre dangerouslySetInnerHTML={{ __html: html }} />
            <p className="note">{ex.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
