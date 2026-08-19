---
name: learn-codebase
description: Fill this repo's .claude/ setup with real knowledge of this codebase — the TODOs in CLAUDE.md, settings.json permissions matched to the actual toolchain, and rules that reflect how this code is really written. Use right after scaffolding, or when CLAUDE.md has drifted from what the repo does now.
disable-model-invocation: true
---

# Learn this codebase

Turn a freshly scaffolded `.claude/` into one that knows this repo.

The scaffold ships placeholders. Until they are replaced with facts, every
session pays context cost for a file that says `TODO`. Your job is to replace
them with things that are **true and verified** — never plausible guesses.

Field guide for what belongs in each section: `reference.md` in this directory.

## Step 1 — Scan, in parallel, out of this context

A codebase scan produces far more text than the answer needs. Dispatch three
`explorer` agents concurrently (one message, three tool calls) and keep only
what they return.

**Explorer A — toolchain and commands**
> Report this repo's stack and its real commands. Read package.json / Cargo.toml
> / pyproject.toml / go.mod / Makefile / CI workflow files. I need: language and
> runtime version, package manager (decide from the lockfile, not the README),
> and the exact commands for install, dev, test, single-file test, lint,
> typecheck, build. Quote each command verbatim from where it is defined and
> give me the file and line. If a command is not defined anywhere, say "none"
> rather than guessing the conventional one.

**Explorer B — architecture**
> Map this repo's structure. I need: the entry point(s), the top-level modules
> and what each is responsible for, how a typical request or invocation flows
> through them, and where state lives (database, cache, queue, filesystem).
> Cite file paths. Five bullets maximum — I want the shape, not an inventory.

**Explorer C — conventions and traps**
> Find the unwritten rules of this repo. Read 5-10 representative source files
> and the last 30 commits. I need: naming and file-layout patterns, the test
> framework and how tests are structured, error-handling style, commit message
> format, and anything a newcomer would get wrong — a helper that must be used
> instead of the obvious builtin, a function that looks pure but isn't, a
> directory that is generated and must not be edited by hand. Cite examples.

## Step 2 — Fill CLAUDE.md

Replace every `TODO`. Keep the file under 200 lines — it loads on every session.

Write only what Explorer A quoted from a real file. If no lint command exists,
delete that row; do not write `npm run lint` because most repos have one.

For Architecture and Conventions, include only what someone would **get wrong by
guessing**. "Uses Express" earns its line only if that is not obvious from the
imports. "Auth middleware must run before the tenant resolver or the query hits
the wrong database" always earns its line.

Delete any section you have nothing true to put in. An empty section is worse
than a missing one — it invites future filler.

## Step 3 — Retune settings.json

The shipped `permissions.allow` assumes npm. Rewrite it for the real package
manager, using the commands Explorer A found:

- pnpm → `Bash(pnpm test:*)`, `Bash(pnpm build:*)`
- cargo → `Bash(cargo test:*)`, `Bash(cargo check:*)`
- make → `Bash(make test:*)`
- and so on

Add read-only commands this repo actually uses often. Do **not** touch the
`deny` list — it blocks reading `.env`, keys and secrets, and it is correct as
shipped. If this repo keeps secrets somewhere else too, add that path to `deny`.

## Step 4 — Write rules that are specific to here

The shipped `rules/` are generic and stay. Add at most **two** files for things
Explorer C found that are specific to this repo — a data-access pattern that
must always be used, a framework convention with a real trap in it.

One rule file per topic. If you cannot name a concrete mistake the rule
prevents, do not write it.

Knowledge too long for a rule — a subsystem with its own vocabulary and traps —
belongs in a skill instead, where it costs nothing until that subsystem is being
worked on. Write it as `skills/<name>/SKILL.md`:

```
---
name: <kebab-case, same as the directory>
description: <when to use it — this is the only part always in context>
---
```

Keep `SKILL.md` to navigation plus the few facts needed every time, and put
detail in sibling files it points at by name. This skill is built that way; see
`reference.md` next to it.

## Step 5 — Verify before reporting done

Not optional. Everything above is a claim until checked:

1. `grep -rn "TODO" CLAUDE.md` → must return nothing.
2. Run the test command you wrote in CLAUDE.md. If it errors, the command is
   wrong. Fix it and run it again.
3. Run the build and lint commands you wrote. Same rule.
4. `node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json'))"`
   → must parse.
5. Re-read CLAUDE.md as if you had never seen this repo. Any line you could have
   written without reading the code is filler — delete it.

## Report

State what you wrote, and separately state what you could **not** determine and
left out. A short honest CLAUDE.md beats a complete-looking one with three
invented commands in it — those cost every future session real time before
anyone notices they are wrong.
