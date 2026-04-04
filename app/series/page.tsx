import { getAllSeries, getPostsInSeries } from "@/lib/mdx";
import { SeriesCard } from "@/components/blog/SeriesCard";
import styles from "./page.module.css";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Series",
  description: `Deep-dive blog series on ${siteConfig.name}.`,
};

export default function SeriesPage() {
  const allSeries = getAllSeries();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Series</h1>
        <p className={styles.description}>
          Curated deep-dive series and multi-part articles.
        </p>
      </header>

      {allSeries.length === 0 ? (
        <p className={styles.empty}>No series available yet.</p>
      ) : (
        <div className={styles.grid}>
          {allSeries.map((series) => {
            const posts = getPostsInSeries(series.id);
            if (posts.length === 0) return null;

            return (
              <SeriesCard 
                key={series.id} 
                series={series} 
                posts={posts} 
                variant="overview" 
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
