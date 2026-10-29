import { useEffect, useRef, useState } from "react";
import { INSTALL, type Os } from "../site";

const TABS: { os: Os; label: string }[] = [
  { os: "unix", label: "Linux · macOS" },
  { os: "win", label: "Windows" },
];

/** Install command with an OS switch (Windows preselected on Windows) and a copy button. */
export default function Install({ cmds = INSTALL, className = "install rise d3" }: { cmds?: Record<Os, string>; className?: string }) {
  const [os, setOs] = useState<Os>("unix");
  const text = useRef<HTMLElement>(null);

  useEffect(() => {
    if (/Win/.test(navigator.platform || navigator.userAgent)) setOs("win");
  }, []);

  return (
    <div className={className}>
      <div className="tabs" role="tablist" aria-label="Install command">
        {TABS.map(t => (
          <button key={t.os} role="tab" aria-selected={os === t.os} onClick={() => setOs(t.os)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className={os === "win" ? "cmd ps" : "cmd"}>
        <code ref={text}>{cmds[os]}</code>
        <CopyButton text={cmds[os]} target={text} />
      </div>
    </div>
  );
}

/** Copies `text`; where the clipboard API is unavailable, selects `target` instead. */
export function CopyButton({ text, target, label = "Copy" }: { text: string; target?: React.RefObject<HTMLElement>; label?: string }) {
  const [state, setState] = useState(label);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("Copied");
    } catch {
      if (target?.current) {
        const r = document.createRange();
        r.selectNodeContents(target.current);
        const s = getSelection()!;
        s.removeAllRanges();
        s.addRange(r);
        setState("Selected");
      }
    }
    setTimeout(() => setState(label), 1600);
  }

  return <button className="copy" type="button" onClick={copy}>{state}</button>;
}
