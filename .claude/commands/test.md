---
description: Run the test suite and fix what fails
argument-hint: "[test-file-or-pattern]"
---

Run the tests for `$1` (default: the whole suite — see the command table in
CLAUDE.md).

For each failure:

1. Read the actual assertion output. Do not guess from the test name.
2. Find the root cause before editing. Grep for every caller of the function
   involved — a guard added in one caller usually means the same bug is live in
   the siblings.
3. Fix the source, not the test. Change the test only when the test itself
   encodes the wrong expectation, and say explicitly that you did.
4. Re-run.

Never delete, skip, or loosen an assertion to get green.

When done, report the real result: what passed, what still fails, and what you
did not get to.
