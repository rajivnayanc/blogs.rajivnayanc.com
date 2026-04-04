import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { Button } from "@/components/ui/Button";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          {siteConfig.name}
        </Link>

        <nav className={styles.nav}>
          {siteConfig.nav.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
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
      </div>
    </header>
  );
}
