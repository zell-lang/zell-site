// Fetches the latest Zell release from the GitHub API into src/generated/release.json.
// Runs before `dev` and `build`. Without network the previous file is kept, so a build
// never fails just because GitHub is unreachable; it fails only when there is no file at all.
// GITHUB_TOKEN raises the API limit from 60 to 5000 requests an hour.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = "zell-lang/zell";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "generated", "release.json");

// Host archives, in the order the download page shows them.
const HOSTS = [
  { id: "linux-amd64", os: "Linux", arch: "x86-64" },
  { id: "linux-arm64", os: "Linux", arch: "arm64" },
  { id: "macos-arm64", os: "macOS", arch: "Apple silicon" },
  { id: "macos-amd64", os: "macOS", arch: "Intel" },
  { id: "windows-amd64", os: "Windows", arch: "x86-64" },
];

const headers = { Accept: "application/vnd.github+json", "User-Agent": "zell-site" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function api(path) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path}: ${res.status} ${res.statusText}`);
  return res.json();
}

/** sha256 from the asset's `digest` (GitHub computes it), else from the `.sha256` file next to it. */
async function sha256(asset, assets) {
  if (asset.digest?.startsWith("sha256:")) return asset.digest.slice(7);
  const side = assets.find(a => a.name === `${asset.name}.sha256`);
  if (!side) return null;
  const res = await fetch(side.browser_download_url, { headers: { "User-Agent": "zell-site" } });
  return res.ok ? (await res.text()).trim().split(/\s+/)[0] : null;
}

async function file(asset, assets) {
  return { name: asset.name, url: asset.browser_download_url, size: asset.size, sha256: await sha256(asset, assets) };
}

async function describe(rel) {
  const version = rel.tag_name.replace(/^v/, "");
  const assets = rel.assets;
  const byName = name => assets.find(a => a.name === name);

  const hosts = [];
  for (const h of HOSTS) {
    const files = [];
    for (const ext of ["tar.xz", "tar.gz"]) {
      const a = byName(`zell-${version}-${h.id}.${ext}`);
      if (a) files.push(await file(a, assets));
    }
    if (files.length) hosts.push({ ...h, files });
  }

  const runtimes = [];
  for (const a of assets) {
    const m = a.name.match(new RegExp(`^zell-runtime-${version.replace(/\./g, "\\.")}-(.+)\\.tar\\.gz$`));
    if (m) runtimes.push({ triple: m[1], ...(await file(a, assets)) });
  }
  runtimes.sort((a, b) => a.triple.localeCompare(b.triple));

  const sums = byName("SHA256SUMS");
  return {
    version,
    tag: rel.tag_name,
    name: rel.name || rel.tag_name,
    prerelease: rel.prerelease,
    publishedAt: rel.published_at,
    url: rel.html_url,
    sumsUrl: sums?.browser_download_url ?? null,
    hosts,
    runtimes,
  };
}

async function main() {
  const list = await api("/releases?per_page=20");
  const published = list.filter(r => !r.draft);
  const stable = published.find(r => !r.prerelease);
  // A pre-release is shown only when it is newer than the latest stable release.
  const pre = published.find(r => r.prerelease && (!stable || r.published_at > stable.published_at));
  if (!stable && !pre) throw new Error("no published releases");

  const data = {
    fetchedAt: new Date().toISOString(),
    latest: await describe(stable ?? pre),
    preview: stable && pre ? await describe(pre) : null,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");
  const pv = data.preview ? `, pre-release ${data.preview.version}` : "";
  console.log(`release: ${data.latest.version}${data.latest.prerelease ? " (pre-release)" : ""}${pv}, ${data.latest.hosts.length} hosts`);
}

main().catch(err => {
  if (existsSync(OUT)) {
    console.warn(`release: ${err.message}; keeping the previous src/generated/release.json`);
  } else {
    console.error(`release: ${err.message}; no src/generated/release.json to fall back to`);
    process.exit(1);
  }
});
