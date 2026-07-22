import { existsSync, renameSync, rmdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Astro gives only the root 404 page special file output. Keep the localized
 * page authored as an ordinary shared-view route, then normalize its generated
 * artifact to the exact `/hi/404.html` URL expected by static hosts.
 */
export function localizedNotFoundOutput() {
  return {
    name: 'localized-not-found-output',
    hooks: {
      'astro:build:done': ({ dir }: { dir: URL }) => {
        const root = fileURLToPath(dir);
        const sourceDirectory = resolve(root, 'hi/404');
        const source = resolve(sourceDirectory, 'index.html');
        const target = resolve(root, 'hi/404.html');

        if (!existsSync(source)) {
          throw new Error(`Localized 404 output was not generated: ${source}`);
        }

        renameSync(source, target);
        rmdirSync(sourceDirectory);
      },
    },
  };
}
