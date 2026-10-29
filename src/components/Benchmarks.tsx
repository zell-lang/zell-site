import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import SectionHead from "./SectionHead";

interface Metric {
  title: string;
  sub: string;
  higherIsBetter?: boolean;
  unit: string;
  rows: [lang: string, value: number][];
}

const METRICS: Metric[] = [
  { title: "HTTP/1.1 hello server", sub: "Requests per second, 64 keep-alive connections · higher is better", higherIsBetter: true, unit: "",
    rows: [["Zell", 608886], ["Go", 396296]] },
  { title: "Contended mutex", sub: "Milliseconds to finish the run", unit: " ms",
    rows: [["Zell", 107], ["Go", 203], [".NET", 3452]] },
  { title: "Timer accuracy", sub: "Mean lateness of a timer, microseconds", unit: " µs",
    rows: [["Zell", 41], ["Go", 126], [".NET", 793]] },
  { title: "Cancelling a task tree", sub: "Average time to drain a cancelled tree, microseconds", unit: " µs",
    rows: [["Zell", 2323], ["Go", 4336], [".NET", 8491]] },
];

/** Bars are scaled to the largest value in each metric. */
export default function Benchmarks() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { setOn(true); o.disconnect(); } }, { threshold: 0.3 });
    o.observe(ref.current!);
    return () => o.disconnect();
  }, []);

  return (
    <section className="band" id="performance">
      <div className="wrap">
        <SectionHead eyebrow="Performance" title="Measured against Go and .NET">
          The same programs in each language, release builds, medians of interleaved runs on one 16-thread machine.
          Lower is better unless marked.
        </SectionHead>
        <div className={on ? "bench on" : "bench"} ref={ref}>
          {METRICS.map(m => {
            const max = Math.max(...m.rows.map(r => r[1]));
            return (
              <div className="metric" key={m.title}>
                <h3>{m.title}</h3>
                <p className="sub">{m.sub}</p>
                {m.rows.map(([lang, v]) => (
                  <div className={lang === "Zell" ? "row z" : "row"} key={lang}>
                    <span className="lbl">{lang}</span>
                    <div className="track">
                      <div className="fill" style={{ "--w": `${(v / max) * 100}%` } as CSSProperties} />
                    </div>
                    <span className="val">{v.toLocaleString("en-US")}{m.unit}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <p className="bench-note">
          Go is still ahead on select-heavy fan-in (2.1×) and worker pools (1.7×).{" "}
          <Link to="/performance">Every benchmark, including where Zell is behind, with the machine and the method →</Link>
        </p>
      </div>
    </section>
  );
}
