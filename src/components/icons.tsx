export const Logo = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <rect width="32" height="32" rx="4" fill="var(--accent)" />
    <path d="M9 10h14L9 22h14" fill="none" stroke="var(--accent-fg)" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

export const GitHubIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

/** Stroke icons for the tooling grid, drawn on a 24×24 box. */
const stroke = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, "aria-hidden": true } as const;

export const ToolIcons = {
  terminal: <svg {...stroke}><path d="M4 17l6-5-6-5M12 19h8" /></svg>,
  editor: <svg {...stroke}><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M3 9h18M8 13l2 2-2 2M12 17h4" /></svg>,
  package: <svg {...stroke}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></svg>,
  globe: <svg {...stroke}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></svg>,
  flask: <svg {...stroke}><path d="M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3" /></svg>,
  bug: <svg {...stroke}><path d="M8 4h8l1 3h3v4H4V7h3l1-3zM6 11v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-6M12 14v3" /></svg>,
};
