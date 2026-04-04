import { PostCard } from "./PostCard";
import type { PostMeta } from "@/types/post";
import styles from "./RelatedPosts.module.css";

interface RelatedPostsProps {
  posts: PostMeta[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Related Posts</h2>
      <div className={styles.grid}>
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
