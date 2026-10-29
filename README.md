# zell-site

The zell-lang.org website: the landing page, Download, Why Zell, Performance and the
documentation. React + TypeScript on Vite, documentation pages in MDX. The build is static
files, served from shared hosting.

## Develop

```sh
npm install
npm run dev          # http://localhost:5173 (fetches the latest release from GitHub first)
```

## Layout

| Path | What |
|---|---|
| `src/styles.css`, `src/pages.css` | design tokens (light and dark), landing and inner pages |
| `src/components/` | landing sections and shared pieces (header, install command, page head) |
| `src/pages/` | Download, Why, Performance |
| `src/data/` | content of Why (code in four languages) and Performance (every benchmark, with its source) |
| `src/site.ts` | release data from `src/generated/release.json`, install commands |
| `src/docs/` | the documentation, see below |
| `scripts/fetch-release.mjs` | GitHub API → `src/generated/release.json` before `dev` and `build`; keeps the old file when offline |
| `scripts/routes.mjs` | after the build, copies `index.html` into every route's directory (the host serves files only) |
| `scripts/deploy.mjs` | uploads `dist/` over FTPS with settings from `.env.deploy` |

## Documentation

- `src/docs/nav.json` is the whole tree: sections, pages, their status (`ready`, `draft`,
  `planned`) and one-line summaries. The sidebar, section indexes, previous/next links and
  the static routes come from it.
- A page is `src/docs/pages/<section>/<slug>.mdx`: Markdown plus components, available without
  imports: `<Example id="…" />`, `<Callout type="note|tip|warning|go">`, `<InstallCommand />`,
  `<Version />`. A page without a file renders as "planned" with its summary.
- An example is a directory in `src/docs/examples/<id>/` with `.zl` files (and `zell.toml` for a
  package), `expected.out` (what `zell run` prints) and optionally `test.out` (`zell test -v`).
  `<Example id="errors/propagate" />` shows the source and the real output.
- `node scripts/check-examples.mjs` runs every example and compares the output (`$ZELL` or `zell`
  from `PATH`). It records the compiler version and a hash of the sources in `verified.json`; an
  example edited after the last check shows "not checked" on the page.

## Deploy

```sh
npm run deploy       # build, upload dist/, remove stale assets
```

`.env.deploy` (not in git) holds `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`, `FTP_DIR`, `FTP_SECURE`
and, for the PHP API, `DEPLOY_API` and `DB_*`. `node scripts/deploy.mjs check` connects and lists
the remote directory without changing anything.

The host is nginx without PHP for this site, so `public/api/` (PHP + MySQL helpers) is not
uploaded (`DEPLOY_API=false`). With PHP enabled, set `DEPLOY_API=true` and fill in `DB_*`: the
first deploy writes `api/config.php` once.
