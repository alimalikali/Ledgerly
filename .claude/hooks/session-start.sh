#!/usr/bin/env bash
# SessionStart hook — injects git context at the top of every session.
# Contract: exit 0 and print ONLY the JSON object on stdout. Anything else
# (a stray echo, a shell profile banner) breaks parsing.
set -uo pipefail

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# --show-current is empty when detached, and unlike `rev-parse --abbrev-ref` it
# does not print "HEAD" and fail at the same time on a repo with no commits.
branch=$(git branch --show-current 2>/dev/null)
[ -n "$branch" ] || branch="(detached)"

dirty=$(git status --porcelain -uall 2>/dev/null | wc -l | tr -d ' ')
recent=$(git log -3 --pretty=format:'%h %s' 2>/dev/null || true)

json_escape() {
  printf '%s' "$1" |
    sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/\t/\\t/g' |
    awk 'BEGIN { ORS = "" } { print sep $0; sep = "\\n" }'
}

context=$(printf 'Branch: %s\nUncommitted files: %s\nRecent commits:\n%s' \
  "$branch" "$dirty" "$recent")

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' \
  "$(json_escape "$context")"
