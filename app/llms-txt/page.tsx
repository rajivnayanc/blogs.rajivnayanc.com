import { getAllPosts } from "@/lib/mdx";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "llms.txt",
  robots: { index: false },
};

/**
 * llms.txt page — AI-friendly content summary.
 * Statically generated at build time.
 * Renders as plain text in a <pre> block.
 */
export default function LlmsTxtPage() {
  const posts = getAllPosts();

  const text = [
    `# ${siteConfig.name}`,
    ``,
    `> ${siteConfig.description}`,
    ``,
    `## About`,
    `Author: ${siteConfig.author.name}`,
    `Website: ${siteConfig.url}`,
    `Topics: Software Engineering, AI, System Design, Personal Achievements, Tech`,
    ``,
    `## Blog Posts`,
    ``,
    ...posts.map(
      (post) =>
        `- [${post.frontmatter.title}](${siteConfig.url}/blog/${post.slug}): ${post.frontmatter.description}`
    ),
    ``,
    `## Links`,
    `- Website: ${siteConfig.author.links.website}`,
    `- LinkedIn: ${siteConfig.author.links.linkedin}`,
    `- Twitter: ${siteConfig.author.links.twitter}`,
    `- GitHub: ${siteConfig.author.links.github}`,
  ].join("\n");

  return (
    <pre
      style={{
        whiteSpace: "pre-wrap",
        fontFamily: "var(--font-mono)",
        padding: "2rem",
        maxWidth: "var(--content-width)",
        margin: "0 auto",
      }}
    >
      {text}
    </pre>
  );
}
