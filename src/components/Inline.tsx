/** Renders text where `backticks` mark inline code. */
export default function Inline({ text }: { text: string }) {
  return <>{text.split("`").map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))}</>;
}
