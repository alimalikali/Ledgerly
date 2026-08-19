---
description: Stage and commit the current changes
disable-model-invocation: true
allowed-tools: Bash(git add *), Bash(git commit *), Bash(git status *), Bash(git diff *), Bash(git log *)
---

Review and commit what is currently changed.

1. `git status` and `git diff` — see everything that would go in.
2. `git log -5 --oneline` — match the message style this repo already uses.
3. Stage deliberately. Never `git add -A` without looking; do not commit debug
   output, secrets, or unrelated files that happen to be dirty.
4. Write the message: a short imperative subject (~50 chars), then a body only
   when the *why* is not obvious from the diff. Explain the reason, not the
   mechanics — the diff already shows what changed.
5. Commit. Do not push unless asked.

If the working tree mixes two unrelated changes, say so and propose splitting
them rather than committing both together.
