"use client";

import { useSearchParams } from "next/navigation";
import { PostCard } from "@/components/blog/PostCard";
import { TagList } from "@/components/blog/TagList";
import type { PostMeta } from "@/types/post";
import styles from "./page.module.css";
import { Suspense } from "react";

interface BlogClientProps {
  allPosts: PostMeta[];
  allTags: string[];
}

function BlogContent({ allPosts, allTags }: BlogClientProps) {
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag");

  const filteredPosts = tag
    ? allPosts.filter((p) => p.frontmatter.tags.includes(tag))
    : allPosts;

  return (
    <>
      <TagList tags={allTags} activeTag={tag || undefined} />

      {filteredPosts.length === 0 ? (
        <p className={styles.empty}>No posts found. Check back soon!</p>
      ) : (
        <div className={styles.grid}>
          {filteredPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  );
}

export function BlogClient({ allPosts, allTags }: BlogClientProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogContent allPosts={allPosts} allTags={allTags} />
    </Suspense>
  );
}
