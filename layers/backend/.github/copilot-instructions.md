## Quick context for AI coding agents

This Nuxt "layer" is a backend-focused Nuxt/Nitro project that exposes server routes, uses Drizzle ORM for SQLite/D1 access, and relies on runtime helpers injected by the layer playground and @nuxthub/core.

Key points an agent should know before editing code:

- Dev workflow: this repo uses pnpm (see `README.md`). Use the layer playground so runtime helpers are available.

  ```bash
  pnpm install
  pnpm dev    # runs `nuxi dev .playground` as configured in package.json
  pnpm build  # runs `nuxt build .playground`
  ```

- Runtime helpers (do not re-implement):
  - `hubDatabase()` and `hubBlob()` are provided at runtime (see generated `.playground/.nuxt/dev/index.mjs`). They proxy to the project's DB and blob storage. Use `useDrizzle()` (in `server/utils/drizzle.ts`) for DB access and `hubBlob()` for file operations.
  - `useDrizzle()` returns a Drizzle instance wired to `hubDatabase()` with the schema in `server/database/schema.ts`.

- Auth & session helpers: the project uses `nuxt-auth-utils`. Local wrappers live in `server/utils/session.ts`:
  - `myRequireUserSession(event)` — typed wrapper around `requireUserSession` that returns the user payload type from `shared`/zod schemas.
  - `updateUserSession(event, user)` — wrapper around `replaceUserSession`.

- Database conventions:
  - Schema is defined in `server/database/schema.ts` with Drizzle `sqliteTable` definitions and relations. Prefer using the exported `tables` and relation helpers from `server/utils/drizzle.ts`.
  - Use the project's inferred types exported from `server/utils/drizzle.ts` (e.g. `UserInsert`, `MembersToGroupsInsert`) for function signatures.

- File & gallery patterns:
  - File uploads/serving is implemented via `hubBlob()` and routes under `server/api/gallery/*` and `server/routes/files/[...pathname].get.ts`. Use these helpers instead of introducing new file-storage code.

- Where to make changes (common hotspots):
  - DB models / relations: `server/database/schema.ts` (single source of truth for tables and views).
  - DB access helpers / queries: `server/utils/drizzle.ts`, `server/utils/*` (e.g., `user.ts`, `group.ts`). Follow existing query style (call `useDrizzle()` then `.select()/.insert()` patterns).
  - Auth checks: use `myRequireUserSession` from `server/utils/session.ts` in API handlers.
  - Uploads & blobs: `hubBlob().handleUpload`, `hubBlob().serve`, `hubBlob().del` as used in `server/api/gallery/*`.

- Generated types & imports:
  - The playground build produces `nitro-imports` typings (see `.playground/.nuxt/types/nitro-imports.d.ts`) which re-export `useDrizzle`, session helpers, etc. Prefer relying on those runtime imports in server code.

- Scripts & linting:
  - `pnpm dev` boots the `.playground` dev server and generates runtime proxies; it's required for hub helpers to be present locally.
  - Lint: `pnpm lint` / `pnpm lint:fix` are available.

Examples (follow these patterns):

- DB query example (follow `server/utils/user.ts`):
  - use `useDrizzle()` then chain `.select().from(tables.users).where(...).get()`

- Secure route example (use session helper):
  - in an API handler call `const session = await myRequireUserSession(event)` and use `session.user`.

What agents should NOT do:

- Recreate `hubDatabase()`/`hubBlob()` or change the way they are called; they are provided by the playground/@nuxthub runtime.
- Replace the Drizzle schema in `server/database/schema.ts` without migrating or updating related code; schema changes affect many files.

Files worth reading first:

- `package.json` — dev/build scripts
- `README.md` — layer/playground notes
- `server/utils/drizzle.ts` — DB glue (useDrizzle + exported types)
- `server/database/schema.ts` — full schema & relations
- `server/utils/session.ts` — session wrappers
- `server/utils/user.ts`, `server/utils/group.ts` — query style examples
- `server/api/gallery/*` and `server/routes/files/*` — blob/file handling examples

If anything here is unclear or you want more detail on a specific area (DB migrations, a particular API route, or how playground proxies work), tell me which part and I'll expand the instructions or add code examples.
