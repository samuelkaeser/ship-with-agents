#!/usr/bin/env bash
# Legt den Anthropic-Schlüssel für Claude Code ab und prüft ihn mit einem kostenlosen API-Aufruf.
set -euo pipefail
umask 077

key_file="$HOME/.claude/anthropic-key"

printf 'Schlüssel vom Zettel einfügen (die Eingabe bleibt unsichtbar), dann Enter: '
read -rs key
echo
key="${key//[[:space:]]/}"

if [[ "$key" != sk-ant-* ]]; then
  echo "Das sieht nicht nach einem Schlüssel aus: er muss mit sk-ant- beginnen." >&2
  echo "Es wurde nichts gespeichert. Bitte ./setup-key.sh nochmals starten und den ganzen Schlüssel einfügen." >&2
  exit 1
fi

mkdir -p "$HOME/.claude"
printf '%s\n' "$key" > "$key_file"
chmod 600 "$key_file"
echo "Schlüssel gespeichert."

# Gratis-Test (Modellliste). Der Schlüssel geht über stdin an curl, damit er nicht in der Prozessliste steht.
status=$(printf 'x-api-key: %s\n' "$key" | curl -s -o /dev/null -w '%{http_code}' --max-time 15 \
  -H @- -H 'anthropic-version: 2023-06-01' https://api.anthropic.com/v1/models) || status=000

case "$status" in
  200)
    echo "Bereit. Starte Claude Code mit:  claude"
    ;;
  401 | 403)
    echo "Der Schlüssel wurde abgelehnt (falsch eingefügt oder abgelaufen)." >&2
    echo "Starte ./setup-key.sh nochmals und füge den Schlüssel erneut ein. Klappt es wieder nicht, frag die Workshop-Leitung." >&2
    exit 1
    ;;
  000)
    echo "Keine Verbindung zu api.anthropic.com. Der Schlüssel ist gespeichert, geprüft ist er noch nicht." >&2
    echo "Prüfe die Verbindung und starte ./setup-key.sh nochmals, oder frag die Workshop-Leitung." >&2
    exit 1
    ;;
  *)
    echo "Unerwartete Antwort der API (HTTP $status). Der Schlüssel ist gespeichert, ob er gültig ist, ist unklar." >&2
    echo "Probiere es mit  claude  oder frag die Workshop-Leitung." >&2
    exit 1
    ;;
esac
