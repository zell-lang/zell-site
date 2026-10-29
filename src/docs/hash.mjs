// FNV-1a over an example's files, shared by scripts/check-examples.mjs and the Example component,
// so the page can tell whether the sources it shows are the ones that were checked.

/** @param {Record<string, string>} files path -> contents (LF line endings) */
export function sourceHash(files) {
  let h = 0x811c9dc5;
  for (const path of Object.keys(files).sort()) {
    const s = `${path}\n${files[path]}\n`;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
  }
  return h.toString(16).padStart(8, "0");
}
