#!/bin/bash
# One-click launcher: serves the game and opens it in your default browser.
cd "$(dirname "$0")" || exit 1

PORT=8765
URL="http://127.0.0.1:${PORT}/index.html"

if lsof -iTCP:"$PORT" -sTCP:LISTEN -P -n >/dev/null 2>&1; then
  echo "Port $PORT is already in use — opening the game (existing server?)."
  open "$URL"
  exit 0
fi

python3 -m http.server "$PORT" >/dev/null 2>&1 &
SERVER_PID=$!
disown "$SERVER_PID" 2>/dev/null || true

# Wait until the port is accepting connections
for _ in $(seq 1 50); do
  if lsof -iTCP:"$PORT" -sTCP:LISTEN -P -n >/dev/null 2>&1; then
    break
  fi
  sleep 0.1
done

open "$URL"
echo "Chronicles of the Sword Coast is open at $URL"
echo "Server PID $SERVER_PID (Python). To stop it later: kill $SERVER_PID"
echo "Or: Activity Monitor → search Python → quit the http.server process."
read -r -p "Press Enter to close this window (server keeps running)…"
