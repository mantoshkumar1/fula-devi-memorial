#!/usr/bin/env node

import { resolve } from 'node:path';
import {
  assertHeaderIdentityOutput,
  runHeaderIdentityMutationTests,
} from './lib/header-identity-output.mjs';
import {
  assertLocalizedContentOutput,
  HINDI_QUOTE,
  OLD_HINDI_QUOTE,
  runLocalizedContentMutationTests,
  validateLocalizedContentPages,
} from './lib/localized-content-output.mjs';
import { readHeaderIdentityPages } from './lib/header-identity-output.mjs';

const root = resolve(process.cwd(), 'dist');

try {
  assertHeaderIdentityOutput(root);
  assertLocalizedContentOutput(root);
  const headerMutations = runHeaderIdentityMutationTests(root);
  const contentMutations = runLocalizedContentMutationTests(root);

  if (process.argv.includes('--controlled-negative')) {
    const pages = readHeaderIdentityPages(root);
    const html = pages.get('hi/index.html');
    if (!html) throw new Error('Missing rendered Hindi homepage');
    pages.set('hi/index.html', html.replace(HINDI_QUOTE, OLD_HINDI_QUOTE));
    const failures = validateLocalizedContentPages(pages);
    if (!failures.length) throw new Error('Controlled quotation negative was not rejected');
    console.log(`Controlled negative rejected: ${failures[0]}`);
  }

  console.log(
    `✓ Publication Output: rendered output passed; ${headerMutations.length + contentMutations.length} regression mutations were rejected.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
