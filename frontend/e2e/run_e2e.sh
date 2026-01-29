#!/usr/bin/env bash
set -euo pipefail

# Start backend in test mode (skip DB) and run a minimal check against ingest/text
ROOT=$(dirname "$0")/../..
cd "$ROOT"

export SKIP_DB=1
# If a server is already running on 127.0.0.1:8001, reuse it and don't start/stop servers
SERVER_ALREADY_RUNNING=0
if curl -sS http://127.0.0.1:8001/ >/dev/null 2>&1; then
	echo "Detected existing server at 127.0.0.1:8001 — will reuse it for E2E"
	SERVER_ALREADY_RUNNING=1
	SHOULD_KILL_SERVER=0
else
	SHOULD_KILL_SERVER=1
fi
# Try to start real backend if available, else fall back to mock Node server
if [ "$SERVER_ALREADY_RUNNING" -eq 1 ]; then
	START_MOCK=0
	UV_PID=""
else
	if command -v uvicorn >/dev/null 2>&1; then
		echo "Starting uvicorn backend (SKIP_DB=1)"
		SKIP_DB=1 uvicorn backend.main:app --port 8001 --host 127.0.0.1 &
		UV_PID=$!
		sleep 1
		# check if process still running
		if ! ps -p $UV_PID >/dev/null 2>&1; then
			echo "uvicorn failed to start; falling back to mock server"
			START_MOCK=1
		else
			START_MOCK=0
		fi
	else
		START_MOCK=1
	fi
fi

if [ "$SERVER_ALREADY_RUNNING" -eq 1 ]; then
	echo "Reusing existing server; will not start mock or uvicorn"
	SERVER_PID=""
elif [ "$START_MOCK" -eq 1 ]; then
	echo "Starting Node mock server"
	node ./frontend/e2e/mock_server.js &
	MOCK_PID=$!
	sleep 0.5
	SERVER_PID=$MOCK_PID
else
	SERVER_PID=$UV_PID
fi

echo "Running E2E: POST /api/v1/ingest/text"
RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"source":"ui","content":"e2e test","user_id":"e2e"}' http://127.0.0.1:8001/api/v1/ingest/text || true)
echo "Response: $RESPONSE"

if [ "${SHOULD_KILL_SERVER:-1}" -eq 1 ] && [ -n "${SERVER_PID:-}" ]; then
	kill $SERVER_PID || true
	echo "Server stopped"
else
	echo "Left existing server running (did not stop)"
fi
