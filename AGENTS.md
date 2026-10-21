<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- Install with `npm ci`. Start the app with `npm run dev` (binds `0.0.0.0:3000`). `dev` and `build` sync `content/reports` into gitignored `public/raw-reports` before Next starts.
- Checks: `npm run lint`, then `npm run build`. There is no test suite. ESLint ignores generated `.source/` and vendored `content/.obsidian/` bundles.
- MDX treats a raw `<` glued to a digit (`<100`) as JSX and fails the whole site. Write `&lt;` in prose.
