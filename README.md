# Portfolio OS

The personal portfolio of Maximilian Mewes, built as a browser desktop instead of a
scrolling page. The site serves a single route (`/`) that renders one Inertia page,
`resources/js/pages/Index.vue`: a menubar, a wallpapered desktop with draggable icons,
and a window manager that opens each "app" in a movable, resizable, minimizable window.
The apps are the portfolio content — `home.md`, About, Projects (case studies with
category filters), Images (a gallery), Calculator, an "Ask a question" form, a
"Talk to a human" contact card, Settings and Trash. A command palette (`Ctrl`/`Cmd` +
`K`), toasts, keyboard shortcuts and localStorage session persistence round out the OS
metaphor; below 768 px the whole thing collapses into a tappable icon grid with
fullscreen windows.

## Stack

| Layer | What |
| --- | --- |
| Backend | Laravel 12, PHP >= 8.2 (developed on 8.4), Inertia Laravel 2, Wayfinder |
| Frontend | Vue 3 (`<script setup>`), TypeScript, Inertia Vue 3, Vite 7 |
| Styling | Tailwind CSS 4 (`@theme` tokens in `resources/css/app.css`), `tw-animate-css` |
| UI bits | reka-ui / shadcn-vue idiom (`components/ui/menubar`), `lucide-vue-next` icons |
| Fonts | IBM Plex Sans, self-hosted via `@fontsource/ibm-plex-sans` (no font CDN) |
| Tests / QA | Pest 3, Laravel Pint, ESLint 9, Prettier 3, `vue-tsc` |

There is no database-backed content yet and no authentication — the starter kit's auth,
settings and Fortify scaffolding was removed. All content lives in typed TypeScript data
files under `resources/js/data/`.

## Local setup

```bash
composer install
npm install
cp .env.example .env          # APP_NAME="Maximilian Mewes" is already set
php artisan key:generate
composer run dev
```

`composer run dev` runs `php artisan serve`, `php artisan queue:listen` and
`npm run dev` concurrently.

> **Port note:** `php artisan serve` defaults to port 8000, which is often taken by
> Docker on this machine. If it is, run the server separately on another port:
> `php artisan serve --port=8010` (plus `npm run dev` in a second shell).

`composer run setup` does the whole sequence above in one go (install, `.env`, key,
`migrate --force`, `npm install`, `npm run build`). Migrations are only the Laravel
defaults (users, cache, jobs); nothing in the site reads them, so a missing database
does not stop the page from rendering.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | production build (also the main correctness gate) |
| `npm run build:ssr` | production build plus the SSR bundle |
| `npm run lint` | `eslint . --fix` |
| `npm run format` | `prettier --write resources/` |
| `npm run format:check` | `prettier --check resources/` (currently red on older files) |
| `npx vue-tsc --noEmit` | Vue/TypeScript typecheck (no npm script wrapper) |
| `php artisan test` | Pest suite |
| `vendor/bin/pint --test` | PHP code style check (CI runs it) |

The definition of "green" used throughout this project: `npm run build`, `npm run lint`,
`npx vue-tsc --noEmit` and `php artisan test` all exit 0.

## Folder map

```
app/                                Laravel application (no controllers — routes/web.php
                                    renders the Index page inline)
resources/
  css/app.css                       Tailwind 4 theme tokens, desktop/wallpaper layer,
                                    the hand-written cursor rules, keyframes
  views/app.blade.php               root Blade template (favicon, @vite, @inertia)
  js/
    app.ts                          Inertia bootstrap; calls initializeTheme() and
                                    applySettings() before the app mounts
    ssr.ts                          SSR entry
    pages/Index.vue                 the only page: menubar + <Desktop />, SEO <Head>
    components/
      Desktop.vue                   icon layout (absolute columns / mobile grid) and
                                    the window list
      CommandPalette.vue            Ctrl/Cmd+K app search
      Toaster.vue                   toast host
      AppearanceTabs.vue            light / dark / system switch
      ui/menubar/                   reka-ui menubar primitives
      ui/desktop-element/           DesktopElement.vue — a desktop icon
      ui/desktop-window/            DesktopWindow.vue (chrome, drag, resize, mobile
                                    fullscreen) + one DesktopWindow<App>.vue per app
                                    + settings/{Appearance,Wallpaper,Cursor}Section.vue
    composables/
      useWindowManager.ts           open / close / focus / minimize / z-order
      useWindowShortcuts.ts         keyboard shortcuts
      useSessionPersistence.ts      localStorage['portfolio-os:session']
      useSettings.ts                localStorage['portfolio-os:settings'] + applySettings()
      useAppearance.ts              colour mode, localStorage['appearance']
      useIsMobile.ts                the single source of the 767 px breakpoint
      useToast.ts                   toast queue
    data/
      apps.ts                       the app registry (appDefinitions)
      projects.ts                   the 10 project case studies
      wallpapers.ts                 11 wallpaper presets
      cursors.ts                    4 cursor sets, roles and hotspots
      accents.ts                    6 accent colour pairs
    directives/draggable.ts         v-draggable (marks its handle with data attributes)
    lib/utils.ts                    cn() class merge helper
    types/                          Inertia page props and ambient types
    routes/, wayfinder/             generated by Wayfinder (git-ignored)
public/
  cursors/<set>/<role>.svg          24 cursor SVGs (pixel, rounded, crosshair)
  images/projects/                  project screenshots and gallery images
  images/textures/fleck-black.png   the desktop texture
```

## How to add an app

An app is one entry in the registry plus one component. Everything else — the desktop
icon and the command palette entry — is derived from the registry. (The windows menu in
the menubar lists the *open* windows, so it needs nothing.)

1. Create `resources/js/components/ui/desktop-window/DesktopWindow<Name>.vue`. It is the
   window *content* only; `DesktopWindow.vue` supplies the frame. Match the existing
   idiom (`text-ink`, `text-mute`, `border-hairline`, `bg-card`, `press`, pastel-soft
   backgrounds) rather than introducing new styling.
2. Add it to `appDefinitions` in `resources/js/data/apps.ts`:

   ```ts
   makeApp(
       'My App',
       SomeLucideIcon,
       () => import('@/components/ui/desktop-window/DesktopWindowMyApp.vue'),
       { width: 560, height: 420 }
   ),
   ```

   `makeApp` derives the app **id** from the title by camel-casing it (`'My App'` →
   `myApp`, `'home.md'` → `home.md`). That id is what `openApp(id)` in `Index.vue` and
   the session persistence use, so keep it stable.
3. Respect the window minimum of **360 × 240** (`MIN_W` / `MIN_H` in
   `DesktopWindow.vue`); smaller values are clamped, but a clamped default is a smell.
4. Optionally export the component from
   `resources/js/components/ui/desktop-window/index.ts` for consistency, and add a
   menubar item in `Index.vue` via `openApp('<id>')`. Content props can be passed as
   `openApp('<id>', { someProp: value })` — the window manager forwards `contentProps`
   to the content component.

Icons are laid out automatically: `Desktop.vue` flows the registry into columns of six
and pins `trash` to the bottom-right corner, so a new app just appears.

## How to add a project

Projects are the entries of `projects: Project[]` in `resources/js/data/projects.ts`
(`slug`, `title`, `year`, `category`, `tags`, `summary` ≤ 140 chars, `description`,
optional `links` and `image`). `DesktopWindowProjects.vue` renders them: a filter pill
per category, one expandable card per project.

1. Append an entry. `category` must be one of `web | tools | 3d-printing | electronics |
   games` — each has a badge colour in the `categoryBadge` map in the component.
2. Only add a GitHub `link` if the repository is actually public.
3. For an image: drop the file into `public/images/projects/` (prefer ≤ 1600 px on the
   long edge and ≤ 400 KB) and set `image: '/images/projects/<file>'`. Add it to the
   `images` list in `DesktopWindowImages.vue` if it should also show up in the gallery.
4. Keep the copy factual — descriptions are sourced from each project's own README or
   Obsidian hub note, not written from memory.

## How to add a wallpaper, cursor set or accent

All three are data files read by `useSettings.ts` / `applySettings()`, which stores only
**ids** in `localStorage['portfolio-os:settings']` and writes them to
`<html>` as `data-cursor` / `data-wallpaper` plus the custom properties `--wallpaper`,
`--wallpaper-size`, `--primary` and `--primary-foreground`. The Settings app
(`DesktopWindowSettings.vue`) renders whatever the data files contain, so no component
change is needed for a new preset.

**Wallpaper** — add an entry to `wallpapers` in `resources/js/data/wallpapers.ts` and to
the `WallpaperId` union:

```ts
{ id: 'ocean', name: 'Ocean', kind: 'gradient',
  css: `linear-gradient(160deg, ${mix('#2c84e0', 24)} 0%, var(--background) 70%)` },
```

`css` is a full `background` shorthand **value**; add `size` if the pattern needs a tile
size. Build every colour from theme tokens via the local `mix()` helper
(`color-mix(in oklab, var(--background), <tint> N%)`) or `var(--primary)` so the preset
works in light and dark mode and follows the chosen accent. Anything that needs an
animation or a special case hooks off `html[data-wallpaper="<id>"]` in `app.css`.

**Accent** — add a `{ id, name, primary, primaryForeground }` pair to `accents` in
`resources/js/data/accents.ts` and to the `AccentId` union. The foreground must be one
of the two inks already in use (`#23251d` or `#eeefe9`) and the pair must clear WCAG AA
(≥ 4.5:1); note the measured ratio in a comment like the existing swatches.

**Cursor set** — three steps, because the CSS is written by hand:

1. Add the id to `CursorId` and an entry to `cursorSets` in
   `resources/js/data/cursors.ts` (`hasAssets: true`), plus any per-role hotspot
   override in `cursorHotspotOverrides`.
2. Draw one 32 × 32 SVG per role into `public/cursors/<id>/`:
   `default, pointer, text, move, nwse-resize, nesw-resize, ew-resize, ns-resize`.
   Give each shape a 1 px contrasting outline so it reads on light and dark.
3. Add the rule block for the set in the cursor section of `resources/css/app.css`,
   copying the shape of the existing three (`html[data-cursor="<id>"] { … }` for the
   default, then the `a, button, [role="button"], .press` pointer rule, the
   `input, textarea, [contenteditable]` text rule, the `.desktop-window-titlebar`
   move rule and the four resize-handle rules). The hotspot numbers must match
   `cursors.ts` — that file is the source of truth and says so. The rules deliberately
   live in the same layer as the Tailwind utilities, not in `@layer base`, because layer
   order beats specificity and a base-layer rule could not override the `cursor-*`
   utilities on the resize handles. Always keep the native keyword fallback
   (`url(...) x y, pointer`) for engines that ignore SVG cursors.

The Cursor section of the Settings app hides itself when the media query
`(pointer: coarse)` matches — there is nothing to restyle on a touch screen.

## Conventions

- **English only** — file names, code, comments, commit messages, docs and UI text.
- Conventional, English commit messages; commit in coherent steps.
- Do not restyle the existing look; reuse the tokens in `resources/css/app.css` and the
  idiom of the neighbouring components.
- Icons come from `lucide-vue-next`. No new UI libraries.
- Verify with `npm run build`, `npm run lint`, `npx vue-tsc --noEmit` and
  `php artisan test` — not by opening a browser.
- Branch: `development` (remote `itCarl/personalPortfolio2025`).

## Open decisions

- **Hosting undecided.** No deployment target is configured, and `og:url` / canonical
  are deliberately omitted from the `<Head>` until a domain exists.
- **Favicon and app icon are still the Laravel defaults** — `public/favicon.ico`,
  `public/favicon.svg` (the Laravel mark) and `public/apple-touch-icon.png`.
- Two follow-up plans are written and approved but not started: a Filament-backed
  content admin (`Docs/plans/2026-09-07-content-backend.md`) and a games folder with
  secrets (`Docs/plans/2026-09-07-games.md`), both in the project's `Docs/` folder one
  level above this repository.
