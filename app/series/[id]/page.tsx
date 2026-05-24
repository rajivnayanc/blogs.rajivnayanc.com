import { notFound } from "next/navigation";
import { getSeriesById, getPostsInSeries, getAllSeries } from "@/lib/mdx";
import { PostCard } from "@/components/blog/PostCard";
import { constructMetadata } from "@/lib/seo";
import { withBasePath } from "@/lib/utils";
import type { Metadata } from "next";
import styles from "./page.module.css";
import { cn } from "@/lib/utils";

interface SeriesDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const allSeries = getAllSeries();
  return allSeries.map((s) => ({
    id: s.id,
  }));
}

export async function generateMetadata({ params }: SeriesDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const series = getSeriesById(id);
  
  if (!series) {
    return {};
  }
  
  return constructMetadata({
    title: `${series.name} | Series`,
    description: series.description,
    image: series.image || "/og_image.png",
    url: `/series/${series.id}`,
  });
}

export default async function SeriesDetailPage({ params }: SeriesDetailPageProps) {
  const { id } = await params;
  const series = getSeriesById(id);
  
  if (!series) {
    notFound();
  }
  
  const posts = getPostsInSeries(id);
  const hasBanner = !!series.image;
  
  return (
    <div className={styles.container}>
      {/* Series Banner / Hero */}
      <section className={cn(styles.hero, hasBanner && styles.heroWithBanner)}>
        {series.image && (
          <div className={styles.bannerContainer}>
            <img 
              src={withBasePath(series.image)} 
              alt={series.name} 
              className={styles.bannerImage}
            />
            <div className={styles.bannerOverlay} />
          </div>
        )}
        <div className={styles.heroContent}>
          <span className={styles.badge}>Series</span>
          <h1 className={styles.title}>{series.name}</h1>
          <p className={styles.description}>{series.description}</p>
          <span className={styles.meta}>{posts.length} {posts.length === 1 ? "Chapter" : "Chapters"}</span>
        </div>
      </section>

      {/* Chapters / Posts Grid */}
      <section className={styles.chaptersSection}>
        <h2 className={styles.sectionTitle}>Chapters</h2>
        {posts.length === 0 ? (
          <p className={styles.empty}>No articles published in this series yet.</p>
        ) : (
          <div className={styles.postsGrid}>
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
