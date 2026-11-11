"""Compile and verify the native DSP with generated input; never capture audio."""
import importlib.util
from pathlib import Path
import shutil
import subprocess
import sys

if sys.platform != 'darwin' or not shutil.which('xcrun'):
    print('Native audio DSP: skipped (macOS and Xcode Command Line Tools required).')
    raise SystemExit(0)
root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('audio_native_test', root / 'dashboard/audio_visualizer.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
manager = module.AudioVisualizer(root / 'dashboard/AudioSpectrum.swift')
try:
    binary = manager._binary()
    subprocess.run([str(binary), '--self-test'], check=True, timeout=10)
finally:
    manager.close()
