## Quick context for AI coding agents

This repository is a Nuxt 4 site with server, shared utilities, and frontend code all at the root level.

- Project layout (high level):
  - Frontend: `app/`, `pages/`, `components/`, `content/` — content-driven site using `@nuxt/content` and `@nuxt/ui`.
  - Backend (runtime APIs & DB): `server/` directory contains API routes, database, and utilities.
  - Shared types/utilities: `shared/` directory contains zod schemas and authorization helpers used across frontend and backend.

- Dev & build basics:
  - Uses pnpm. Typical commands (run from repo root):
    - `pnpm install`
    - `pnpm dev` — boots the `.playground` dev server; required locally so runtime helpers (hubDatabase/hubBlob) are available.
    - `pnpm build` / `pnpm preview`
  - Linting/typechecks: `pnpm lint`, `pnpm lint:fix`, `pnpm typecheck`.

- Runtime helpers (do not re-implement):
  - DB access wrapper: `useDrizzle()` (see `server/utils/drizzle.ts`) -> returns a Drizzle instance wired to `hubDatabase()` and the schema (see `server/database/schema.ts`).
  - Session helpers: typed wrappers like `myRequireUserSession(event)` and `updateUserSession` live in `server/utils/session.ts` — use these for secure routes instead of raw auth calls.

- Data & DB conventions:
  - Drizzle schema lives at `server/database/schema.ts`. Tables, relations, and a `members_view` are defined there — treat it as the source of truth.
  - `server/utils/drizzle.ts` re-exports `tables`, helper SQL functions, and common insert/update types (e.g. `UserInsert`). Use those exported types for signatures.
  - Query pattern: call `const db = useDrizzle()` then `db.select().from(tables.users).where(...).get()` (see `server/utils/user.ts` for examples).

- File / gallery patterns:
  - File uploads use `hubBlob().handleUpload(...)` (see `server/api/gallery/upload.ts`).
  - File serving routes live under `server/routes/files/[...pathname].get.ts` and gallery routes under `server/api/gallery/*` — prefer existing helpers for storage operations.

- Auth & secure routes:
  - In API handlers use `await myRequireUserSession(event)` to assert and obtain a typed session.
  - Follow existing handlers for error/status conventions; avoid introducing alternate session management layers.

- Where to look / common edit points:
  - `package.json`, `nuxt.config.ts` — dev/build/runtime configuration
  - `server/database/schema.ts` — schema & relations (DB model changes ripple widely)
  - `server/utils/drizzle.ts` — DB glue and exported types
  - `server/utils/session.ts` — session wrappers
  - `server/api/gallery/*` and `server/routes/files/*` — upload and file-serving examples
  - `app/pages` and `content/*` — content-driven pages and routing conventions

- Examples (copy patterns exactly):
  - DB access: `const db = useDrizzle(); await db.select().from(tables.users).where(eq(tables.users.id, id)).get()`
  - Secure upload handler: `await requireUserSession(event); return hubBlob().handleUpload(event, { multiple: false, ensure: { maxSize: '8MB' } })`

- Important do/ don't notes:
  - DO run `pnpm dev` to ensure runtime hub helpers are available before running or editing server handler code locally.
  - DO use exported types from `server/utils/drizzle.ts` for function signatures.
  - DON'T re-implement or replace `hubDatabase()` / `hubBlob()` or change how they are consumed.
  - DON'T change the Drizzle schema without updating all dependent queries and considering migrations; prefer incremental, isolated schema changes.

NOTE: All files placed under `.github/prompt_files` are considered "prompt files" and should be referenced by AI agents when the user says "use the prompt files" or similar. Treat them as canonical context for future prompts.
