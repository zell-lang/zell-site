import { useMemo, useRef, type ReactElement, type ReactNode, type RefObject } from "react";
import { esc, highlight, type Lang } from "../../highlight";
import { CopyButton } from "../../components/Install";

const LANGS = new Set<string>(["zell", "go", "csharp", "rust"]);

/** Shell, PowerShell and TOML: `#` comments and quoted strings are enough. */
function lineHighlight(code: string): string {
  return code.split("\n").map(line => {
    const hash = line.search(/(^|\s)#/);
    const body = hash < 0 ? line : line.slice(0, hash);
    const comment = hash < 0 ? "" : line.slice(hash);
    const strings = esc(body).replace(/("[^"]*"|'[^']*')/g, '<span class="s">$1</span>');
    return strings + (comment ? `<span class="c">${esc(comment)}</span>` : "");
  }).join("\n");
}

export function CodeBlock({ code, lang, bare, preRef }: { code: string; lang?: string; bare?: boolean; preRef?: RefObject<HTMLElement> }) {
  const own = useRef<HTMLElement>(null);
  const ref = preRef ?? own;
  const html = useMemo(
    () => (lang && LANGS.has(lang) ? highlight(code, lang as Lang) : lineHighlight(code)),
    [code, lang],
  );
  const pre = <pre ref={ref as RefObject<HTMLPreElement>} className={bare ? undefined : "code"} dangerouslySetInnerHTML={{ __html: html }} />;
  if (bare) return pre;
  return (
    <div className="codeblock">
      {lang && <span className="codeblock-lang">{lang === "sh" ? "shell" : lang}</span>}
      <CopyButton text={code} target={ref} />
      {pre}
    </div>
  );
}

/** MDX renders ```lang fences as <pre><code class="language-lang">; this maps them to CodeBlock. */
export function MdxPre({ children }: { children?: ReactNode }) {
  const code = children as ReactElement<{ className?: string; children?: string }>;
  const lang = code?.props?.className?.replace(/^language-/, "");
  const text = String(code?.props?.children ?? "").replace(/\n$/, "");
  return <CodeBlock code={text} lang={lang} />;
}
