import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { getDraftBySlug, getSeriesById, getPostsInSeries } from "@/lib/mdx";
import type { Series, PostMeta } from "@/types/post";
import { rehypeMermaid } from "@/lib/rehype-mermaid";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { getMDXComponents } from "@/components/mdx/MDXComponents";
import { SeriesCard } from "@/components/blog/SeriesCard";
import { formatDate, withBasePath } from "@/lib/utils";
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

  const postSeriesList: { series: Series; posts: PostMeta[] }[] = [];
  
  if (post.frontmatter.series) {
    post.frontmatter.series.forEach(item => {
      const s = getSeriesById(item.id);
      if (s) {
        postSeriesList.push({
          series: s,
          posts: getPostsInSeries(item.id)
        });
      }
    });
  }

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

        {postSeriesList.map(({ series, posts }) => (
          <SeriesCard
            key={series.id}
            series={series}
            posts={posts}
            currentSlug={slug}
          />
        ))}

        {/* Cover Image */}
        {frontmatter.image && (
          <div className={styles.coverImage}>
            <img
              src={withBasePath(frontmatter.image)}
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
                remarkPlugins: [remarkGfm, remarkMath],
                rehypePlugins: [
                  rehypeMermaid,
                  rehypeKatex,
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
