/**
 * External tools used only for *sanitizing* (never for verifying).
 *
 * Verification stays dependency-free on purpose, so it runs identically in the
 * pre-commit hook, GitHub Actions and the Cloudflare build. Sanitizing is a
 * local/pre-commit step and may use native tools.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

export const run = promisify(execFile);

const INSTALL_HINTS = {
  exiftool: {
    macOS: 'brew install exiftool',
    debian: 'sudo apt-get install -y libimage-exiftool-perl',
    site: 'https://exiftool.org',
  },
  qpdf: {
    macOS: 'brew install qpdf',
    debian: 'sudo apt-get install -y qpdf',
    site: 'https://qpdf.sourceforge.io',
  },
};

/** Exit with clear install instructions if a required tool is missing. */
export async function requireTool(name, versionArg = '-ver') {
  try {
    const { stdout } = await run(name, [versionArg]);
    return stdout.trim().split('\n')[0];
  } catch {
    const hint = INSTALL_HINTS[name];
    console.error(`✗ ${name} is not installed, so files cannot be sanitized.\n`);
    if (hint) {
      console.error(`  macOS:          ${hint.macOS}`);
      console.error(`  Debian/Ubuntu:  ${hint.debian}`);
      console.error(`  Other:          ${hint.site}\n`);
    }
    console.error('Verification (npm run privacy:check) needs no tools and still works.');
    process.exit(1);
  }
}
