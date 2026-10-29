// Generates the standard library reference data from `zell doc std --json`:
//   src/generated/stdlib/index.json        every namespace with its symbols' names and summaries
//   src/generated/stdlib/ns/<name>.json    one namespace in full (loaded when its page opens)
// Runs before `dev` and `build`. The compiler is $ZELL, else the installed toolchain of the
// release the site shows (~/.zell/toolchain/zell-<version>-*), else `zell` on PATH. Without one,
// the files from the last run are kept, so the site builds anywhere; they are committed for that.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "generated", "stdlib");
const RELEASE = JSON.parse(readFileSync(join(ROOT, "src", "generated", "release.json"), "utf8")).latest.version;

function findZell() {
  if (process.env.ZELL) return process.env.ZELL;
  const dir = join(homedir(), ".zell", "toolchain");
  const match = existsSync(dir) && readdirSync(dir).find(d => d.startsWith(`zell-${RELEASE}-`));
  if (match) {
    for (const exe of ["zell.exe", "zell"]) {
      const p = join(dir, match, "bin", exe);
      if (existsSync(p)) return p;
    }
  }
  return "zell";
}
const ZELL = findZell();

function zell(args) {
  return execFileSync(ZELL, args, { encoding: "utf8", maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "pipe"] });
}

/** Enum variants repeat the enum's own comment; keep a variant's doc only when it says something new. */
function tidy(item) {
  const members = item.members?.map(m => (m.kind === "variant" && m.doc === item.doc ? { ...m, doc: "", summary: "" } : m));
  return members ? { ...item, members } : item;
}

try {
  const version = zell(["version"]).trim().split(/\s+/)[1];
  if (version !== RELEASE) console.warn(`stdlib: zell ${version} differs from the release ${RELEASE}; install ${RELEASE} or set ZELL`);
  const { namespaces } = JSON.parse(zell(["doc", "std", "--json"]));
  rmSync(join(OUT, "ns"), { recursive: true, force: true });
  mkdirSync(join(OUT, "ns"), { recursive: true });

  const index = namespaces
    .filter(ns => ns.items.some(i => i.exported))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(ns => {
      const items = ns.items.filter(i => i.exported).map(tidy);
      writeFileSync(join(OUT, "ns", `${ns.name}.json`), JSON.stringify({ name: ns.name, doc: ns.doc, files: ns.files, items }));
      return {
        name: ns.name,
        summary: ns.summary,
        symbols: items.map(i => ({ name: i.name, kind: i.kind, summary: i.summary })),
      };
    });

  writeFileSync(join(OUT, "index.json"), JSON.stringify({ zell: version, namespaces: index }));
  const symbols = index.reduce((n, ns) => n + ns.symbols.length, 0);
  console.log(`stdlib: ${index.length} namespaces, ${symbols} symbols from zell ${version}`);
} catch (err) {
  if (existsSync(join(OUT, "index.json"))) {
    console.warn(`stdlib: ${err.message.split("\n")[0]}; keeping the previous src/generated/stdlib`);
  } else {
    console.error(`stdlib: ${err.message.split("\n")[0]}; no src/generated/stdlib to fall back to`);
    process.exit(1);
  }
}
