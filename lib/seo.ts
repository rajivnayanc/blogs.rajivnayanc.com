import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { withBasePath } from "./utils";

interface ConstructMetadataProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  tags?: readonly string[] | string[];
}

export function constructMetadata({
  title = siteConfig.title,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  url = "/",
  type = "website",
  publishedTime,
  authors = [siteConfig.author.name],
  tags = siteConfig.defaultTags,
}: ConstructMetadataProps = {}): Metadata {
  const ogImageUrl = withBasePath(image);

  return {
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    authors: authors.map((author) => ({ name: author })),
    creator: siteConfig.author.name,
    keywords: tags as string[],
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [
        {
          url: ogImageUrl,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(type === "article" && authors.length > 0 && { authors }),
      ...(type === "article" && tags.length > 0 && { tags: tags as string[] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: siteConfig.author.handle,
      creator: siteConfig.author.handle,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      "og:logo": withBasePath(siteConfig.logo),
    },
  };
}
