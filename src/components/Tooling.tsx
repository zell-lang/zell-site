import { ToolIcons } from "./icons";
import SectionHead from "./SectionHead";

const FEATURES = [
  { icon: ToolIcons.terminal, title: "One command",
    text: <><code>zell build</code>, <code>run</code>, <code>test</code>, <code>fmt</code>, <code>doc</code> and <code>check</code>.</> },
  { icon: ToolIcons.editor, title: "Editors",
    text: "A language server with typed completion, refactorings and type hierarchy. Extensions for VS Code and IntelliJ; works with Neovim and Helix." },
  { icon: ToolIcons.package, title: "Packages",
    text: <><code>zell.toml</code> manifests, a lock file and workspaces. Dependencies come straight from Git.</> },
  { icon: ToolIcons.globe, title: "Cross-compilation",
    text: "Linux on x86-64 and arm64, glibc or fully static musl, macOS and Windows from any host." },
  { icon: ToolIcons.flask, title: "Testing",
    text: <>Tests and benchmarks next to the code. <code>t.Must</code> unwraps results and reports the file and line.</> },
  { icon: ToolIcons.bug, title: "Debugging",
    text: "DWARF for lldb and gdb with pretty-printers. A panic ends its task and prints a backtrace with file and line." },
];

export default function Tooling() {
  return (
    <section className="band alt" id="tooling">
      <div className="wrap">
        <SectionHead eyebrow="Tooling" title="Everything in one archive">
          No clang, no C headers, no SDKs. Unpack it and build for any supported platform.
        </SectionHead>
        <div className="grid3">
          {FEATURES.map(f => (
            <div className="feat" key={f.title}>{f.icon}<h3>{f.title}</h3><p>{f.text}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}
