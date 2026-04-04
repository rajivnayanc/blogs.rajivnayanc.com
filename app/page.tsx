import Link from "next/link";
import { getAllPostsMeta } from "@/lib/mdx";
import { PostCard } from "@/components/blog/PostCard";
import { Button } from "@/components/ui/Button";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import styles from "./page.module.css";

export default function HomePage() {
  const posts = getAllPostsMeta().slice(0, 6);

  return (
    <>
      <WebsiteJsonLd />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Hi, I&apos;m{" "}
            <span className={styles.heroHighlight}>
              {siteConfig.author.name.split(" ")[0]}
            </span>
          </h1>
          <p className={styles.heroDescription}>{siteConfig.author.bio}</p>
          <div className={styles.heroLinks}>
            <Button href="/blog" size="lg">
              Read the Blog →
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section className={styles.postsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Latest Posts</h2>
            <Button href="/blog" variant="link">
              View all →
            </Button>
          </div>
          <div className={styles.postsGrid}>
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
