// Central site configuration — the single source of truth for all hardcoded strings.
// All pages, components, and metadata should import values from here.

export const siteConfig = {
  name: "Rajiv's Blog",
  title: "Blogs by Rajiv",
  description:
    "Software engineering, AI, system design, personal achievements, and everything tech — by Rajiv Nayan Choubey.",
  url: "https://blogs.rajivnayanc.com",
  author: {
    name: "Rajiv Nayan Choubey",
    handle: "@rajivnayanc",
    email: "rajivnayanc.business@gmail.com",
    bio: "Software Engineer exploring AI, system design, and the art of building great products.",
    avatar: "/images/avatar.jpg",
    links: {
      website: "https://rajivnayanc.com",
      linkedin: "https://www.linkedin.com/in/rajivnayanc",
      twitter: "https://x.com/rajivnayanc",
      github: "https://github.com/rajivnayanc",
    },
  },
  locale: "en-US",
  // Google Analytics — only fires on the production domain
  analytics: {
    gaId: "G-2Y5J39W5CH", // Set your GA Measurement ID here (e.g. "G-XXXXXXXXXX")
    allowedHostname: "blogs.rajivnayanc.com",
  },
  // Navigation links
  nav: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Series", href: "/series" },
  ],
  // Post categories/tags for the blog
  defaultTags: [
    "Software Engineering",
    "AI",
    "System Design",
    "Personal",
    "Tech",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
