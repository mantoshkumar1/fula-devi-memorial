/**
 * Shared file collection for the Privacy Pipeline.
 * One walker, used by every scanner, so they can never disagree about scope.
 */

import { readdir } from 'node:fs/promises';
import path from 'node:path';

/** Recursively collect files under `roots` matching any of `extensions`. */
export async function collectFiles(roots, extensions) {
  const exts = extensions.map((e) => e.toLowerCase());
  const found = [];

  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return; // a missing directory is not an error
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (exts.includes(path.extname(entry.name).toLowerCase())) found.push(full);
    }
  }

  for (const root of roots) await walk(root);
  return found.sort();
}
