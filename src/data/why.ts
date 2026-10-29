// The /why page: one task per topic, written in Zell and in each of Go, C# and Rust.
// The Zell programs compile and run with zell 0.1.5 (outputs in `output`).
import type { Lang } from "../highlight";

export type Rival = "go" | "csharp" | "rust";

export const RIVALS: { id: Rival; name: string }[] = [
  { id: "go", name: "Go" },
  { id: "csharp", name: "C#" },
  { id: "rust", name: "Rust" },
];

export interface Version { code: string; notes: string[] }

export interface Topic {
  id: string;
  eyebrow: string;
  title: string;
  task: string;
  argument: string[];
  zell: Version;
  output: string;
  /** What the output shows, when it depends on the input. */
  outputLabel: string;
  rivals: Record<Rival, Version>;
}

export const LANG_OF: Record<Rival | "zell", Lang> = { zell: "zell", go: "go", csharp: "csharp", rust: "rust" };

export const TOPICS: Topic[] = [
  {
    id: "errors",
    eyebrow: "Errors",
    title: "Errors are values, without the boilerplate",
    task: "Read a port number from a file, check its range, and report what went wrong with enough context to fix it.",
    argument: [
      "A function that can fail says so in its type: `int!` is an int or an error. `?` returns the error to the caller, and `?(\"context\")` adds a line to its message on the way. Handling is `try … catch` on the spot, or `try … else` with a default.",
      "Every error also records where it was created and each `?` it passed through, one pointer per step, with no stack unwinding. `errors.Trace(err)` prints that path with files and lines, so a log tells you which call failed, not only what it said.",
    ],
    zell: {
      code: `namespace config

import io

func loadPort(path string) int! {
    var text = io.ReadFile(path)?("reading config")
    var port = strings.ToInt(strings.Trim(text))?("port in " + path)
    if port < 1 || port > 65535 {
        return error("port out of range: " + strconv.Itoa(port))
    }
    return port
}

func main() {
    var port = try loadPort("port.txt") catch err {
        println("bad config:", err)
        return
    }
    println("listening on", port)
}`,
      notes: [
        "Three failure points, three `?`; context is part of the expression.",
        "The signature `int!` tells every caller that the call can fail.",
      ],
    },
    output: `bad config: port in port.txt: invalid integer: "abc"`,
    outputLabel: 'Output when port.txt holds "abc"',
    rivals: {
      go: {
        code: `package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

func loadPort(path string) (int, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return 0, fmt.Errorf("reading config: %w", err)
	}
	port, err := strconv.Atoi(strings.TrimSpace(string(data)))
	if err != nil {
		return 0, fmt.Errorf("port in %s: %w", path, err)
	}
	if port < 1 || port > 65535 {
		return 0, fmt.Errorf("port out of range: %d", port)
	}
	return port, nil
}

func main() {
	port, err := loadPort("port.txt")
	if err != nil {
		fmt.Println("bad config:", err)
		return
	}
	fmt.Println("listening on", port)
}`,
        notes: [
          "The same model, values, but each failure point is an `if err != nil` block and the chain is built by hand with `fmt.Errorf`.",
          "Forgetting to check `err` compiles; `go vet` does not catch it either.",
          "An error knows its message, not where it came from.",
        ],
      },
      csharp: {
        code: `try
{
    Console.WriteLine($"listening on {LoadPort("port.txt")}");
}
catch (ConfigException e)
{
    Console.WriteLine($"bad config: {e.Message}");
}

static int LoadPort(string path)
{
    string text;
    try
    {
        text = File.ReadAllText(path).Trim();
    }
    catch (IOException e)
    {
        throw new ConfigException("reading config", e);
    }
    if (!int.TryParse(text, out var port))
        throw new ConfigException($"port in {path}: invalid integer: \\"{text}\\"");
    if (port is < 1 or > 65535)
        throw new ConfigException($"port out of range: {port}");
    return port;
}

class ConfigException(string message, Exception? inner = null)
    : Exception(inner is null ? message : $"{message}: {inner.Message}", inner);`,
        notes: [
          "Which calls throw is not in the signature of `LoadPort`; a caller learns it from documentation or in production.",
          "Adding context means catching and rethrowing with a custom exception type.",
          "Exceptions carry a stack trace, captured at a run-time cost on every throw.",
        ],
      },
      rust: {
        code: `use anyhow::{bail, Context, Result};
use std::fs;

fn load_port(path: &str) -> Result<u16> {
    let text = fs::read_to_string(path).context("reading config")?;
    let port: u16 = text
        .trim()
        .parse()
        .with_context(|| format!("port in {path}"))?;
    if port == 0 {
        bail!("port out of range: {port}");
    }
    Ok(port)
}

fn main() {
    match load_port("port.txt") {
        Ok(port) => println!("listening on {port}"),
        Err(err) => println!("bad config: {err:#}"),
    }
}`,
        notes: [
          "The closest to Zell: `Result` and `?`. Context comes from the `anyhow` crate; libraries usually define error enums with `thiserror`.",
          "Where an error came from needs `RUST_BACKTRACE` and a captured backtrace; Zell's return trace is always on and costs a pointer per step.",
        ],
      },
    },
  },
  {
    id: "cancel",
    eyebrow: "Cancellation",
    title: "Cancellation flows through the task tree",
    task: "Fetch several URLs at once, give up after two seconds, and stop the remaining requests as soon as one fails.",
    argument: [
      "Every task inherits a context from the code that started it. `task.WithTimeout` cancels a scope; `task.All` cancels the rest on the first error; `task.Any` cancels the losers. Cancellation reaches every task started inside the scope, and a pending network read or `task.Delay` wakes at once with `task.ErrCancelled`.",
      "None of this is a parameter. `size` below has no context or token argument, and neither does `http.Get`: the standard library reads the current task's context. Code written without cancellation in mind is still cancellable.",
    ],
    zell: {
      code: `namespace crawler

import io
import net

async func size(url string) int! {
    var res = await http.Get(url)?
    return len(res.Body)
}

async func sizes(urls []string) []int! {
    var pending []Task<int!>
    for url in urls {
        pending = append(pending, size(url))
    }
    return await task.All(pending)?
}

async func main() void! {
    var urls = ["https://zell-lang.org", "https://go.dev"]
    var result = await task.WithTimeout(2000, async func() []int! {
        return await sizes(urls)?
    })?
    println(result)
}`,
      notes: [
        "Calling an async function starts it; `task.All` waits for all and cancels the rest on the first error.",
        "The timeout covers everything started inside, including requests in flight.",
      ],
    },
    output: `error: GET https://zell-lang.org/: task cancelled
  created at   crawler.zl:16  sizes
  returned via crawler.zl:7   size
  returned via crawler.zl:16  sizes
  returned via crawler.zl:22  main$lambda1
  returned via crawler.zl:23  main`,
    outputLabel: "Output when one site does not answer within 2 s: the request is cancelled, and the error carries its trace",
    rivals: {
      go: {
        code: `package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"golang.org/x/sync/errgroup"
)

func size(ctx context.Context, url string) (int, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return 0, err
	}
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return 0, err
	}
	return len(body), nil
}

func sizes(ctx context.Context, urls []string) ([]int, error) {
	g, ctx := errgroup.WithContext(ctx)
	out := make([]int, len(urls))
	for i, url := range urls {
		g.Go(func() error {
			n, err := size(ctx, url)
			out[i] = n
			return err
		})
	}
	return out, g.Wait()
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	result, err := sizes(ctx, []string{"https://zell-lang.org", "https://go.dev"})
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	fmt.Println(result)
}`,
        notes: [
          "`ctx` is the first parameter of every function on the path; one function that drops it makes everything below uncancellable.",
          "Cancel-on-first-error needs `errgroup` from `golang.org/x/sync`.",
          "A goroutine started without the context keeps running after the caller gave up.",
        ],
      },
      csharp: {
        code: `using var http = new HttpClient();
using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(2));

var result = await Sizes(["https://zell-lang.org", "https://go.dev"], timeout.Token);
Console.WriteLine(string.Join(" ", result));

async Task<int> Size(string url, CancellationToken ct)
{
    var body = await http.GetByteArrayAsync(url, ct);
    return body.Length;
}

async Task<int[]> Sizes(string[] urls, CancellationToken ct)
{
    using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
    var tasks = urls.Select(async url =>
    {
        try
        {
            return await Size(url, cts.Token);
        }
        catch
        {
            cts.Cancel(); // Task.WhenAll does not cancel the others itself
            throw;
        }
    });
    return await Task.WhenAll(tasks);
}`,
        notes: [
          "A `CancellationToken` is threaded through every call by hand, as in Go.",
          "`Task.WhenAll` waits for every task even after one failed; cancel-on-error is a linked token source written by hand.",
        ],
      },
      rust: {
        code: `use futures::future::try_join_all;
use std::time::Duration;
use tokio::time::timeout;

async fn size(url: &str) -> reqwest::Result<usize> {
    let body = reqwest::get(url).await?.bytes().await?;
    Ok(body.len())
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let urls = ["https://zell-lang.org", "https://go.dev"];
    // dropping a future cancels it: on timeout or on the first error
    let all = try_join_all(urls.iter().map(|url| size(url)));
    let result = timeout(Duration::from_secs(2), all).await??;
    println!("{result:?}");
    Ok(())
}`,
        notes: [
          "Short too: a dropped future stops at its next `.await`, so no token is passed.",
          "That covers futures, not tasks: a `tokio::spawn`ed task keeps running when its handle is dropped. Zell cancels spawned tasks of the scope as well.",
          "Needs tokio, futures and reqwest; async functions in traits and `Send` bounds add ceremony in larger code.",
        ],
      },
    },
  },
  {
    id: "json",
    eyebrow: "JSON",
    title: "Reflection at compile time",
    task: "Parse JSON into a struct, rename one field, skip a private one, omit an empty one, and write it back.",
    argument: [
      "Attributes are typed declarations, not strings: `@json(omitEmpty: true)` is checked by the compiler, and a misspelled option is an error. The encoder and decoder for `User` are generated at compile time from its fields and attributes: plain code, no run-time reflection, nothing to keep for a linker that trims.",
      "The same machinery is open to libraries: `Fields<T>()`, `Attribute<A>()` and `reflect.TypesWith<A>()` fold at compile time, so an ORM mapping, a DI container or a router is generated the same way, without macros or a separate code generator.",
    ],
    zell: {
      code: `namespace users

import encoding
import io

struct User {
    @json(name: "id") Id int
    Name string
    @json(omitEmpty: true) Email string
    @json(skip: true) password string
}

func main() void! {
    var u = json.Parse<User>("{\\"id\\": 7, \\"Name\\": \\"ann\\"}")?
    u.Name = "Ann"
    println(json.Format(u))
}`,
      notes: [
        "`json.Parse<User>` is generated for `User` at compile time.",
        "Attribute arguments are typed and checked by the compiler.",
      ],
    },
    output: `{"id":7,"Name":"Ann"}`,
    outputLabel: "Output",
    rivals: {
      go: {
        code: `package main

import (
	"encoding/json"
	"fmt"
	"os"
)

type User struct {
	ID       int    \`json:"id"\`
	Name     string
	Email    string \`json:",omitempty"\`
	password string // unexported: never encoded
}

func main() {
	var u User
	if err := json.Unmarshal([]byte(\`{"id": 7, "Name": "ann"}\`), &u); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	u.Name = "Ann"
	out, _ := json.Marshal(u)
	fmt.Println(string(out))
}`,
        notes: [
          "Struct tags are strings: `json:\"id,omitempy\"` with a typo compiles and is silently ignored.",
          "`encoding/json` walks the struct with run-time reflection on every call; fast alternatives need a code generator.",
        ],
      },
      csharp: {
        code: `using System.Text.Json;
using System.Text.Json.Serialization;

var u = JsonSerializer.Deserialize("""{"id": 7, "Name": "ann"}""", AppJson.Default.User)!;
u.Name = "Ann";
Console.WriteLine(JsonSerializer.Serialize(u, AppJson.Default.User));

class User
{
    [JsonPropertyName("id")] public int Id { get; set; }
    public string Name { get; set; } = "";
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? Email { get; set; }
    [JsonIgnore] public string Password { get; set; } = "";
}

// source generator: required for trimming and Native AOT
[JsonSerializable(typeof(User))]
partial class AppJson : JsonSerializerContext { }`,
        notes: [
          "Attributes are typed, as in Zell. By default serialization uses run-time reflection, which trimming and Native AOT break.",
          "The source-generated path works without it, at the price of a context class registered for every type.",
        ],
      },
      rust: {
        code: `use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct User {
    id: i64,
    #[serde(rename = "Name")]
    name: String,
    #[serde(rename = "Email", default, skip_serializing_if = "String::is_empty")]
    email: String,
    #[serde(skip)]
    password: String,
}

fn main() -> serde_json::Result<()> {
    let mut u: User = serde_json::from_str(r#"{"id": 7, "Name": "ann"}"#)?;
    u.name = "Ann".into();
    println!("{}", serde_json::to_string(&u)?);
    Ok(())
}`,
        notes: [
          "serde is compile-time as well, and excellent. It is built on derive macros: writing your own means a proc-macro crate working on token streams.",
          "In Zell the same thing is ordinary code over `Fields<T>()`, in the same language and the same file.",
        ],
      },
    },
  },
  {
    id: "resources",
    eyebrow: "Resources",
    title: "Released at a known point, on every path",
    task: "Lease a connection from a pool and give it back when the handler finishes, whether it succeeds or fails.",
    argument: [
      "A type with a `Drop` method has a destructor. It runs exactly once, when the value goes away: at the end of the block for a local, when the last reference is gone for a shared object. Early `return`, `?` and `break` included. Files, sockets and database rows in the standard library close themselves this way.",
      "There is no garbage collector, so this is not a finalizer that runs some time later, or never. For cleanup that must be awaited, `defer await c.Close()` runs at function exit on every path.",
    ],
    zell: {
      code: `namespace pool

import io

struct Lease {
    pool *Pool
    Id   int

    // runs exactly once, on every way out of the owner's scope
    func Drop() {
        this.pool.free = append(this.pool.free, this.Id)
    }
}

struct Pool {
    free []int

    func Get() Lease! {
        if len(this.free) == 0 {
            return error("pool exhausted")
        }
        var id = this.free[len(this.free) - 1]
        this.free = this.free[..len(this.free) - 1]
        return Lease{pool: this, Id: id}
    }
}

func handle(p *Pool, ok bool) void! {
    var c = p.Get()?
    if !ok {
        return error("query failed on conn " + strconv.Itoa(c.Id))
    }
    println("served on conn", c.Id)
}

func main() {
    var p = new Pool{free: [1, 2]}
    for ok in [true, false, true] {
        try handle(p, ok) catch err {
            println("error:", err)
        }
    }
    println("free:", len(p.free))
}`,
      notes: [
        "`handle` has no cleanup code: the lease returns itself on success and on the error path.",
        "The pool is shared by reference counting; no lifetimes, no `Rc<RefCell<…>>`.",
      ],
    },
    output: `served on conn 2
error: query failed on conn 2
served on conn 2
free: 2`,
    outputLabel: "Output",
    rivals: {
      go: {
        code: `package main

import (
	"errors"
	"fmt"
)

type Pool struct{ free []int }

func (p *Pool) Get() (int, error) {
	if len(p.free) == 0 {
		return 0, errors.New("pool exhausted")
	}
	id := p.free[len(p.free)-1]
	p.free = p.free[:len(p.free)-1]
	return id, nil
}

func (p *Pool) Put(id int) { p.free = append(p.free, id) }

func handle(p *Pool, ok bool) error {
	c, err := p.Get()
	if err != nil {
		return err
	}
	defer p.Put(c) // every caller of Get must remember this line
	if !ok {
		return fmt.Errorf("query failed on conn %d", c)
	}
	fmt.Println("served on conn", c)
	return nil
}

func main() {
	p := &Pool{free: []int{1, 2}}
	for _, ok := range []bool{true, false, true} {
		if err := handle(p, ok); err != nil {
			fmt.Println("error:", err)
		}
	}
	fmt.Println("free:", len(p.free))
}`,
        notes: [
          "`defer` is correct here, but it is written at every call site; leaving it out compiles and leaks.",
          "`runtime.SetFinalizer` is no fallback: it runs when the GC gets to it, or not at all.",
        ],
      },
      csharp: {
        code: `var pool = new Pool([1, 2]);
foreach (var ok in new[] { true, false, true })
{
    try { Handle(pool, ok); }
    catch (Exception e) { Console.WriteLine($"error: {e.Message}"); }
}
Console.WriteLine($"free: {pool.Free.Count}");

static void Handle(Pool p, bool ok)
{
    using var c = p.Get(); // without \`using\`, Dispose never runs
    if (!ok) throw new Exception($"query failed on conn {c.Id}");
    Console.WriteLine($"served on conn {c.Id}");
}

class Pool(List<int> free)
{
    public List<int> Free => free;

    public Lease Get()
    {
        if (free.Count == 0) throw new InvalidOperationException("pool exhausted");
        var id = free[^1];
        free.RemoveAt(free.Count - 1);
        return new Lease(this, id);
    }
}

sealed class Lease(Pool pool, int id) : IDisposable
{
    public int Id => id;
    public void Dispose() => pool.Free.Add(id);
}`,
        notes: [
          "`IDisposable` plus `using` gives the same result, but `using` is the caller's job: without it nothing is released (an analyzer may warn).",
          "A finalizer as a safety net runs on the GC's schedule, on another thread.",
        ],
      },
      rust: {
        code: `use std::cell::RefCell;
use std::rc::Rc;

struct Pool {
    free: RefCell<Vec<u32>>,
}

struct Lease {
    pool: Rc<Pool>,
    id: u32,
}

impl Drop for Lease {
    // runs exactly once, on every way out of the owner's scope
    fn drop(&mut self) {
        self.pool.free.borrow_mut().push(self.id);
    }
}

fn get(pool: &Rc<Pool>) -> Result<Lease, String> {
    let id = pool.free.borrow_mut().pop().ok_or("pool exhausted")?;
    Ok(Lease { pool: Rc::clone(pool), id })
}

fn handle(pool: &Rc<Pool>, ok: bool) -> Result<(), String> {
    let c = get(pool)?;
    if !ok {
        return Err(format!("query failed on conn {}", c.id));
    }
    println!("served on conn {}", c.id);
    Ok(())
}

fn main() {
    let pool = Rc::new(Pool { free: RefCell::new(vec![1, 2]) });
    for ok in [true, false, true] {
        if let Err(err) = handle(&pool, ok) {
            println!("error: {err}");
        }
    }
    println!("free: {}", pool.free.borrow().len());
}`,
        notes: [
          "The same model as Zell: `Drop` runs at a known point. Rust did it first.",
          "The lease cannot hold `&mut Pool` while the pool is used elsewhere, so the pool becomes `Rc<RefCell<…>>`; across threads, `Arc<Mutex<…>>`.",
        ],
      },
    },
  },
];

/** The at-a-glance table at the end of the page. */
export const GLANCE: { row: string; zell: string; go: string; csharp: string; rust: string }[] = [
  { row: "Errors", zell: "`T!` values, `?`, return traces", go: "Values, `if err != nil`", csharp: "Exceptions, not in signatures", rust: "`Result`, `?`; context via crates" },
  { row: "Memory", zell: "Reference counting, compile-time ownership, `Drop`", go: "Tracing GC", csharp: "Tracing GC, `IDisposable`", rust: "Ownership and borrowing, `Drop`" },
  { row: "Concurrency", zell: "`async`/`await` on a multi-threaded scheduler, channels", go: "Goroutines, channels", csharp: "`async`/`await` on the thread pool", rust: "`async`/`await` with a chosen runtime (tokio)" },
  { row: "Cancellation", zell: "Structured, through the task context", go: "`context.Context` by hand", csharp: "`CancellationToken` by hand", rust: "Drop the future; spawned tasks separately" },
  { row: "Sum types", zell: "Enums with data, exhaustive `switch`", go: "None", csharp: "None built in", rust: "Enums with data, exhaustive `match`" },
  { row: "Reflection", zell: "Compile time, in the language", go: "Run time", csharp: "Run time or source generators", rust: "Derive and proc macros" },
  { row: "Learning curve", zell: "A Go-sized core", go: "Small", csharp: "Large", rust: "Steep: lifetimes, borrow checker" },
  { row: "Deployment", zell: "One native binary, cross-compiles from any host", go: "One native binary, cross-compiles", csharp: "Runtime, or Native AOT with limits", rust: "One native binary; cross-compiling needs target toolchains" },
];
