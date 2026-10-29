// A small highlighter for the languages on the site: comments, strings, attributes, numbers,
// keywords and types. Good enough for short, well-formed examples; not a parser.
export type Lang = "zell" | "go" | "csharp" | "rust";

const words = (s: string) => new Set(s.split(" "));

const KW: Record<Lang, Set<string>> = {
  zell: words("namespace import struct interface enum func async await var const if else for in switch case default return try catch defer break continue nil true false this weak type new"),
  go: words("package import type struct interface func var const if else for range switch case default return go defer break continue nil true false map chan select"),
  csharp: words("using namespace class sealed partial record struct interface enum static public private protected internal readonly var const if else for foreach in switch case default return try catch finally throw new async await is or and not null true false this out ref"),
  rust: words("use mod struct enum impl trait fn let mut const if else for in loop while match return async await move pub crate self Self as ref true false where dyn"),
};

const TY: Record<Lang, Set<string>> = {
  zell: words("int float string bool void error byte char any int8 int16 int32 int64 uint uint8 uint16 uint32 uint64 float32 float64"),
  go: words("int string bool error byte any int64 uint16 float64"),
  csharp: words("int string bool void object double long"),
  rust: words("i32 i64 u16 u32 u64 usize f64 bool str String Vec Option Result"),
};

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const span = (cls: string, s: string) => `<span class="${cls}">${esc(s)}</span>`;

// comment | string (incl. Go raw, C# raw """, Rust r#""#) | attribute | number | word | other
const RE = /(\/\/[^\n]*)|("""[\s\S]*?"""|r#"[\s\S]*?"#|`[^`]*`|\$?"(?:[^"\\\n]|\\.)*")|(@[A-Za-z_]\w*|#\[[^\]\n]*\])|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*!?)|([\s\S])/g;

export function highlight(src: string, lang: Lang = "zell"): string {
  const kw = KW[lang], ty = TY[lang];
  let out = "";
  let m: RegExpExecArray | null;
  RE.lastIndex = 0;
  while ((m = RE.exec(src))) {
    if (m[1]) out += span("c", m[1]);
    else if (m[2]) out += span("s", m[2]);
    else if (m[3]) out += span("a", m[3]);
    else if (m[4]) out += span("n", m[4]);
    else if (m[5]) {
      const bang = m[5].endsWith("!");
      if (bang && lang === "rust") { out += span("a", m[5]); continue; } // macro: println!
      const w = bang ? m[5].slice(0, -1) : m[5];                          // Zell result type: int!
      if (kw.has(w)) out += span("k", w);
      else if (ty.has(w) || /^[A-Z]/.test(w)) out += span("t", w);
      else out += esc(w);
      if (bang) out += "!";
    } else out += esc(m[6]);
  }
  return out;
}
