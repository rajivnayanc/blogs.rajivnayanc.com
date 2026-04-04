import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import styles from "./Button.module.css";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  href?: string;
  disabled?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", href, disabled, ...props }, ref) => {
    const combinedClassName = cn(
      styles.btn,
      styles[variant],
      styles[size],
      disabled && styles.disabled,
      className
    );

    if (href) {
      return (
        <Link 
          href={href} 
          className={combinedClassName}
          aria-disabled={disabled}
        >
          {props.children}
        </Link>
      );
    }

    return (
      <button
        className={combinedClassName}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
