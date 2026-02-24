#!/usr/bin/env bash
set -euo pipefail

cd /repo

export NEXA_STATE_DIR="/tmp/nexa-test"
export NEXA_CONFIG_PATH="${NEXA_STATE_DIR}/nexa.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${NEXA_STATE_DIR}/credentials"
mkdir -p "${NEXA_STATE_DIR}/agents/main/sessions"
echo '{}' >"${NEXA_CONFIG_PATH}"
echo 'creds' >"${NEXA_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${NEXA_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm nexa reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${NEXA_CONFIG_PATH}"
test ! -d "${NEXA_STATE_DIR}/credentials"
test ! -d "${NEXA_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${NEXA_STATE_DIR}/credentials"
echo '{}' >"${NEXA_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm nexa uninstall --state --yes --non-interactive

test ! -d "${NEXA_STATE_DIR}"

echo "OK"
