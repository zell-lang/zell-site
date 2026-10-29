import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import SectionHead from "./SectionHead";

const ROWS: [string, ReactNode, ReactNode, ReactNode][] = [
  ["Errors",
    <>Values: <code>T!</code> results, <code>?</code> to propagate, a trace of where each error was created and passed</>,
    <>Values, checked with <code>if err != nil</code> after every call</>,
    "Exceptions; which calls throw is not in the signature"],
  ["Memory",
    "Reference counting with compile-time ownership; destructors run at a known point; no GC",
    "Tracing garbage collector",
    <>Tracing garbage collector; <code>using</code> for deterministic cleanup</>],
  ["Concurrency",
    <><code>async</code>/<code>await</code>, channels, mutexes; cancellation flows through the task tree</>,
    <>Goroutines and channels; <code>context.Context</code> passed by hand</>,
    <><code>async</code>/<code>await</code>; <code>CancellationToken</code> passed by hand</>],
  ["Sum types",
    <>Enums with data, exhaustive <code>switch</code></>,
    <>None; <code>iota</code> constants</>,
    "None built in; records with pattern matching"],
  ["Generics",
    "Monomorphized, on functions, methods and types",
    "Since 1.18; methods cannot take type parameters",
    "Reified at run time"],
  ["Reflection",
    "At compile time: JSON, SQL mapping and DI generate plain code",
    <>At run time (<code>reflect</code>, struct tags)</>,
    "At run time, or source generators"],
  ["Structure",
    <>Namespaces, <code>var</code> inference, methods inside structs</>,
    "Packages per directory, methods declared apart from the type",
    "Namespaces, classes, inheritance"],
  ["Deployment",
    "One native executable; one archive builds for Linux, macOS and Windows",
    "One native executable, cross-compiles",
    "Needs the runtime, or Native AOT with trimming limits"],
];

export default function Compare() {
  return (
    <section className="band alt" id="compare">
      <div className="wrap">
        <SectionHead eyebrow="Compare" title="What you get over Go and C#">
          Zell takes the parts that work in both and leaves out the runtime costs.
        </SectionHead>
        <div className="table-scroll">
          <table className="cmp">
            <thead>
              <tr><th /><th className="zell">Zell</th><th>Go</th><th>C# / .NET</th></tr>
            </thead>
            <tbody>
              {ROWS.map(([name, zell, go, cs]) => (
                <tr key={name}><th>{name}</th><td className="zell">{zell}</td><td>{go}</td><td>{cs}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="more"><Link to="/why">The same tasks in Zell, Go, C# and Rust, side by side →</Link></p>
      </div>
    </section>
  );
}
