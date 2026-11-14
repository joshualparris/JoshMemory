#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build/java
javac -encoding UTF-8 -d build/java services/Domain.java
cc -std=c11 -O2 -Wall -Wextra -o build/checksum services/checksum.c
echo 'Built Java and C adapters.'
