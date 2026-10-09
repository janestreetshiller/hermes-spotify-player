"""Exercise shipped installers without touching the user's Hermes profile."""
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
import os

ROOT = Path(__file__).resolve().parents[1]

@unittest.skipUnless(sys.platform == 'darwin', 'macOS installer')
class DesktopInstallTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='spotify install ')
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name) / 'checkout with spaces'
        (self.root / 'scripts').mkdir(parents=True)
        (self.root / 'desktop').mkdir()
        for name in ('install-desktop.sh', 'uninstall-desktop.sh'):
            shutil.copy2(ROOT / 'scripts' / name, self.root / 'scripts' / name)
        self.source = self.root / 'desktop/plugin.js'
        self.source.write_text('// test source\n')
        self.home = Path(self.tmp.name) / 'custom profile'
        self.link = self.home / 'desktop-plugins/spotify-player/plugin.js'

    def run_script(self, name='install-desktop.sh', success=True):
        result = subprocess.run(['sh', str(self.root / 'scripts' / name)],
                                env={**os.environ, 'HERMES_HOME': str(self.home)},
                                capture_output=True, text=True, timeout=10)
        self.assertEqual(result.returncode == 0, success, result.stdout + result.stderr)

    def test_clean_repeat_and_uninstall(self):
        self.run_script()
        self.run_script()
        self.assertEqual(self.link.resolve(), self.source.resolve())
        self.source.write_text('// updated\n')
        self.assertEqual(self.link.read_text(), '// updated\n')
        self.run_script('uninstall-desktop.sh')
        self.run_script('uninstall-desktop.sh')
        self.assertFalse(self.link.is_symlink())

    def test_existing_file_preserved(self):
        self.link.parent.mkdir(parents=True)
        self.link.write_text('user content')
        self.run_script(success=False)
        self.run_script('uninstall-desktop.sh')
        self.assertEqual(self.link.read_text(), 'user content')

    def test_existing_directory_preserved(self):
        self.link.mkdir(parents=True)
        self.run_script(success=False)
        self.assertEqual(list(self.link.iterdir()), [])

    def test_missing_source_creates_no_link(self):
        self.source.unlink()
        self.run_script(success=False)
        self.assertFalse(self.link.is_symlink())
        self.assertFalse(self.home.exists())

    def test_stale_link_repaired(self):
        self.link.parent.mkdir(parents=True)
        self.link.symlink_to(self.root / 'missing.js')
        self.run_script()
        self.assertEqual(self.link.resolve(), self.source.resolve())

    def test_directory_link_not_followed(self):
        self.link.parent.mkdir(parents=True)
        self.link.symlink_to(self.root / 'desktop', target_is_directory=True)
        self.run_script(success=False)
        self.assertFalse(self.source.is_symlink())

if __name__ == '__main__':
    unittest.main()
