---
description: Review the current diff for correctness, then quality
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(git log:*)
argument-hint: "[base-branch]"
---

Review the diff against `$1` (default: the branch this one was cut from).

Start with `git diff` and `git status` to see exactly what changed. Read the
surrounding code for every changed file — a diff read in isolation produces
confident wrong findings.

Report in two passes.

**Pass 1 — correctness.** Only defects that can actually bite:

- logic that produces the wrong result for some concrete input
- unhandled error paths, missing `await`, leaked resources
- off-by-one, wrong comparison operator, inverted condition
- security: injection, missing authz check, secret in the diff
- behaviour changed in a way the task did not ask for

For each one: file and line, what breaks, and the input that breaks it. If you
cannot name the failing input, it is a hunch — label it as such or drop it.

**Pass 2 — quality.** Only after correctness:

- code that duplicates something already in this repo (name the existing thing)
- an abstraction with one caller
- a change larger than the task required

Rank most severe first. If the diff is clean, say so in one line — do not invent
findings to fill the report.
