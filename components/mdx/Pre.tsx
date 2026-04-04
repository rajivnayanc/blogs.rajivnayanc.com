"use client";

import { useRef, useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import styles from "./Pre.module.css";

export function Pre({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (preRef.current) {
      const text = preRef.current.textContent || "";
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        onClick={handleCopy}
        className={styles.copyButton}
        aria-label="Copy code"
      >
        {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
      </button>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
    </div>
  );
}
