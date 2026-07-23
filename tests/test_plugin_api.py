import importlib.util
import json
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

MODULE_PATH = Path(__file__).resolve().parents[1] / "dashboard" / "plugin_api.py"


def load_api_module():
    spec = importlib.util.spec_from_file_location("spotify_player_plugin_api", MODULE_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def make_client(api):
    app = FastAPI()
    app.include_router(api.router)
    return TestClient(app)


class SpotifyPluginApiTests(unittest.TestCase):
    def test_status_returns_native_spotify_snapshot(self):
        api = load_api_module()

        class Result:
            returncode = 0
            stdout = json.dumps({
                "ok": True,
                "running": True,
                "state": "paused",
                "title": "Test Track",
                "artist": "Test Artist",
            })
            stderr = ""

        with patch.object(api.subprocess, "run", return_value=Result()):
            response = make_client(api).post(
                "/control", json={"action": "status", "argument": ""}
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["title"], "Test Track")

    def test_rejects_unknown_actions_before_running_osascript(self):
        api = load_api_module()

        with patch.object(api.subprocess, "run") as run:
            response = make_client(api).post(
                "/control", json={"action": "delete-everything"}
            )

        self.assertEqual(response.status_code, 400)
        run.assert_not_called()

    def test_search_returns_ten_compact_track_results_without_osascript(self):
        api = load_api_module()

        tracks = [
            {
                "name": f"Track {index}",
                "uri": f"spotify:track:{index}",
                "artists": [{"name": "Test Artist"}],
                "album": {
                    "name": "Test Album",
                    "images": [{"url": f"https://example.test/{index}.jpg"}],
                },
                "duration_ms": 180000,
            }
            for index in range(12)
        ]

        class Client:
            def search(self, **kwargs):
                self.kwargs = kwargs
                return {"tracks": {"items": tracks}}

        client = Client()
        with patch.object(api, "SpotifyClient", return_value=client), patch.object(
            api.subprocess, "run"
        ) as run:
            response = make_client(api).post(
                "/control", json={"action": "search", "argument": "  synth wave  "}
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["query"], "synth wave")
        self.assertEqual(len(response.json()["results"]), 10)
        self.assertEqual(response.json()["results"][0]["title"], "Track 0")
        self.assertEqual(response.json()["results"][0]["artist"], "Test Artist")
        self.assertEqual(client.kwargs["limit"], 10)
        run.assert_not_called()

    def test_search_rejects_blank_or_oversized_queries(self):
        api = load_api_module()

        with patch.object(api.subprocess, "run") as run:
            blank = make_client(api).post(
                "/control", json={"action": "search", "argument": "   "}
            )
            oversized = make_client(api).post(
                "/control", json={"action": "search", "argument": "x" * 201}
            )

        self.assertEqual(blank.status_code, 400)
        self.assertEqual(oversized.status_code, 400)
        run.assert_not_called()

    def test_playback_launches_spotify_hidden_when_it_is_closed(self):
        api = load_api_module()

        class Closed:
            returncode = 1
            stdout = ""
            stderr = ""

        class Opened:
            returncode = 0
            stdout = ""
            stderr = ""

        class Running:
            returncode = 0
            stdout = "123\n"
            stderr = ""

        class Controller:
            returncode = 0
            stdout = json.dumps({"ok": True, "running": True, "state": "playing"})
            stderr = ""

        with patch.object(
            api.subprocess,
            "run",
            side_effect=[Closed(), Opened(), Running(), Controller()],
        ) as run:
            response = make_client(api).post(
                "/control", json={"action": "playpause"}
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            run.call_args_list[1].args[0],
            ["/usr/bin/open", "-gj", "-a", "Spotify"],
        )

    def test_current_track_saved_status_is_authoritative(self):
        api = load_api_module()

        class Client:
            def library_contains(self, *, uris):
                self.uris = uris
                return [True]

        client = Client()
        uri = "spotify:track:abc123"
        with patch.object(api, "SpotifyClient", return_value=client), patch.object(
            api.subprocess, "run"
        ) as run:
            status = make_client(api).post(
                "/control", json={"action": "saved-status", "argument": uri}
            )

        self.assertTrue(status.json()["saved"])
        self.assertEqual(status.json()["uri"], uri)
        self.assertEqual(client.uris, [uri])
        run.assert_not_called()

    def test_saved_state_updates_are_idempotent_and_never_toggle(self):
        api = load_api_module()

        class Client:
            def __init__(self):
                self.saved = True
                self.saved_uris = []
                self.removed_ids = []

            def library_contains(self, *, uris):
                return [self.saved]

            def save_library_items(self, *, uris):
                self.saved = True
                self.saved_uris.extend(uris)

            def remove_saved_tracks(self, *, track_ids):
                self.saved = False
                self.removed_ids.extend(track_ids)

        client = Client()
        uri = "spotify:track:abc123"
        keep_liked = json.dumps({"uri": uri, "saved": True})
        unlike = json.dumps({"uri": uri, "saved": False})
        with patch.object(api, "SpotifyClient", return_value=client), patch.object(
            api.subprocess, "run"
        ) as run:
            unchanged = make_client(api).post(
                "/control", json={"action": "set-saved", "argument": keep_liked}
            )
            removed = make_client(api).post(
                "/control", json={"action": "set-saved", "argument": unlike}
            )
            still_removed = make_client(api).post(
                "/control", json={"action": "set-saved", "argument": unlike}
            )

        self.assertTrue(unchanged.json()["saved"])
        self.assertFalse(removed.json()["saved"])
        self.assertFalse(still_removed.json()["saved"])
        self.assertEqual(client.saved_uris, [])
        self.assertEqual(client.removed_ids, ["abc123"])
        run.assert_not_called()

    def test_legacy_toggle_save_is_rejected(self):
        api = load_api_module()

        with patch.object(api.subprocess, "run") as run:
            response = make_client(api).post(
                "/control",
                json={"action": "toggle-save", "argument": "spotify:track:abc123"},
            )

        self.assertEqual(response.status_code, 400)
        run.assert_not_called()

    def test_lists_playlists_and_adds_the_selected_track(self):
        api = load_api_module()

        class Client:
            def __init__(self):
                self.added = None

            def get_my_playlists(self, *, limit, offset):
                return {"items": [{
                    "id": "playlist123",
                    "name": "Focus",
                    "images": [{"url": "https://example.test/focus.jpg"}],
                    "items": {"total": 12},
                }]}

            def add_playlist_items(self, *, playlist_id, uris):
                self.added = (playlist_id, uris)
                return {"snapshot_id": "snapshot123"}

        client = Client()
        payload = json.dumps({
            "playlistId": "playlist123",
            "uri": "spotify:track:abc123",
        })
        with patch.object(api, "SpotifyClient", return_value=client), patch.object(
            api.subprocess, "run"
        ) as run:
            playlists = make_client(api).post(
                "/control", json={"action": "playlists"}
            )
            added = make_client(api).post(
                "/control", json={"action": "playlist-add", "argument": payload}
            )

        self.assertEqual(playlists.json()["playlists"][0]["name"], "Focus")
        self.assertTrue(added.json()["added"])
        self.assertEqual(client.added, ("playlist123", ["spotify:track:abc123"]))
        run.assert_not_called()

    def test_lyrics_fetches_exact_track_signature_from_lrclib(self):
        api = load_api_module()

        class Response:
            status = 200

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

            def read(self):
                return json.dumps({
                    "plainLyrics": "First line\nSecond line",
                    "syncedLyrics": "[00:01.00] First line",
                    "instrumental": False,
                }).encode()

        request_seen = None

        def fake_urlopen(request, timeout):
            nonlocal request_seen
            request_seen = request
            self.assertEqual(timeout, 8)
            return Response()

        signature = json.dumps({
            "title": "Test Track",
            "artist": "Test Artist",
            "album": "Test Album",
            "duration": 180,
        })
        with patch.object(api, "urlopen", side_effect=fake_urlopen), patch.object(
            api.subprocess, "run"
        ) as run:
            response = make_client(api).post(
                "/control", json={"action": "lyrics", "argument": signature}
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["lyrics"], "First line\nSecond line")
        self.assertEqual(response.json()["syncedLyrics"], "[00:01.00] First line")
        self.assertIn("track_name=Test+Track", request_seen.full_url)
        self.assertEqual(request_seen.get_header("User-agent"), api.LRCLIB_USER_AGENT)
        run.assert_not_called()

    def test_auth_status_reports_connection_without_exposing_credentials(self):
        api = load_api_module()

        with patch.object(
            api, "get_spotify_auth_status", return_value={
                "logged_in": True,
                "scope": "user-library-read playlist-modify-private",
                "expires_at": 1234567890,
                "client_id": "must-not-leak",
            }
        ), patch.object(api, "_configured_spotify_client_id", return_value="configured-client"):
            response = make_client(api).get("/auth/status")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["loggedIn"])
        self.assertTrue(body["clientConfigured"])
        self.assertNotIn("client_id", json.dumps(body))
        self.assertNotIn("must-not-leak", json.dumps(body))

    def test_auth_start_uses_a_single_background_pkce_flow(self):
        api = load_api_module()
        started = []

        class DeferredThread:
            def __init__(self, *, target, args, daemon, name):
                self.target = target
                self.args = args
                self.daemon = daemon
                self.name = name

            def start(self):
                started.append(self)

        with patch.object(api, "Thread", DeferredThread):
            response = make_client(api).post(
                "/auth/start", json={"clientId": "a" * 32}
            )
            duplicate = make_client(api).post(
                "/auth/start", json={"clientId": "a" * 32}
            )

        self.assertEqual(response.status_code, 202)
        self.assertEqual(response.json()["phase"], "waiting")
        self.assertEqual(duplicate.status_code, 409)
        self.assertEqual(len(started), 1)
        self.assertTrue(started[0].daemon)

    def test_auth_start_rejects_malformed_client_id(self):
        api = load_api_module()

        response = make_client(api).post(
            "/auth/start", json={"clientId": "not a client id; rm -rf"}
        )

        self.assertEqual(response.status_code, 400)

    def test_surfaces_invalid_controller_output(self):
        api = load_api_module()

        class Result:
            returncode = 0
            stdout = "not-json"
            stderr = ""

        with patch.object(api.subprocess, "run", return_value=Result()):
            response = make_client(api).post(
                "/control", json={"action": "status"}
            )

        self.assertEqual(response.status_code, 502)
        self.assertEqual(
            response.json()["detail"],
            "Spotify controller returned invalid JSON.",
        )


if __name__ == "__main__":
    unittest.main()
