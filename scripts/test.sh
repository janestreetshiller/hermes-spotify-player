#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

node scripts/vendor-metal-fx.mjs --check
node --test desktop/*.test.mjs
python -m unittest discover -s tests -p 'test_plugin_api.py' -v
python -m compileall -q dashboard/plugin_api.py tests/test_plugin_api.py

if [ "$(uname -s)" = "Darwin" ]; then
  TEST_HOME=$(mktemp -d "${TMPDIR:-/tmp}/spotify-player-install.XXXXXX")
  trap 'rm -rf "$TEST_HOME"' EXIT HUP INT TERM
  HERMES_HOME="$TEST_HOME/hermes-home" ./scripts/install-desktop.sh >/dev/null
  LINK="$TEST_HOME/hermes-home/desktop-plugins/spotify-player/plugin.js"
  [ -L "$LINK" ]
  [ "$(readlink "$LINK")" = "$ROOT/desktop/plugin.js" ]
  HERMES_HOME="$TEST_HOME/hermes-home" ./scripts/uninstall-desktop.sh >/dev/null
  [ ! -e "$LINK" ]
  rm -rf "$TEST_HOME"
  trap - EXIT HUP INT TERM
fi
