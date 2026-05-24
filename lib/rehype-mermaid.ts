/**
 * Custom Rehype plugin to process Mermaid code blocks.
 * It intercepts <pre><code class="language-mermaid">...</code></pre> nodes,
 * extracts the raw mermaid chart text, and transforms them into <mermaid-diagram chart="..."></mermaid-diagram>
 * so that they skip syntax highlighting and can be rendered by a client-side component.
 */
export function rehypeMermaid() {
  return (tree: any) => {
    const walk = (node: any) => {
      if (!node || typeof node !== "object") return;

      if (node.children && Array.isArray(node.children)) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (
            child.type === "element" &&
            child.tagName === "pre" &&
            child.children &&
            child.children.length === 1 &&
            child.children[0].tagName === "code"
          ) {
            const codeNode = child.children[0];
            const className = codeNode.properties?.className;
            const isMermaid =
              Array.isArray(className) &&
              className.some(
                (c) => c === "language-mermaid" || c === "mermaid"
              );

            if (isMermaid) {
              // Extract the raw text from the code children
              let chartText = "";
              if (codeNode.children && codeNode.children.length > 0) {
                chartText = codeNode.children
                  .map((c: any) => c.value || "")
                  .join("");
              }

              // Replace the 'pre' node with a custom 'mermaid-diagram' element
              node.children[i] = {
                type: "element",
                tagName: "mermaid-diagram",
                properties: {
                  chart: chartText.trim(),
                },
                children: [],
              };
              continue; // Skip walking children of the replaced node
            }
          }
          walk(child);
        }
      }
    };

    walk(tree);
  };
}
