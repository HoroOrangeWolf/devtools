#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-4321}"
BASE_URL="${BASE_URL:-http://127.0.0.1:${PORT}}"
SERVER_LOG="${SERVER_LOG:-/tmp/devtools-cypress-server.log}"

if ! command -v node >/dev/null 2>&1 && [ -d "${HOME}/.nvm/versions/node" ]; then
	LATEST_NODE_BIN="$(
		find "${HOME}/.nvm/versions/node" -mindepth 2 -maxdepth 2 -type d -name bin 2>/dev/null \
			| sort -V \
			| tail -n 1
	)"

	if [ -n "${LATEST_NODE_BIN}" ]; then
		export PATH="${LATEST_NODE_BIN}:${PATH}"
	fi
fi

if ! command -v node >/dev/null 2>&1; then
	echo "node not found on PATH and no NVM install discovered" >&2
	exit 1
fi

if ! command -v rtk >/dev/null 2>&1; then
	echo "rtk not found on PATH" >&2
	exit 1
fi

export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-/tmp/codex-astro-config}"

SERVER_PID=""
CYPRESS_EXIT_CODE=1
SERVER_READY=0

cleanup() {
	if [ -z "${SERVER_PID}" ]; then
		return
	fi

	# Astro is a grandchild of rtk/pnpm, so stop the server's whole process group.
	kill -TERM -- "-${SERVER_PID}" 2>/dev/null || true

	for _ in $(seq 1 20); do
		if ! kill -0 -- "-${SERVER_PID}" 2>/dev/null; then
			wait "${SERVER_PID}" 2>/dev/null || true
			return
		fi
		sleep 0.1
	done

	kill -KILL -- "-${SERVER_PID}" 2>/dev/null || true
	wait "${SERVER_PID}" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

cd "${ROOT_DIR}"

if curl --silent --fail --max-time 1 "${BASE_URL}" >/dev/null 2>&1; then
	echo "a server is already running at ${BASE_URL}; stop it before running Cypress" >&2
	exit 1
fi

: > "${SERVER_LOG}"
setsid rtk pnpm exec astro dev --host 127.0.0.1 --port "${PORT}" >"${SERVER_LOG}" 2>&1 &
SERVER_PID=$!

for _ in $(seq 1 60); do
	if curl --silent --fail --max-time 1 "${BASE_URL}" >/dev/null 2>&1; then
		SERVER_READY=1
		set +e
		rtk pnpm exec cypress run --config "baseUrl=${BASE_URL}" "$@"
		CYPRESS_EXIT_CODE=$?
		set -e
		break
	fi

	if ! kill -0 "${SERVER_PID}" 2>/dev/null; then
		echo "dev server exited before Cypress started" >&2
		tail -n 50 "${SERVER_LOG}" >&2 || true
		exit 1
	fi

	sleep 1
done

if [ "${SERVER_READY}" -eq 1 ]; then
	exit "${CYPRESS_EXIT_CODE}"
fi

echo "timed out waiting for dev server at ${BASE_URL}" >&2
tail -n 50 "${SERVER_LOG}" >&2 || true
exit 1
