#!/usr/bin/env bash
set -euo pipefail

missing=()
for name in VERCEL_ORG_ID VERCEL_PROJECT_ID VERCEL_TOKEN; do
  if [ -z "${!name:-}" ]; then
    missing+=("$name")
  fi
done

if [ "${#missing[@]}" -gt 0 ]; then
  printf 'Missing required GitHub secret(s): %s\n' "${missing[*]}"
  exit 1
fi
