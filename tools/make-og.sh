#!/bin/sh
set -eu

version="${1:?usage: tools/make-og.sh VERSION}"
root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
out="$root/releases/og-$version.png"

mkdir -p "$root/releases"

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

sed "s/__VERSION__/$version/g" "$root/tools/og-template.svg" > "$tmp"
rsvg-convert -w 1200 -h 630 -o "$out" "$tmp"

echo "$out"
