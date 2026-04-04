import { siteConfig } from "@/config/site";
import styles from "./Footer.module.css";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.links}>
          {Object.entries(siteConfig.author.links).map(([key, url]) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </a>
          ))}
        </div>
        <p className={styles.copyright}>
          &copy; {currentYear} {siteConfig.author.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
