#!/bin/sh
set -eu

HERMES_HOME=${HERMES_HOME:-"$HOME/.hermes"}
DEST="$HERMES_HOME/desktop-plugins/spotify-player/plugin.js"

if [ -L "$DEST" ]; then
  rm "$DEST"
  rmdir "$(dirname "$DEST")" 2>/dev/null || true
  printf '%s\n' 'Removed the Spotify Player desktop link.'
else
  printf '%s\n' "No managed desktop link found at $DEST"
fi
