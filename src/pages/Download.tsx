import { Link } from "react-router-dom";
import { useRef } from "react";
import PageHead from "../components/PageHead";
import SectionHead from "../components/SectionHead";
import Install, { CopyButton } from "../components/Install";
import { usePageTitle } from "../components/Layout";
import { installVersion, LATEST, PREVIEW, REPO, type Host, type Release, type ReleaseFile } from "../site";

const mb = (bytes: number) => `${(bytes / 1048576).toFixed(1)} MB`;
const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const OS_NOTE: Record<string, string> = {
  Linux: "Programs it builds run on glibc 2.31 or newer, or fully static with musl",
  macOS: "Builds for Apple silicon and Intel from either",
  Windows: "No Visual Studio, MinGW or SDK to install",
};

export default function Download() {
  usePageTitle("Download");
  const r = LATEST;
  return (
    <>
      <PageHead
        eyebrow="Download"
        title={<>Zell {r.version}{r.prerelease && <span className="badge warn">pre-release</span>}</>}
      >
        <p>
          Released {date(r.publishedAt)}. One archive per host holds the compiler, the runtime, the linker and the link
          inputs for every target: nothing else to install, and any host builds for all of them.{" "}
          <a href={r.url}>Release notes</a> · <a href={`${REPO}/releases`}>All releases</a>
        </p>
      </PageHead>

      <section className="wrap notices">
        {r.prerelease && (
          <p className="notice warn">
            <strong>This is a pre-release.</strong> It has not been through a stable release cycle yet, and the
            install script does not pick it up by default: use the commands below, which name the version.
          </p>
        )}
        <p className="notice">
          <strong>Zell is before 1.0.</strong> The language and the standard library can still change between minor
          releases; breaking changes are listed in the release notes, and <code>zell fmt</code> or a compiler
          diagnostic points at what to update.
        </p>
      </section>

      <section className="band" id="install">
        <div className="wrap">
          <SectionHead eyebrow="Install" title="One command">
            The script downloads the archive for your system, checks its SHA-256 and unpacks it into{" "}
            <code>~/.zell/toolchain</code>. On Linux and macOS it links <code>zell</code> into{" "}
            <code>~/.local/bin</code>; on Windows it adds it to the user <code>PATH</code>.{" "}
            <Link to="/docs/get-started/install">Installation details</Link>.
          </SectionHead>
          <Install className="install wide" cmds={r.prerelease ? installVersion(r.version) : undefined} />
          <p className="hint">
            A specific version: <code>sh install.sh --version {r.version}</code>, or{" "}
            <code>.\install.ps1 -Version {r.version}</code> on Windows.
          </p>
        </div>
      </section>

      <section className="band alt" id="archives">
        <div className="wrap">
          <SectionHead eyebrow="Archives" title="Download by platform">
            Unpack anywhere and add its <code>bin</code> directory to <code>PATH</code>. <code>.tar.xz</code> is the
            smaller one; <code>.tar.gz</code> unpacks with the <code>tar</code> built into Windows.
          </SectionHead>
          <div className="platforms">
            {r.hosts.map(h => <PlatformCard key={h.id} host={h} />)}
          </div>
        </div>
      </section>

      {PREVIEW && <PreviewBand pre={PREVIEW} />}

      <section className="band" id="verify">
        <div className="wrap">
          <SectionHead eyebrow="Verify" title="Check what you downloaded">
            The install script does this for you. For a manual download, compare against the release's{" "}
            {r.sumsUrl ? <a href={r.sumsUrl}>SHA256SUMS</a> : "SHA256SUMS"} or the checksum on the card.
          </SectionHead>
          <div className="verify">
            <div>
              <h3>Linux · macOS</h3>
              <pre className="snippet">{`curl -fsSLO ${r.sumsUrl ?? `${REPO}/releases/download/${r.tag}/SHA256SUMS`}
sha256sum --ignore-missing -c SHA256SUMS
# macOS:
shasum -a 256 --ignore-missing -c SHA256SUMS`}</pre>
            </div>
            <div>
              <h3>Windows (PowerShell)</h3>
              <pre className="snippet">{`$file = ".\\zell-${r.version}-windows-amd64.tar.gz"
(Get-FileHash $file -Algorithm SHA256).Hash.ToLower()
# compare with the SHA-256 on the Windows card`}</pre>
            </div>
          </div>
        </div>
      </section>

      {r.runtimes.length > 0 && <RuntimesBand r={r} />}
    </>
  );
}

function PlatformCard({ host }: { host: Host }) {
  const [main, ...rest] = host.files;
  return (
    <article className="platform">
      <header>
        <h3>{host.os}</h3>
        <span>{host.arch}</span>
      </header>
      <p className="sub">{OS_NOTE[host.os]}</p>
      <a className="btn primary" href={main.url}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1v9M4 6.5 8 10.5l4-4M2 13.5h12" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
        {main.name.endsWith(".tar.xz") ? ".tar.xz" : ".tar.gz"} · {mb(main.size)}
      </a>
      {rest.map(f => (
        <a className="alt-file" key={f.name} href={f.url}>{f.name.slice(f.name.lastIndexOf(".tar"))} · {mb(f.size)}</a>
      ))}
      <dl>
        {host.files.map(f => <Checksum key={f.name} file={f} label={host.files.length > 1 ? f.name.slice(f.name.lastIndexOf(".tar")) : "SHA-256"} />)}
      </dl>
    </article>
  );
}

function Checksum({ file, label }: { file: ReleaseFile; label: string }) {
  const ref = useRef<HTMLElement>(null);
  if (!file.sha256) return null;
  return (
    <div className="sum">
      <dt>{label}</dt>
      <dd>
        <code ref={ref} title={file.sha256}>{file.sha256}</code>
        <CopyButton text={file.sha256} target={ref} />
      </dd>
    </div>
  );
}

function PreviewBand({ pre }: { pre: Release }) {
  return (
    <section className="band" id="preview">
      <div className="wrap">
        <SectionHead eyebrow="Pre-release" title={`Try ${pre.version} early`}>
          Released {date(pre.publishedAt)}, ahead of the next stable version. It is not what the install script
          installs by default; name the version to get it. <a href={pre.url}>What is new</a>.
        </SectionHead>
        <Install className="install wide" cmds={installVersion(pre.version)} />
        <div className="platforms compact">
          {pre.hosts.map(h => (
            <a className="platform-link" key={h.id} href={h.files[0].url}>
              <strong>{h.os}</strong> {h.arch} <span>{mb(h.files[0].size)}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function RuntimesBand({ r }: { r: Release }) {
  return (
    <section className="band alt" id="runtimes">
      <div className="wrap">
        <SectionHead eyebrow="Targets" title="Runtime archives">
          The toolchain archives already carry the runtime of every tier-1 and tier-2 target.{" "}
          <code>zell target add &lt;target&gt;</code> downloads one of these into <code>~/.zell/targets</code> and
          checks its SHA-256; you rarely need them by hand.
        </SectionHead>
        <div className="table-scroll">
          <table className="cmp runtimes">
            <thead><tr><th>Target</th><th>Size</th><th>SHA-256</th></tr></thead>
            <tbody>
              {r.runtimes.map(t => (
                <tr key={t.triple}>
                  <th><a href={t.url}><code>{t.triple}</code></a></th>
                  <td>{mb(t.size)}</td>
                  <td><code className="hash">{t.sha256}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
