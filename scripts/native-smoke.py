"""Opt-in real macOS smoke test. Briefly pauses, seeks and restores playback.
No Spotify library mutations. Run with the Hermes Python environment.
"""
import importlib.util
import json
import platform
import resource
import statistics
import sys
import time
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('native_smoke_api', ROOT / 'dashboard/plugin_api.py')
assert spec is not None and spec.loader is not None
api = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = api
spec.loader.exec_module(api)
app = FastAPI()
app.include_router(api.router, prefix='/api/plugins/spotify-player')
client = TestClient(app)


def control(action, argument: str | int | float = ''):
    response = client.post('/api/plugins/spotify-player/control', json={'action': action, 'argument': str(argument)})
    response.raise_for_status()
    result = response.json()
    assert result['ok'], result
    return result


def fresh():
    api._NATIVE_CACHE.clear()
    return control('status')


before = fresh()
assert before['running'] and before['state'] in ('playing', 'paused'), 'Start Spotify and choose a track first.'
checks = []
try:
    control('pause')
    assert fresh()['state'] == 'paused'
    checks.append('pause read-back')
    control('volume', before['volume'])
    assert abs(fresh()['volume'] - before['volume']) <= 1  # Spotify quantizes percentages.
    checks.append('volume read-back within Spotify one-point quantization')
    target = max(0, min(int(before['positionSeconds']) + 1, int(before['durationMs'] / 1000) - 1))
    control('seek', target)
    assert abs(fresh()['positionSeconds'] - target) < 1.5
    checks.append('seek read-back')
finally:
    control('seek', before['positionSeconds'])
    control('volume', before['volume'])
    control('play' if before['state'] == 'playing' else 'pause')
    restored = fresh()
    assert restored['state'] == before['state']
    assert abs(restored['positionSeconds'] - before['positionSeconds']) < 2
    assert abs(restored['volume'] - before['volume']) <= 1
checks.append('original position/playback restored; volume restored within one point')
runs = []
cpu_before = resource.getrusage(resource.RUSAGE_CHILDREN)
for _ in range(5):
    start = time.perf_counter()
    fresh()
    runs.append((time.perf_counter() - start) * 1000)
cpu_after = resource.getrusage(resource.RUSAGE_CHILDREN)
report = {
    'status': 'passed',
    'transport': 'FastAPI TestClient, real plugin route + real osascript/Spotify (no native mocks)',
    'platform': platform.platform(),
    'spotifyVersion': before.get('appVersion'),
    'checks': checks,
    'uncachedSnapshotSamples': len(runs),
    'uncachedSnapshotMedianMs': round(statistics.median(runs), 2),
    'childCpuSecondsAcrossSamples': round(cpu_after.ru_utime + cpu_after.ru_stime - cpu_before.ru_utime - cpu_before.ru_stime, 4),
    'maxChildRssBytesMacOS': cpu_after.ru_maxrss,
    'caveat': 'Helper costs only, not total Hermes/Spotify memory or battery measurements. Search/library OAuth not configured; not live-tested.'
}
(ROOT / 'docs/evidence').mkdir(exist_ok=True)
(ROOT / 'docs/evidence/native.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
