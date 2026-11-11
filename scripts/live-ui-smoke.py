"""Opt-in live Hermes UI smoke test. No library writes or login actions."""
import json
import subprocess
import time
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SESSION = 'spotify-live-qa-' + uuid.uuid4().hex

def driver(tool, **args):
    return json.loads(subprocess.check_output(['cua-driver', 'call', tool, json.dumps({'session': SESSION, **args})]))

window = next(w for w in driver('list_windows')['windows'] if w['app_name'] == 'Hermes' and w['title'] == 'Hermes' and w['bounds']['height'] > 200)
base = {'pid': window['pid'], 'window_id': window['window_id']}

def elements(query='Spotify'):
    return driver('get_window_state', **base, query=query, include_screenshot=False)['elements']

def click(label):
    rows = elements(label)
    target = next(e for e in rows if e.get('label') == label and e['role'] in ['AXButton', 'AXCheckBox'] and e.get('frame', {}).get('h', 0) > 5)
    return driver('click', **base, element_token=target['element_token'])

def native(action='status'):
    return json.loads(subprocess.check_output(['/usr/bin/osascript', '-l', 'JavaScript', str(ROOT/'dashboard/spotify_control.js'), action]))

before = native()
checks = []
try:
    transitions = [('paused', 'Pause Spotify'), ('playing', 'Play Spotify')] if before['state'] == 'playing' else [('playing', 'Play Spotify'), ('paused', 'Pause Spotify')]
    for wanted, label in transitions:
        if native()['state'] == wanted:
            continue
        deadline = time.monotonic() + 18
        while not any(e.get('label') == label and e['role'] == 'AXButton' for e in elements(label)):
            assert time.monotonic() < deadline, 'UI did not synchronize before click'
            time.sleep(.3)
        click(label)
        opposite = 'Pause Spotify' if wanted == 'playing' else 'Play Spotify'
        deadline = time.monotonic() + 8
        while True:
            now = native()
            rows = elements(opposite)
            if now['state'] == wanted and any(e.get('label') == opposite and e['role'] == 'AXButton' for e in rows):
                checks.append({'button': label, 'nativeReadback': now['state'], 'uiReadback': opposite})
                break
            assert time.monotonic() < deadline, f'{label} failed native/UI readback: {now["state"]}'
            time.sleep(.3)
finally:
    current = native()
    if current.get('spotifyUrl') == before.get('spotifyUrl') and current['state'] != before['state']:
        native('play' if before['state'] == 'playing' else 'pause')

# Account setup is presentation-only: do not click consent or enter credentials.
click('Connect Spotify to use Liked Songs')
deadline = time.monotonic() + 5
while not any(e.get('label') == 'Spotify Client ID' for e in elements('Spotify Client ID')):
    assert time.monotonic() < deadline, 'Account setup did not open inside player'
    time.sleep(.2)
checks.append({'button': 'Connect Spotify to use Liked Songs', 'uiReadback': 'Spotify Client ID field present in embedded account form'})
path = ROOT/'docs/evidence/ui-audit/live-hermes.png'
driver('get_window_state', **base, query='Spotify', screenshot_out_file=str(path))
click('Close screen panel')
deadline = time.monotonic() + 5
while any(e.get('label') == 'Close screen panel' and e['role'] == 'AXButton' for e in elements('Close screen panel')):
    assert time.monotonic() < deadline, 'Embedded account panel did not close'
    time.sleep(.2)
checks.append({'button': 'Close screen panel', 'uiReadback': 'returned to player'})
report = {'status': 'passed', 'boundary': 'Real installed Hermes UI → plugin REST → osascript → real Spotify; no simulated playback', 'checks': checks, 'restoredPlaybackState': native()['state'], 'account': 'Disconnected; no live library/search writes tested', 'screenshot': str(path)}
(ROOT/'docs/evidence/ui-audit/live.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report, indent=2))
