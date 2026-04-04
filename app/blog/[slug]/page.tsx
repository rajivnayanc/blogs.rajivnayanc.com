import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { getPostBySlug, getAllSlugs, getRelatedPosts, getSeriesById, getPostsInSeries } from "@/lib/mdx";
import { getMDXComponents } from "@/components/mdx/MDXComponents";
import { ArticleJsonLd } from "@/components/seo/JsonLd";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { SeriesCard } from "@/components/blog/SeriesCard";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";
import styles from "./page.module.css";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Static generation — all slugs are resolved at build time.
 */
export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Dynamic metadata for SEO — each post gets its own title, description, and OG tags.
 */
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const { frontmatter } = post;
  return {
    title: frontmatter.title,
    description: frontmatter.description,
    keywords: frontmatter.tags,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: "article",
      publishedTime: frontmatter.date,
      authors: [frontmatter.author || siteConfig.author.name],
      tags: frontmatter.tags,
      images: frontmatter.image ? [frontmatter.image] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
      images: frontmatter.image ? [frontmatter.image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug, 3);
  
  const series = post.frontmatter.seriesId ? getSeriesById(post.frontmatter.seriesId) : null;
  const seriesPosts = post.frontmatter.seriesId ? getPostsInSeries(post.frontmatter.seriesId) : [];

  const { frontmatter, content } = post;

  return (
    <>
      <ArticleJsonLd frontmatter={frontmatter} slug={slug} />

      <article className={styles.article}>
        <header className={styles.header}>
          <div className={styles.meta}>
            <time dateTime={frontmatter.date}>
              {formatDate(frontmatter.date)}
            </time>
            <span className={styles.dot}>·</span>
            <span>{post.readingTime}</span>
          </div>
          <h1 className={styles.title}>{frontmatter.title}</h1>
          <p className={styles.description}>{frontmatter.description}</p>
          <div className={styles.tags}>
            {frontmatter.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </header>

        {series && seriesPosts.length > 0 && (
          <SeriesCard series={series} posts={seriesPosts} currentSlug={slug} />
        )}

        {/* Cover Image */}
        {frontmatter.image && (
          <div className={styles.coverImage}>
            <img
              src={frontmatter.image}
              alt={frontmatter.title}
              loading="eager"
            />
          </div>
        )}

        {/* MDX Content */}
        <div className="prose">
          <MDXRemote
            source={content}
            components={getMDXComponents()}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  [
                    rehypePrettyCode,
                    {
                      theme: "one-dark-pro",
                      keepBackground: true,
                    },
                  ],
                ],
              },
            }}
          />
        </div>

        {/* Related Posts */}
        <RelatedPosts posts={relatedPosts} />
      </article>
    </>
  );
}
