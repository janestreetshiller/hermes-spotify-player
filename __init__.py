"""Spotify desktop player and explicit, single-call library curation."""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path


def _curate(args, **_kwargs):
    # Load lazily: desktop-only users need not initialize Web API auth.
    try:
        spec = importlib.util.spec_from_file_location('spotify_player_curation_api', Path(__file__).parent / 'dashboard' / 'plugin_api.py')
        if spec is None or spec.loader is None:
            raise RuntimeError('Curation backend is missing.')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return json.dumps(module.curate_spotify(args))
    except Exception as exc:
        return json.dumps({'ok':False,'verified':False,'error':getattr(exc,'detail',str(exc))})


def register(ctx):
    ctx.register_tool(
        name='spotify_player_curate', toolset='spotify', handler=_curate,
        schema={
            'name':'spotify_player_curate',
            'description': (
                'Curate Spotify from an explicit user request. taste reads a sample of 20 recent liked songs; '
                'preview searches candidates without writing; create creates ONE playlist from exact Spotify track URIs '
                'or named songs, with private visibility by default and read-back verification. '
                'Named songs must match title and artist exactly; unmatched songs prevent creation. '
                'set-liked saves/removes explicit tracks and verifies every state. '
                'Only mutate when the user asked to create/save/remove, never when they asked only for recommendations. '
                'create requires a unique requestId; reuse it on retries. If a partial result includes a playlistId, '
                'do not create another playlist. Never invent track URIs. No listening-history training occurs.'
            ),
            'parameters':{
                'type':'object','additionalProperties':False,'required':['action'],
                'properties':{
                    'action':{'type':'string','enum':['taste','preview','create','set-liked']},
                    'name':{'type':'string','maxLength':100},
                    'description':{'type':'string','maxLength':300},
                    'public':{'type':'boolean','default':False},
                    'requestId':{'type':'string','pattern':'^[A-Za-z0-9_-]{8,100}$'},
                    'tracks':{'type':'array','minItems':1,'maxItems':50,'items':{'type':'string','pattern':'^spotify:track:[A-Za-z0-9]{22}$'}},
                    'songs':{'type':'array','minItems':1,'maxItems':20,'items':{
                        'type':'object','additionalProperties':False,'required':['title','artist'],
                        'properties':{'title':{'type':'string','maxLength':150},'artist':{'type':'string','maxLength':150}}}},
                    'queries':{'type':'array','minItems':1,'maxItems':10,'items':{'type':'string','maxLength':200}},
                    'saved':{'type':'boolean','description':'Required for set-liked; true saves, false removes.'}
                }
            }
        }
    )
