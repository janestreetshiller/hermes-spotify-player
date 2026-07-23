"""Local native Spotify controller for the Hermes Desktop plugin."""
from __future__ import annotations

import json
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
from hermes_cli.auth import (
    DEFAULT_SPOTIFY_REDIRECT_URI,
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
LRCLIB_USER_AGENT = "HermesSpotifyPlayer/1.2.0 (https://github.com/janestreetshiller/hermes-spotify-player)"
_LYRICS_CACHE: dict[tuple[str, str, str, int], dict[str, Any]] = {}
SPOTIFY_CLIENT_ID_RE = re.compile(r"^[A-Za-z0-9_-]{20,128}$")
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
            payload = SpotifyClient().search(
                query=argument,
                search_types=["track"],
                limit=10,
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
        track_id = _track_id(uri)
        try:
            client = SpotifyClient()
            saved = bool((client.library_contains(uris=[uri]) or [False])[0])
            if action == "set-saved" and saved != desired_saved:
                if desired_saved:
                    client.save_library_items(uris=[uri])
                else:
                    client.remove_saved_tracks(track_ids=[track_id])
                saved = desired_saved
            return {"ok": True, "uri": uri, "saved": saved}
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Spotify library update failed: {exc}") from exc

    if action == "playlists":
        try:
            payload = SpotifyClient().get_my_playlists(limit=30, offset=0)
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
            SpotifyClient().add_playlist_items(playlist_id=playlist_id, uris=[uri])
            return {"ok": True, "added": True, "playlistId": playlist_id, "uri": uri}
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Could not add track to playlist: {exc}") from exc

    if action != "status":
        _ensure_spotify_running_hidden()

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
