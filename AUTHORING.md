# Writing the documentation

Rules for everyone who writes pages under `src/docs/` (people and agents alike).

## Sources of truth

The language lives in the compiler repository, `C:\Users\dvislobokov\zell` locally
(github.com/zell-lang/zell):

- `DESIGN.md`: the language specification (in Russian). Every statement about the language
  must agree with it.
- `docs/guide/*.md`, `examples/*.zl` + `.out`, `tests/spec/`: working code to learn from.
- `compiler/src/sema/stdlib.rs`: every standard-library function and its signature.
- `runtime/ABI.md`, `docs/PLATFORMS.md`, `docs/TOOLING.md`, `benchmarks/`: details beyond the spec.

Do not copy the old guides. Write new pages in English, with new examples, for the structure in
`src/docs/nav.json`.

## Pages

- One file per page: `src/docs/pages/<section>/<slug>.mdx`. The layout already renders the title
  and the summary from `nav.json`: start with an introductory paragraph, never with `# Title`.
- Sections are `##` (they feed "On this page"), subsections `###`. End with a short `## Next`
  pointing to the following page.
- Components, available without imports:
  - `<Example id="learn/structs/methods" />`: a checked example (see below). Props: `files={[...]}`
    to show several files as tabs, `output="run" | "test" | "none"`, children as a caption.
  - `<Callout type="note|tip|warning|go">…</Callout>`; `go` is "Coming from Go" for differences
    that surprise Go programmers.
  - `<InstallCommand />`, `<Version />`.
  - Fenced blocks (` ```sh `, ` ```toml `, ` ```go `, …) for commands and for code that is not
    a runnable Zell program. Zell code that runs belongs in an `<Example>`.
  - Markdown tables, links: internal ones as `/docs/learn/errors`.
- Style: plain technical English, short sentences, second person, no marketing words. Explain what
  a feature does and why, show it, mention the cost when it matters. Prefer one precise example to
  three similar ones. A page is usually 600–1500 words.
- Never state something you have not checked: run it, or find it in `DESIGN.md` or the compiler.
  If a feature is not in the released compiler yet, leave it out or mark it with a `note` callout.

## Examples

An example is a directory `src/docs/examples/<id>/` holding:

- one or more `.zl` files (a package also has `zell.toml` and `src/`);
- `expected.out`: exactly what `zell run .` prints in that directory;
- optionally `test.out`: what `zell test . -v` prints (durations are ignored).

Each example is a complete program that compiles with the released compiler
(`C:\Users\dvislobokov\.zell\toolchain\zell-0.1.5-windows-amd64\bin\zell.exe`) and prints its
result deterministically: no timings, addresses, random values or network access.
Keep it short (usually under 40 lines) and focused on one idea. Name ids after the page:
`learn/<slug>/<name>`, `examples/<slug>/<name>`.

Check your examples, without touching the shared `verified.json`:

```sh
ZELL=~/.zell/toolchain/zell-0.1.5-windows-amd64/bin/zell node scripts/check-examples.mjs --dry learn/structs
```

Check that the pages compile, into a build directory of your own:

```sh
npx vite build --outDir ../zell-site-build-<yourname> --emptyOutDir
```

## Working in parallel

Several authors write at once, each owning their pages and example directories. Do not edit
`nav.json`, shared components, styles, scripts or anyone else's pages; propose such changes in
your report instead. Do not commit, push or deploy: the maintainer checks everything, records
`verified.json`, flips the page status in `nav.json`, and publishes.

## Pitfalls found so far

- A namespace may not reuse a standard-library root (`namespace errors`, `namespace text`): the
  compiler rejects it and then reports follow-on errors that hide the first one. Pick another name.
- Examples must not depend on map iteration order or on task scheduling: sort keys
  (`maps.SortedKeys`), and run async examples several times before trusting their output.
- `zell build -o name` does not add `.exe` for Windows targets; say so when showing `-o`.
- `zell run .` leaves `target/` (and `zell.lock`) in a package example directory. Both are
  git-ignored, but delete `target/` when you are done.
