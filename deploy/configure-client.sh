#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <server-url> <token>" >&2
  exit 2
fi

SERVER_URL="${1%/}"
TOKEN="$2"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/joshmemory"
ENV_FILE="$CONFIG_DIR/client.env"
PROFILE_FILE="$HOME/.profile"

curl --fail --silent --show-error "$SERVER_URL/health" >/dev/null
mkdir -p "$CONFIG_DIR"
cat >"$ENV_FILE" <<EOF
export JOSHMEMORY_REMOTE_URL='$SERVER_URL'
export JOSHMEMORY_TOKEN='$TOKEN'
EOF
chmod 600 "$ENV_FILE"

SOURCE_LINE="[ -f '$ENV_FILE' ] && . '$ENV_FILE'"
if [[ ! -f "$PROFILE_FILE" ]] || ! grep -Fqx "$SOURCE_LINE" "$PROFILE_FILE"; then
  printf '\n%s\n' "$SOURCE_LINE" >>"$PROFILE_FILE"
fi

export JOSHMEMORY_REMOTE_URL="$SERVER_URL"
export JOSHMEMORY_TOKEN="$TOKEN"

printf 'JoshMemory central client configured.\nRemote URL: %s\n' "$SERVER_URL"
printf 'Open a new login shell (or source %s) before launching agents that are already running.\n' "$ENV_FILE"
