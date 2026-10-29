// Benchmark results for /performance, copied from benchmarks/*.md in zell-lang/zell.
// Each group names the machine, the date and the section it comes from; update a group
// only from a new measurement of the same kind, never by editing single numbers.
import { REPO } from "../site";

export type Rt = "Zell" | "Go" | ".NET";

export const src = (dir: string) => `${REPO}/tree/master/benchmarks/${dir}`;
export const doc = (file: string) => `${REPO}/blob/master/benchmarks/${file}`;

export interface Machine { id: string; name: string; detail: string }

export const MACHINES: Machine[] = [
  {
    id: "m16",
    name: "16 threads",
    detail: "AMD Ryzen 7 8845HS (8 cores, 16 threads), Fedora 42, Linux 6.19, loopback networking. Zell master a1cd2e6 --release, Go 1.24.7, .NET SDK 10.0.108 (Release, workstation non-concurrent GC).",
  },
  {
    id: "m4",
    name: "4 vCPU",
    detail: "x86-64 VM with 4 vCPU (Intel Xeon @ 2.80 GHz, AVX-512, Firecracker), Linux 6.18, clang/LLVM 18, Go 1.24. Zell --release targets the host CPU, Go the default GOAMD64=v1.",
  },
];

/** A benchmark phase with absolute values per runtime. */
export interface Measure {
  bench: string;
  phase: string;
  unit: string;
  higherIsBetter?: boolean;
  values: Partial<Record<Rt, number>>;
  /** Display names when a column is a library rather than the language (zap, GORM). */
  labels?: Partial<Record<Rt, string>>;
  note?: string;
}

/** A phase known only as a ratio: Zell's time over Go's (below 1, Zell is faster). */
export interface Ratio {
  bench: string;
  phase: string;
  ratio: number;
  note?: string;
}

interface GroupBase {
  id: string;
  title: string;
  intro: string;
  machine: Machine["id"];
  date: string;
  method: string;
  source: { label: string; href: string };
}

export type Group =
  | (GroupBase & { kind: "measures"; items: Measure[] })
  | (GroupBase & { kind: "ratios"; items: Ratio[] });

export const GROUPS: Group[] = [
  {
    id: "async",
    kind: "measures",
    title: "Async runtime",
    intro: "The scheduler suite: tasks, channels, mutexes, timers, await chains, cancellation, loopback I/O and select. The same programs in Zell, Go and C#, with identical checksums.",
    machine: "m16",
    date: "2026-10-25",
    method: "One session, one process at a time, runtimes interleaved (Zell, Go, .NET) for 5 rounds; medians of the phase times each program prints.",
    source: { label: "benchmarks/README.md, “Async wave result”", href: doc("README.md#async-wave-result-2026-10-25") },
    items: [
      { bench: "spawn_tasks", phase: "1M tasks that yield once", unit: "ms", values: { Zell: 246, Go: 148, ".NET": 233 } },
      { bench: "spawn_tasks", phase: "1M tasks parked at once", unit: "ms", values: { Zell: 235, Go: 1101, ".NET": 456 } },
      { bench: "spawn_tasks", phase: "wake 1M parked tasks", unit: "ms", values: { Zell: 89, Go: 121, ".NET": 204 } },
      { bench: "channel_pingpong", phase: "5M messages over unbuffered channels", unit: "ms", values: { Zell: 430, Go: 418, ".NET": 2365 } },
      { bench: "channel_pingpong", phase: "1M values through a 4-stage pipeline", unit: "ms", values: { Zell: 125, Go: 76, ".NET": 269 } },
      { bench: "fanout_fanin", phase: "10k producers into one channel", unit: "ms", values: { Zell: 460, Go: 312, ".NET": 547 } },
      { bench: "fanout_fanin", phase: "pool of 8 workers over 1M jobs", unit: "ms", values: { Zell: 136, Go: 78, ".NET": 430 } },
      { bench: "mutex_contention", phase: "8 tasks, 10M increments, one mutex", unit: "ms", values: { Zell: 107, Go: 203, ".NET": 3452 } },
      { bench: "mutex_contention", phase: "uncontended, 10M lock/unlock", unit: "ms", values: { Zell: 39, Go: 35, ".NET": 257 } },
      { bench: "timers", phase: "total wall time", unit: "ms", values: { Zell: 66, Go: 51, ".NET": 66 } },
      { bench: "timers", phase: "mean lateness of a timer", unit: "µs", values: { Zell: 41, Go: 126, ".NET": 793 } },
      { bench: "await_chain", phase: "10M awaits that complete synchronously", unit: "ms", values: { Zell: 11, Go: 10, ".NET": 299 } },
      { bench: "await_chain", phase: "1k deep chains that suspend", unit: "ms", values: { Zell: 14, Go: 7, ".NET": 129 } },
      { bench: "cancel_tree", phase: "drain a cancelled task tree, average", unit: "µs", values: { Zell: 2323, Go: 4336, ".NET": 8491 } },
      { bench: "cancel_tree", phase: "drain a tree after a timeout, average", unit: "µs", values: { Zell: 2777, Go: 4756, ".NET": 7974 } },
      { bench: "async_io", phase: "1000 connections × 1000 round trips", unit: "ms", values: { Zell: 1254, Go: 1256, ".NET": 1527 } },
      { bench: "async_io", phase: "p99 round-trip latency", unit: "µs", values: { Zell: 1591, Go: 2420, ".NET": 2882 } },
      { bench: "select_many", phase: "select over 8 channels", unit: "ms", values: { Zell: 1237, Go: 967, ".NET": 1001 }, note: "1237 follows a .NET run in the interleaving; in isolation the same build measures ~1120." },
      { bench: "select_many", phase: "merge of 8 channels", unit: "ms", values: { Zell: 827, Go: 396, ".NET": 956 } },
    ],
  },
  {
    id: "network",
    kind: "measures",
    title: "Network servers",
    intro: "Servers from the standard libraries under Go's load generator: HTTP/1.1 with keep-alive and WebSocket echo. Zell and Go only.",
    machine: "m16",
    date: "2026-10-25",
    method: "5 rounds of each benchmark's run.sh, medians. Both servers face the same Go client, which takes CPU on the same machine.",
    source: { label: "benchmarks/README.md, “Async wave result”", href: doc("README.md#async-wave-result-2026-10-25") },
    items: [
      { bench: "http_hello", phase: "requests per second, 64 keep-alive connections", unit: "req/s", higherIsBetter: true, values: { Zell: 608886, Go: 396296 }, note: "Server CPU per request: Zell 8.3 µs, Go 17.1 µs." },
      { bench: "websocket_echo", phase: "messages per second, Go client", unit: "msg/s", higherIsBetter: true, values: { Zell: 619086, Go: 663983 } },
    ],
  },
  {
    id: "core",
    kind: "measures",
    title: "Language core",
    intro: "Single-threaded programs: calls, slices, maps, strings, structs and allocation, plus regex, gzip and TCP from the standard library.",
    machine: "m4",
    date: "2026-10-21",
    method: "Best of 3 on an idle machine, wall time of the whole process; cycle collector in its default mode.",
    source: { label: "benchmarks/README.md, “Memory wave results”", href: doc("README.md#memory-wave-results-2026-10-21-after-cycle-collector-os-memory-return-biased-rc") },
    items: [
      { bench: "strings", phase: "Split, ToUpper, Join on 1.2 MB", unit: "s", values: { Zell: 0.069, Go: 0.167 } },
      { bench: "regex", phase: "FindAll of an e-mail pattern in 10 MB", unit: "s", values: { Zell: 0.234, Go: 0.588 } },
      { bench: "sieve", phase: "5 × 10M, slices with bounds checks", unit: "s", values: { Zell: 0.324, Go: 0.608 } },
      { bench: "fib", phase: "fib(38), recursive calls", unit: "s", values: { Zell: 0.115, Go: 0.213 } },
      { bench: "json_like", phase: "format 100k records", unit: "s", values: { Zell: 0.18, Go: 0.293 } },
      { bench: "map", phase: "4M int map operations", unit: "s", values: { Zell: 0.242, Go: 0.386 } },
      { bench: "alloc_heavy", phase: "binary trees of small nodes", unit: "s", values: { Zell: 0.448, Go: 0.561 } },
      { bench: "struct_map", phase: "map of structs, 2M updates", unit: "s", values: { Zell: 0.196, Go: 0.227 } },
      { bench: "tcp_echo", phase: "1000 connections × 1 MB echoed", unit: "s", values: { Zell: 0.482, Go: 0.553 }, note: "Peak memory: Zell 56 MB, Go 117 MB." },
      { bench: "gzip", phase: "level 6, 20 MB round trip", unit: "s", values: { Zell: 1.91, Go: 2.101 } },
      { bench: "nbody", phase: "5M steps, float math", unit: "s", values: { Zell: 0.43, Go: 0.446 } },
      { bench: "heap_churn", phase: "allocate and drop 40 MB, 20 rounds", unit: "s", values: { Zell: 2.244, Go: 0.976 } },
      { bench: "shared_objects", phase: "objects read from 8 threads", unit: "s", values: { Zell: 0.636, Go: 0.217 } },
    ],
  },
  {
    id: "latency",
    kind: "measures",
    title: "Tail latency under allocation pressure",
    intro: "An HTTP server answering a small JSON body, alone and with a background task that churns the heap. This is where a garbage collector and reference counting differ.",
    machine: "m4",
    date: "2026-10-22",
    method: "Go's load generator, 64 connections; best of 5 by p99. Idle: the server alone. Churn: plus one task that allocates and drops objects continuously.",
    source: { label: "benchmarks/RESULTS-latency.md", href: doc("RESULTS-latency.md#latency_p99") },
    items: [
      { bench: "latency_p99", phase: "p99, idle", unit: "µs", values: { Zell: 2210, Go: 3411 } },
      { bench: "latency_p99", phase: "p99, under churn", unit: "µs", values: { Zell: 3145, Go: 8142 } },
      { bench: "latency_p99", phase: "p99.9, under churn", unit: "µs", values: { Zell: 6459, Go: 12217 } },
      { bench: "latency_p99", phase: "median, idle", unit: "µs", values: { Zell: 764, Go: 491 } },
      { bench: "latency_p99", phase: "requests per second, idle", unit: "req/s", higherIsBetter: true, values: { Zell: 77602, Go: 95924 } },
      { bench: "latency_p99", phase: "requests per second, under churn", unit: "req/s", higherIsBetter: true, values: { Zell: 65210, Go: 52539 } },
    ],
  },
  {
    id: "scaling",
    kind: "measures",
    title: "Scaling over cores",
    intro: "A fixed amount of work split among 1 and 4 workers: word frequencies over 400 MB of text, and 2048 binary trees.",
    machine: "m4",
    date: "2026-10-22",
    method: "Best of 5; the programs report their own timings.",
    source: { label: "benchmarks/RESULTS-latency.md, “cores_scaling”", href: doc("RESULTS-latency.md#cores_scaling") },
    items: [
      { bench: "cores_scaling", phase: "wordfreq, 1 worker", unit: "ms", values: { Zell: 1948, Go: 2151 } },
      { bench: "cores_scaling", phase: "wordfreq, 4 workers", unit: "ms", values: { Zell: 532, Go: 535 } },
      { bench: "cores_scaling", phase: "trees, 1 worker", unit: "ms", values: { Zell: 4770, Go: 2384 } },
      { bench: "cores_scaling", phase: "trees, 4 workers", unit: "ms", values: { Zell: 1319, Go: 1504 }, note: "Speed-up from 1 to 4 workers: Zell 3.6×, Go 1.6× (the GC competes for the same cores)." },
    ],
  },
  {
    id: "mechanisms",
    kind: "ratios",
    title: "Language mechanisms",
    intro: "The cost of individual features, each in its own loop: calls through interfaces and closures, generics, defer, errors.",
    machine: "m16",
    date: "2026-10-23",
    method: "One run per side after performance wave 2; treat as ±5%. Absolute times are in the source.",
    source: { label: "benchmarks/README.md, “Performance wave 2”", href: doc("README.md#performance-wave-2-2026-10-23-16-core-x86-64-fedora-42-amd-ryzen-7-8845hs-clangllvm-18-go-1247---release") },
    items: [
      { bench: "defer_errors_iface", phase: "direct method calls", ratio: 0.17, note: "LLVM vectorizes the loop; Go keeps the calls." },
      { bench: "defer_errors_iface", phase: "generic sum over []int", ratio: 0.24 },
      { bench: "defer_errors_iface", phase: "sum through an interface", ratio: 1.24 },
      { bench: "defer_errors_iface", phase: "closure calls", ratio: 1.27 },
      { bench: "defer_errors_iface", phase: "interface method calls", ratio: 1.39 },
      { bench: "defer_errors_iface", phase: "sentinel error through 3 levels of ?", ratio: 5.84, note: "With error traces on; built with --no-error-trace it is 1.18× Go." },
      { bench: "defer_errors_iface", phase: "function with defer", ratio: 6.79, note: "Two heap objects per call today." },
    ],
  },
  {
    id: "stdlib",
    kind: "ratios",
    title: "Standard library",
    intro: "JSON, cryptography, data formats, files and collections against Go's standard library and its usual packages.",
    machine: "m16",
    date: "2026-10-23",
    method: "JSON and crypto: one run per side on the 16-thread machine after wave 2. Formats, files and collections: best of 5 alternating on the 4 vCPU machine (2026-10-22). Throughput rows are converted to time ratios.",
    source: { label: "benchmarks/RESULTS-stdlib.md and README.md “Performance wave 2”", href: doc("RESULTS-stdlib.md") },
    items: [
      { bench: "json_codec", phase: "Value format", ratio: 0.17 },
      { bench: "json_codec", phase: "Value parse, 100 MB", ratio: 0.18 },
      { bench: "json_codec", phase: "1M small messages", ratio: 0.28, note: "3.6× Go's throughput." },
      { bench: "json_codec", phase: "typed parse, 100 MB", ratio: 0.34 },
      { bench: "json_codec", phase: "typed format", ratio: 0.64 },
      { bench: "json_codec", phase: "Value lookups", ratio: 3.3, note: "One runtime call per Get/Index." },
      { bench: "crypto", phase: "HKDF-SHA256", ratio: 0.43 },
      { bench: "crypto", phase: "AES-256-GCM seal, 1 GB", ratio: 0.93 },
      { bench: "crypto", phase: "SHA-256, 1 GB", ratio: 1.0 },
      { bench: "crypto", phase: "SHA-512", ratio: 1.8 },
      { bench: "crypto", phase: "TLS 1.3 handshakes", ratio: 2.2, note: "Bound by P-256 and Ed25519." },
      { bench: "crypto", phase: "Argon2id", ratio: 3.9 },
      { bench: "crypto", phase: "P-256 sign", ratio: 6.5, note: "No fixed-base tables yet." },
      { bench: "crypto", phase: "ChaCha20-Poly1305 seal", ratio: 7.8, note: "No AVX2 path yet." },
      { bench: "crypto", phase: "Ed25519 sign", ratio: 8.2, note: "No fixed-base tables yet." },
      { bench: "encodings", phase: "YAML format (4 vCPU)", ratio: 0.17 },
      { bench: "encodings", phase: "YAML parse, 20 MB (4 vCPU)", ratio: 0.68 },
      { bench: "encodings", phase: "TOML format (4 vCPU)", ratio: 0.78 },
      { bench: "encodings", phase: "TOML parse, 20 MB (4 vCPU)", ratio: 1.76 },
      { bench: "encodings", phase: "XML parse, 20 MB (4 vCPU)", ratio: 2.12 },
      { bench: "file_io", phase: "create 100k files (4 vCPU)", ratio: 0.12 },
      { bench: "file_io", phase: "walk and stat 100k files (4 vCPU)", ratio: 0.73 },
      { bench: "file_io", phase: "read 1 GB in 1 MB chunks (4 vCPU)", ratio: 1.01 },
      { bench: "file_io", phase: "write 1 GB in 1 MB chunks (4 vCPU)", ratio: 1.4 },
      { bench: "file_io", phase: "buffered writes of 1 KB (4 vCPU)", ratio: 2.42 },
      { bench: "file_io", phase: "line scan of 1 GB (4 vCPU)", ratio: 2.85 },
      { bench: "file_io", phase: "buffered reads of 1 KB (4 vCPU)", ratio: 9.25 },
      { bench: "sort_collect", phase: "heap, 1M push and pop (4 vCPU)", ratio: 0.48 },
      { bench: "sort_collect", phase: "sort 10M ints (4 vCPU)", ratio: 1.18 },
      { bench: "sort_collect", phase: "strings.Builder, 100 MB (4 vCPU)", ratio: 2.14 },
      { bench: "sort_collect", phase: "ordered map (4 vCPU)", ratio: 2.58 },
      { bench: "sort_collect", phase: "text.template, 1M rows (4 vCPU)", ratio: 3.11 },
      { bench: "sort_collect", phase: "sort 2M strings (4 vCPU)", ratio: 3.26 },
      { bench: "sort_collect", phase: "linked list, 2M (4 vCPU)", ratio: 5.66 },
    ],
  },
  {
    id: "framework",
    kind: "measures",
    title: "Framework packages",
    intro: "Structured logging against zap, and the data ORM against GORM on SQLite in memory.",
    machine: "m4",
    date: "2026-10-22",
    method: "ORM: best of 5 rounds, implementations alternating. Logging: a single run of 5M records per scenario; Zell's log also renders the message and stores the template per record (Serilog CLEF), the Go loggers write a constant message.",
    source: { label: "benchmarks/RESULTS-framework.md", href: doc("RESULTS-framework.md") },
    items: [
      { bench: "logging", phase: "JSON records to /dev/null, vs zap", unit: "records/s", higherIsBetter: true, values: { Zell: 40326, Go: 612984 }, labels: { Go: "zap" }, note: "344 allocations per record in Zell's log today." },
      { bench: "logging", phase: "disabled Debug call, vs zap", unit: "ns", values: { Zell: 3.7, Go: 122 }, labels: { Go: "zap" } },
      { bench: "orm_sqlite", phase: "1M lookups by key, vs GORM", unit: "ms", values: { Zell: 14079, Go: 20796 }, labels: { Go: "GORM" } },
      { bench: "orm_sqlite", phase: "insert 100k rows, vs GORM", unit: "ms", values: { Zell: 1819, Go: 414 }, labels: { Go: "GORM" } },
      { bench: "orm_sqlite", phase: "update 10k tracked rows, vs GORM", unit: "ms", values: { Zell: 92, Go: 171 }, labels: { Go: "GORM" } },
    ],
  },
];

/** Hello-world sizes; Zell measured with zell 0.1.5 `build --release`, Go from bench-size.sh (stripped). */
export const SIZES: { label: string; kb: number; zell: boolean }[] = [
  { label: "Zell, linux-amd64", kb: 45, zell: true },
  { label: "Zell, linux-arm64", kb: 47, zell: true },
  { label: "Zell, windows-amd64", kb: 101, zell: true },
  { label: "Zell, macos-arm64", kb: 105, zell: true },
  { label: "Go, linux-amd64, stripped", kb: 1404, zell: false },
];

/** Where Zell is behind today, why, and what is planned. Shown at the top of the page. */
export const BEHIND: { what: string; why: string }[] = [
  { what: "Await chains that suspend (2×), channel pipelines (1.6×), worker pools (1.7×), select merge (2.1×)", why: "Each resumed frame still goes through a task object and the run queue, while Go switches stacks directly. Thin await and direct hand-off on channels are the next item on the roadmap." },
  { what: "defer (6.8×) and sentinel errors with traces (5.8×)", why: "A deferred call allocates two heap objects; a constant error copies its trace on every return. Both have known fixes; --no-error-trace brings errors to 1.18×." },
  { what: "Heap churn (2.3×) and objects read across threads (2.9×)", why: "Large-buffer churn pays page faults that Go's allocator amortizes, and cross-thread reads pay atomic reference counts. This is the cost of having no GC." },
  { what: "Signatures and ChaCha20 (6.5–8.2×)", why: "Ed25519 and P-256 have no fixed-base tables yet, ChaCha20 no AVX2 path. SHA-256 and AES-GCM already match Go." },
  { what: "Small buffered I/O and line scanning (2.4–9×), linked list, string sort, templates (3–5.7×)", why: "Measured before performance wave 2 on the 4 vCPU machine; the buffered reader path and these collections have not been tuned yet." },
  { what: "Structured logging (15× slower than zap when enabled)", why: "344 allocations per record. A disabled log call is the cheapest of all (3.7 ns)." },
];
