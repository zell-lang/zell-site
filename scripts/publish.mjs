// Publishes the last commit, never the working tree: authors may be writing pages in parallel,
// and half-written files must not reach the site.
//   1. a temporary git worktree at HEAD (sharing this checkout's node_modules)
//   2. npm run build there
//   3. scripts/deploy.mjs upload with DIST pointing at that build
// The worktree is removed afterwards, whatever happens.
import { execFileSync } from "node:child_process";
import { existsSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TREE = join(ROOT, "..", "zell-site-publish");
const run = (cmd, args, cwd, env = {}) =>
  execFileSync(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32", env: { ...process.env, ...env } });

const head = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
const dirty = execFileSync("git", ["status", "--porcelain"], { cwd: ROOT, encoding: "utf8" }).trim();
if (dirty) console.log(`publish: the working tree has uncommitted changes; publishing ${head} without them`);

if (existsSync(TREE)) run("git", ["worktree", "remove", "--force", TREE], ROOT);
run("git", ["worktree", "add", "--detach", TREE, "HEAD"], ROOT);
try {
  // a junction on Windows needs no privileges; elsewhere a plain symlink
  symlinkSync(join(ROOT, "node_modules"), join(TREE, "node_modules"), "junction");
  run("npm", ["run", "build"], TREE);
  run("node", [join(ROOT, "scripts", "deploy.mjs"), "upload"], ROOT, { DIST: join(TREE, "dist") });
  console.log(`publish: ${head} is live`);
} finally {
  rmSync(join(TREE, "node_modules"), { force: true, recursive: false });
  run("git", ["worktree", "remove", "--force", TREE], ROOT);
}
