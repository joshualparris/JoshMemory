#!/usr/bin/env bash
# Publishes dist/public to the GitHub Pages repo without losing anyone else's work.
#   tools/publish_pages.sh <site-repo-checkout> "commit message"
# Keeps the site repo's own files (README.md, AGENTS.md, CLAUDE.md, .nojekyll) and stops
# if the publish would delete files that are not in the build: those are someone's
# hand edits that must first be ported into repository-town/src (see AGENTS.md).
set -euo pipefail
site="$1"; msg="${2:-Publish Repository Town build}"
town="$(cd "$(dirname "$0")/.." && pwd)"
node "$town/tools/build.mjs"
node "$town/tools/check_privacy.mjs"
git -C "$site" fetch -q origin main
git -C "$site" reset -q --hard origin/main
find "$site" -mindepth 1 -maxdepth 1 ! -name .git ! -name README.md ! -name AGENTS.md ! -name CLAUDE.md ! -name .nojekyll -exec rm -rf {} +
cp -r "$town/dist/public/." "$site/"
git -C "$site" add -A
lost="$(git -C "$site" diff --cached --diff-filter=D --name-only)"
if [ -n "$lost" ]; then
  echo "Refusing to publish: these live-site files are not in the build (port them into src/ first):"
  echo "$lost"
  git -C "$site" reset -q --hard origin/main
  exit 1
fi
if git -C "$site" diff --cached --quiet; then echo "Site already up to date."; exit 0; fi
git -C "$site" commit -q -m "$msg"
git -C "$site" push origin main
