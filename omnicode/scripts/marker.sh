#!/usr/bin/env bash
set -euo pipefail
IFS= read -r tld || true
[[ "$tld" =~ ^[a-z]{2,63}$ ]] || exit 1
printf 'TLD-%s\n' "${tld^^}"
