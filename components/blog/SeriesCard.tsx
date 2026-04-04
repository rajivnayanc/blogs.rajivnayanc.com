import type { Series, PostMeta } from "@/types/post";
import Link from "next/link";
import { cn } from "@/lib/utils";
import styles from "./SeriesCard.module.css";

interface SeriesCardProps {
  series: Series;
  posts: PostMeta[];
  currentSlug?: string;
  variant?: "overview" | "navigator";
}

export function SeriesCard({ 
  series, 
  posts, 
  currentSlug, 
  variant = "navigator" 
}: SeriesCardProps) {
  const isNavigator = variant === "navigator";
  
  // For navigator, find current index
  const currentIndex = isNavigator ? posts.findIndex((p) => p.slug === currentSlug) : -1;
  
  const previousPost = isNavigator && currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = isNavigator && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return (
    <div className={cn(styles.card, !isNavigator && styles.cardOverview)}>
      <div className={styles.header}>
        <span className={styles.badge}>Series</span>
        <h3 className={styles.title}>{series.name}</h3>
      </div>
      
      <p className={styles.description}>{series.description}</p>
      
      {posts.length > 0 && (
        <>
          <h4 className={styles.subheading}>Chapters</h4>
          <ol className={styles.postList}>
            {posts.map((post, i) => {
              const isCurrent = isNavigator && post.slug === currentSlug;
              const postNumber = (i + 1).toString().padStart(2, "0");
              
              return (
                <li key={post.slug} className={cn(styles.postItem, isCurrent && styles.current)}>
                  {isCurrent ? (
                    <span className={styles.postLink}>
                      <span className={styles.postNumber}>{postNumber}</span>
                      <span className={styles.postTitle}>{post.frontmatter.title}</span>
                    </span>
                  ) : (
                    <Link href={`/blog/${post.slug}`} className={styles.postLink}>
                      <span className={styles.postNumber}>{postNumber}</span>
                      <span className={styles.postTitle}>{post.frontmatter.title}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      )}

      {isNavigator && (previousPost || nextPost) && (
        <div className={styles.navigation}>
          {previousPost ? (
            <Link href={`/blog/${previousPost.slug}`} className={styles.navBtn}>
              ← Previous: {previousPost.frontmatter.title}
            </Link>
          ) : <span />}
          
          {nextPost ? (
            <Link href={`/blog/${nextPost.slug}`} className={cn(styles.navBtn, styles.nextBtn)}>
              Next: {nextPost.frontmatter.title} →
            </Link>
          ) : <span />}
        </div>
      )}
    </div>
  );
}
