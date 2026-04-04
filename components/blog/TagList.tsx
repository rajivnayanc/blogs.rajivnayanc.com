import Link from "next/link";
import styles from "./TagList.module.css";

interface TagListProps {
  tags: string[];
  activeTag?: string;
}

export function TagList({ tags, activeTag }: TagListProps) {
  return (
    <div className={styles.list}>
      <Link
        href="/blog"
        className={`${styles.tag} ${!activeTag ? styles.active : ""}`}
      >
        All
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/blog?tag=${encodeURIComponent(tag)}`}
          className={`${styles.tag} ${activeTag === tag ? styles.active : ""}`}
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
