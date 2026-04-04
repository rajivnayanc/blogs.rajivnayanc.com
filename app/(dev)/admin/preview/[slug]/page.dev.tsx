import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { getDraftBySlug, getSeriesById, getPostsInSeries } from "@/lib/mdx";
import { getMDXComponents } from "@/components/mdx/MDXComponents";
import { SeriesCard } from "@/components/blog/SeriesCard";
import { formatDate } from "@/lib/utils";
import styles from "@/app/blog/[slug]/page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Draft Preview",
  robots: "noindex, nofollow",
};

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DraftPreviewPage({ params }: PreviewPageProps) {
  const { slug } = await params;
  const post = getDraftBySlug(slug);

  if (!post) {
    notFound();
  }

  const series = post.frontmatter.seriesId ? getSeriesById(post.frontmatter.seriesId) : null;
  const seriesPosts = post.frontmatter.seriesId ? getPostsInSeries(post.frontmatter.seriesId) : [];

  const { frontmatter, content } = post;

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{
        background: '#ef4444',
        color: 'white',
        padding: '0.5rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        fontWeight: 'bold',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        DRAFT PREVIEW MODE — {slug}.mdx
      </div>

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
                      theme: {
                        dark: "one-dark-pro",
                        light: "github-light",
                      },
                      keepBackground: false,
                    },
                  ],
                ],
              },
            }}
          />
        </div>

        <div style={{ marginTop: '4rem', opacity: 0.5 }}>
          <p>Related posts are disabled in preview mode.</p>
        </div>
      </article>
    </div>
  );
}
