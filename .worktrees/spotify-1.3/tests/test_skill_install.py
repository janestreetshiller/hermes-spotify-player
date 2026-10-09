import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]


class SkillInstallTests(unittest.TestCase):
    def test_install_is_profile_scoped_repeatable_and_preserves_conflicts(self):
        path = ROOT / 'scripts/install-skills.py'
        self.assertTrue(path.exists(), 'Pack installer must exist')
        spec = importlib.util.spec_from_file_location('mix_install', path)
        assert spec and spec.loader
        installer = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(installer)
        with tempfile.TemporaryDirectory() as folder, patch.dict(os.environ, {'HERMES_HOME': folder}):
            home = Path(folder)
            installed = installer.install()
            self.assertEqual(set(installed), {'my-mix', 'new-tracks', 'my-favorites'})
            self.assertEqual(installer.install(), installed)
            target = home / 'skills/my-mix/SKILL.md'
            target.write_text('personal change')
            with self.assertRaises(FileExistsError):
                installer.install()
            self.assertEqual(target.read_text(), 'personal change')
            self.assertFalse((home / 'config.yaml').exists())


if __name__ == '__main__':
    unittest.main()
