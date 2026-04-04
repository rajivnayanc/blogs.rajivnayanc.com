// TypeScript definitions for blog posts.
// All frontmatter fields and computed properties are typed here.

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string; // ISO 8601 format: "2026-04-04"
  tags: string[];
  image?: string; // Path relative to /public, e.g. "/images/posts/my-post/cover.jpg"
  published: boolean;
  author?: string;
  seriesId?: string;
  seriesOrder?: number;
}

export interface Series {
  id: string;
  name: string;
  description: string;
}

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string; // Raw MDX string
  readingTime: string; // e.g. "5 min read"
}

export interface PostMeta {
  slug: string;
  frontmatter: PostFrontmatter;
  readingTime: string;
}
