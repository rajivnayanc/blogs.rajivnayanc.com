import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { PostMeta } from "@/types/post";
import styles from "./PostCard.module.css";

interface PostCardProps {
  post: PostMeta;
}

export function PostCard({ post }: PostCardProps) {
  const { slug, frontmatter, readingTime } = post;

  return (
    <article className={styles.card}>
      <Link href={`/blog/${slug}`} className={styles.link}>
        {frontmatter.image && (
          <div className={styles.imageWrapper}>
            <img
              src={frontmatter.image}
              alt={frontmatter.title}
              className={styles.image}
              loading="lazy"
            />
          </div>
        )}
        <div className={styles.content}>
          <div className={styles.meta}>
            <time dateTime={frontmatter.date}>
              {formatDate(frontmatter.date)}
            </time>
            <span className={styles.dot}>·</span>
            <span>{readingTime}</span>
          </div>
          <h2 className={styles.title}>{frontmatter.title}</h2>
          <p className={styles.description}>{frontmatter.description}</p>
          <div className={styles.tags}>
            {frontmatter.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}
