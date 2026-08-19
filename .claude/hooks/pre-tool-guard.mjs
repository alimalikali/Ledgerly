#!/usr/bin/env node
// PreToolUse hook (matcher: Bash) — blocks or questions destructive commands.
//
// Contract: exit 0 and print ONLY the JSON object on stdout. Printing nothing
// is the neutral answer and leaves the normal permission flow untouched.
//
// Node rather than jq: `npx` already guarantees node, jq is not installed
// everywhere. One less thing to break on a teammate's machine.
//
// .mjs, not .js: this file lands in someone else's repo, so the host
// package.json decides how a .js file is parsed. Under "type": "commonjs" the
// top-level await below is a SyntaxError and the hook dies. .mjs is always ESM.

const RULES = [
  {
    // rm -rf targeting /, ~, $HOME, or a bare variable that could expand to any
    // of them. Catches the classic `rm -rf "$DIR"/` with DIR unset.
    test: /\brm\s+(-[a-zA-Z]*\s+)*-[a-zA-Z]*[rR][a-zA-Z]*[fF]?[a-zA-Z]*\s+(\/|~|\$HOME|\$\{?\w+\}?\/?\s*$)/,
    decision: 'deny',
    reason: 'Recursive delete of /, $HOME, or an unquoted variable path. Name the exact directory instead.'
  },
  {
    test: /\bcurl\b[^|]*\|\s*(sudo\s+)?(ba)?sh\b|\bwget\b[^|]*\|\s*(sudo\s+)?(ba)?sh\b/,
    decision: 'deny',
    reason: 'Piping a downloaded script straight into a shell. Download it, read it, then run it.'
  },
  {
    test: /\bDROP\s+(TABLE|DATABASE|SCHEMA)\b|\bTRUNCATE\s+TABLE\b/i,
    decision: 'deny',
    reason: 'Destructive schema change. Run it through a reviewed migration, not an ad-hoc shell command.'
  },
  {
    test: /\bchmod\s+(-[a-zA-Z]+\s+)*777\b/,
    decision: 'deny',
    reason: 'chmod 777 makes the target world-writable. Grant the narrowest mode that works.'
  },
  {
    // --force(?![-\w]) so that --force-with-lease, the safe form, is not caught.
    test: /\bgit\s+push\b.*(--force(?![-\w])|(?:^|\s)-f(?=\s|$))/,
    decision: 'ask',
    reason: 'Force push can discard commits pushed by someone else. Prefer --force-with-lease.'
  },
  {
    test: /\bgit\s+(reset\s+--hard|clean\s+-[a-zA-Z]*f)\b/,
    decision: 'ask',
    reason: 'This discards uncommitted work irreversibly.'
  }
];

const read = () =>
  new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolve(data));
  });

const payload = await read()
  .then(JSON.parse)
  .catch(() => null);

const command = payload?.tool_input?.command;
if (typeof command !== 'string') process.exit(0);

const hit = RULES.find((r) => r.test.test(command));
if (!hit) process.exit(0);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: hit.decision,
      permissionDecisionReason: hit.reason
    }
  })
);
