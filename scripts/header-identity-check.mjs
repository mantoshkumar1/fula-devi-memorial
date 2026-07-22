#!/usr/bin/env node

import { resolve } from 'node:path';
import {
  assertHeaderIdentityOutput,
  readHeaderIdentityPages,
  runHeaderIdentityMutationTests,
  validateHeaderIdentityPages,
} from './lib/header-identity-output.mjs';

const root = resolve(process.cwd(), 'dist');

try {
  assertHeaderIdentityOutput(root);
  const mutations = runHeaderIdentityMutationTests(root);

  if (process.argv.includes('--controlled-negative')) {
    const pages = readHeaderIdentityPages(root);
    const html = pages.get('hi/index.html');
    if (!html) throw new Error('Missing rendered Hindi homepage');
    pages.set(
      'hi/index.html',
      html.replace(
        /<a class="site-name"[^>]*>Fula Devi Memorial Sewa Sansthan<\/a>/,
        '',
      ),
    );
    const failures = validateHeaderIdentityPages(pages);
    if (!failures.length) throw new Error('Controlled negative was not rejected');
    console.log(`Controlled negative rejected: ${failures[0]}`);
  }

  console.log(
    `✓ Header Identity: rendered output passed; ${mutations.length} regression mutations were rejected.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
