## Quick context for AI coding agents

This repository is a Nuxt 4 site structured as a Nuxt "layer" with a frontend and a backend layer. Agents should read the layer-level backend instructions at `layers/backend/.github/copilot-instructions.md` for deeper backend runtime details — this file summarizes the essential knowledge to get productive quickly.

- Project layout (high level):
  - Frontend: `app/`, `pages/`, `components/`, `content/` — content-driven site using `@nuxt/content` and `@nuxt/ui`.
  - Backend (runtime APIs & DB): the backend/server layer at `layers/backend/server` (layer playground + same patterns).
  - Shared types/utilities: the backend/shared folder at `layers/backend/shared` mirrors zod schemas and helpers used across layers.

- Dev & build basics:
  - Uses pnpm. Typical commands (run from repo root):
    - `pnpm install`
    - `pnpm dev` — boots the `.playground` dev server; required locally so runtime helpers (hubDatabase/hubBlob) are available.
    - `pnpm build` / `pnpm preview`
  - Linting/typechecks: `pnpm lint`, `pnpm lint:fix`, `pnpm typecheck`.

- Runtime helpers (do not re-implement):
  - hub helpers (`hubDatabase()`, `hubBlob()`) are injected by the playground/@nuxthub runtime. They provide DB and blob storage access.
  - DB access wrapper: `useDrizzle()` (see `layers/backend/server/utils/drizzle.ts`) -> returns a Drizzle instance wired to `hubDatabase()` and the schema (see `layers/backend/server/database/schema.ts`).
  - Session helpers: typed wrappers like `myRequireUserSession(event)` and `updateUserSession` live in `layers/backend/server/utils/session.ts` — use these for secure routes instead of raw auth calls.

- Data & DB conventions:
  - Drizzle schema lives in the backend database layer at `layers/backend/server/database/schema.ts`. Tables, relations, and a `members_view` are defined there — treat it as the source of truth.
  - `layers/backend/server/utils/drizzle.ts` re-exports `tables`, helper SQL functions, and common insert/update types (e.g. `UserInsert`). Use those exported types for signatures.
  - Query pattern: call `const db = useDrizzle()` then `db.select().from(tables.users).where(...).get()` (see `layers/backend/server/utils/user.ts` for examples).

- File / gallery patterns:
  - File uploads use `hubBlob().handleUpload(...)` (see `layers/backend/server/api/gallery/upload.ts`).
  - File serving routes live under `layers/backend/server/routes/files/[...pathname].get.ts` and gallery routes under `layers/backend/server/api/gallery/*` — prefer existing helpers for storage operations.

- Auth & secure routes:
  - In API handlers use `await myRequireUserSession(event)` to assert and obtain a typed session.
  - Follow existing handlers for error/status conventions; avoid introducing alternate session management layers.

- Where to look / common edit points:
  - `package.json`, `nuxt.config.ts` — dev/build/runtime configuration
  - `layers/backend/server/database/schema.ts` — schema & relations (DB model changes ripple widely)
  - `layers/backend/server/utils/drizzle.ts` — DB glue and exported types
  - `layers/backend/server/utils/session.ts` — session wrappers
  - `layers/backend/server/api/gallery/*` and `layers/backend/server/routes/files/*` — upload and file-serving examples
  - `app/pages` and `content/*` — content-driven pages and routing conventions

- Examples (copy patterns exactly):
  - DB access: `const db = useDrizzle(); await db.select().from(tables.users).where(eq(tables.users.id, id)).get()`
  - Secure upload handler: `await requireUserSession(event); return hubBlob().handleUpload(event, { multiple: false, ensure: { maxSize: '8MB' } })`

- Important do/ don't notes:
  - DO run `pnpm dev` to ensure runtime hub helpers are available before running or editing server handler code locally.
  - DO use exported types from `layers/backend/server/utils/drizzle.ts` for function signatures.
  - DO reference `layers/backend/.github/copilot-instructions.md` for deeper layer/playground-specific details.
  - DON'T re-implement or replace `hubDatabase()` / `hubBlob()` or change how they are consumed.
  - DON'T change the Drizzle schema without updating all dependent queries and considering migrations; prefer incremental, isolated schema changes.

If you'd like, I can merge any extra details from `layers/backend/.github/copilot-instructions.md` into this root file or expand sections (DB migrations, playground dev flow, or testing hooks). What area should I expand next?

NOTE: All files placed under `.github/prompt_files` are considered "prompt files" and should be referenced by AI agents when the user says "use the prompt files" or similar. Treat them as canonical context for future prompts.
