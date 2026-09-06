#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

node scripts/vendor-metal-fx.mjs --check
node --test desktop/*.test.mjs
PYTHON="${HERMES_PYTHON:-python3}"
"$PYTHON" -m unittest discover -s tests -p 'test_plugin_api.py' -v
"$PYTHON" -m unittest discover -s tests -p 'test_audio_visualizer.py' -v
"$PYTHON" -m compileall -q dashboard tests
"$PYTHON" scripts/test-audio-native.py

"$PYTHON" -m unittest discover -s tests -p 'test_desktop_install.py' -v
"$PYTHON" -m unittest discover -s tests -p 'test_mix_desk.py' -v
"$PYTHON" -m unittest discover -s tests -p 'test_skill_install.py' -v
