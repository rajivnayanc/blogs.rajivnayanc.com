# AGENTS.md — Project Context for AI Assistants

## Project Overview

**blogs.rajivnayanc.com** is a personal blog by Rajiv Nayan Choubey covering software engineering, AI, system design, personal achievements, and all things tech.

- **Live URL**: https://blogs.rajivnayanc.com
- **Repo**: https://github.com/rajivnayanc/blogs.rajivnayanc.com

## Tech Stack

| Technology        | Usage                                           |
|-------------------|-------------------------------------------------|
| Next.js 16        | SSG framework (App Router)                      |
| TypeScript        | Type safety                                     |
| MDX               | Blog content (Markdown + React components)      |
| CSS Modules       | Component styling (no Tailwind in pages)         |
| CSS Variables     | Full design token system (light/dark themes)     |
| rehype-pretty-code| Syntax highlighting (one-dark-pro, constant)     |
| next-themes       | Light/dark mode toggle                           |
| next-mdx-remote   | Server-side MDX rendering                        |
| gray-matter       | Frontmatter parsing                              |

## Directory Structure

```
app/                  → Pages and routes (App Router)
  (dev)/              → Admin dashboard (dev-only, excluded from production)
  api/admin/          → Local-only API routes for the writing tool
  blog/               → Blog listing and [slug] pages
  llms.txt/           → AI-friendly content summary
components/           → Reusable UI components
  admin/              → Local writing dashboard components
  analytics/          → Domain-locked Google Analytics
  blog/               → PostCard, TagList, RelatedPosts
  layout/             → Header, Footer (CSS Modules)
  mdx/                → MDX component overrides (extensible for Mermaid, Excalidraw)
  seo/                → JSON-LD structured data
  ui/                 → Shadcn UI primitives, ThemeSwitcher
config/               → siteConfig.ts (single source of truth for all strings)
content/              → Published .mdx blog posts
drafts/               → Unpublished draft .mdx files
lib/                  → Utilities (mdx parser, formatting, etc.)
public/images/posts/  → Post images organized by slug
scripts/              → CLI tools (new-post.js)
types/                → TypeScript interfaces
```

## Coding Standards

1. **No hardcoding**: All colors, spacing, typography, and layout values must use CSS Variables defined in `globals.css`.
2. **No Tailwind in pages**: Tailwind utility classes may only appear inside `components/ui/`. All page-level and layout-level styling uses CSS Modules.
3. **Component-first pages**: `app/` page files should be clean JSX composed of imported components. No inline styles or ad-hoc CSS classes.
4. **Reuse over redundancy**: Before creating a new component, check if an existing one can be reused or extended.
5. **Static generation**: All blog routes use `generateStaticParams`. No server-side rendering at request time.
6. **SEO**: Every page must have proper metadata (title, description, OG tags). Blog posts include JSON-LD structured data.
7. **Config-driven**: All site-wide strings (URLs, names, descriptions) come from `config/site.ts`.
8. **Strict TypeScript (No \`any\`)**: All variables, components, and functions must be strongly typed. The use of the \`any\` keyword is strictly prohibited.

## Important Files

- `config/site.ts` — Central configuration (change site name, author, links, GA ID here)
- `app/globals.css` — Design token system (all CSS Variables for theming)
- `lib/mdx.ts` — MDX post engine (reading, parsing, related posts, slugs)
- `types/post.ts` — Post TypeScript interfaces

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build static site
- `npm run post "Title"` — Create a new blog post with scaffolding
- `npm run post -- --draft "Title"` — Create a draft post

## Admin Dashboard

Access at `http://localhost:3000/admin` during development. Features:
- Write posts with side-by-side preview
- Upload and manage images
- Save drafts and publish
- **This route is excluded from production builds.**
