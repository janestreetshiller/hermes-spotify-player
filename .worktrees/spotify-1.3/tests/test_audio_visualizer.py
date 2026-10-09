"""No Spotify mutations, capture, permission prompts, or compiler invocation."""
import importlib.util
from pathlib import Path
import re
import time
import unittest
from unittest.mock import patch, Mock

spec = importlib.util.spec_from_file_location('audio_test_module', Path(__file__).resolve().parents[1] / 'dashboard/audio_visualizer.py')
audio = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audio)


class AudioVisualizerTests(unittest.TestCase):
    def setUp(self):
        self.manager = audio.AudioVisualizer(Path('not-executed.swift'))

    def tearDown(self):
        self.manager.close()

    def test_native_source_uses_only_spotify_system_audio_output(self):
        source = (Path(__file__).resolve().parents[1] / 'dashboard/AudioSpectrum.swift').read_text()
        self.assertEqual(re.findall(r'addStreamOutput\(.*?type:\s*\.(\w+)', source, re.S), ['audio'])
        self.assertIn('including: [spotify], exceptingWindows: []', source)
        self.assertNotIn('addRecordingOutput', source)
        self.assertNotIn('config.captureMicrophone', source, 'avoid requiring a macOS 15 SDK to compile the macOS 13 helper')

    def test_status_and_unleased_reads_never_start_capture(self):
        with patch.object(audio.subprocess, 'Popen') as process:
            self.assertEqual(self.manager.status()['state'], 'off')
            self.assertEqual(self.manager.poll('unknown')['state'], 'off')
            process.assert_not_called()

    def test_explicit_boolean_consent_required(self):
        for consent in (False, None, 'true', 1):
            with self.assertRaises(ValueError):
                self.manager.start(consent)
        self.assertEqual(self.manager.leases, {})

    def test_unsupported_platform_never_starts(self):
        with patch.object(audio.sys, 'platform', 'linux'), patch.object(audio.threading, 'Thread') as worker:
            self.assertEqual(self.manager.start(True)['state'], 'unavailable')
            worker.assert_not_called()

    def test_viewers_share_one_source_with_independent_leases(self):
        with patch.object(audio.sys, 'platform', 'darwin'), patch.object(audio.threading, 'Thread') as worker:
            first = self.manager.start(True)['lease']
            second = self.manager.start(True)['lease']
            self.assertNotEqual(first, second)
            self.assertEqual(worker.call_count, 2, 'one capture worker and one watchdog, not per viewer')
            self.manager.stop(first)
            self.assertIn(second, self.manager.leases)
            self.assertEqual(self.manager.poll(second)['state'], 'starting')
            self.manager.stop(second)
            self.assertEqual(self.manager.frame['state'], 'off')

    def test_expired_viewer_cannot_resurrect_capture(self):
        self.manager.leases['old'] = time.monotonic() - 10
        self.assertEqual(self.manager.poll('old')['state'], 'off')
        self.assertEqual(self.manager.leases, {})

    def test_last_viewer_stops_process(self):
        process = Mock()
        process.poll.return_value = None
        self.manager.process = process
        self.manager.leases['a'] = time.monotonic()
        with patch.object(audio.threading, 'Thread'):
            self.manager.stop('a')
        process.terminate.assert_called_once()
        self.assertIsNone(self.manager.process)

    def test_stale_frame_is_silence_not_fake_activity(self):
        self.manager.leases['a'] = time.monotonic()
        self.manager.frame = {'state': 'streaming', 'bands': [0.8] * 32, 'wave': [0.5] * 64, 'rms': 0.3}
        self.manager.updated = time.monotonic() - 3
        frame = self.manager.poll('a')
        self.assertEqual(frame['state'], 'silent')
        self.assertEqual(sum(frame['bands']), 0)
        self.assertEqual(sum(frame['wave']), 0)

    def test_rejects_malformed_or_nonfinite_analysis(self):
        good = {'state': 'streaming', 'bands': [0.5] * 32, 'wave': [0] * 64, 'rms': 0.1}
        self.assertTrue(self.manager._valid_frame(good))
        for bad in ({'bands': [float('nan')] * 32}, {'wave': [0] * 63}, {'rms': float('inf')}, {'rms': True}, {'state': 'fake'}, {'bands': [1.01] * 32}):
            self.assertFalse(self.manager._valid_frame({**good, **bad}))

    def test_obsolete_worker_cannot_start_after_viewer_leaves(self):
        self.manager.generation = 2
        with patch.object(self.manager, '_binary', return_value=Path('/not-executed')), patch.object(audio.subprocess, 'Popen') as process:
            self.manager._run(1)
            process.assert_not_called()


if __name__ == '__main__':
    unittest.main()
