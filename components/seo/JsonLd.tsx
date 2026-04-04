import { siteConfig } from "@/config/site";
import type { PostFrontmatter } from "@/types/post";

interface ArticleJsonLdProps {
  frontmatter: PostFrontmatter;
  slug: string;
}

/**
 * JSON-LD structured data for blog posts — helps Google understand and
 * display rich search results for your articles.
 */
export function ArticleJsonLd({ frontmatter, slug }: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.date,
    dateModified: frontmatter.date,
    author: {
      "@type": "Person",
      name: frontmatter.author || siteConfig.author.name,
      url: siteConfig.author.links.website,
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.author.name,
    },
    url: `${siteConfig.url}/blog/${slug}`,
    image: frontmatter.image
      ? `${siteConfig.url}${frontmatter.image}`
      : undefined,
    keywords: frontmatter.tags.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * Website-level JSON-LD for the homepage.
 */
export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: siteConfig.author.links.website,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
