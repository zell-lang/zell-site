import { Link } from "react-router-dom";
import { VERSION } from "../site";
import DotGrid from "./DotGrid";
import Install from "./Install";
import Terminal from "./Terminal";

export default function Hero() {
  return (
    <section className="hero">
      <DotGrid />
      <div className="wrap">
        <div>
          <p className="eyebrow rise">Compiled · Statically typed · No garbage collector</p>
          <h1 className="rise d1">
            The simplicity of Go.<br />The expressiveness of C#.<br />Native code without GC pauses.
          </h1>
          <p className="lead rise d2">
            Zell is a language for services, tools and command-line programs. Errors are values without the
            boilerplate, <code>async</code>/<code>await</code> runs on a multi-threaded scheduler, and memory is freed
            deterministically by reference counting.
          </p>
          <div className="cta rise d3">
            <Link className="btn primary" to="/docs/get-started/install">Get started</Link>
            <Link className="btn ghost" to="/download">Download v{VERSION}</Link>
          </div>
          <Install />
        </div>
        <Terminal />
      </div>
    </section>
  );
}
