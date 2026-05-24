"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Handle client-side mounting to avoid server/client hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let isMounted = true;
    
    // Initialize Mermaid based on the resolved dark or light theme
    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === "dark" ? "dark" : "default",
      securityLevel: "loose",
      themeVariables: {
        fontFamily: "var(--font-sans)",
      }
    });

    const renderChart = async () => {
      if (!elementRef.current) return;
      try {
        const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const cleanChart = chart.trim();
        const { svg: renderedSvg } = await mermaid.render(uniqueId, cleanChart);
        if (isMounted) {
          setSvg(renderedSvg);
          setError("");
        }
      } catch (err: any) {
        console.error("Mermaid parsing error:", err);
        if (isMounted) {
          setError(err?.message || "Failed to render Mermaid diagram");
        }
      }
    };

    renderChart();
    return () => {
      isMounted = false;
    };
  }, [chart, resolvedTheme, mounted]);

  if (!mounted) {
    return (
      <div style={{ display: "flex", justifyContent: "center", margin: "2rem 0", opacity: 0.5 }}>
        Loading diagram...
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="mermaid-error" 
        style={{ 
          color: "hsl(var(--destructive))", 
          padding: "1.5rem", 
          border: "1px solid hsl(var(--border))", 
          borderRadius: "var(--radius-lg)",
          margin: "2rem 0",
          backgroundColor: "hsl(var(--muted) / 0.3)"
        }}
      >
        <p style={{ fontWeight: 600 }}>Mermaid Render Error</p>
        <pre style={{ fontSize: "var(--font-size-sm)", fontFamily: "var(--font-mono)", whiteSpace: "pre-wrap", marginTop: "var(--space-2)", opacity: 0.8 }}>{error}</pre>
      </div>
    );
  }

  return (
    <div 
      ref={elementRef} 
      className="mermaid-wrapper" 
      style={{ display: "flex", justifyContent: "center", margin: "2rem 0", background: "transparent", overflowX: "auto", maxWidth: "100%" }}
      dangerouslySetInnerHTML={{ __html: svg || '<div style="opacity: 0.5;">Loading diagram...</div>' }}
    />
  );
}
