/**
 * Custom MDX component overrides.
 * These are passed to next-mdx-remote to replace default HTML elements
 * with styled React components. Modular — add new components here as needed
 * (e.g., Mermaid, Excalidraw, interactive diagrams).
 */

import type { MDXComponents } from "mdx/types";
import { Pre } from "./Pre";

export function getMDXComponents(): MDXComponents {
  return {
    // Override default elements to use prose styling
    pre: (props) => <Pre {...props} />,
    h1: (props) => <h1 {...props} />,
    h2: (props) => <h2 {...props} />,
    h3: (props) => <h3 {...props} />,
    h4: (props) => <h4 {...props} />,
    p: (props) => <p {...props} />,
    a: (props) => (
      <a
        {...props}
        target={props.href?.startsWith("http") ? "_blank" : undefined}
        rel={
          props.href?.startsWith("http") ? "noopener noreferrer" : undefined
        }
      />
    ),
    img: (props) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img {...props} alt={props.alt || ""} loading="lazy" />
    ),
    // Callout / Admonition component for tips, warnings, etc.
    Callout: ({
      type = "info",
      children,
    }: {
      type?: "info" | "warning" | "tip" | "danger";
      children: React.ReactNode;
    }) => <div className={`callout callout-${type}`}>{children}</div>,
    // Placeholder for future Mermaid diagram support
    // Mermaid: ({ chart }: { chart: string }) => <MermaidDiagram chart={chart} />,
  };
}
