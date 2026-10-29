import { useEffect, useState } from "react";
import { esc } from "../highlight";
import { reducedMotion } from "../site";

const SESSION = [
  { cmd: "zell run main.zl", out: 'ann is 31\nskipped: age of bob: invalid integer: "x"' },
  { cmd: "zell build --release --target windows-amd64 main.zl", out: '<span class="ok">built</span> main.exe <span class="dim">(101 KB)</span>' },
  { cmd: "zell test", out: '<span class="ok">ok</span>  parse_test.zl  <span class="dim">4 passed</span>' },
];
const PROMPT = '<span class="p">$</span> ';
const CARET = '<span class="caret"></span>';
const FINAL = SESSION.map(l => PROMPT + esc(l.cmd) + "\n" + l.out + "\n").join("") + PROMPT + CARET;

/** Types the session once, ending on the same text that renders with reduced motion. */
export default function Terminal() {
  const [html, setHtml] = useState(FINAL);

  useEffect(() => {
    if (reducedMotion()) return;
    let alive = true;
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
    (async () => {
      let done = "";
      for (const l of SESSION) {
        done += PROMPT;
        for (let i = 1; i <= l.cmd.length; i++) {
          if (!alive) return;
          setHtml(done + esc(l.cmd.slice(0, i)) + CARET);
          await wait(28);
        }
        done += esc(l.cmd) + "\n";
        setHtml(done + CARET);
        await wait(380);
        done += l.out + "\n";
        setHtml(done + CARET);
        await wait(650);
      }
      if (alive) setHtml(FINAL);
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="term rise d2" aria-label="Example terminal session">
      <div className="bar"><i /><i /><i /><span>~/hello</span></div>
      <pre dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
