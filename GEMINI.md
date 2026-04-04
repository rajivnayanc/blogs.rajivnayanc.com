# GEMINI.md — Instructions for Gemini / Antigravity

@AGENTS.md

## Gemini-Specific Guidelines

1. **Design Tokens First**: When making any visual change, always modify CSS Variables in `globals.css` rather than adding inline styles or new CSS rules.
2. **Use StitchMCP**: For generating new UI layouts or components, prefer using the StitchMCP tools to ensure mobile-first responsive design.
3. **MDX Components**: When adding support for new interactive elements (Mermaid, Excalidraw, etc.), add them to `components/mdx/MDXComponents.tsx` as part of the registry.
4. **Code Theme**: Syntax highlighting uses `one-dark-pro` theme. Do not change this — it must remain constant across all environments.
5. **Static Export**: This site uses `output: 'export'` in production. All routes must be statically generatable. No server-side rendering at request time.
6. **API Routes**: The `app/api/admin/` routes are dev-only utilities. They will not exist in production builds due to `output: 'export'`.
7. **llms.txt**: When adding new content types or pages, update the llms.txt route at `app/llms.txt/route.ts` to include them.
8. **Strict TypeScript**: Do not use the \`any\` type anywhere in the codebase. Every interface and type must be properly defined.
