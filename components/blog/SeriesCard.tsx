"use client";

import { useState } from "react";
import type { Series, PostMeta } from "@/types/post";
import Link from "next/link";
import { cn, withBasePath } from "@/lib/utils";
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
  const [copied, setCopied] = useState(false);
  
  // For navigator, find current index
  const currentIndex = isNavigator ? posts.findIndex((p) => p.slug === currentSlug) : -1;
  
  const previousPost = isNavigator && currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = isNavigator && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window === "undefined") return;
    const shareUrl = `${window.location.origin}/series/${series.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div id={series.id} className={cn(styles.card, !isNavigator && styles.cardOverview)}>
      {series.image && (
        <Link href={`/series/${series.id}`} className={styles.bannerLink}>
          <div className={styles.cardBanner}>
            <img 
              src={withBasePath(series.image)} 
              alt={series.name} 
              className={styles.bannerImg}
              loading="lazy"
            />
          </div>
        </Link>
      )}
      <div className={styles.header}>
        <span className={styles.badge}>Series</span>
        <Link href={`/series/${series.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{series.name}</h3>
        </Link>
        <button 
          className={styles.copyBtn} 
          onClick={handleCopyLink}
          title="Copy link to series"
          aria-label="Copy link to series"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </button>
        {copied && <span className={styles.copiedTooltip}>Link Copied!</span>}
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
