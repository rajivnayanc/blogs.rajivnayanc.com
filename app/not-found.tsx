import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.description}>
          The page you are looking for doesn't exist or has been moved.
          Perhaps you can find what you need on the home page.
        </p>
        <Link href="/" className={styles.link}>
          Go back home
        </Link>
      </div>
    </div>
  );
}
