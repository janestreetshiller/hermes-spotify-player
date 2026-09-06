"""The quiz artifact is inert, validated data until Hermes approves a write."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'skills/my-mix/scripts/mix_desk.py'


class MixDeskTests(unittest.TestCase):
    def load(self):
        self.assertTrue(SCRIPT.exists(), 'The portable quiz renderer must exist')
        spec = importlib.util.spec_from_file_location('mix_desk', SCRIPT)
        assert spec and spec.loader
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    def test_validation_rejects_bad_ids_and_never_silently_repairs(self):
        module = self.load()
        for uri in ['spotify:track:short', ' spotify:track:' + 'a' * 22]:
            with self.assertRaises(ValueError):
                module.validate({'mode': 'my-mix', 'tracks': [{'uri': uri}]})
        with self.assertRaises(ValueError):
            module.validate({'mode': 'unknown'})
        with self.assertRaises(ValueError):
            module.validate({'mode': 'my-mix', 'dryRun': 'false'})
        track = {'uri': 'spotify:track:' + 'b' * 22, 'title': 'Fixture'}
        state = module.validate({'mode': 'my-favorites', 'tracks': [track, track]})
        self.assertEqual(state['tracks'], [track])
        self.assertEqual(state['stage'], 'review')
        self.assertEqual(module.validate({'mode': 'new-tracks'})['stage'], 'quiz')

    def test_render_is_portable_and_preserves_untrusted_text_as_data(self):
        module = self.load()
        state = {'mode': 'my-mix', 'dryRun': True, 'name': '</script><script>evil()</script>',
                 'tracks': [{'uri': 'spotify:track:' + 'a' * 22, 'title': '<img onerror=evil()>', 'artist': 'Fixture artist'}]}
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / 'mix.html'
            module.render(state, output)
            html = output.read_text()
            self.assertNotIn('</script><script>evil()', html)
            self.assertIn('\\u003c/script', html)
            self.assertIn('spotify:track:' + 'a' * 22, html)
            self.assertIn('window.hermes', html)
            self.assertNotIn('src="http', html)


if __name__ == '__main__':
    unittest.main()
