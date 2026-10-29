// Runs every docs example and compares its output with the expected one.
//   node scripts/check-examples.mjs            all examples
//   node scripts/check-examples.mjs errors     only ids starting with "errors"
// An example is a directory under src/docs/examples/ with .zl files (and an optional zell.toml):
//   expected.out   what `zell run <dir>` prints (required)
//   test.out       what `zell test <dir> -v` prints (optional; durations are ignored)
// On success it records the compiler version and a hash of the sources in
// src/docs/examples/verified.json, which the Example component shows as "checked with zell X".
// The compiler is $ZELL, else `zell` from PATH.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { sourceHash } from "../src/docs/hash.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "docs", "examples");
const MANIFEST = join(ROOT, "verified.json");
const ZELL = process.env.ZELL || "zell";
const args = process.argv.slice(2);
// --dry: check only and leave verified.json alone (several authors checking at once)
const dry = args.includes("--dry");
const only = args.find(a => !a.startsWith("--")) ?? "";

const norm = s => s.replace(/\r\n/g, "\n").replace(/\(\d+(\.\d+)?s\)/g, "(…s)").trimEnd();

function examples(dir = ROOT) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (existsSync(join(p, "expected.out"))) out.push(p);
    else out.push(...examples(p));
  }
  return out;
}

function sources(dir) {
  const files = {};
  const walk = d => {
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(zl|toml)$/.test(name)) files[relative(dir, p).split(sep).join("/")] = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
    }
  };
  walk(dir);
  return files;
}

function run(args, cwd) {
  try {
    return { ok: true, out: execFileSync(ZELL, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    return { ok: false, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

const version = execFileSync(ZELL, ["version"], { encoding: "utf8" }).trim().split(/\s+/)[1];
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
let failed = 0, checked = 0;

for (const dir of examples()) {
  const id = relative(ROOT, dir).split(sep).join("/");
  if (!id.startsWith(only)) continue;
  checked++;
  const problems = [];
  const r = run(["run", "."], dir);
  if (!r.ok) problems.push(`zell run failed:\n${r.out}`);
  else if (norm(r.out) !== norm(readFileSync(join(dir, "expected.out"), "utf8"))) problems.push(`zell run printed:\n${r.out}`);
  if (existsSync(join(dir, "test.out"))) {
    const t = run(["test", ".", "-v"], dir);
    if (!t.ok) problems.push(`zell test failed:\n${t.out}`);
    else if (norm(t.out) !== norm(readFileSync(join(dir, "test.out"), "utf8"))) problems.push(`zell test printed:\n${t.out}`);
  }
  if (problems.length) {
    failed++;
    delete manifest[id];
    console.log(`FAIL ${id}\n${problems.join("\n").replace(/^/gm, "     ")}`);
  } else {
    manifest[id] = { zell: version, hash: sourceHash(sources(dir)) };
    console.log(`ok   ${id}`);
  }
}

// Forget examples whose directory is gone.
for (const id of Object.keys(manifest)) {
  if (!existsSync(join(ROOT, id, "expected.out"))) delete manifest[id];
}

if (!dry) {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");
}
console.log(`${checked - failed}/${checked} examples match with zell ${version}`);
process.exit(failed ? 1 : 0);
