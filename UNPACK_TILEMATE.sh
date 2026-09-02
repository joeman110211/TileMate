#!/usr/bin/env bash
set -euo pipefail
# Reconstruct TileMate folder structure from the browser-uploaded flat files.
for f in ROOT__*; do
  [ -f "$f" ] || continue
  target=".${f#ROOT__}"
  mv "$f" "$target"
done
for f in *__*; do
  [ -f "$f" ] || continue
  rel="${f//__//}"
  mkdir -p "$(dirname "$rel")"
  mv "$f" "$rel"
done
rm -f UNPACK_TILEMATE.sh
