#!/usr/bin/env bash
# Pre-answers Claude Code's first-run questions (theme, folder trust, API key
# source, bypass-mode warning). Safe to run repeatedly: existing keys are kept.
set -euo pipefail

workspace="${1:-$PWD}"
mkdir -p "$HOME/.claude"

merge_json() {
  node -e '
    const fs = require("fs");
    const [file, patch] = process.argv.slice(1);
    let cur = {};
    if (fs.existsSync(file)) cur = JSON.parse(fs.readFileSync(file, "utf8"));
    const merge = (a, b) => {
      for (const [k, v] of Object.entries(b)) {
        a[k] = v && typeof v === "object" && !Array.isArray(v) ? merge(a[k] ?? {}, v) : v;
      }
      return a;
    };
    fs.writeFileSync(file, JSON.stringify(merge(cur, JSON.parse(patch)), null, 2) + "\n");
  ' "$1" "$2"
}

merge_json "$HOME/.claude.json" "$(node -e '
  console.log(JSON.stringify({
    hasCompletedOnboarding: true,
    projects: { [process.argv[1]]: { hasTrustDialogAccepted: true } },
  }));
' "$workspace")"

merge_json "$HOME/.claude/settings.json" '{
  "apiKeyHelper": "cat ~/.claude/anthropic-key",
  "model": "claude-sonnet-5-5",
  "skipDangerousModePermissionPrompt": true
}'
