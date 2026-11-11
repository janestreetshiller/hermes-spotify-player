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
    def test_curate_creates_private_playlist_and_verifies_it(self):
        import tempfile
        import os
        from unittest.mock import Mock
        api = load_api_module()
        uri = 'spotify:track:' + 'a' * 22
        playlist = {'id':'b'*22, 'name':'Night drive', 'public':False, 'collaborative':False}
        fake = Mock()
        fake.request.side_effect = [playlist, {'snapshot_id':'v1'}, playlist,
                                    {'items':[{'item':{'uri':uri}}], 'total':1, 'next':None}]
        with tempfile.TemporaryDirectory() as home, patch.dict(os.environ, {'HERMES_HOME':home}), patch.object(api, 'SpotifyClient', return_value=fake):
            body = {'action':'create', 'name':'Night drive', 'tracks':[uri], 'requestId':'test-private-1'}
            response = make_client(api).post('/curate', json=body)
            self.assertEqual(response.status_code, 200, response.text)
            self.assertTrue(response.json()['verified'])
            self.assertEqual(response.json()['trackCount'], 1)
            self.assertEqual(fake.request.call_args_list[0].args, ('POST','/me/playlists'))
            self.assertEqual(fake.request.call_args_list[0].kwargs['json_body']['public'], False)
            replay = make_client(api).post('/curate', json=body)
            self.assertEqual(replay.json()['playlistId'], 'b'*22)
            self.assertEqual(fake.request.call_count, 4, 'same request ID must not create twice')

    def test_curate_preview_and_bulk_likes_are_verified(self):
        from unittest.mock import Mock
        api = load_api_module()
        uri = 'spotify:track:' + 'a' * 22
        fake = Mock()
        fake.request.side_effect = [{'tracks':{'items':[{'uri':uri,'name':'Night','artists':[{'name':'Artist'}]}]}},
                                    {}, [True]]
        with patch.object(api, 'SpotifyClient', return_value=fake):
            preview = make_client(api).post('/curate', json={'action':'preview','queries':['Artist Night']})
            self.assertEqual(preview.status_code,200,preview.text)
            self.assertEqual(preview.json()['results'][0]['candidates'][0]['uri'],uri)
            liked = make_client(api).post('/curate', json={'action':'set-liked','tracks':[uri,uri],'saved':True})
            self.assertTrue(liked.json()['verified'],liked.text)
            self.assertEqual(liked.json()['trackCount'],1)
            self.assertEqual(fake.request.call_args_list[-1].args,('GET','/me/library/contains'))

    def test_api_errors_do_not_expose_exception_details(self):
        from unittest.mock import Mock
        api = load_api_module()
        secret = 'Traceback: access_token=do-not-disclose'
        fake = Mock()
        fake.request.side_effect = RuntimeError(secret)
        uri = 'spotify:track:' + 'a' * 22
        with patch.object(api, 'SpotifyClient', return_value=fake):
            client = make_client(api)
            responses = [
                client.post('/control', json={'action': 'search', 'argument': 'music'}),
                client.post('/curate', json={'action': 'preview', 'queries': ['music']}),
                client.post('/curate', json={'action': 'taste'}),
                client.post('/curate', json={'action': 'set-liked', 'tracks': [uri], 'saved': True}),
            ]
        self.assertEqual([response.status_code for response in responses], [502, 502, 502, 200])
        for response in responses:
            self.assertNotIn(secret, response.text)
        self.assertFalse(responses[-1].json()['verified'])
        self.assertIn('Read current state', responses[-1].json()['error'])

    def test_failed_creation_and_legacy_receipt_do_not_expose_errors(self):
        import os
        import sqlite3
        import tempfile
        from contextlib import closing
        from unittest.mock import Mock
        api = load_api_module()
        secret = 'Traceback: access_token=do-not-disclose'
        fake = Mock()
        fake.request.side_effect = [{'id': 'b' * 22}, RuntimeError(secret)]
        uri = 'spotify:track:' + 'a' * 22
        body = {'action': 'create', 'name': 'Partial', 'tracks': [uri], 'requestId': 'partial-secret'}
        with tempfile.TemporaryDirectory() as home, patch.dict(os.environ, {'HERMES_HOME': home}), patch.object(api, 'SpotifyClient', return_value=fake):
            client = make_client(api)
            response = client.post('/curate', json=body)
            self.assertNotIn(secret, response.text)
            self.assertEqual(response.json()['playlistId'], 'b' * 22)
            path = Path(home) / 'spotify-player' / 'curation.sqlite3'
            with closing(sqlite3.connect(path)) as db, db:
                receipt = response.json()
                receipt['error'] = secret
                db.execute('UPDATE receipts SET result=?', (json.dumps(receipt),))
            replay = client.post('/curate', json=body)
            self.assertTrue(replay.json()['replayed'])
            self.assertEqual(replay.json()['playlistId'], 'b' * 22)
            self.assertNotIn(secret, replay.text)
            self.assertEqual(fake.request.call_count, 2)

    def test_named_song_retry_reads_receipt_without_search_or_mutation(self):
        import os
        import tempfile
        from unittest.mock import Mock
        api = load_api_module()
        uri = 'spotify:track:' + 'a' * 22
        body = {'action': 'create', 'name': 'Named mix', 'songs': [{'title': 'Night', 'artist': 'Artist'}], 'requestId': 'named-retry'}
        search = {'tracks': {'items': [{'uri': uri, 'name': 'Night', 'artists': [{'name': 'Artist'}]}]}}
        playlist = {'id': 'b' * 22, 'name': 'Named mix', 'public': False, 'collaborative': False}
        for interrupted in (False, True):
            with self.subTest(interrupted=interrupted), tempfile.TemporaryDirectory() as home:
                fake = Mock()
                fake.request.side_effect = ([search, {'id': 'b' * 22}, RuntimeError('response lost')] if interrupted else
                    [search, playlist, {}, playlist, {'items': [{'item': {'uri': uri}}], 'total': 1, 'next': None}])
                with patch.dict(os.environ, {'HERMES_HOME': home}), patch.object(api, 'SpotifyClient', return_value=fake):
                    client = make_client(api)
                    first = client.post('/curate', json=body)
                    self.assertEqual(first.status_code, 200, first.text)
                    self.assertEqual(first.json()['verified'], not interrupted)
                    count = fake.request.call_count
                    fake.request.side_effect = RuntimeError('search is unavailable')
                    replay = client.post('/curate', json=body)
                    self.assertEqual(replay.status_code, 200, replay.text)
                    self.assertTrue(replay.json()['replayed'])
                    self.assertEqual(replay.json()['playlistId'], 'b' * 22)
                    self.assertEqual(fake.request.call_count, count)
                    changed = client.post('/curate', json={**body, 'songs': [{'title': 'Other', 'artist': 'Artist'}]})
                    self.assertEqual(changed.status_code, 409)
                    self.assertEqual(fake.request.call_count, count)
                    if not interrupted:
                        uri_retry = {key: value for key, value in body.items() if key != 'songs'}
                        uri_retry['tracks'] = [uri]
                        self.assertTrue(client.post('/curate', json=uri_retry).json()['replayed'])
                        self.assertEqual(fake.request.call_count, count)

    def test_pending_named_search_does_not_lock_receipt_replay(self):
        import os
        import tempfile
        from threading import Event, Thread
        from unittest.mock import Mock
        api = load_api_module()
        started, release = Event(), Event()
        fake = Mock()
        def search(*args, **kwargs):
            started.set()
            self.assertTrue(release.wait(5))
            return {'tracks': {'items': []}}
        fake.request.side_effect = search
        body = {'action': 'create', 'name': 'Pending', 'songs': [{'title': 'Night', 'artist': 'Artist'}], 'requestId': 'pending-test'}
        with tempfile.TemporaryDirectory() as home, patch.dict(os.environ, {'HERMES_HOME': home}), patch.object(api, 'SpotifyClient', return_value=fake):
            client = make_client(api)
            responses = []
            worker = Thread(target=lambda: responses.append(client.post('/curate', json=body)))
            worker.start()
            try:
                self.assertTrue(started.wait(5))
                replay = client.post('/curate', json=body)
                self.assertTrue(replay.json()['replayed'])
                self.assertFalse(replay.json()['verified'])
                self.assertEqual(fake.request.call_count, 1)
            finally:
                release.set()
                worker.join(5)
            self.assertEqual(responses[0].status_code, 422)
    def test_named_search_failure_can_retry_before_any_creation(self):
        import os
        import tempfile
        from unittest.mock import Mock
        api = load_api_module()
        fake = Mock()
        fake.request.side_effect = [RuntimeError('temporary secret'), {'tracks': {'items': []}}]
        body = {'action': 'create', 'name': 'Retry', 'songs': [{'title': 'Night', 'artist': 'Artist'}], 'requestId': 'search-retry'}
        with tempfile.TemporaryDirectory() as home, patch.dict(os.environ, {'HERMES_HOME': home}), patch.object(api, 'SpotifyClient', return_value=fake):
            client = make_client(api)
            failed = client.post('/curate', json=body)
            self.assertEqual(failed.status_code, 502)
            self.assertNotIn('temporary secret', failed.text)
            retry = client.post('/curate', json=body)
            self.assertEqual(retry.status_code, 422)
            self.assertEqual(fake.request.call_count, 2)




    def test_curate_does_not_report_partial_creation_as_success(self):
        import tempfile, os
        from unittest.mock import Mock
        api = load_api_module()
        uri = 'spotify:track:' + 'a' * 22
        fake = Mock()
        fake.request.side_effect = [{'id':'b'*22}, RuntimeError('write refused')]
        with tempfile.TemporaryDirectory() as home, patch.dict(os.environ, {'HERMES_HOME':home}), patch.object(api,'SpotifyClient',return_value=fake):
            body={'action':'create','name':'Partial','tracks':[uri],'requestId':'partial-test'}
            result=make_client(api).post('/curate',json=body).json()
            self.assertFalse(result['ok'])
            self.assertFalse(result['verified'])
            self.assertEqual(result['playlistId'],'b'*22)
            replay=make_client(api).post('/curate',json=body).json()
            self.assertTrue(replay['replayed'])
            self.assertEqual(fake.request.call_count,2)
            conflict=make_client(api).post('/curate',json={**body,'name':'Different'})
            self.assertEqual(conflict.status_code,409)

    def test_curate_rejects_bad_identifiers_before_any_side_effect(self):
        api=load_api_module()
        with patch.object(api,'SpotifyClient') as client:
            for tracks in [['spotify:track:short'],[' spotify:track:'+'a'*22],[],['spotify:track:'+'a'*22]*51]:
                result=make_client(api).post('/curate',json={'action':'create','name':'Test','tracks':tracks,'requestId':'valid-request'})
                self.assertEqual(result.status_code,400,result.text)
            client.assert_not_called()

    def test_plugin_exposes_one_shot_curation_tool(self):
        from unittest.mock import Mock
        path = Path(__file__).resolve().parents[1] / '__init__.py'
        spec=importlib.util.spec_from_file_location('spotify_player_registration_test',path)
        plugin=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(plugin)
        ctx=Mock()
        plugin.register(ctx)
        definitions=[call.kwargs for call in ctx.register_tool.call_args_list]
        self.assertEqual([d['name'] for d in definitions],['spotify_player_curate'])
        self.assertEqual(definitions[0]['toolset'],'spotify')
        self.assertIn('create',definitions[0]['schema']['parameters']['properties']['action']['enum'])

    def test_curate_named_songs_resolves_exact_matches_before_create(self):
        import tempfile, os
        from unittest.mock import Mock
        api=load_api_module()
        uri='spotify:track:'+'a'*22
        playlist={'id':'b'*22,'name':'Named mix','public':False,'collaborative':False}
        fake=Mock()
        fake.request.side_effect=[{'tracks':{'items':[{'uri':uri,'name':'Night','artists':[{'name':'Artist'}]}]}},
            playlist,{},playlist,{'items':[{'item':{'uri':uri}}],'total':1,'next':None}]
        with tempfile.TemporaryDirectory() as home, patch.dict(os.environ,{'HERMES_HOME':home}),patch.object(api,'SpotifyClient',return_value=fake):
            result=make_client(api).post('/curate',json={'action':'create','name':'Named mix','songs':[{'title':'Night','artist':'Artist'}],'requestId':'named-test'})
            self.assertEqual(result.status_code,200,result.text)
            self.assertTrue(result.json()['verified'],result.text)
            self.assertEqual(fake.request.call_args_list[0].args,('GET','/search'))

    def test_current_hermes_imports_without_deprecated_compat(self):
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter('error')
            load_api_module()

    def test_native_numbers_are_validated_before_launch(self):
        api = load_api_module()
        with patch.object(api.subprocess, 'run') as run:
            client = make_client(api)
            for action, values in {'volume': ['NaN', 'Infinity', '-1', '101', 'no'], 'seek': ['NaN', '-1', '86401']}.items():
                for value in values:
                    with self.subTest(action=action, value=value):
                        self.assertEqual(client.post('/control', json={'action': action, 'argument': value}).status_code, 400)
            run.assert_not_called()

    def test_status_coalesces_and_mutation_invalidates_snapshot(self):
        from types import SimpleNamespace
        api = load_api_module()
        result = SimpleNamespace(returncode=0, stdout=json.dumps({'ok': True, 'running': True, 'state': 'paused'}), stderr='')
        with patch.object(api.subprocess, 'run', return_value=result) as run, patch.object(api, '_ensure_spotify_running_hidden'):
            client = make_client(api)
            client.post('/control', json={'action': 'status'})
            client.post('/control', json={'action': 'status'})
            self.assertEqual(run.call_count, 1)
            response = client.post('/control', json={'action': 'seek', 'argument': '12.5'})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(run.call_args.args[0][-2:], ['seek', '12.5'])
            self.assertEqual(run.call_count, 2)

    def test_current_spotify_client_request_contract(self):
        api = load_api_module()
        client = object.__new__(api.SpotifyClient)
        with patch.object(api, 'SpotifyClient', return_value=client), patch.object(client, 'request', return_value={'tracks': {'items': []}}) as request:
            response = make_client(api).post('/control', json={'action': 'search', 'argument': 'focus'})
            self.assertEqual(response.status_code, 200, response.text)
            request.assert_called_once_with('GET', '/search', params={'q': 'focus', 'type': 'track', 'limit': 10})

    def test_current_library_and_playlist_request_contract(self):
        api = load_api_module()
        client = object.__new__(api.SpotifyClient)
        uri = 'spotify:track:abc123'
        with patch.object(api, 'SpotifyClient', return_value=client), patch.object(client, 'request', side_effect=[[True], {}, [False]]) as request:
            response = make_client(api).post('/control', json={'action': 'set-saved', 'argument': json.dumps({'uri': uri, 'saved': False})})
            self.assertEqual(response.status_code, 200, response.text)
            self.assertFalse(response.json()['saved'])
            self.assertEqual(request.call_args_list[1].args, ('DELETE', '/me/library'))
            self.assertEqual(request.call_args_list[1].kwargs, {'params': {'uris': uri}})
            self.assertEqual(request.call_count, 3, 'Read back saved state after mutation')
        with patch.object(api, 'SpotifyClient', return_value=client), patch.object(client, 'request', return_value={'items': []}) as request:
            response = make_client(api).post('/control', json={'action': 'playlists'})
            self.assertEqual(response.status_code, 200, response.text)
            request.assert_called_once_with('GET', '/me/playlists', params={'limit': 30, 'offset': 0})
        with patch.object(api, 'SpotifyClient', return_value=client), patch.object(client, 'request', return_value={'snapshot_id': 'receipt123'}) as request:
            response = make_client(api).post('/control', json={'action': 'playlist-add', 'argument': json.dumps({'uri': uri, 'playlistId': 'abc123'})})
            self.assertEqual(response.status_code, 200, response.text)
            request.assert_called_once_with('POST', '/playlists/abc123/items', json_body={'uris': [uri]})
            self.assertEqual(response.json()['snapshotId'], 'receipt123')

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
            def request(self, method, path, *, params):
                assert (method, path) == ("GET", "/search")
                self.kwargs = params
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
            def request(self, method, path, *, params):
                assert (method, path) == ("GET", "/me/library/contains")
                self.uris = params["uris"].split(",")
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

            def request(self, method, path, *, params):
                if method == "GET":
                    assert path == "/me/library/contains"
                    return [self.saved]
                assert path == "/me/library"
                self.saved = method == "PUT"
                if self.saved:
                    self.saved_uris.extend(params["uris"].split(","))
                else:
                    self.removed_ids.extend(uri.split(":")[-1] for uri in params["uris"].split(","))
                return {}

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

            def request(self, method, path, *, params=None, json_body=None):
                if method == "POST":
                    assert path == "/playlists/playlist123/items"
                    self.added = ("playlist123", json_body["uris"])
                    return {"snapshot_id": "snapshot123"}
                assert (method, path) == ("GET", "/me/playlists")
                return {"items": [{
                    "id": "playlist123",
                    "name": "Focus",
                    "images": [{"url": "https://example.test/focus.jpg"}],
                    "items": {"total": 12},
                }]}

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
                "redirect_uri": "http://127.0.0.1:49999/custom/callback",
            }
        ), patch.object(api, "_configured_spotify_client_id", return_value="configured-client"), patch.object(api, "get_env_value", return_value=None):
            response = make_client(api).get("/auth/status")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["loggedIn"])
        self.assertTrue(body["clientConfigured"])
        self.assertEqual(body["redirectUri"], "http://127.0.0.1:49999/custom/callback")
        self.assertNotIn("client_id", json.dumps(body))
        self.assertNotIn("must-not-leak", json.dumps(body))

    def test_audio_start_requires_strict_consent_and_uses_public_router(self):
        api = load_api_module()
        client = make_client(api)
        with patch.object(api._AUDIO, 'start', return_value={'state':'starting','lease':'test'}) as start:
            self.assertEqual(client.post('/visualizer/start',json={'consent':'true'}).status_code,422)
            start.assert_not_called()
            response = client.post('/visualizer/start',json={'consent':True})
            self.assertEqual(response.status_code,200)
            start.assert_called_once_with(True)
        self.assertEqual(client.post('/visualizer/start',json={'consent':False}).status_code,400)
        self.assertEqual(client.get('/visualizer/status').json()['state'],'off')
        self.assertEqual(client.get('/visualizer/frame?lease=unknown').json()['state'],'off')
        self.assertEqual(client.post('/visualizer/stop',json={'lease':'unknown'}).status_code,200)

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
