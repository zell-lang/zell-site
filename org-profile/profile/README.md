<p align="center">
  <a href="https://zell-lang.org"><img src="https://raw.githubusercontent.com/zell-lang/.github/main/profile/logo.svg" width="96" height="96" alt="Zell"></a>
</p>

<h3 align="center">The simplicity of Go. The expressiveness of C#. Native code without GC pauses.</h3>

<p align="center">
  <a href="https://zell-lang.org">Website</a> ·
  <a href="https://zell-lang.org/docs/get-started/install">Get started</a> ·
  <a href="https://zell-lang.org/download">Download</a> ·
  <a href="https://zell-lang.org/why">Why Zell</a> ·
  <a href="https://zell-lang.org/performance">Performance</a>
</p>

---

**Zell** is a compiled, statically typed language for services, tools and command-line programs.
Errors are values without the boilerplate, `async`/`await` runs on a multi-threaded scheduler,
and memory is freed deterministically by reference counting — no garbage collector.

```zell
namespace config

import io

func loadPort(path string) int! {
    var text = io.ReadFile(path)?("reading config")
    var port = strings.ToInt(strings.Trim(text))?("port in " + path)
    if port < 1 || port > 65535 {
        return error("port out of range: " + strconv.Itoa(port))
    }
    return port
}
```

### Install

```sh
curl -fsSL https://raw.githubusercontent.com/zell-lang/zell/master/scripts/install.sh | sh   # Linux, macOS
irm https://raw.githubusercontent.com/zell-lang/zell/master/scripts/install.ps1 | iex        # Windows
```

One archive: compiler, `build` / `run` / `test` / `fmt` / `doc` / `check`, the language server,
and cross-compilation to Linux (x86-64, arm64, glibc or static musl), macOS and Windows.

### Repositories

| | |
|---|---|
| **Language** | [zell](https://github.com/zell-lang/zell) — compiler, toolchain and standard library |
| **Web & config** | [web](https://github.com/zell-lang/web) · [zconf](https://github.com/zell-lang/zconf) · [template](https://github.com/zell-lang/template) |
| **Databases** | [db](https://github.com/zell-lang/db) · [postgres](https://github.com/zell-lang/postgres) · [mysql](https://github.com/zell-lang/mysql) · [mssql](https://github.com/zell-lang/mssql) · [oracle](https://github.com/zell-lang/oracle) · [sqlite](https://github.com/zell-lang/sqlite) · [migrate](https://github.com/zell-lang/migrate) |
| **Storage & messaging** | [redis](https://github.com/zell-lang/redis) · [kafka](https://github.com/zell-lang/kafka) · [blob](https://github.com/zell-lang/blob) · [s3](https://github.com/zell-lang/s3) |
| **Editors** | [zell-idea-plugin](https://github.com/zell-lang/zell-idea-plugin) — IntelliJ |
| **Examples** | [example-web-service](https://github.com/zell-lang/example-web-service) · [example-cli](https://github.com/zell-lang/example-cli) · [example-worker](https://github.com/zell-lang/example-worker) |
| **Site** | [zell-site](https://github.com/zell-lang/zell-site) — zell-lang.org and the documentation |

<sub>MIT License · © 2026 Zell contributors</sub>
