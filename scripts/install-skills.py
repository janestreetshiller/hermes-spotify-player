"""Install the reviewed local skill pack into the active Hermes profile.

Never overwrite a different existing skill. No config, plugin or auth changes.
"""
from __future__ import annotations

import argparse
import os
import shutil
from pathlib import Path

NAMES = ('my-mix', 'new-tracks', 'my-favorites')
SOURCE = Path(__file__).resolve().parents[1] / 'skills'


def files(directory: Path) -> dict[str, bytes]:
    return {str(p.relative_to(directory)): p.read_bytes() for p in directory.rglob('*')
            if p.is_file() and '__pycache__' not in p.parts and p.suffix != '.pyc'}


def install(home: Path | None = None) -> list[str]:
    home = home or Path(os.environ.get('HERMES_HOME') or Path.home() / '.hermes')
    target = home / 'skills'
    # Validate all destinations before copying any of the three skills.
    for name in NAMES:
        source = SOURCE / name
        if not (source / 'SKILL.md').is_file():
            raise FileNotFoundError(f'Incomplete pack: {source}')
        dest = target / name
        collisions = [p.parent for p in target.rglob('SKILL.md') if p.parent.name == name and p.parent != dest] if target.exists() else []
        if collisions or (dest.exists() and files(dest) != files(source)):
            raise FileExistsError(f'Preserving existing skill {name}; review/move it explicitly before installing: {collisions or [dest]}')
    for name in NAMES:
        dest = target / name
        if not dest.exists():
            shutil.copytree(SOURCE / name, dest, ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
    return list(NAMES)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--home', type=Path, help='Explicit Hermes profile home; default is active HERMES_HOME')
    args = parser.parse_args()
    for name in install(args.home):
        print(f'Installed /{name}')
    print('Open a new Hermes session to discover the skills; no backend restart is needed.')
