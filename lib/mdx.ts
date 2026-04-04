import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { Post, PostMeta } from "@/types/post";

const CONTENT_DIR = path.join(process.cwd(), "content");
const DRAFTS_DIR = path.join(process.cwd(), "drafts");

/**
 * Get a single draft by slug.
 */
export function getDraftBySlug(slug: string): Post | null {
  const filePath = path.join(DRAFTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    frontmatter: data as Post["frontmatter"],
    content,
    readingTime: readingTime(content).text,
  };
}

/**
 * Check if a slug is available for a new post.
 * If originalSlug is provided, it's considered available if slug matches originalSlug.
 */
export function isSlugAvailable(slug: string, originalSlug?: string): boolean {
  if (originalSlug && slug === originalSlug) return true;
  
  const contentPath = path.join(CONTENT_DIR, `${slug}.mdx`);
  const draftPath = path.join(DRAFTS_DIR, `${slug}.mdx`);
  
  return !fs.existsSync(contentPath) && !fs.existsSync(draftPath);
}

/**
 * Generate a unique slug by appending a suffix if the base slug is taken.
 */
export function getUniqueSlug(baseSlug: string, originalSlug?: string): string {
  if (isSlugAvailable(baseSlug, originalSlug)) return baseSlug;
  
  let counter = 1;
  let newSlug = `${baseSlug}-${counter}`;
  
  while (!isSlugAvailable(newSlug, originalSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }
  
  return newSlug;
}

/**
 * Get all published posts sorted by date (newest first).
 */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"));

  const posts = files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      return getPostBySlug(slug);
    })
    .filter((post): post is Post => post !== null && post.frontmatter.published)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );

  return posts;
}

/**
 * Get lightweight metadata for all published posts (no content body).
 */
export function getAllPostsMeta(): PostMeta[] {
  return getAllPosts().map(({ slug, frontmatter, readingTime: rt }) => ({
    slug,
    frontmatter,
    readingTime: rt,
  }));
}

/**
 * Get a single post by slug.
 */
export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    frontmatter: data as Post["frontmatter"],
    content,
    readingTime: readingTime(content).text,
  };
}

/**
 * Get all unique tags across published posts.
 */
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = new Set<string>();
  posts.forEach((post) =>
    post.frontmatter.tags?.forEach((tag) => tags.add(tag))
  );
  return Array.from(tags).sort();
}

/**
 * Get related posts based on overlapping tags.
 */
export function getRelatedPosts(
  currentSlug: string,
  limit = 3
): PostMeta[] {
  const current = getPostBySlug(currentSlug);
  if (!current) return [];

  const currentTags = new Set(current.frontmatter.tags);
  const allPosts = getAllPostsMeta().filter((p) => p.slug !== currentSlug);

  const scored = allPosts.map((post) => {
    const overlap = post.frontmatter.tags.filter((t) =>
      currentTags.has(t)
    ).length;
    return { post, overlap };
  });

  return scored
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((s) => s.post);
}

/**
 * Get all slugs for static generation.
 */
export function getAllSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

import type { Series } from "@/types/post";

export function getAllSeries(): Series[] {
  const file = path.join(CONTENT_DIR, "series.json");
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf-8");
  try {
    return JSON.parse(raw) as Series[];
  } catch {
    return [];
  }
}

export function getSeriesById(id: string): Series | null {
  return getAllSeries().find((p) => p.id === id) || null;
}

export function getPostsInSeries(seriesId: string): PostMeta[] {
  return getAllPostsMeta()
    .filter((p) => p.frontmatter.seriesId === seriesId)
    .sort((a, b) => {
      const orderA = a.frontmatter.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.frontmatter.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
}
