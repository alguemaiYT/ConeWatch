#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

MODE="${1:-prod}"
HOST="${HOST:-0.0.0.0}"
DEV_PORT="${DEV_PORT:-8080}"
PREVIEW_PORT="${PREVIEW_PORT:-4173}"
NPM_INSTALL_RETRIES="${NPM_INSTALL_RETRIES:-3}"
PKG_MANAGER_OVERRIDE="${PKG_MANAGER_OVERRIDE:-}"

if [[ "${PKG_MANAGER_OVERRIDE}" == "npm" ]]; then
  PKG_MANAGER="npm"
elif [[ "${PKG_MANAGER_OVERRIDE}" == "bun" ]]; then
  PKG_MANAGER="bun"
elif command -v bun >/dev/null 2>&1 && [[ -f bun.lockb ]]; then
  PKG_MANAGER="bun"
else
  PKG_MANAGER="npm"
fi

retry_npm() {
  local attempt=1
  local max_attempts="${NPM_INSTALL_RETRIES}"
  while (( attempt <= max_attempts )); do
    if "$@"; then
      return 0
    fi
    if (( attempt == max_attempts )); then
      return 1
    fi
    echo "Install attempt ${attempt}/${max_attempts} failed. Retrying in 3s..."
    sleep 3
    (( attempt++ ))
  done
}

install_with_npm() {
  if [[ -f package-lock.json ]]; then
    if ! retry_npm npm ci --prefer-offline --no-audit --no-fund; then
      echo "npm ci failed (lockfile out of sync). Falling back to npm install."
      retry_npm npm install --prefer-offline --no-audit --no-fund
    fi
  else
    retry_npm npm install --prefer-offline --no-audit --no-fund
  fi
}

install_dependencies() {
  if [[ -d node_modules ]]; then
    echo "Dependencies already installed. Skipping install."
    return
  fi

  echo "Installing dependencies with ${PKG_MANAGER}..."

  if [[ "${PKG_MANAGER}" == "bun" ]]; then
    if ! bun install --frozen-lockfile; then
      echo "bun install failed on this machine. Falling back to npm."
      PKG_MANAGER="npm"
      install_with_npm
    fi
  else
    install_with_npm
  fi
}

run_dev_server() {
  echo "Starting dev server on http://${HOST}:${DEV_PORT}"
  if [[ "${PKG_MANAGER}" == "bun" ]]; then
    exec bun run dev --host "${HOST}" --port "${DEV_PORT}"
  fi
  exec npm run dev -- --host "${HOST}" --port "${DEV_PORT}"
}

run_preview_server() {
  export NODE_ENV=production

  echo "Building optimized production bundle..."
  if [[ "${PKG_MANAGER}" == "bun" ]]; then
    bun run build
    echo "Starting preview server on http://${HOST}:${PREVIEW_PORT}"
    exec bun run preview --host "${HOST}" --port "${PREVIEW_PORT}"
  fi

  npm run build
  echo "Starting preview server on http://${HOST}:${PREVIEW_PORT}"
  exec npm run preview -- --host "${HOST}" --port "${PREVIEW_PORT}"
}

install_dependencies

case "${MODE}" in
  dev)
    run_dev_server
    ;;
  prod)
    run_preview_server
    ;;
  *)
    echo "Invalid mode: ${MODE}"
    echo "Usage: ./start-local.sh [prod|dev]"
    exit 1
    ;;
esac
