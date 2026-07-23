#!/bin/sh
set -eu

if [ "$(uname -s)" != "Darwin" ]; then
  printf '%s\n' 'spotify-player currently requires macOS.' >&2
  exit 1
fi

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
HERMES_HOME=${HERMES_HOME:-"$HOME/.hermes"}
DEST="$HERMES_HOME/desktop-plugins/spotify-player"
SOURCE="$ROOT/desktop/plugin.js"

mkdir -p "$DEST"
if [ -e "$DEST/plugin.js" ] && [ ! -L "$DEST/plugin.js" ]; then
  printf '%s\n' "Refusing to replace existing file: $DEST/plugin.js" >&2
  printf '%s\n' 'Move it aside, then run this installer again.' >&2
  exit 1
fi
ln -sfn "$SOURCE" "$DEST/plugin.js"

printf '%s\n' "Desktop plugin linked: $DEST/plugin.js"
printf '%s\n' 'Restart the Hermes gateway, then use Cmd+K → Reload desktop plugins.'
