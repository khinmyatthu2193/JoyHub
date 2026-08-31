# Development

## Prerequisites and setup

Use a current Node.js/npm version supported by the installed Vite release. Dependencies are locked in `package-lock.json`.

```bash
npm install
npm run dev
```

Vite serves the application locally and provides hot module replacement. No environment variables, external services, seed command, or backend process are required. Browser local storage is device- and origin-specific; clearing site data resets saved quizzes/settings/game state to their fallbacks.

## Available commands

| Command | Purpose | Repository status |
| --- | --- | --- |
| `npm run dev` | Start the Vite development server | Configured |
| `npm run build` | Run TypeScript project builds, then create `dist/` with Vite | Configured |
| `npm run preview` | Serve the production build locally | Configured; run after build |
| `npm run lint` | Run ESLint across the repository | Script exists, but no ESLint config is committed, so it currently fails |

There is no separate type-check script; `npm run build` runs `tsc -b` before Vite. There is no test script or committed unit/end-to-end test setup. Until one is intentionally added, validate affected user flows manually in addition to running the build. Do not claim `npm run lint` passed unless a compatible configuration has been added and the command actually succeeds.

## Configuration

- `vite.config.ts`: React plugin only; no aliases or custom server/build behavior.
- `tsconfig.app.json`: strict TypeScript, browser/ES2022 libraries, bundler resolution, isolated modules, and no emit.
- `tsconfig.node.json`: composite configuration for `vite.config.ts`.
- `tailwind.config.js`: scans the HTML entry point and source JS/TS/JSX/TSX files; no theme extensions or plugins.
- `postcss.config.js`: Tailwind CSS and Autoprefixer.

Generated `dist/`, TypeScript build info, and emitted `vite.config.js`/`.d.ts` files are ignored and should not be edited. Keep `package-lock.json` aligned only when dependencies are deliberately changed.

## Manual verification

For behavior changes, exercise the relevant path through quiz creation/editing, classroom setup, wheel selection, card answering, completion, restart/end, and refresh restoration. For UI changes, check keyboard use, reduced motion, a narrow layout, and a wide classroom/projector layout. Use a fresh browser profile or clear only JoyHub’s versioned local-storage entries when testing first-run behavior.

## Deployment

No deployment-provider, container, or CI configuration is committed. `npm run build` produces a static `dist/` directory suitable for a static host, but provider-specific base paths, caching, headers, and SPA fallback behavior are not defined here. Because navigation is state-driven rather than URL-routed, server rewrite rules are not currently required for client routes.
