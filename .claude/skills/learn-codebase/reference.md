# Field guide

Loaded only when `SKILL.md` points here. Detail for filling `CLAUDE.md` well.

## Package manager: decide from the lockfile

The README lies; lockfiles do not. Check in this order and stop at the first hit.

| File present | Manager | Test command shape |
| --- | --- | --- |
| `pnpm-lock.yaml` | pnpm | `pnpm test` |
| `yarn.lock` | yarn | `yarn test` |
| `bun.lockb` | bun | `bun test` |
| `package-lock.json` | npm | `npm test` |
| `Cargo.lock` | cargo | `cargo test` |
| `poetry.lock` | poetry | `poetry run pytest` |
| `uv.lock` | uv | `uv run pytest` |
| `go.sum` | go | `go test ./...` |
| `Gemfile.lock` | bundler | `bundle exec rspec` |

Two lockfiles means the repo is mid-migration. Say so in Conventions and name
which one CI actually uses — check the workflow file, not the README.

## The single-file test command

The most valuable line in the file. Without it, every test run is the full
suite, and slow suites are why sessions stall.

| Runner | Single file |
| --- | --- |
| vitest | `vitest run path/to/file.test.ts` |
| jest | `jest path/to/file.test.js` |
| node:test | `node --test test/file.test.js` |
| pytest | `pytest path/to/test_file.py` |
| go | `go test ./pkg/...` |
| cargo | `cargo test --test integration_name` |

Confirm the runner from the dependency list, not the file extension.

## What earns a line

The test: **could I have written this without reading the repo?** If yes, cut it.

| Cut | Keep |
| --- | --- |
| "Uses TypeScript" | "`strict` is off in `tsconfig.json`; new files should still typecheck under strict" |
| "Follow best practices" | "Every DB call goes through `db/withTenant()` — a raw `db.query` leaks across tenants" |
| "Tests live in `test/`" | "`test/e2e/` needs a running Postgres; `make test-db` starts one" |
| "Uses React" | "Components in `ui/` are server components — adding `useState` breaks the build with no clear error" |
| "Run `npm run lint`" *(unverified)* | "`npm run lint` — note it also rewrites files, run it before staging" |

## Gotchas worth hunting

Explorer C should be pushed until it finds at least one of these:

- A generated directory that must not be hand-edited (`*_pb.go`, `schema.d.ts`,
  migration output) — and the command that regenerates it.
- A wrapper that must be used instead of the obvious builtin (a `fetch` with
  retry and auth, a logger that redacts, a tenant-scoped DB handle).
- Ordering that is load-bearing: middleware, migrations, init side effects.
- A test that is slow or flaky and how the team actually deals with it.
- An env var without which the app starts and then fails confusingly later.

## Length

Under 200 lines total. If you are over, the Architecture section is the usual
culprit — it wants to be an inventory. It should be the five things that make
the rest of the repo legible.

Deep subsystem knowledge does not belong in `CLAUDE.md`. It belongs in a skill,
where it loads only when that subsystem is being worked on.

## Writing it so it stays true

Prefer statements that stay true as the code changes. "The auth flow is in
`api/auth/`" survives a refactor; "`login()` is at `api/auth/index.ts:142`"
is wrong after the next commit and quietly misleads for months.

Where you must cite a line number, cite the file too, so a stale reference is
still findable.
