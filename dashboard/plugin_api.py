"""Local native Spotify controller for the Hermes Desktop plugin."""
from __future__ import annotations

import json
import math
import io
import re
import subprocess
import time
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from threading import Lock, Thread
from types import SimpleNamespace
from typing import Any
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from hermes_cli.auth_constants import DEFAULT_SPOTIFY_REDIRECT_URI
from hermes_cli.auth_spotify import (
    get_spotify_auth_status,
    login_spotify_command,
)
from hermes_cli.config import get_env_value
from plugins.spotify.client import SpotifyClient

router = APIRouter()

SCRIPT_PATH = Path(__file__).with_name("spotify_control.js")
OSASCRIPT = "/usr/bin/osascript"
OPEN = "/usr/bin/open"
PGREP = "/usr/bin/pgrep"
ALLOWED_ACTIONS = {
    "status",
    "open",
    "playpause",
    "play",
    "pause",
    "next",
    "previous",
    "volume",
    "seek",
    "play-uri",
    "search",
    "saved-status",
    "set-saved",
    "playlists",
    "playlist-add",
    "lyrics",
}
TRACK_URI_RE = re.compile(r"^spotify:track:([A-Za-z0-9]+)$")
PLAYLIST_ID_RE = re.compile(r"^[A-Za-z0-9]+$")
LRCLIB_API_URL = "https://lrclib.net/api/get"
LRCLIB_USER_AGENT = "HermesSpotifyPlayer/1.3.0 (https://github.com/janestreetshiller/hermes-spotify-player)"
_LYRICS_CACHE: dict[tuple[str, str, str, int], dict[str, Any]] = {}
SPOTIFY_CLIENT_ID_RE = re.compile(r"^[A-Za-z0-9_-]{20,128}$")
_NATIVE_LOCK = Lock()
_NATIVE_CACHE: dict[str, Any] = {}
_AUTH_LOCK = Lock()
_AUTH_FLOW: dict[str, Any] = {"phase": "idle", "message": ""}


class ControlRequest(BaseModel):
    action: str = "status"
    argument: str = ""


class AuthStartRequest(BaseModel):
    clientId: str = ""


def _configured_spotify_client_id(explicit: str = "") -> str:
    status = get_spotify_auth_status() or {}
    candidates = (
        explicit,
        get_env_value("HERMES_SPOTIFY_CLIENT_ID"),
        get_env_value("SPOTIFY_CLIENT_ID"),
        status.get("client_id"),
    )
    for candidate in candidates:
        cleaned = str(candidate or "").strip()
        if cleaned:
            return cleaned
    return ""


def _configured_spotify_redirect_uri(status: dict[str, Any] | None = None) -> str:
    status = status or {}
    candidates = (
        get_env_value("HERMES_SPOTIFY_REDIRECT_URI"),
        get_env_value("SPOTIFY_REDIRECT_URI"),
        status.get("redirect_uri"),
        DEFAULT_SPOTIFY_REDIRECT_URI,
    )
    for candidate in candidates:
        cleaned = str(candidate or "").strip()
        if cleaned:
            return cleaned
    return DEFAULT_SPOTIFY_REDIRECT_URI


def _run_spotify_auth(client_id: str) -> None:
    try:
        args = SimpleNamespace(
            client_id=client_id,
            redirect_uri=None,
            scope=None,
            no_browser=False,
            timeout=180.0,
        )
        # The desktop owns presentation. Keep one-time authorization URLs and
        # verbose CLI progress out of persistent gateway logs.
        with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
            login_spotify_command(args)
        with _AUTH_LOCK:
            _AUTH_FLOW.update(phase="connected", message="Spotify connected securely.")
    except BaseException as exc:  # CLI auth may raise SystemExit on OAuth denial.
        message = str(exc).strip() or "Spotify authorization did not complete."
        with _AUTH_LOCK:
            _AUTH_FLOW.update(phase="error", message=message[:240])


@router.get("/auth/status")
def spotify_auth_status() -> dict[str, Any]:
    try:
        status = get_spotify_auth_status()
    except Exception:
        status = {"logged_in": False}
    with _AUTH_LOCK:
        flow = dict(_AUTH_FLOW)
    logged_in = bool(status.get("logged_in"))
    phase = "connected" if logged_in else str(flow.get("phase") or "idle")
    return {
        "ok": True,
        "loggedIn": logged_in,
        "clientConfigured": bool(_configured_spotify_client_id()),
        "redirectUri": _configured_spotify_redirect_uri(status),
        "phase": phase,
        "message": "Spotify connected securely." if logged_in else str(flow.get("message") or ""),
        "scope": str(status.get("scope") or ""),
        "expiresAt": status.get("expires_at"),
    }


@router.post("/auth/start", status_code=202)
def start_spotify_auth(request: AuthStartRequest) -> dict[str, Any]:
    supplied = request.clientId.strip()
    if supplied and not SPOTIFY_CLIENT_ID_RE.fullmatch(supplied):
        raise HTTPException(status_code=400, detail="Enter a valid Spotify Client ID.")
    client_id = _configured_spotify_client_id(supplied)
    if not client_id:
        raise HTTPException(status_code=400, detail="A Spotify Client ID is required for first-time setup.")

    with _AUTH_LOCK:
        if _AUTH_FLOW.get("phase") in {"starting", "waiting"}:
            raise HTTPException(status_code=409, detail="Spotify authorization is already in progress.")
        _AUTH_FLOW.update(phase="waiting", message="Finish connecting in your browser.")
        worker = Thread(
            target=_run_spotify_auth,
            args=(client_id,),
            daemon=True,
            name="spotify-player-auth",
        )
        worker.start()
    return {"ok": True, "phase": "waiting", "message": "Finish connecting in your browser."}


def _ensure_spotify_running_hidden() -> None:
    probe = subprocess.run(
        [PGREP, "-x", "Spotify"],
        capture_output=True,
        check=False,
        text=True,
        timeout=2,
    )
    if probe.returncode == 0:
        return

    launch = subprocess.run(
        [OPEN, "-gj", "-a", "Spotify"],
        capture_output=True,
        check=False,
        text=True,
        timeout=8,
    )
    if launch.returncode != 0:
        raise HTTPException(
            status_code=502,
            detail=launch.stderr.strip() or "Could not start Spotify in the background.",
        )

    for _ in range(12):
        probe = subprocess.run(
            [PGREP, "-x", "Spotify"],
            capture_output=True,
            check=False,
            text=True,
            timeout=2,
        )
        if probe.returncode == 0:
            return
        time.sleep(0.25)

    raise HTTPException(status_code=502, detail="Spotify did not start in the background.")


def _track_id(uri: str) -> str:
    match = TRACK_URI_RE.fullmatch(uri.strip())
    if not match:
        raise HTTPException(status_code=400, detail="A valid Spotify track URI is required.")
    return match.group(1)


@router.post("/control")
def control_spotify(request: ControlRequest) -> dict[str, Any]:
    action = request.action.strip().lower()
    if action not in ALLOWED_ACTIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported Spotify action: {action}")

    argument = request.argument.strip() if action == "search" else request.argument
    if action == "search" and not argument:
        raise HTTPException(status_code=400, detail="Enter something to search for.")
    if action == "search" and len(argument) > 200:
        raise HTTPException(status_code=400, detail="Spotify search is limited to 200 characters.")

    if action == "lyrics":
        try:
            signature = json.loads(request.argument)
        except (TypeError, json.JSONDecodeError) as exc:
            raise HTTPException(status_code=400, detail="Invalid track signature.") from exc
        if not isinstance(signature, dict):
            raise HTTPException(status_code=400, detail="Invalid track signature.")
        title = str(signature.get("title") or "").strip()
        artist = str(signature.get("artist") or "").strip()
        album = str(signature.get("album") or "").strip()
        try:
            duration = int(signature.get("duration") or 0)
        except (TypeError, ValueError) as exc:
            raise HTTPException(status_code=400, detail="Invalid track duration.") from exc
        if not title or not artist or not album or duration < 1 or duration > 86400:
            raise HTTPException(status_code=400, detail="A complete track signature is required for lyrics.")
        if any(len(value) > 300 for value in (title, artist, album)):
            raise HTTPException(status_code=400, detail="Track metadata is too long.")

        cache_key = (title.casefold(), artist.casefold(), album.casefold(), duration)
        if cache_key in _LYRICS_CACHE:
            return _LYRICS_CACHE[cache_key]

        query = urlencode({
            "track_name": title,
            "artist_name": artist,
            "album_name": album,
            "duration": duration,
        })
        lyrics_request = Request(
            f"{LRCLIB_API_URL}?{query}",
            headers={"User-Agent": LRCLIB_USER_AGENT, "Accept": "application/json"},
        )
        try:
            with urlopen(lyrics_request, timeout=8) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            if exc.code == 404:
                result = {
                    "ok": True,
                    "lyrics": "",
                    "syncedLyrics": "",
                    "instrumental": False,
                    "source": "lrclib",
                }
                _LYRICS_CACHE[cache_key] = result
                return result
            if exc.code == 429:
                raise HTTPException(status_code=503, detail="Lyrics service is temporarily busy.") from exc
            raise HTTPException(status_code=502, detail="Lyrics service request failed.") from exc
        except (OSError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
            raise HTTPException(status_code=502, detail="Could not load lyrics.") from exc

        if not isinstance(payload, dict):
            raise HTTPException(status_code=502, detail="Lyrics service returned invalid data.")
        synced_lyrics = str(payload.get("syncedLyrics") or "").strip()
        plain_lyrics = str(payload.get("plainLyrics") or "").strip()
        if not plain_lyrics:
            plain_lyrics = re.sub(r"\[[^\]]+\]\s*", "", synced_lyrics).strip()
        result = {
            "ok": True,
            "lyrics": plain_lyrics,
            "syncedLyrics": synced_lyrics,
            "instrumental": bool(payload.get("instrumental")),
            "source": "lrclib",
        }
        if len(_LYRICS_CACHE) >= 64:
            _LYRICS_CACHE.pop(next(iter(_LYRICS_CACHE)))
        _LYRICS_CACHE[cache_key] = result
        return result

    if action == "search":
        try:
            payload = SpotifyClient().request(
                "GET", "/search", params={"q": argument, "type": "track", "limit": 10}
            )
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Spotify search failed: {exc}") from exc

        items = payload.get("tracks", {}).get("items", []) if isinstance(payload, dict) else []
        results = []
        for track in items[:10]:
            if not isinstance(track, dict) or not str(track.get("uri") or "").startswith("spotify:track:"):
                continue
            album = track.get("album") if isinstance(track.get("album"), dict) else {}
            artists = track.get("artists") if isinstance(track.get("artists"), list) else []
            images = album.get("images") if isinstance(album.get("images"), list) else []
            results.append({
                "title": str(track.get("name") or "Unknown track"),
                "artist": ", ".join(
                    str(artist.get("name") or "")
                    for artist in artists
                    if isinstance(artist, dict) and artist.get("name")
                ),
                "album": str(album.get("name") or ""),
                "artworkUrl": str(images[0].get("url") or "") if images and isinstance(images[0], dict) else "",
                "uri": str(track.get("uri")),
                "durationMs": int(track.get("duration_ms") or 0),
            })

        return {"ok": True, "query": argument, "results": results}

    if action in {"saved-status", "set-saved"}:
        desired_saved = None
        if action == "set-saved":
            try:
                selection = json.loads(request.argument)
            except (TypeError, json.JSONDecodeError) as exc:
                raise HTTPException(status_code=400, detail="Invalid saved-track update.") from exc
            if not isinstance(selection, dict) or not isinstance(selection.get("saved"), bool):
                raise HTTPException(status_code=400, detail="Saved-track updates require an explicit boolean state.")
            uri = str(selection.get("uri") or "").strip()
            desired_saved = selection["saved"]
        else:
            uri = request.argument.strip()
        _track_id(uri)
        try:
            client = SpotifyClient()
            saved = bool((client.request("GET", "/me/library/contains", params={"uris": uri}) or [False])[0])
            if action == "set-saved" and saved != desired_saved:
                client.request("PUT" if desired_saved else "DELETE", "/me/library", params={"uris": uri})
                saved = bool((client.request("GET", "/me/library/contains", params={"uris": uri}) or [False])[0])
                if saved != desired_saved:
                    raise HTTPException(status_code=502, detail="Spotify has not confirmed the saved state. Please retry.")
            return {"ok": True, "uri": uri, "saved": saved}
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Spotify library update failed: {exc}") from exc

    if action == "playlists":
        try:
            payload = SpotifyClient().request("GET", "/me/playlists", params={"limit": 30, "offset": 0})
            items = payload.get("items", []) if isinstance(payload, dict) else []
            playlists = []
            for playlist in items:
                if not isinstance(playlist, dict) or not playlist.get("id"):
                    continue
                images = playlist.get("images") if isinstance(playlist.get("images"), list) else []
                track_summary = playlist.get("tracks") if isinstance(playlist.get("tracks"), dict) else playlist.get("items")
                track_summary = track_summary if isinstance(track_summary, dict) else {}
                playlists.append({
                    "id": str(playlist.get("id")),
                    "name": str(playlist.get("name") or "Untitled playlist"),
                    "artworkUrl": str(images[0].get("url") or "") if images and isinstance(images[0], dict) else "",
                    "trackCount": int(track_summary.get("total") or 0),
                })
            return {"ok": True, "playlists": playlists}
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Could not load Spotify playlists: {exc}") from exc

    if action == "playlist-add":
        try:
            selection = json.loads(request.argument)
        except (TypeError, json.JSONDecodeError) as exc:
            raise HTTPException(status_code=400, detail="Invalid playlist selection.") from exc
        playlist_id = str(selection.get("playlistId") or "").strip() if isinstance(selection, dict) else ""
        uri = str(selection.get("uri") or "").strip() if isinstance(selection, dict) else ""
        _track_id(uri)
        if not PLAYLIST_ID_RE.fullmatch(playlist_id):
            raise HTTPException(status_code=400, detail="A valid Spotify playlist ID is required.")
        try:
            receipt = SpotifyClient().request("POST", f"/playlists/{playlist_id}/items", json_body={"uris": [uri]})
            return {"ok": True, "added": True, "playlistId": playlist_id, "uri": uri, "snapshotId": receipt.get("snapshot_id", "")}
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Could not add track to playlist: {exc}") from exc

    if action in {"volume", "seek"}:
        try:
            number = float(argument)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="A finite number is required.") from exc
        maximum = 100 if action == "volume" else 86400
        if not math.isfinite(number) or not 0 <= number <= maximum:
            raise HTTPException(status_code=400, detail=f"{action} must be between 0 and {maximum}.")
    if action == "play-uri" and not re.fullmatch(r"spotify:(track|album|playlist|artist|episode|show):[A-Za-z0-9]+", argument):
        raise HTTPException(status_code=400, detail="Invalid Spotify URI.")

    # Coalesce requests and serialize mutations without a resident helper.
    with _NATIVE_LOCK:
        if action == "status" and time.monotonic() - _NATIVE_CACHE.get("at", 0) < 1:
            return dict(_NATIVE_CACHE["payload"])
        _NATIVE_CACHE.clear()
        if action != "status":
            _ensure_spotify_running_hidden()
        payload = _native_command(action, argument)
        if payload.get("ok"):
            _NATIVE_CACHE.update(at=time.monotonic(), payload=payload)
        return payload


def _curation_tracks(tracks: Any) -> list[str]:
    if not isinstance(tracks, list) or not 1 <= len(tracks) <= 50 or any(
        not isinstance(uri, str) or not re.fullmatch(r"spotify:track:[A-Za-z0-9]{22}", uri) for uri in tracks
    ):
        raise HTTPException(status_code=400, detail="Supply 1–50 exact Spotify track URIs (22-character IDs).")
    return list(dict.fromkeys(tracks))


def _curation_track(track: dict[str, Any]) -> dict[str, str]:
    return {"uri":str(track.get('uri') or ''), "title":str(track.get('name') or ''),
            "artist":', '.join(str(a.get('name') or '') for a in track.get('artists',[]) if isinstance(a,dict))}


@router.post("/curate")
def curate_spotify(selection: dict[str, Any]) -> dict[str, Any]:
    """One explicit, verified curation operation; never invoke an LLM here."""
    import hashlib
    import sqlite3
    from hermes_constants import get_hermes_home

    action = selection.get("action")
    if action == 'preview':
        queries = selection.get('queries')
        if not isinstance(queries,list) or not 1 <= len(queries) <= 10 or any(
            not isinstance(q,str) or not q.strip() or len(q)>200 for q in queries
        ):
            raise HTTPException(status_code=400, detail='Provide 1–10 nonempty search queries, each at most 200 characters.')
        try:
            client=SpotifyClient()
            results=[]
            for query in queries:
                payload=client.request('GET','/search',params={'q':query,'type':'track','limit':3})
                candidates=[_curation_track(t) for t in payload.get('tracks',{}).get('items',[]) if re.fullmatch(r'spotify:track:[A-Za-z0-9]{22}',str(t.get('uri') or ''))]
                results.append({'query':query,'candidates':candidates})
            return {'ok':True,'mutation':False,'results':results}
        except Exception as exc:
            raise HTTPException(status_code=502,detail=f'Spotify search failed: {exc}') from exc
    if action == 'taste':
        try:
            payload=SpotifyClient().request('GET','/me/tracks',params={'limit':20,'offset':0})
            tracks=[_curation_track(row.get('track') or row.get('item') or {}) for row in payload.get('items',[])]
            return {'ok':True,'mutation':False,'sample':True,'source':'recent liked songs','tracks':tracks,
                    'sampleCount':len(tracks),'total':payload.get('total'),'hasMore':bool(payload.get('next'))}
        except Exception as exc:
            raise HTTPException(status_code=502,detail=f'Could not read taste sample: {exc}') from exc
    if action == 'set-liked':
        uris=_curation_tracks(selection.get('tracks'))
        saved=selection.get('saved')
        if not isinstance(saved,bool):
            raise HTTPException(status_code=400,detail='saved must be an explicit boolean.')
        try:
            client=SpotifyClient()
            client.request('PUT' if saved else 'DELETE','/me/library',params={'uris':','.join(uris)})
            states=client.request('GET','/me/library/contains',params={'uris':','.join(uris)})
            confirmed=isinstance(states,list) and len(states)==len(uris) and all(v is saved for v in states)
            return {'ok':confirmed,'verified':confirmed,'trackCount':len(uris),'uris':uris,'saved':states,
                    **({} if confirmed else {'error':'Spotify did not confirm every liked-state update. Read current state before retrying.'})}
        except Exception as exc:
            return {'ok':False,'verified':False,'uris':uris,'error':f'Liked-state update uncertain: {exc}'}
    if action != "create":
        raise HTTPException(status_code=400, detail="Unsupported curation action.")
    name = selection.get("name")
    description = selection.get("description", "")
    public = selection.get("public", False)
    request_id = selection.get("requestId", "")
    tracks = selection.get("tracks", [])
    if not isinstance(name, str) or not name.strip() or len(name) > 100:
        raise HTTPException(status_code=400, detail="A playlist name of 1–100 characters is required.")
    if not isinstance(description, str) or len(description) > 300 or not isinstance(public, bool):
        raise HTTPException(status_code=400, detail="Invalid description or visibility.")
    if not isinstance(request_id, str) or not re.fullmatch(r"[A-Za-z0-9_-]{8,100}", request_id):
        raise HTTPException(status_code=400, detail="A unique requestId (8–100 letters/digits/_/-) is required.")
    songs = selection.get('songs')
    if songs is not None:
        if 'tracks' in selection or not isinstance(songs,list) or not 1 <= len(songs) <= 20 or any(
            not isinstance(song,dict) or any(not isinstance(song.get(k),str) or not song[k].strip() or len(song[k])>150 for k in ('title','artist'))
            for song in songs
        ):
            raise HTTPException(status_code=400, detail='Use either tracks, or 1–20 songs with explicit title and artist.')
        client=SpotifyClient()
        tracks=[]
        unresolved=[]
        for song in songs:
            payload=client.request('GET','/search',params={'q':f"track:{song['title']} artist:{song['artist']}",'type':'track','limit':3})
            candidates=payload.get('tracks',{}).get('items',[])
            exact=[t for t in candidates if t.get('name','').casefold()==song['title'].casefold()
                   and any(a.get('name','').casefold()==song['artist'].casefold() for a in t.get('artists',[]))]
            if exact:
                tracks.append(exact[0].get('uri'))
            else:
                unresolved.append({'song':song,'candidates':[_curation_track(t) for t in candidates]})
        if unresolved:
            raise HTTPException(status_code=422,detail={'message':'No playlist was created: some named songs had no exact title/artist match. Review candidates and use explicit URIs.', 'unresolved':unresolved})
    uris = _curation_tracks(tracks)
    body = {"name": name, "description": description, "public": public, "collaborative": False}
    fingerprint = hashlib.sha256(json.dumps({"body":body,"uris":uris}, sort_keys=True).encode()).hexdigest()
    directory = get_hermes_home() / 'spotify-player'
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    db_path = directory / 'curation.sqlite3'
    with sqlite3.connect(db_path, timeout=5) as db:
        db_path.chmod(0o600)
        db.execute('CREATE TABLE IF NOT EXISTS receipts (request_id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, result TEXT NOT NULL)')
        db.execute('BEGIN IMMEDIATE')
        prior = db.execute('SELECT fingerprint,result FROM receipts WHERE request_id=?', (request_id,)).fetchone()
        if prior:
            if prior[0] != fingerprint:
                raise HTTPException(status_code=409, detail="requestId was already used for a different playlist.")
            return {**json.loads(prior[1]), "replayed":True}
        # Commit the intent before a non-idempotent remote POST. A lost response
        # stays explicitly uncertain rather than creating a duplicate on retry.
        result = {"ok":False,"verified":False,"requestId":request_id,"error":"Creation pending or interrupted. Do not retry with a new ID until Spotify is checked."}
        db.execute('INSERT INTO receipts VALUES (?,?,?)', (request_id,fingerprint,json.dumps(result)))
        db.commit()
        try:
            client = SpotifyClient()
            created = client.request('POST', '/me/playlists', json_body=body)
            playlist_id = created.get('id', '')
            if not re.fullmatch(r'[A-Za-z0-9]{22}', playlist_id):
                raise ValueError('Spotify returned no valid playlist ID. Creation may have occurred.')
            result.update(playlistId=playlist_id, url=f'https://open.spotify.com/playlist/{playlist_id}', created=True)
            db.execute('UPDATE receipts SET result=? WHERE request_id=?', (json.dumps(result),request_id))
            db.commit()
            client.request('POST', f'/playlists/{playlist_id}/items', json_body={'uris':uris})
            verified = client.request('GET', f'/playlists/{playlist_id}')
            contents = client.request('GET', f'/playlists/{playlist_id}/items', params={'limit':50,'offset':0})
            actual = [(row.get('item') or row.get('track') or {}).get('uri') for row in contents.get('items', [])]
            if (verified.get('id') != playlist_id or verified.get('name') != name
                or verified.get('public') is not public or verified.get('collaborative') is not False
                or actual != uris or contents.get('total') != len(uris) or contents.get('next')):
                raise ValueError('Playlist exists, but its metadata or ordered tracks could not be confirmed. Inspect the returned URL; do not recreate it.')
            result = {"ok":True,"verified":True,"created":True,"requestId":request_id,
                      "playlistId":playlist_id,"url":result['url'],"name":name,"public":public,
                      "trackCount":len(uris),"uris":uris}
        except Exception as exc:
            result.update(ok=False, verified=False, error=str(exc)[:500])
        db.execute('UPDATE receipts SET result=? WHERE request_id=?', (json.dumps(result),request_id))
        db.commit()
        return result


def _native_command(action: str, argument: str) -> dict[str, Any]:

    try:
        result = subprocess.run(
            [OSASCRIPT, "-l", "JavaScript", str(SCRIPT_PATH), action, argument],
            capture_output=True,
            check=False,
            text=True,
            timeout=12,
        )
    except subprocess.TimeoutExpired as exc:
        raise HTTPException(status_code=504, detail="Spotify controller timed out.") from exc
    except OSError as exc:
        raise HTTPException(status_code=502, detail=f"Could not start Spotify controller: {exc}") from exc

    if result.returncode != 0:
        detail = result.stderr.strip() or "Spotify controller failed."
        raise HTTPException(status_code=502, detail=detail)

    try:
        payload = json.loads(result.stdout)
    except (TypeError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=502, detail="Spotify controller returned invalid JSON.") from exc

    if not isinstance(payload, dict):
        raise HTTPException(status_code=502, detail="Spotify controller returned invalid JSON.")
    return payload
