import release from "./generated/release.json";

// Release data comes from GitHub at build time (scripts/fetch-release.mjs).
export interface ReleaseFile { name: string; url: string; size: number; sha256: string | null }
export interface Host { id: string; os: string; arch: string; files: ReleaseFile[] }
export interface Release {
  version: string;
  tag: string;
  name: string;
  prerelease: boolean;
  publishedAt: string;
  url: string;
  sumsUrl: string | null;
  hosts: Host[];
  runtimes: (ReleaseFile & { triple: string })[];
}

export const LATEST = release.latest as Release;
export const PREVIEW = release.preview as Release | null;
export const VERSION = LATEST.version;

const SCRIPTS = "https://raw.githubusercontent.com/zell-lang/zell/master/scripts";

export const INSTALL = {
  unix: `curl -fsSL ${SCRIPTS}/install.sh | sh`,
  win: `irm ${SCRIPTS}/install.ps1 | iex`,
} as const;

export type Os = keyof typeof INSTALL;

/** Install commands pinned to one version (a pre-release never becomes `latest`). */
export const installVersion = (v: string): Record<Os, string> => ({
  unix: `curl -fsSL ${SCRIPTS}/install.sh | sh -s -- --version ${v}`,
  win: `& ([scriptblock]::Create((irm ${SCRIPTS}/install.ps1))) -Version ${v}`,
});

export const REPO = "https://github.com/zell-lang/zell";

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
