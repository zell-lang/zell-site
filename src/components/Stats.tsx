const STATS = [
  { value: "1.54×", text: <>HTTP/1.1 requests per second of Go's <code>net/http</code>, at half the CPU per request</> },
  { value: "46 KB", text: "Hello world, stripped. Go's is 1.4 MB" },
  { value: "0", text: "GC pauses. Memory is freed when the last reference goes away" },
  { value: "5", text: "Host platforms. One archive cross-compiles to all of them" },
];

export default function Stats() {
  return (
    <section className="wrap" aria-label="Key numbers">
      <div className="stats">
        {STATS.map(s => (
          <div className="stat" key={s.value}><b>{s.value}</b><span>{s.text}</span></div>
        ))}
      </div>
    </section>
  );
}
