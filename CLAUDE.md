# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # Dev server at http://localhost:4200/ (development env)
npm run start:test     # Dev server with test environment
npm run start:prod     # Dev server with production environment

npm run build:dev      # Build — development
npm run build:test     # Build — test
npm run build:prod     # Build — production (default: npm run build)

npm test               # Run unit tests with Vitest
npm run watch          # Build watch mode (development)
```

Angular CLI scaffolding:
```bash
npx ng generate component features/<feature>/<name> --flat   # feature component
npx ng generate component shared/components/<name>           # shared component
npx ng generate service core/services/<name>                 # singleton service
npx ng generate guard core/guards/<name> --functional        # functional route guard
npx ng generate interceptor core/interceptors/<name>         # functional HTTP interceptor
```

## PrimeNG

**Version:** `primeng@21.1.1` with `@primeuix/themes` (Aura preset) and `primeicons`.

- Theme is configured via `providePrimeNG()` in `app.config.ts` — no global CSS imports required for PrimeNG itself
- `primeicons/primeicons.css` is imported in `src/styles.scss`
- Dark mode toggle: add/remove `.dark` class on the `<html>` element
- **Do NOT use `provideAnimationsAsync`** — `@angular/animations` is deprecated in Angular v20.2+; PrimeNG v21 uses native CSS animations
- Import components individually: `import { Button } from 'primeng/button'`, `import { Select } from 'primeng/select'`, etc. (no Module suffix needed in v21)
- `cssLayer` is configured so PrimeNG styles can coexist with Tailwind if added later

## rxResource API (Angular 21.2)

```typescript
// Correct API — uses 'params' and 'stream', NOT 'request' and 'loader'
readonly myResource = rxResource({
  params: () => this.someSignal(),    // undefined → resource stays idle
  stream: ({ params }) => this.service.getData(params),
});
```

## SCSS Import Paths

`angular.json` has `stylePreprocessorOptions.includePaths: ["src"]`. Use non-relative paths in all SCSS:
```scss
@use 'styles/mixins' as *;   // resolves to src/styles/_mixins.scss
@use 'styles/tokens';        // resolves to src/styles/_tokens.scss
@use 'styles/animations';    // resolves to src/styles/_animations.scss
```
`@use` rules must always come BEFORE all other rules in a SCSS file.

## Environments

| File | Config flag | Used by |
|---|---|---|
| `src/environments/environment.ts` | `development` | `npm start` / `ng serve` (default) |
| `src/environments/environment.test.ts` | `test` | `npm run start:test` / `build:test` |
| `src/environments/environment.prod.ts` | `production` | `npm run build` / `build:prod` |

Angular swaps the file at build time via `fileReplacements` in `angular.json`. Always import from `environment.ts` — never import the prod/test files directly.

## Folder Structure

```
src/
├─ styles/            # Design system partials (_tokens.scss, _mixins.scss, _animations.scss)
├─ styles.scss        # Global stylesheet — imports everything
└─ app/
   ├─ core/
   │  ├─ constants/   # api.constants.ts — ALL backend endpoint URLs
   │  ├─ interceptors/
   │  ├─ models/      # TypeScript interfaces (project, chapter, character, scene, analysis, translation)
   │  └─ services/    # Thin Observable HTTP wrappers (rxResource belongs in COMPONENTS, not services)
   ├─ features/       # Lazy-loaded pages (dashboard, projects, chapters, characters, scenes)
   ├─ layout/         # App shell (header, sidebar, mobile-nav)
   └─ shared/
      └─ components/  # Reusable components (project-card, character-card, scene-card, ssp-loader, etc.)
```

## Application Routes

| Route | Component |
|---|---|
| `/` | Dashboard — project list |
| `/projects/new` | ProjectForm — create |
| `/projects/:id/edit` | ProjectForm — edit |
| `/projects/:id` | ProjectWorkspace — chapter list + project info |
| `/projects/:id/chapters/new` | ChapterForm — file/text/JSON upload |
| `/projects/:id/chapters/:chapterId` | ChapterWorkspace — original/analysis/translation |
| `/projects/:id/characters` | CharacterRegistry — character grid with role filter |
| `/projects/:id/scenes` | SceneTimeline — scene cards with filters |

Route params are bound to component inputs via `withComponentInputBinding()`.

## Architecture

**Angular 21.2.0 SPA** — all components use the standalone pattern (`standalone: true` is the default).

- `app.config.ts` — root providers: router (`withComponentInputBinding`), `HttpClient` (`withInterceptors`)
- `app.routes.ts` — top-level lazy-loaded routes
- `app.html` — responsive shell: `<app-header>` (tablet/mobile topbar), sidebar, `<router-outlet>`, `<app-mobile-nav>` (mobile bottom nav)

**Key patterns:**
- Reactive state with Angular **signals** (`signal`, `computed`, `effect`)
- `rxResource` in **components** for async data fetching; services return plain `Observable<T>`
- `firstValueFrom()` for one-time mutations (create, update, delete)
- Polling implemented via `setTimeout` loops in components (not RxJS polling service in components)
- Use `inject()` in constructors rather than constructor parameter injection
- TypeScript strict mode — no `any`, no non-null assertion shortcuts
- SCSS per component; global design tokens in `src/styles/_tokens.scss` (typography sizes, colors, spacing)

## Design System

All tokens are CSS custom properties defined in `src/styles/_tokens.scss`:
- Colors: `--ink-900` through `--ink-300`, `--parchment`, `--amber`, `--crimson`, `--sage`, `--slate-blue`
- Typography: `--text-2xs` through `--text-display` — **change once, updates everywhere**
- Spacing: `--sp-1` through `--sp-20`
- Transitions: `--t-fast`, `--t-normal`, `--t-slow`, `--t-spring`

Shared components in `src/app/shared/components/`:
- `app-project-card`, `app-character-card`, `app-scene-card` — data display cards
- `app-status-badge` — maps any status enum to a colored badge
- `app-ssp-loader` — unique "Manuscript Loader" animation (not a spinner)
- `app-empty-state`, `app-page-header`, `app-tension-bar`, `app-segment-progress`, etc.

**Testing:** Vitest 4.0.8 + jsdom. Test files are `*.spec.ts` co-located with source files.
