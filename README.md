# Aetherpunk 28 Companion App

A list building and companion app for [Aetherpunk28](https://www.wargamevault.com/product/463718/Aetherpunk28?manufacturers_id=26307), the tabletop skirmish game by **Jack Edwards**.

Build a College, pick a faction, kit out your models, and print a game-ready roster. The app enforces the game's list building rules as you go, so what you take to the table is always legal.

All game rules, stats and costs belong to Jack Edwards, and as such any reference docs used in development of this project have been ignored.

## Features

- **Guided builder**: a stepped flow (name, points limit, faction, roster) that walks you through creating a College from scratch.
- **All 11 factions**: Abjurers, Diviners, Druids, Evokers, Geomancers, Golem Corps, Mechanists, Necromancers, Paladins, Stormcallers and Hedge Wizards, each with their Empowered bonuses, faction spell and unique model.
- **Full model configuration**: universal models plus your faction's unique model, with weapon upgrades, equipment swaps and merchant items.
- **Live costing**: Shilling totals and starting Erudite charges recalculate as you build, including charges gained from unspent Shillings.
- **Rule validation**: exactly one Wizard, points limit, faction restrictions, summonable model limits and merchant item restrictions are all checked continuously.
- **Save and edit**: Colleges are stored locally in the browser, and can be reopened and amended at any time.
- **Print / PDF export**: a dedicated print layout renders a clean roster sheet with full stat blocks, equipment and special rules.

## Tech Stack

- **SvelteKit 2** with **Svelte 5** (runes mode forced project-wide)
- **TypeScript** in strict mode
- **TailwindCSS v4** via the Vite plugin
- **Vitest** (browser and node projects) with Playwright
- **pnpm**

## Getting Started

```sh
pnpm install
pnpm dev
```

| Command          | Description                  |
| ---------------- | ---------------------------- |
| `pnpm dev`       | Start the dev server         |
| `pnpm build`     | Production build             |
| `pnpm preview`   | Preview the production build |
| `pnpm check`     | Run `svelte-check`           |
| `pnpm lint`      | Prettier check + ESLint      |
| `pnpm format`    | Format with Prettier         |
| `pnpm test`      | Run the full test suite once |
| `pnpm test:unit` | Run Vitest in watch mode     |

The app ships with `@sveltejs/adapter-auto`. Swap in a specific adapter for your deployment target.

## Architecture

```
docs/                          # Source-of-truth rules documents
src/
├── lib/
│   ├── components/
│   │   └── builder/           # Stepped builder UI (faction, models, configurator)
│   ├── data/                  # Game data as typed constants
│   ├── stores/                # Rune-based stores
│   ├── types/                 # game.types.ts, all domain types
│   └── utils/                 # Costing, validation, localStorage
└── routes/
    ├── +page.svelte           # Home, saved Colleges
    ├── builder/               # Guided creation flow (also read-only view via ?view=<id>)
    └── edit/                  # Direct roster editing via ?id=<id>
```

### Game data

`docs/` holds the rules as Markdown and is the source of truth for all game data. Everything in `src/lib/data/` is transcribed from it by hand and must match exactly:

- `factions.ts`: all 11 factions with Empowered bonuses, faction spells and unique models
- `universal-models.ts`: Wizard, Slogger, Scrapper, Dragoon, Arcane Engine, Field Gun, Broomstick C.A.T.V. and friends
- `spells-and-items.ts`: core spells and merchant items

Data files are treated as read-only constants. Derived values (model cost, College cost, Erudite charges) are computed rather than stored.

### State

Two stores, both using Svelte 5 runes and exposed through getters so consumers get reactive reads without direct mutation:

- `college.store.svelte.ts`: the College currently being built. Holds name, faction, models and game config as `$state`; total cost, Erudite charges and validation errors are `$derived`.
- `saved-colleges.store.svelte.ts`: a thin reactive wrapper over `localStorage`.

Persistence lives in `utils/storage.ts` under the `a28-saved-colleges` key. It is SSR-safe (returns an empty list when `window` is undefined) and tolerates corrupt JSON. There is no backend; everything stays in the browser.

### Rules engine

`utils/college-calculations.ts` is pure and framework-free, which makes it the easiest part of the codebase to test and reason about:

- `calculateModelCost` / `calculateCollegeCost`: base cost plus upgrades plus merchant item
- `calculateEruditeCharges`: 1 charge per 10 Shillings spent, plus 1 per 2 Shillings unspent
- `validateCollege`: Wizard count, points limit, faction legality, summonable restrictions, merchant item restrictions
- `checkMerchantItemRestriction`: resolves restriction strings such as `Wizard only` or `50mm base or smaller`
- `calculateUnderdogBonus` and `validateCampaignCollege`: campaign helpers

Two restriction edge cases are marked with `TODO` comments and currently resolve conservatively: `Wizard or Veteran only` (Veteran state is campaign-only and not yet tracked) and the `50-60mm` base band.

### Testing

Vitest runs two projects, split by filename:

- **client**: `*.svelte.{test,spec}.ts`, in headless Chromium via Playwright
- **server**: everything else, in Node

Alongside the unit tests, `data/data-integrity.test.ts` guards the transcribed game data: it checks faction IDs against the type union, verifies every merchant item restriction string is one the validator actually handles, and catches structural drift between the data files and the types.

## Conventions

See `CLAUDE.md` for the full set. In short: British English, no em-dashes, arrow functions, `type` over `interface` for data shapes, union types over enums, kebab-case filenames, Svelte 5 runes, `{#snippet}` over slots, and Tailwind utilities in markup rather than extracted CSS classes.

## Credits

- **Aetherpunk 28** created by Jack Edwards
