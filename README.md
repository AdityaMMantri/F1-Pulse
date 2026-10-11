# F1 Pulse

### Explore the grid. Compare the drivers. Design your car.

F1 Pulse is a multi-page Formula 1 web application built for a **Human–Computer Interaction (HCI)** project. It brings season information, driver comparisons, circuit results, and an interactive 3D livery studio into one interface.

The project focuses on making common fan tasks easier to understand: finding a result, comparing drivers, interpreting a race weekend, and customising a car with clear feedback and reversible actions. It combines a React frontend with a small working Node.js backend for automatic published-result updates and persistent Garage saves.

> An independent educational prototype, not an official Formula 1 product. The 3D car is an original 2026-inspired visual concept, not a team-accurate or regulation-certified model.

[Website screenshots](#website-screenshots) · [Features](#features) · [F1 field guide](#f1-field-guide) · [Run locally](#run-locally) · [Deployment](#deploying-from-github) · [HCI principles](#hci-principles) · [Official-site comparison](#comparison-with-the-official-f1-website)

## Website screenshots

Actual screenshots from the running project. Results and timestamps in these images are examples captured at that time, not a source of current standings. These captures predate the latest overview showcase and chapter-based F1 guide; they illustrate the results and Garage features below.

### Grand Prix podium and results

Driver portraits, an elevated winner card, readable names, and team-colour accents make the top three easy to identify. Position labels provide meaning independently of colour.

![Grand Prix podium with driver portraits and team-colour accents](docs/previews/refined-podium.png)

### Garage workspace and update status

Paint, identity, and artwork are grouped into three steps. Save controls, undo/redo, and status feedback sit above the design studio. The compact results status exposes additional update information on demand.

![Garage controls, shared save panel, and compact automatic-update status](docs/previews/refined-garage.png)

### Interactive car model

The Garage includes a rotatable car with sculpted sidepods, recessed intakes, wings, suspension, and a halo. This close-up illustrates the model; the toolbar presentation is shown in the newer screenshot above.

![Close-up of the Garage car and recessed sidepod intakes](docs/previews/sidepods-recessed-intakes.png)

### Sprint classification

Sprint results have their own top-three presentation, distinct from the Grand Prix podium, with team colours and explicit finishing positions.

![Sprint top-three cards and team-colour result highlighting](docs/previews/team-colour-sprint.png)

## Features

| Area | What you can do |
|---|---|
| Overview | See a season summary, championship leaders, constructor standings, and upcoming racing context in open, divider-led sections. |
| Driver showcase | Discover random pairs from the full driver roster, automatically changing every 12 seconds, and open their comparison. Pause/resume or request a new pairing. |
| F1 field guide | Explore five linked chapters covering the weekend, points, results, strategy, and the 2026 car, with worked examples and interactive explanations. |
| Drivers and teams | Browse profiles, supplied portraits and team artwork, and season statistics. |
| Compare | Select two different drivers, switch between 2026, career, and 2025 archive views, and explore chart presets, configurable metrics, and exact values. |
| Season | Explore the race calendar and championship progression. |
| Circuits | View track maps and switch between qualifying, sprint, and Grand Prix results for each weekend. |
| Result highlights | Identify the qualifying top ten, sprint top three, and Grand Prix podium using team colours and position labels. The qualifying top ten correspond to the Q3 group, not Q1 advancement. |
| The Garage | Orbit and zoom the 3D car, change paint and finish, place sponsor marks, upload artwork, and position custom text on different surfaces. |
| Design storage | Undo/redo changes, save/load in the browser or shared local server, and export an image. |
| HCI guide | Turn on header annotations to locate Norman and Shneiderman principles in the interface. |

The Garage also provides camera presets, a 2D fallback, artwork limits, and separate replace/add actions. A dark visual theme, red primary actions, team-colour highlights, and responsive layouts connect the pages. DM Sans handles interface and guide body text, Barlow Condensed supplies racing and guide headings, Georgia adds an editorial voice to overview headings, and monospace labels distinguish season metadata. Open sections and divider-led layouts reduce unnecessary card containers. Motion respects reduced-motion preferences.

### Overview and rotating driver showcase

The overview presents the championship leaders once. Its driver showcase introduces the comparison feature without repeating the points and positions already shown elsewhere on the page.

- Random pairings use the full roster (currently 23 drivers), with two distinct drivers per pairing. When the roster allows, neither driver from the previous pairing appears immediately again; this is random selection, not a guaranteed tour of every possible combination.
- The pairing changes automatically every **12 seconds** while the browser tab is visible and rotation is enabled. Hovering or focusing the section does not stop the timer. **Pause/Resume** gives explicit control, and **New pairing** changes it manually.
- The comparison link follows the displayed pair, opening `/compare?a=DRIVER_ID&b=DRIVER_ID`.
- Portraits, team accents, and racing numbers identify the drivers. Numbers sit beside their portraits; a larger coral **VS** is centred in the visible gap between the two driver groups and recalculated when the pairing or layout changes.
- The layout adapts to smaller screens while keeping names, teams, and comparison controls readable.

## F1 field guide

The guide at `/learn` shows one chapter at a time. Direct chapter links, **Previous**, and **Next** all use the same URL-hash navigation, so the sequence includes all five chapters. Active states and a progress line show the current location, and browser Back can return to an earlier chapter.

| Chapter | Presentation and learning aids |
|---|---|
| 1. The race weekend | A numbered practice → qualifying → Grand Prix timeline, a Q1 → Q2 → Q3 progression, and an expandable Sprint explanation. |
| 2. The points | Grand Prix and Sprint scoring together, proportional Grand Prix point bars, and a worked **18 + 10 = 28** example separating driver and constructor totals. |
| 3. Reading results | A numbered, plain-language reference for result labels, gaps, classifications, and missing information. |
| 4. Race strategy | Six expandable explanations: undercut, overcut, tyre compounds, Safety Car/VSC, flags, and downforce/dirty air. Each includes context, an example, and what to watch. |
| 5. The 2026 car | Interactive **Corner/Straight** wing illustrations with matching explanatory text, plus active-aero, electrical-power, and Garage context. The illustration is a teaching concept, not an aerodynamic simulation. |

Chapters share readable sans-serif text and consistent navigation, while timelines, tables, disclosures, and diagrams give each topic a suitable presentation. Strategy disclosures use native expandable controls with clear open/closed states.

## Tech stack

| Layer | Technology | Role |
|---|---|---|
| UI | React 19 + TypeScript | Reusable components, typed data, and interactive state. |
| Navigation | React Router 8 | Client-side page navigation and detail routes. |
| Build tools | Vite 8 | Development server, asset processing, and production builds. |
| Styling | CSS | Responsive layouts, team accents, typography, focus states, and transitions. |
| Animation | Motion + CSS animations | Interface transitions and visual feedback. |
| 3D | Three.js, React Three Fiber, Drei | Car geometry, materials, lighting, and camera interaction. |
| Backend | Node.js native HTTP and filesystem APIs | Local API, result synchronisation, validation, and file persistence. |
| Racing data | Jolpica F1 API | Published 2026 calendar, standings, qualifying, sprint, and race results. |
| Persistence | Browser storage + JSON files | Local design saves, shared server save, and last-successful result cache. |
| Quality checks | TypeScript, Oxlint, Node test runner | Type checks, linting, and backend integration tests. |

No database installation, authentication service, or API key is required. This project does not use Express or a hosted database.

## Run locally

### Requirements

- **Node.js 22.12 or newer** and npm. Check with `node --version` and `npm --version`.
- A modern browser; WebGL is needed for the 3D view. A 2D fallback is available.
- Internet access for the initial dependency installation and fresh racing data. Google Fonts also uses an external request; system font fallbacks are configured.

### Install and start

Open a terminal inside the **F1 app folder containing `package.json`**, not the parent assignment folder:

```powershell
cd "F:\SEM-7\ELECTIVES\DEPARTMENT-ELECTIVES\HCI\Project\F1"
npm install
npm run dev
```

If you cloned the project elsewhere, use the corresponding app path instead.

Open **http://127.0.0.1:5173**. The command starts both Vite and the backend at **http://127.0.0.1:3001**. Press **Ctrl+C** in that terminal to stop both.

### Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start frontend and backend together. |
| `npm run dev:client` | Start only the Vite frontend. |
| `npm run server` | Start only the backend. |
| `npm run build` | Type-check and generate the production frontend in `dist/`. |
| `npm run preview` | Preview an existing production build locally. |
| `npm run lint` | Run Oxlint. |
| `npm run test:api` | Run backend and racing-data integration tests. |

For a production-build **local preview**, run `npm run build`, then run `npm run server` and `npm run preview` in separate terminals. Open the URL printed by Vite. This is a local preview, not a production deployment configuration.

### Troubleshooting

| Symptom | What to check |
|---|---|
| `Missing script: dev` | You are likely in the parent folder. Change into `F1` and check that its `package.json` lists the scripts above. |
| PowerShell blocks `npm.ps1` | Use `npm.cmd install` and `npm.cmd run dev`. |
| Port 3001 or 5173 is already in use | Check whether the project is already running. Stop your previous instance with Ctrl+C before starting another. |
| Saved/snapshot data appears | Inspect **About updates** and `/api/health`. Keep the backend running and allow the next sync; provider data may not yet be published. |
| 3D is unavailable | Use the Garage's 2D fallback. Saved designs remain available. |
| Server save is unavailable | Start the backend. Browser save/load remains a separate option. |

## Deploying from GitHub

The local development setup is complete, but deployment requires the hosting configuration below. The repository currently binds the API to localhost and does not contain a `vercel.json`. Uploading to GitHub alone does not publish the website.

### 1. Prepare the backend for Render

In `server/index.mjs`, inside the existing direct-execution block, replace the fixed `server.listen(...)` call with:

```js
const port = Number(process.env.PORT) || 3001
server.listen(port, '0.0.0.0', () => console.log(`Garage API listening on ${port}`))
```

Keep the existing `const server = createApi()` and surrounding execution guard. Commit and push this change. Render requires a publicly bound listening address and supplies the port through `PORT`; see [Render port binding](https://render.com/docs/web-services#port-binding).

### 2. Create the backend service

In [Render](https://render.com/), create a **Web Service**, connect the GitHub repository, and select the branch containing the latest changes.

| Setting | Value |
|---|---|
| Runtime | Node |
| Root directory | `F1` if that folder contains `package.json` in GitHub; otherwise the repository root |
| Build command | `npm ci` |
| Start command | `npm run server` |
| Node version | Set `NODE_VERSION` to `22.x` |
| Health check path | `/api/health` |

Deploy, then open `https://YOUR-BACKEND.onrender.com/api/health` and check for a successful JSON response. Keep the actual backend URL for the next step. The backend serves API routes; its base URL is not the frontend website.

### 3. Configure frontend routing

Create `vercel.json` beside the app's `package.json`, replacing the placeholder domain with the deployed backend domain:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-BACKEND.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Keep the API rewrite first. It forwards the app's relative `/api` requests to Render; the second rewrite supports direct visits and refreshes on React Router pages. Commit and push the file. See [Vercel rewrites](https://vercel.com/docs/routing/rewrites) and [Vite SPA routing](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas).

### 4. Publish the frontend

In [Vercel](https://vercel.com/), import the same GitHub repository and configure:

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Root directory | The folder containing the app's `package.json` and `vercel.json` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 22.x |

Choose **Deploy** and open the generated frontend URL. This rewrite setup does not require a separate frontend API environment variable.

### 5. Verify the published app

Check the overview and its 12-second rotation; open a displayed driver's comparison; visit all five guide chapters using Next/Previous; and refresh a nested route such as `/learn`. Open `/api/health` through the frontend domain to verify the proxy, then test racing data and Garage save/load. With automatic deployments enabled, future pushes to the configured branch update the corresponding service.

Render's free service can sleep after inactivity, making the first API request slow. Its default filesystem is ephemeral: the Garage JSON save and racing cache can disappear after restarts or redeployments. Durable hosting needs persistent storage. The server save is also shared by everyone, with no account isolation; browser saves remain separate. See [Render free-service limitations](https://render.com/docs/free).

## HCI principles

The interface applies **Norman's seven design principles** and **Shneiderman's eight golden rules**, using the terminology from the course materials. Enable **HCI highlights** in the header to display the implementation codes and explanatory guide. Switch it off for the normal website.

| Code | Principle | Implementation | Page |
|---|---|---|---|
| N1 | Knowledge in the world and in the head | Visible search labels, examples, graph definitions, and named artwork surfaces reduce guessing. | `/compare` |
| N2 | Simplify the structure of tasks | The guide divides learning into five chapters with Previous/Next navigation. The Garage groups editing into three steps. | `/learn`, `/cars` |
| N3 | Make things visible | Selected controls, filter counts, the live car preview, and status messages show the result of an action. | `/cars` |
| N4 | Get the mappings right | Corner/Straight controls update the wing illustration and explanation together; scoring bars share a common scale. Driver selectors match chart legends. | `/learn`, `/compare` |
| N5 | Use constraints | The same driver cannot occupy both comparison slots. Artwork limits and disabled undo prevent invalid actions. | `/compare` |
| N6 | Design for error | Garage undo/redo, reset confirmation, clear filters, and upload error messages provide recovery. | `/cars` |
| N7 | Standardize | Shared navigation, labelled form controls, familiar buttons, and visible keyboard focus work consistently across pages. | `/drivers` |
| S1 | Strive for consistency | The same navigation, button styles, headings, and active-state treatment recur throughout the site. | `/` |
| S2 | Enable shortcuts | Press / to focus global search. In the Garage, Alt+S saves, Alt+Z undoes, and Alt+Shift+Z redoes. Shortcuts ignore text fields. | `/cars` |
| S3 | Offer informative feedback | Result counts, selected chart settings, the live preview, and Garage status messages explain what changed. | `/drivers` |
| S4 | Give interactions closure | Saving, loading, exporting, and resetting end with a clear confirmation message. The Garage distinguishes saved and unsaved work. | `/cars` |
| S5 | Prevent errors and support recovery | Distinct-driver constraints, upload validation, separate artwork positions, and actionable empty states prevent or explain errors. | `/compare` |
| S6 | Permit easy reversal | Garage Undo and Redo reverse design changes, including reset. Filters have a clearly labelled reset action. | `/cars` |
| S7 | Keep users in control | Pause/Resume and New pairing control the rotating showcase. Guide chapters support direct and sequential navigation. HCI highlights can be switched off or exited with Escape. | `/`, `/learn` |
| S8 | Reduce short-term memory load | Chapter labels, progress, worked examples, chart legends, and exact-data tables keep relevant context visible. | `/learn`, `/compare` |

The HCI walkthrough includes evidence for the rotating showcase, guide navigation, scoring example, strategy disclosures, and wing modes. **Show this example** opens the relevant guide chapter when it is hidden, then focuses and scrolls to the annotated element below the sticky header. See [the detailed HCI implementation guide](docs/HCI-IMPLEMENTATION.md).

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


## Comparison with the official F1 website

The [official Formula 1 website](https://www.formula1.com/) serves a much broader audience and business purpose. Its homepage links to news, videos, schedules, results, standings, drivers, teams, live timing, and commercial services such as tickets, the store, and F1 TV (reviewed 9 October 2026).

This comparison explains **the prototype's design focus**, not a claim that the official site lacks all similar features. No controlled usability study has established that F1 Pulse is faster or more accessible.

| Design question | Official F1 website / scope | F1 Pulse approach |
|---|---|---|
| What is the main purpose? | A broad official destination for racing information, editorial content, media, and fan services. | A focused coursework interface for exploration, comparison, and car customisation. |
| How is navigation organised? | Multiple content and service destinations reflect the breadth of the official offering. | Seven primary areas keep the project's smaller task set visible and consistent. |
| How are results explored? | Official results and standings are dedicated destinations. | Circuit pages place qualifying, sprint, and Grand Prix sessions together, with visual top-finisher summaries. |
| How does the project support analysis? | Official driver, team, and standings content provides racing context. | A dedicated two-driver workspace offers period selection, graph controls, and exact values together. |
| What interactive learning is emphasised? | The homepage links to newcomer information and fan activities. | A five-chapter field guide combines scoring examples, strategy disclosures, and wing-mode illustrations; the Garage demonstrates editing, undo/redo, and save feedback. |
| How is freshness communicated here? | The official offering includes a Live Timing destination. | A status strip states when published data was synced; this project does not provide live timing. |
| How are HCI choices demonstrated? | A public-facing product serving its audience. | Optional annotations explicitly map interface decisions to course principles for assessment. |

The intended benefits are lower memory load, clearer task progression, easier recognition of key results, and recovery from mistakes. These remain design hypotheses to validate through testing. The official site has a much broader editorial and service offering; this prototype is not a replacement for it.

### Suggested usability evaluation

Ask participants to find a circuit's qualifying top ten, compare two drivers, and customise then restore a Garage design. Record completion rate, time on task, errors, and participant comments. For tasks supported by both sites, use the same task wording and alternate the order of sites. Evaluate the Garage separately rather than forcing an unequal comparison.

## Presentation walkthrough

1. Show the overview and expand **About updates** to explain freshness and the provider.
2. Watch the driver showcase rotate after 12 seconds. Pause/resume it, request a new pairing, and open that pair in Compare.
3. Change the comparison period and explore a graph alongside exact values.
4. Visit the F1 guide and use Next through all five chapters, including points and strategy. Show the scoring example, expand a strategy explanation, and switch Corner/Straight modes.
5. Open a completed circuit and switch between qualifying, sprint (where available), and Grand Prix results.
6. In Garage, change paint and add artwork at separate positions. Undo and redo a change.
7. Save to the server, change the design, and load it again to demonstrate local persistence.
8. Enable **HCI highlights** and use **Show this example**, including an example in another guide chapter, to explain the relevant principles.

## Limitations and asset credits

- Racing updates are published-result polling, not live telemetry. The backend must be running for scheduled refreshes.
- Career and 2025 archive statistics are local snapshots; artwork, track dimensions, and explanatory text are reference content.
- There is one shared local Garage save, with no accounts or multi-user permissions. Treat the backend as a local demonstration service.
- The 4.5-second intro pairs the car outline glow with sequential start lights, a warm atmospheric background, and a perspective track. This is a presentation sequence, not a download-progress indicator. Reduced-motion support stops decorative movement but does not remove the minimum wait. Its effect on task speed should be evaluated.
- The 3D model and guide wing illustration are visual teaching concepts, not aerodynamic simulations. The 2D fallback does not reproduce all 3D lighting and material effects.
- Supplied driver photographs, team logos, and circuit maps remain the property of their respective owners. Their inclusion does not grant redistribution rights. Portraits may depict a different season from the event data.
- Sponsor presets are fictional. The project is not affiliated with or endorsed by Formula 1, the FIA, or any team.

See [the HCI implementation guide](docs/HCI-IMPLEMENTATION.md) for the in-app principle map, and [Jolpica's documentation](https://github.com/jolpica/jolpica-f1/tree/main/docs) for the racing-data source.

## Folder map

- `src/components/` — shared UI, rotating `DriverShowcase`, and `HciGuide`; `loading/` contains the intro and bootstrap.
- `src/pages/` — website pages, comparison charts, and the chapter-based `Learn` guide.
- `src/garage/` — car model, editor, design logic, API client.
- `src/data/` — fallback snapshots, live-data adapter, shared React provider and context.
- `src/assets/` — supplied photographs, maps, and optimized assets.
- `src/styles/` — shared style refinements.
- `server/` — Node API and racing sync; generated saves go in `data/`.
- `tests/server/` — backend persistence and racing-data integration tests.
- `scripts/` — combined development launcher.
- `public/` — static public icons.
- `docs/` — HCI and asset documentation, `reference/` documents, `previews/` screenshots, and `previews/archive/` older design captures.

Root configuration files are required by Vite, TypeScript, and npm. `dist/` and `node_modules/` are generated, ignored folders. Parent-folder assignment/PPT materials are preserved.


See [the project structure guide](docs/PROJECT-STRUCTURE.md) for what each root configuration file does and where new files belong.
