import Inline from "../../components/Inline";

/** A doc comment: paragraphs separated by blank lines, `backticks` as code. */
export default function DocText({ text }: { text: string }) {
  if (!text) return null;
  return (
    <>
      {text.split(/\n\s*\n/).map((p, i) => (
        <p key={i}><Inline text={p.replace(/\s*\n\s*/g, " ")} /></p>
      ))}
    </>
  );
}
