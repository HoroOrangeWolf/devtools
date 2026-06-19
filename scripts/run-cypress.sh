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

cleanup() {
	if [ -n "${SERVER_PID}" ] && kill -0 "${SERVER_PID}" 2>/dev/null; then
		kill "${SERVER_PID}" 2>/dev/null || true
		wait "${SERVER_PID}" 2>/dev/null || true
	fi
}

trap cleanup EXIT INT TERM

cd "${ROOT_DIR}"

: > "${SERVER_LOG}"
rtk pnpm dev >"${SERVER_LOG}" 2>&1 &
SERVER_PID=$!

for _ in $(seq 1 60); do
	if curl --silent --fail "${BASE_URL}" >/dev/null 2>&1; then
		rtk pnpm exec cypress run "$@"
		exit $?
	fi

	if ! kill -0 "${SERVER_PID}" 2>/dev/null; then
		echo "dev server exited before Cypress started" >&2
		tail -n 50 "${SERVER_LOG}" >&2 || true
		exit 1
	fi

	sleep 1
done

echo "timed out waiting for dev server at ${BASE_URL}" >&2
tail -n 50 "${SERVER_LOG}" >&2 || true
exit 1
