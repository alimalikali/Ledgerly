# Code style

Binding for every edit in this repo. Override only when explicitly told to.

## Match the surrounding code

Quote style, semicolons, indent, naming, comment density — copy what the file
already does, even if you would write it differently. A diff that reads like the
rest of the file is worth more than a diff that is objectively prettier.

## Keep it small

- No dead code. Delete unused variables, imports, branches, parameters.
- No abstraction with a single caller. No interface with one implementation, no
  factory for one product, no config for a value that never changes.
- No speculative flexibility. Build what was asked for, not what might be asked
  for later.
- If a change could be half the size and still correct, make it half the size.

## Surgical changes

- Touch only what the task requires. Do not reformat, rename, or "improve"
  adjacent code.
- Clean up orphans your own change created — imports and helpers left unused by
  your edit. Leave pre-existing dead code alone; mention it instead.
- Every changed line should trace back to the request.

## Comments

Default to zero. Code that needs a comment to be understood usually needs a
better name instead. Write one when it explains *why*, never *what*:

- a non-obvious constraint (a spec quirk, a vendor bug being worked around)
- a deliberate trade-off with a known ceiling and the upgrade path

Never leave commented-out code or debug logging behind.

## Errors

- Fail loudly at trust boundaries — validate input where it enters the system.
- Never swallow an error to make a test pass. Never `catch {}` without a reason.
- Error messages name what failed and what to do about it.

## Files

One concept per file. Co-locate tightly related helpers; split when they stop
being related. A file that keeps growing is a file doing too many jobs.
