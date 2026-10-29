import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import PageHead from "../components/PageHead";
import SectionHead from "../components/SectionHead";
import { usePageTitle } from "../components/Layout";
import { REPO } from "../site";
import { BEHIND, GROUPS, MACHINES, SIZES, src, type Group, type Measure, type Ratio, type Rt } from "../data/benchmarks";

type Filter = "all" | "ahead" | "behind";

/** Zell's cost relative to Go: below 1 Zell is ahead, whatever the unit's direction. */
const costVsGo = (m: Measure) => {
  const z = m.values.Zell!, g = m.values.Go!;
  return m.higherIsBetter ? g / z : z / g;
};

const PARITY = 0.05;
const side = (r: number): Filter => (r < 1 - PARITY ? "ahead" : r > 1 + PARITY ? "behind" : "all");
const keep = (f: Filter, r: number) => f === "all" || side(r) === f;

const num = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: v < 10 ? 3 : v < 100 ? 1 : 0 });
const times = (r: number) => `${(r >= 1 ? r : 1 / r).toFixed(r >= 10 || r <= 0.1 ? 0 : r >= 1.95 || r <= 0.51 ? 1 : 2)}×`;

function verdict(r: number, other = "Go") {
  if (side(r) === "ahead") return { cls: "win", text: `Zell ${times(r)} better` };
  if (side(r) === "behind") return { cls: "loss", text: `${other} ${times(r)} better` };
  return { cls: "even", text: "parity" };
}

/** Adds `on` to an element once it scrolls into view, which starts the bar animation. */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { setOn(true); o.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, on] as const;
}

export default function Performance() {
  usePageTitle("Performance");
  const [filter, setFilter] = useState<Filter>("all");
  return (
    <>
      <PageHead eyebrow="Performance" title="Measured against Go and .NET, losses included">
        <p>
          The same programs in each language, with the same inputs and identical checksums, release builds. Below is
          every published result, grouped by what it exercises, with the machine, the method and the source of each
          program. Where Zell is slower, it says so first.
        </p>
        <nav className="toc" aria-label="Groups">
          <a href="#behind">Where Zell is behind</a>
          {GROUPS.map(g => <a key={g.id} href={`#${g.id}`}>{g.title}</a>)}
          <a href="#size">Binary size</a>
          <a href="#method">Method</a>
        </nav>
      </PageHead>

      <section className="band alt" id="behind">
        <div className="wrap">
          <SectionHead eyebrow="Honest numbers" title="Where Zell is behind today">
            Each of these has a known cause, and most have a planned fix. Ratios are Zell's time over Go's.
          </SectionHead>
          <ul className="behind">
            {BEHIND.map(b => (
              <li key={b.what}><strong>{b.what}</strong><span>{b.why}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <div className="filter-bar">
        <div className="wrap">
          <span>Show</span>
          <div className="seg" role="radiogroup" aria-label="Filter results">
            {([["all", "All results"], ["ahead", "Zell ahead"], ["behind", "Zell behind"]] as [Filter, string][]).map(([f, label]) => (
              <button key={f} role="radio" aria-checked={filter === f} onClick={() => setFilter(f)}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {GROUPS.map((g, i) => <GroupBand key={g.id} group={g} alt={i % 2 === 1} filter={filter} />)}

      <SizeBand />

      <section className="band" id="method">
        <div className="wrap">
          <SectionHead eyebrow="Method" title="How these numbers were taken">
            Every program prints a checksum, and a result counts only when Zell's matches Go's (and .NET's).
          </SectionHead>
          <div className="machines">
            {MACHINES.map(m => (
              <div className="metric" key={m.id}>
                <h3>{m.name}</h3>
                <p className="sub">{m.detail}</p>
              </div>
            ))}
          </div>
          <ul className="method-list">
            <li>Zell builds with <code>--release</code>; Go with <code>go build</code>; .NET with <code>-c Release</code>, run as a binary.</li>
            <li>Runs alternate between implementations so that machine load affects them alike; each group says whether it reports medians or the best run.</li>
            <li>Results from the two machines are never compared with each other. Each group names its machine and date.</li>
            <li>
              To reproduce: <code>./scripts/bench-perf.sh</code> for the core set, <code>./scripts/bench-perf.sh async</code>{" "}
              for the scheduler suite, and each benchmark's <code>run.sh</code> for the rest. Everything is in{" "}
              <a href={`${REPO}/tree/master/benchmarks`}>benchmarks/</a>.
            </li>
          </ul>
          <p className="more"><Link to="/why">How the language features behind these numbers look in code →</Link></p>
        </div>
      </section>
    </>
  );
}

function GroupBand({ group: g, alt, filter }: { group: Group; alt: boolean; filter: Filter }) {
  const [ref, on] = useInView<HTMLDivElement>();
  const machine = MACHINES.find(m => m.id === g.machine)!;
  const shown = g.kind === "measures"
    ? g.items.filter(m => keep(filter, costVsGo(m)))
    : g.items.filter(r => keep(filter, r.ratio));

  return (
    <section className={alt ? "band alt" : "band"} id={g.id}>
      <div className="wrap">
        <SectionHead eyebrow={`${machine.name} · ${g.date}`} title={g.title}>{g.intro}</SectionHead>
        <p className="meta">
          {g.method} Source: <a href={g.source.href}>{g.source.label}</a>.
        </p>
        <div ref={ref} className={on ? "on" : undefined}>
          {shown.length === 0 && <p className="empty">No results in this group match the filter.</p>}
          {g.kind === "measures" ? (
            <div className="bench">
              {(shown as Measure[]).map(m => <MeasureCard key={m.bench + m.phase} m={m} />)}
            </div>
          ) : (
            <div className="ratios">
              <div className="ratio-scale" aria-hidden="true"><span>Zell faster</span><span>Go = 1</span><span>Go faster</span></div>
              {(shown as Ratio[]).map(r => <RatioRow key={r.bench + r.phase} r={r} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MeasureCard({ m }: { m: Measure }) {
  const rts = (["Zell", "Go", ".NET"] as Rt[]).filter(rt => m.values[rt] !== undefined);
  const max = Math.max(...rts.map(rt => m.values[rt]!));
  const v = verdict(costVsGo(m), m.labels?.Go ?? "Go");
  return (
    <div className="metric">
      <div className="metric-head">
        <h3><a href={src(m.bench)}><code>{m.bench}</code></a></h3>
        <span className={`verdict ${v.cls}`}>{v.text}</span>
      </div>
      <p className="sub">{m.phase} · {m.unit}, {m.higherIsBetter ? "higher" : "lower"} is better</p>
      {rts.map(rt => (
        <div className={rt === "Zell" ? "row z" : "row"} key={rt}>
          <span className="lbl">{m.labels?.[rt] ?? rt}</span>
          <div className="track"><div className="fill" style={{ "--w": `${(m.values[rt]! / max) * 100}%` } as CSSProperties} /></div>
          <span className="val">{num(m.values[rt]!)} {m.unit}</span>
        </div>
      ))}
      {m.note && <p className="note">{m.note}</p>}
    </div>
  );
}

/** A diverging bar on a log scale: left of the centre Zell is faster, right of it Go is. 8× fills a side. */
function RatioRow({ r }: { r: Ratio }) {
  const w = Math.min(Math.abs(Math.log2(r.ratio)) / 3, 1) * 50;
  const v = verdict(r.ratio);
  return (
    <div className="ratio">
      <div className="ratio-name">
        <a href={src(r.bench)}><code>{r.bench}</code></a>
        <span>{r.phase}</span>
        {r.note && <small>{r.note}</small>}
      </div>
      <div className="ratio-track">
        <div className={`ratio-fill ${r.ratio < 1 ? "left" : "right"} ${v.cls}`} style={{ "--w": `${w}%` } as CSSProperties} />
      </div>
      <span className={`verdict ${v.cls}`}>{r.ratio.toFixed(2)} · {v.text}</span>
    </div>
  );
}

function SizeBand() {
  const [ref, on] = useInView<HTMLDivElement>();
  const max = Math.max(...SIZES.map(s => s.kb));
  return (
    <section className="band alt" id="size">
      <div className="wrap">
        <SectionHead eyebrow="Binary size" title="Hello world, release build">
          No runtime to ship and no garbage collector to link: a Zell binary carries only the runtime pieces it reaches.
        </SectionHead>
        <p className="meta">
          Zell 0.1.5, <code>zell build --release --target …</code> of <code>examples/hello.zl</code>, cross-built from
          one Windows host. Go 1.24 with <code>-ldflags="-s -w"</code>, from <code>scripts/bench-size.sh</code>.
        </p>
        <div ref={ref} className={on ? "metric sizes on" : "metric sizes"}>
          {SIZES.map(s => (
            <div className={s.zell ? "row z" : "row"} key={s.label}>
              <span className="lbl">{s.label}</span>
              <div className="track"><div className="fill" style={{ "--w": `${Math.max((s.kb / max) * 100, 0.6)}%` } as CSSProperties} /></div>
              <span className="val">{num(s.kb)} KB</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
