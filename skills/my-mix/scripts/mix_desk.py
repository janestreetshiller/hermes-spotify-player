"""Render a local Hermes quiz; no credentials, network or Spotify writes."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def validate(state: dict) -> dict:
    if not isinstance(state, dict) or state.get('mode', 'my-mix') not in {'my-mix', 'new-tracks', 'my-favorites'}:
        raise ValueError('Unknown mix mode')
    if not isinstance(state.get('dryRun', False), bool):
        raise ValueError('dryRun must be a boolean')
    tracks = state.get('tracks', [])
    if not isinstance(tracks, list) or len(tracks) > 50:
        raise ValueError('Supply at most 50 tracks')
    unique = {}
    for track in tracks:
        if not isinstance(track, dict) or not re.fullmatch(r'spotify:track:[A-Za-z0-9]{22}', str(track.get('uri', ''))):
            raise ValueError('Every track needs an exact Spotify track URI')
        unique.setdefault(track['uri'], track)
    stage = state.get('stage', 'review' if unique else 'quiz')
    if stage not in {'quiz', 'review', 'error', 'success'}:
        raise ValueError('Unknown stage')
    if stage == 'success' and (state.get('verified') is not True or not re.fullmatch(r'https://open.spotify.com/playlist/[A-Za-z0-9]{22}', str(state.get('url', '')))):
        raise ValueError('Success needs a verified Spotify playlist URL')
    return {**state, 'mode': state.get('mode', 'my-mix'), 'tracks': list(unique.values()), 'stage': stage, 'dryRun': state.get('dryRun', False)}


def render(state: dict, output: Path) -> None:
    state = validate(state)
    template = (Path(__file__).resolve().parents[1] / 'templates/mix-desk.html').read_text(encoding='utf-8')
    data = json.dumps({**state, 'artifact': str(output.resolve())}, ensure_ascii=True).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(template.replace('__MIX_STATE__', data), encoding='utf-8')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--state', type=Path, help='Local JSON state; omit for a fresh quiz')
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--mode', choices=['my-mix', 'new-tracks', 'my-favorites'], default='my-mix')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    state = json.loads(args.state.read_text(encoding='utf-8')) if args.state else {'mode': args.mode, 'tracks': []}
    if args.dry_run:
        state['dryRun'] = True
    render(state, args.output)
    print(args.output.resolve())


if __name__ == '__main__':
    main()
