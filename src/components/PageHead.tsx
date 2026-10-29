import type { ReactNode } from "react";
import DotGrid from "./DotGrid";

/** The top band of an inner page: the hero's dot grid, an eyebrow, a title and a lead. */
export default function PageHead({ eyebrow, title, children, aside }: { eyebrow: string; title: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return (
    <section className="hero page-head">
      <DotGrid />
      <div className="wrap">
        <div>
          <p className="eyebrow rise">{eyebrow}</p>
          <h1 className="rise d1">{title}</h1>
          {children && <div className="lead rise d2">{children}</div>}
        </div>
        {aside && <div className="rise d2">{aside}</div>}
      </div>
    </section>
  );
}
