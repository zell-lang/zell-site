// Components available in every docs page without an import, and the mapping of plain
// Markdown elements (links, code fences, tables) onto the site's own components.
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import type { MDXComponents } from "mdx/types";
import Install from "../../components/Install";
import { LATEST } from "../../site";
import Example from "./Example";
import Callout from "./Callout";
import { MdxPre } from "./CodeBlock";

function A({ href = "", children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith("/") || href.startsWith("#")) return <Link to={href}>{children}</Link>;
  return <a href={href} {...rest}>{children}</a>;
}

function Table({ children }: { children?: ReactNode }) {
  return <div className="table-scroll"><table className="cmp doc-table">{children}</table></div>;
}

/** The current release version, from GitHub at build time. */
const Version = () => <>{LATEST.version}</>;

/** The install command with an OS switch, as on the home page. */
const InstallCommand = () => <Install className="install wide" />;

export const mdxComponents: MDXComponents = {
  a: A,
  pre: MdxPre,
  table: Table,
  Example,
  Callout,
  Version,
  InstallCommand,
};
