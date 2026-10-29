import type { ReactNode } from "react";

const TITLES = { note: "Note", tip: "Tip", warning: "Warning", go: "Coming from Go", planned: "Not written yet" } as const;

/** A highlighted aside. `go` marks differences that trip up Go programmers. */
export default function Callout({ type = "note", title, children }: { type?: keyof typeof TITLES; title?: string; children: ReactNode }) {
  return (
    <aside className={`callout ${type}`}>
      <strong>{title ?? TITLES[type]}</strong>
      <div>{children}</div>
    </aside>
  );
}
