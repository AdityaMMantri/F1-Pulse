# Project structure

The files at the app root are tool entry points, not loose application code. Keep them here so npm, Vite, TypeScript, Git, and Oxlint find their configuration without extra flags.

## Root files explained

| File | Purpose |
|---|---|
| `package.json` | Project dependencies and commands such as `npm run dev`, `build`, and `test:api`. |
| `package-lock.json` | Locks the installed dependency versions for reproducible installs. Commit it together with dependency changes. |
| `index.html` | Vite's HTML entry point, containing the React mount element and application script. |
| `vite.config.ts` | React build integration and the `/api` proxy to the local backend. |
| `tsconfig.json` | Connects the application and tooling TypeScript configurations. |
| `tsconfig.app.json` | TypeScript settings for React source code in `src/`. |
| `tsconfig.node.json` | TypeScript settings for tooling such as `vite.config.ts`. |
| `.oxlintrc.json` | Lint rules, including React hooks checks. |
| `.gitignore` | Prevents dependencies, builds, logs, and runtime data from entering Git. |
| `README.md` | Main project introduction, screenshots, setup, HCI principles, and usage. |

## Where files belong

```text
F1/
  src/                    React application
    components/           Shared interface components
    pages/                Page views and comparison features
    garage/               3D model, design editor, and Garage client
    data/                 Snapshots, racing adapter, and shared season state
    assets/               Driver images, team logos, and circuit maps
    styles/               Shared visual styles
  public/                 Public static files
  server/                 Backend implementation
    data/                 Generated saves and racing cache (Git-ignored)
  tests/
    server/               Backend integration tests
  scripts/                Development launcher
  docs/
    HCI-IMPLEMENTATION.md Principle map and demonstration guide
    PROJECT-STRUCTURE.md  This guide
    ASSETS.md             Earlier asset-source notes
    reference/            Assignment reference documents
    previews/             Screenshots used by the current README
      archive/            Previous design and verification screenshots
  dist/                   Generated frontend build (Git-ignored)
  node_modules/           Installed dependencies (Git-ignored)
```

`ASSETS.md` contains historical descriptions of earlier iterations. Use the current README for the implemented feature set and current asset limitations.

## Organisation rules

- Add interface code under `src/`, backend code under `server/`, and backend tests under `tests/server/`.
- Keep current README screenshots in `docs/previews/`. Store superseded captures in `docs/previews/archive/` and update links when moving an image.
- Run `npm run test:api` from the app root. The command already points to the new test directory.
- Never manually edit generated `dist/` or `node_modules/` files. Rebuild or reinstall them with npm.
- Keep `server/data/` in place. It contains persistent local saves and cached results rather than source code.
- Keep the parent assignment and presentation files outside the application repository unless deliberately adding them as project references.

No configuration files were hidden or moved solely to reduce the root file count.
