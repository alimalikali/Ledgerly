# Security

Not optional, and not something to trade away for a smaller diff.

## Secrets

- Never commit credentials, tokens, keys, or connection strings. They belong in
  environment variables or a secret manager.
- Never paste a secret into a log line, an error message, a test fixture, or a
  commit message.
- If you find a committed secret, stop and say so. Rotating it is the fix —
  deleting the line is not, the value stays in git history.

## Input

Validate at every trust boundary: HTTP handlers, queue consumers, CLI args,
file uploads, webhook payloads. Validate shape *and* range, not just presence.

- Parameterised queries only. Never build SQL, shell, or a regex by string
  concatenation with user input.
- Escape on output according to the sink (HTML, SQL, shell, JSON, URL).
- Treat data from your own database as untrusted if a user ever wrote it.

## Authorisation

Check on every request, server-side, at the point the resource is loaded.
A hidden UI control is not an access check. Deny by default — an unlisted
action is forbidden, not permitted.

## Dependencies

No new top-level dependency without asking first. Before adding one, check the
stdlib and what is already installed.

## Destructive operations

Look at the target before deleting or overwriting. Anything irreversible or
outward-facing — force pushes, migrations, deletes, sending mail, publishing —
gets confirmed first, unless you were explicitly told to proceed.
