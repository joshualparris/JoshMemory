#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV="${JOSHMEMORY_VENV:-$ROOT/.venv}"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/joshmemory"
ENV_FILE="$CONFIG_DIR/central.env"
SERVICE_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
SERVICE_FILE="$SERVICE_DIR/joshmemory-central.service"
PORT="${JOSHMEMORY_PORT:-8765}"

mkdir -p "$CONFIG_DIR" "$SERVICE_DIR"
python3 -m venv "$VENV"
"$VENV/bin/python" -m pip install --upgrade pip
"$VENV/bin/python" -m pip install -e "$ROOT"

if [[ -n "${JOSHMEMORY_BIND:-}" ]]; then
  BIND="$JOSHMEMORY_BIND"
elif command -v tailscale >/dev/null 2>&1; then
  BIND="$(tailscale ip -4 2>/dev/null | head -n1 || true)"
else
  BIND=""
fi
if [[ -z "$BIND" ]]; then
  BIND="127.0.0.1"
fi

if [[ -f "$ENV_FILE" ]]; then
  # Preserve an existing secret. Update only address/port below.
  TOKEN="$(sed -n 's/^JOSHMEMORY_TOKEN=//p' "$ENV_FILE" | head -n1)"
else
  TOKEN=""
fi
if [[ -z "$TOKEN" ]]; then
  TOKEN="$("$VENV/bin/python" - <<'PY'
import secrets
print(secrets.token_urlsafe(48))
PY
)"
fi

cat >"$ENV_FILE" <<EOF
JOSHMEMORY_BIND=$BIND
JOSHMEMORY_PORT=$PORT
JOSHMEMORY_TOKEN=$TOKEN
EOF
chmod 600 "$ENV_FILE"

cat >"$SERVICE_FILE" <<EOF
[Unit]
Description=JoshMemory central shared-memory service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=$ROOT
EnvironmentFile=$ENV_FILE
ExecStart=$VENV/bin/joshmemory-central
Restart=on-failure
RestartSec=3

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now joshmemory-central.service

for _ in {1..20}; do
  if curl --fail --silent --show-error "http://$BIND:$PORT/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

if ! curl --fail --silent --show-error "http://$BIND:$PORT/health"; then
  echo >&2
  echo "JoshMemory service did not pass its health check." >&2
  systemctl --user --no-pager status joshmemory-central.service >&2 || true
  exit 1
fi

echo
echo "JoshMemory central service is running."
echo "Server URL: http://$BIND:$PORT"
echo "Client token is stored in: $ENV_FILE"
echo "Token: $TOKEN"
if [[ "$BIND" == "127.0.0.1" ]]; then
  echo "WARNING: only loopback was available. Install/connect Tailscale or set JOSHMEMORY_BIND to a trusted reachable address, then rerun this installer."
fi
