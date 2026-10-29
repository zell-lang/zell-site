// Publishes dist/ to the hosting over FTP(S), with settings from .env.deploy.
//   node scripts/deploy.mjs check    connect and list the remote directory, change nothing
//   node scripts/deploy.mjs upload   upload dist/, remove stale hashed assets, write api/config.php once
// Files on the server that the build does not produce are left alone, except old files in assets/.
import { Client } from "basic-ftp";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, posix, relative, sep } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = process.env.DIST || join(ROOT, "dist");  // scripts/publish.mjs builds elsewhere
const ENV_FILE = join(ROOT, ".env.deploy");

function readEnv() {
  if (!existsSync(ENV_FILE)) throw new Error(".env.deploy not found");
  const env = {};
  for (const line of readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    // A value may be quoted (needed when it contains #); the quotes are not part of it.
    if (m) env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  const missing = ["FTP_HOST", "FTP_USER", "FTP_PASSWORD", "FTP_DIR"].filter(k => !env[k]);
  if (missing.length) throw new Error(`.env.deploy: empty ${missing.join(", ")}`);
  return env;
}

async function connect(env) {
  const client = new Client(30000);
  await client.access({
    host: env.FTP_HOST,
    port: Number(env.FTP_PORT || 21),
    user: env.FTP_USER,
    password: env.FTP_PASSWORD,
    secure: env.FTP_SECURE !== "false",
  });
  return client;
}

function localFiles(dir = DIST) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...localFiles(p));
    else out.push(relative(DIST, p).split(sep).join("/"));
  }
  return out;
}

const fmt = e => `${e.isDirectory ? "d" : "-"} ${String(e.size).padStart(10)}  ${e.name}${e.isDirectory ? "/" : ""}`;

async function check(env) {
  const client = await connect(env);
  try {
    console.log(`connected, ${env.FTP_SECURE !== "false" ? "FTPS (TLS)" : "plain FTP"}`);
    const list = await client.list(env.FTP_DIR);
    console.log(`${env.FTP_DIR}: ${list.length} entries`);
    for (const e of list) console.log("  " + fmt(e));
    const api = list.find(e => e.name === "api" && e.isDirectory);
    if (api) {
      const apiList = await client.list(posix.join(env.FTP_DIR, "api"));
      console.log(`${env.FTP_DIR}/api: ${apiList.map(e => e.name).join(", ") || "(empty)"}`);
    }
  } finally {
    client.close();
  }
}

function configPhp(env) {
  const q = s => `'${String(s ?? "").replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
  return `<?php
// Written once by scripts/deploy.mjs from .env.deploy; edit on the server if needed.
return [
    'db' => [
        'host' => ${q(env.DB_HOST || "localhost")},
        'port' => ${Number(env.DB_PORT || 3306)},
        'name' => ${q(env.DB_NAME)},
        'user' => ${q(env.DB_USER)},
        'pass' => ${q(env.DB_PASSWORD)},
    ],
];
`;
}

/** Removes a remote directory if it exists. */
async function removeDirIfAny(client, dir) {
  try {
    await client.removeDir(dir);
    return true;
  } catch {
    return false;
  }
}

async function upload(env) {
  if (!existsSync(join(DIST, "index.html"))) throw new Error("dist/ is empty; run npm run build first");
  // DEPLOY_API=false: the host does not run PHP (it would serve the sources), so api/ stays local.
  const withApi = env.DEPLOY_API !== "false";
  const files = localFiles().filter(f => withApi || !f.startsWith("api/"));
  const client = await connect(env);
  try {
    const base = env.FTP_DIR;
    if (!withApi && await removeDirIfAny(client, posix.join(base, "api"))) console.log("  removed api/ (DEPLOY_API=false)");
    for (const f of files) {
      try {
        await client.ensureDir(posix.join(base, posix.dirname(f)));
        await client.uploadFrom(join(DIST, f), posix.join(base, f));
      } catch (err) {
        throw new Error(`${f}: ${err.message}`);
      }
      console.log(`  put ${f}`);
    }

    // Vite names assets by content hash: the previous build's files are no longer referenced.
    const keep = new Set(files.filter(f => f.startsWith("assets/")).map(f => f.slice(7)));
    for (const e of await client.list(posix.join(base, "assets"))) {
      if (!e.isDirectory && !keep.has(e.name)) {
        await client.remove(posix.join(base, "assets", e.name));
        console.log(`  removed stale assets/${e.name}`);
      }
    }

    if (withApi && env.DB_NAME) {
      const api = await client.list(posix.join(base, "api"));
      if (api.some(e => e.name === "config.php")) console.log("  api/config.php exists on the server, kept");
      else {
        await client.uploadFrom(Readable.from([configPhp(env)]), posix.join(base, "api", "config.php"));
        console.log("  wrote api/config.php from DB_* settings");
      }
    }
    console.log(`uploaded ${files.length} files to ${base}`);
  } finally {
    client.close();
  }
}

const mode = process.argv[2];
const env = readEnv();
try {
  if (mode === "check") await check(env);
  else if (mode === "upload") await upload(env);
  else throw new Error("usage: node scripts/deploy.mjs check|upload");
} catch (err) {
  console.error(`deploy: ${err.message}`);
  process.exit(1);
}
