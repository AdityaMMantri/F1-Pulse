# F1 Pulse — HCI project

React + TypeScript frontend with a 3D Garage and a Node.js backend for Garage saves and automatic racing updates.

## Run

Use Node.js 22 or newer. From this folder:

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. One command starts both Vite and the Garage API on port 3001. Ctrl+C stops both. No database installation or API key is needed.

## Backend demonstration

1. Open Garage and change paint, text, or sponsors.
2. Choose **Save to server**; the response confirms the save time.
3. Change the design, then **Load from server** to restore it. Undo reverses the load.
4. Restart the project and load again: the design persists in `server/data/garage.json`.

Browser Save/Load remains separate. There is one shared local demo save, not a user-account system. Server saves include uploaded artwork. The 2026 racing pages now use automatic provider updates; career totals and the 2025 archive remain clearly labelled snapshots.

| Endpoint | Purpose |
|---|---|
| GET /api/health | Backend availability and racing sync status |
| GET /api/racing/2026 | Cached calendar, standings, race/sprint/qualifying results and freshness |
| PUT /api/garage/design | Validate and persist the complete design |
| GET /api/garage/design | Restore design and timestamp |

The API binds to localhost, validates input, limits request sizes, and writes atomically. Storage is excluded from Git. Request errors leave the browser design intact.

## Automatic racing updates

Run `npm run dev` as usual. The backend checks [Jolpica F1](https://github.com/jolpica/jolpica-f1/tree/main/docs) on startup and every 15 minutes while it is running. No API key is required. The browser checks the backend once a minute (more frequently during the first sync), updating pages without a reload. The app deliberately stays on the **2026 season** rather than silently changing years.

Updates include:

- Driver and constructor championship order and points, using the provider's standings rather than recalculating championship penalties.
- Calendar changes, completed races, next race and current-season driver statistics.
- Separate Grand Prix, sprint and qualifying tables on each circuit, with session points, grid, laps, status, time gaps and Q1/Q2/Q3 times when published.
- Current-season comparison graphs and weekend points, including sprint results before the Grand Prix is available.

**These are published results, not live timing.** Changes appear after the provider publishes them and the next successful polling cycle completes. Provider publication delays and outages are outside the app's control. Results and standings may be published at different times; the standings round is displayed explicitly. Qualifying P1 counts are labelled separately from final pole/grid positions. Team identity follows each driver's latest recorded session, not an independently verified future lineup.

The server caches the full successful response in ignored `server/data/racing-2026.json`. Requests are paced and paginated; simultaneous refreshes share one request sequence. An incomplete refresh cannot replace the saved data. Failures/timeouts and HTTP 429 responses retain the cache and back off (honouring `Retry-After`). The status strip distinguishes current, saved/stale and bundled fallback data. Restarting restores the server cache before checking for updates. When both the API and its cache are unavailable, the original bundled snapshot keeps the frontend usable.

Career totals, the 2025 archive, track dimensions, photographs and explanatory content remain local reference data. New drivers without supplied portraits receive the existing placeholder. Nothing is presented as a live career-statistics feed.

For a presentation: open a circuit such as China, switch between Grand Prix/Sprint/Qualifying, then show `/api/racing/2026` and the sync status in `/api/health`. `npm run test:api` also simulates new points, a sprint-only weekend, pagination, provider failure, cache restart and recovery without depending on the real provider.

## Folder map

- `src/components/` — shared UI; `loading/` contains the intro and bootstrap.
- `src/pages/` — website pages and comparison charts.
- `src/garage/` — car model, editor, design logic, API client.
- `src/data/` — fallback snapshots, live-data adapter, shared React provider and context.
- `src/assets/` — supplied photographs, maps, and optimized assets.
- `src/styles/` — shared style refinements.
- `server/` — Node API and integration tests; generated saves go in `data/`.
- `scripts/` — combined development launcher.
- `public/` — static public icons.
- `docs/` — HCI and asset documentation, `reference/` documents, `previews/` screenshots.

Root configuration files are required by Vite, TypeScript, and npm. `dist/` and `node_modules/` are generated, ignored folders. Parent-folder assignment/PPT materials are preserved.

## Checks

```sh
npm run build
npm run lint
npm run test:api
```

`npm run dev:client` starts only Vite. `npm run server` starts only the API. For production preview, build first, then run `npm run server` and `npm run preview` in separate terminals.

See [HCI implementation](docs/HCI-IMPLEMENTATION.md) and [asset notes](docs/ASSETS.md).

The 4.5-second loader centers the car against a dark background with softly blended image edges and a moving red glow tracing its silhouette. There is no permanently visible outline; the glow is a separate SVG layer.


