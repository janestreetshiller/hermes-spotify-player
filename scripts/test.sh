#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

node --test desktop/plugin.contract.test.mjs desktop/lyrics.test.mjs
python -m unittest discover -s tests -p 'test_plugin_api.py' -v
python -m compileall -q dashboard/plugin_api.py tests/test_plugin_api.py
