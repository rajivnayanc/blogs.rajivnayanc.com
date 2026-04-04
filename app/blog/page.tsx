import { getAllPostsMeta, getAllTags } from "@/lib/mdx";
import { BlogClient } from "./BlogClient";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description: `All posts on ${siteConfig.name} — software engineering, AI, system design, and more.`,
};

export default function BlogPage() {
  const allPosts = getAllPostsMeta();
  const allTags = getAllTags();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.description}>
          Thoughts on software engineering, AI, system design, and everything tech.
        </p>
      </header>

      <BlogClient allPosts={allPosts} allTags={allTags} />
    </div>
  );
}
