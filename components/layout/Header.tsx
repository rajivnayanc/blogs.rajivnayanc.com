"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "@/app/logo.svg";
import { siteConfig } from "@/config/site";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { Button } from "@/components/ui/Button";
import styles from "./Header.module.css";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo — always visible on left */}
        <Link href="/" className={styles.logoLink} aria-label="Home">
          <Image
            src={logo}
            alt={`${siteConfig.name} logo`}
            width={36}
            height={36}
            className={styles.logoImage}
            priority
          />
          <span className={styles.logoText}>{siteConfig.name}</span>
        </Link>

        {/* Mobile center brand name (visible only on mobile) */}
        <span className={styles.mobileBrand}>{siteConfig.name}</span>

        {/* Desktop nav — hidden on mobile */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {siteConfig.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ""}`}
            >
              {link.label}
            </Link>
          ))}
          {process.env.NODE_ENV === "development" && (
            <Button href="/admin" size="sm" variant="primary">
              Admin
            </Button>
          )}
          <ThemeSwitcher />
        </nav>

        {/* Hamburger button — visible only on mobile */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ""}`}
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          id="hamburger-toggle"
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
      </div>

      {/* Mobile overlay + menu */}
      {menuOpen && (
        <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}
      <nav
        id="mobile-menu"
        className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ""}`}
        aria-label="Mobile navigation"
      >
        {siteConfig.nav.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.mobileNavLink} ${pathname === link.href ? styles.mobileNavLinkActive : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        <div className={styles.mobileNavDivider} />

        {/* Social links in mobile menu */}
        <div className={styles.mobileNavSocials}>
          {Object.entries(siteConfig.author.links).map(([name, url]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileSocialLink}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </a>
          ))}
        </div>

        <div className={styles.mobileNavDivider} />

        <div className={styles.mobileNavActions}>
          <ThemeSwitcher />
          {process.env.NODE_ENV === "development" && (
            <Button href="/admin" size="sm" variant="primary">
              Admin
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
