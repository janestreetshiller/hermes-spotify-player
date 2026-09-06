"""Opt-in Spotify audio analyzer; in-memory data only, with expiring viewer leases.

GET never starts capture. An explicit consented POST grants a short viewer lease.
The native helper is stopped when the last viewer leaves, stops polling, or hangs.
"""
from __future__ import annotations

import atexit
import hashlib
import json
import math
import os
import platform
from pathlib import Path
import secrets
import subprocess
import sys
import threading
import time


class AudioVisualizer:
    LEASE_SECONDS = 5.0
    FRAME_SECONDS = 2.0

    def __init__(self, source: Path):
        self.source = source
        self.lock = threading.RLock()
        self.leases: dict[str, float] = {}
        self.process = None
        self.generation = 0
        self.frame = {"state": "off", "source": "spotify-application-audio"}
        self.updated = 0.0
        atexit.register(self.close)

    def status(self):
        with self.lock:
            return {"supported": sys.platform == "darwin", "source": "spotify-application-audio",
                    "state": "off", "privacy": "Spotify app audio only. No microphone or recordings."}

    def start(self, consent: bool):
        if consent is not True:
            raise ValueError("Explicit Spotify audio-analysis consent is required.")
        if sys.platform != "darwin":
            return {"state": "unavailable", "message": "Spotify application audio requires macOS 13 or later."}
        with self.lock:
            self._expire()
            if len(self.leases) >= 8:
                raise ValueError("Too many active visualizer viewers.")
            lease = secrets.token_urlsafe(24)
            self.leases[lease] = time.monotonic()
            if len(self.leases) == 1:
                self.generation += 1
                generation = self.generation
                self.frame = {"state": "starting", "message": "Preparing Spotify-only audio analysis…"}
                threading.Thread(target=self._run, args=(generation,), daemon=True).start()
                threading.Thread(target=self._watch, args=(generation,), daemon=True).start()
            return {"lease": lease, **self.frame}

    def poll(self, lease: str):
        with self.lock:
            self._expire()
            if lease not in self.leases:
                return {"state": "off", "message": "Audio analysis stopped. Enable it again."}
            self.leases[lease] = time.monotonic()
            frame = dict(self.frame)
            has_native_source = frame.get("state") in {"streaming", "silent"} or (frame.get("state") == "starting" and frame.get("source") == "spotify-application-audio")
            if has_native_source and time.monotonic() - self.updated > self.FRAME_SECONDS:
                # Never leave stale energy on screen as though music is playing.
                return {"state": "silent", "message": "No fresh Spotify audio.", "bands": [0] * 32, "wave": [0] * 64, "rms": 0}
            return frame

    def stop(self, lease: str):
        with self.lock:
            self.leases.pop(lease, None)
            if not self.leases:
                self._stop()
        return {"state": "off"}

    def _expire(self):
        now = time.monotonic()
        expired = [key for key, touched in self.leases.items() if now - touched > self.LEASE_SECONDS]
        for key in expired:
            self.leases.pop(key, None)
        if expired and not self.leases:
            self._stop()

    def _stop(self):
        self.generation += 1
        process, self.process = self.process, None
        if process is not None and process.poll() is None:
            process.terminate()
            # Reap without holding a request worker for an unresponsive helper.
            threading.Thread(target=self._reap, args=(process,), daemon=True).start()
        self.frame = {"state": "off"}

    @staticmethod
    def _reap(process):
        try:
            process.wait(timeout=2)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()

    def close(self):
        with self.lock:
            self.leases.clear()
            self._stop()

    def _watch(self, generation):
        while True:
            time.sleep(0.5)
            with self.lock:
                if generation != self.generation:
                    return
                self._expire()

    def _binary(self):
        digest = hashlib.sha256(b"macos13-v1" + self.source.read_bytes()).hexdigest()[:20]
        directory = Path.home() / ".cache/hermes-spotify-player/audio" / digest
        directory.mkdir(parents=True, exist_ok=True, mode=0o700)
        target = directory / "spotify-audio"
        if target.exists():
            return target
        # Per-process staging means two hosts compiling concurrently do not use
        # one another's partially linked output. Cache key follows source changes.
        staging = directory / f"build-{os.getpid()}-{secrets.token_hex(4)}"
        try:
            result = subprocess.run(["/usr/bin/xcrun", "swiftc", "-parse-as-library", "-target", f"{platform.machine()}-apple-macosx13.0", "-O", str(self.source), "-o", str(staging)], capture_output=True, timeout=60)
            if result.returncode:
                raise RuntimeError("Audio helper needs macOS 13+ and Xcode Command Line Tools (xcode-select --install).")
            staging.chmod(0o700)
            staging.replace(target)
        finally:
            staging.unlink(missing_ok=True)
        return target

    @staticmethod
    def _valid_frame(value):
        if not isinstance(value, dict):
            return False
        if value.get("state") not in {"streaming", "silent"}:
            return value.get("state") in {"starting", "permission-required", "unavailable", "error"}
        def numbers(key, count, lo, hi):
            items = value.get(key)
            return isinstance(items, list) and len(items) == count and all(type(x) in (float, int) and math.isfinite(x) and lo <= x <= hi for x in items)
        rms = value.get("rms")
        return numbers("bands", 32, 0, 1) and numbers("wave", 64, -1, 1) and type(rms) in (float, int) and math.isfinite(rms) and 0 <= rms <= 1

    def _run(self, generation):
        process = None
        try:
            binary = self._binary()
            with self.lock:
                if generation != self.generation or not self.leases:
                    return
                process = subprocess.Popen([str(binary), "--capture"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, stdin=subprocess.DEVNULL, text=True, bufsize=1)
                self.process = process
            for line in process.stdout:
                if len(line) > 12000:
                    raise ValueError("Invalid audio analysis frame.")
                value = json.loads(line)
                if not self._valid_frame(value):
                    raise ValueError("Invalid audio analysis frame.")
                with self.lock:
                    if generation != self.generation:
                        return
                    self.frame = value
                    self.updated = time.monotonic()
            with self.lock:
                if generation == self.generation and self.frame.get("state") not in {"permission-required", "unavailable", "error"}:
                    self.frame = {"state": "error", "message": "Spotify audio analysis stopped. Retry to reconnect."}
        except Exception as exc:
            with self.lock:
                if generation == self.generation:
                    self.frame = {"state": "error", "message": str(exc) if isinstance(exc, RuntimeError) else "Could not start Spotify audio analysis. Check macOS recording permission and retry."}
        finally:
            if process is not None:
                if process.poll() is None:
                    process.terminate()
                self._reap(process)
                process.stdout.close()
