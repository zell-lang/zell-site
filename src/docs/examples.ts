// Docs examples: every directory under ./examples with an expected.out is one example.
// Sources and outputs are bundled as text; verified.json says which were checked, and with
// which compiler (scripts/check-examples.mjs writes it).
import { sourceHash } from "./hash.mjs";
import verified from "./examples/verified.json";

const raw = import.meta.glob("./examples/**/*.{zl,toml,out}", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export interface ExampleData {
  id: string;
  /** Source files by path inside the example, e.g. "main.zl", "src/main.zl", "zell.toml". */
  files: Record<string, string>;
  run: string;
  test?: string;
  /** The compiler version that produced `run` (and `test`) from exactly these files, if any. */
  checkedWith?: string;
}

const lf = (s: string) => s.replace(/\r\n/g, "\n");

function load(): Map<string, ExampleData> {
  const byId = new Map<string, ExampleData>();
  const outputs: [string, string, string][] = [];
  for (const [path, text] of Object.entries(raw)) {
    const rel = path.slice("./examples/".length);
    const m = rel.match(/^(.*)\/(expected|test)\.out$/);
    if (m) outputs.push([m[1], m[2], lf(text)]);
  }
  for (const [id, kind, text] of outputs) {
    const ex = byId.get(id) ?? { id, files: {}, run: "" };
    if (kind === "expected") ex.run = text.trimEnd();
    else ex.test = text.trimEnd();
    byId.set(id, ex);
  }
  for (const [path, text] of Object.entries(raw)) {
    if (path.endsWith(".out")) continue;
    const rel = path.slice("./examples/".length);
    const id = [...byId.keys()].find(k => rel.startsWith(k + "/"));
    if (id) byId.get(id)!.files[rel.slice(id.length + 1)] = lf(text);
  }
  const marks = verified as Record<string, { zell: string; hash: string }>;
  for (const ex of byId.values()) {
    const mark = marks[ex.id];
    if (mark && mark.hash === sourceHash(ex.files)) ex.checkedWith = mark.zell;
  }
  return byId;
}

const EXAMPLES = load();

export function getExample(id: string): ExampleData {
  const ex = EXAMPLES.get(id);
  if (!ex) throw new Error(`docs: no example "${id}" in src/docs/examples`);
  return ex;
}

/** The file shown by default: the only .zl file, else main.zl or src/main.zl. */
export function mainFile(ex: ExampleData): string {
  const zl = Object.keys(ex.files).filter(f => f.endsWith(".zl"));
  return zl.length === 1 ? zl[0] : zl.find(f => /(^|\/)main\.zl$/.test(f)) ?? zl[0];
}
