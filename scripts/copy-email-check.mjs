#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const sourcePath = resolve(root, 'public/scripts/copy-email.js');
const outputPath = resolve(root, 'dist/scripts/copy-email.js');
const expectedEmail = 'Fula.Devi.NGO@outlook.com';
const deprecatedMethod = ['exec', 'Command'].join('');
const deprecatedCopyPattern = new RegExp(
  `\\bdocument\\s*\\.\\s*${deprecatedMethod}\\s*\\(`,
);

const source = readFileSync(sourcePath, 'utf8');
const output = readFileSync(outputPath, 'utf8');

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function findDeprecatedCopy(files) {
  return files.filter((file) => deprecatedCopyPattern.test(readFileSync(file, 'utf8')));
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1] ?? null;
}

function contactMarkup(locale) {
  const path = locale === 'en'
    ? resolve(root, 'dist/contact/index.html')
    : resolve(root, 'dist/hi/contact/index.html');
  const html = readFileSync(path, 'utf8');
  const button = html.match(/<button\b[^>]*\bdata-copy-email=["'][^"']+["'][^>]*>/i)?.[0];
  const status = html.match(/<span\b[^>]*\bdata-copy-status\b[^>]*>/i)?.[0];

  assert.ok(button, `Missing rendered Copy email button on ${locale} Contact`);
  assert.equal(attribute(button, 'type'), 'button', `Copy control is not a native button on ${locale} Contact`);
  assert.equal(attribute(button, 'data-copy-email'), expectedEmail, `Incorrect email on ${locale} Contact`);
  assert.ok(/\bhidden\b/.test(button), `Copy control is not progressively enhanced on ${locale} Contact`);
  assert.ok(status, `Missing rendered copy status on ${locale} Contact`);
  assert.equal(attribute(status, 'role'), 'status', `Copy status is not a polite live region on ${locale} Contact`);

  return {
    html,
    success: attribute(button, 'data-copy-success'),
  };
}

function createHarness({ successMessage, writeText }) {
  const listeners = new Map();
  const button = {
    hidden: true,
    getAttribute(name) {
      if (name === 'data-copy-email') return expectedEmail;
      if (name === 'data-copy-success') return successMessage;
      return null;
    },
    addEventListener(name, listener) {
      listeners.set(name, listener);
    },
  };
  const status = { textContent: '' };
  const document = {
    querySelector(selector) {
      if (selector === '[data-copy-email]') return button;
      if (selector === '[data-copy-status]') return status;
      return null;
    },
  };
  const navigator = writeText ? { clipboard: { writeText } } : {};

  vm.runInNewContext(source, {
    clearTimeout() {},
    document,
    navigator,
    setTimeout() {
      return 1;
    },
  }, { filename: sourcePath });

  return { button, listeners, status };
}

async function verifySuccessfulCopy(successMessage) {
  let resolveCopy;
  const calls = [];
  const pendingCopy = new Promise((resolve) => {
    resolveCopy = resolve;
  });
  const harness = createHarness({
    successMessage,
    writeText(value) {
      calls.push(value);
      return pendingCopy;
    },
  });

  assert.equal(harness.button.hidden, false, 'Modern clipboard support did not reveal the Copy email button');
  const activate = harness.listeners.get('click');
  assert.equal(typeof activate, 'function', 'Copy email is not attached to native button activation');

  const result = activate();
  assert.deepEqual(calls, [expectedEmail], 'Clipboard API did not receive the exact email address');
  assert.equal(harness.status.textContent, '', 'Success was announced before the clipboard write completed');

  resolveCopy();
  await result;
  assert.equal(harness.status.textContent, successMessage, 'Localized success confirmation changed');
}

async function verifyFailedCopy(successMessage) {
  const harness = createHarness({
    successMessage,
    writeText() {
      return Promise.reject(new Error('Clipboard access denied'));
    },
  });

  await harness.listeners.get('click')();
  assert.equal(harness.status.textContent, '', 'A failed clipboard write displayed a false success confirmation');
}

try {
  const sourceFiles = [
    ...filesUnder(resolve(root, 'src')),
    ...filesUnder(resolve(root, 'public/scripts')),
  ].filter((file) => ['.astro', '.js', '.mjs', '.ts'].includes(extname(file)));

  assert.deepEqual(findDeprecatedCopy(sourceFiles), [], 'Deprecated clipboard API found in source');
  assert.equal(deprecatedCopyPattern.test(output), false, 'Deprecated clipboard API found in build output');
  assert.match(
    source,
    /await navigator\.clipboard\.writeText\(email\)/,
    'Modern Clipboard API is not the copy implementation',
  );
  assert.equal(
    deprecatedCopyPattern.test(`${source}\ndocument.${deprecatedMethod}('copy')`),
    true,
    'Controlled deprecation mutation was not rejected',
  );

  const english = contactMarkup('en');
  const hindi = contactMarkup('hi');
  assert.equal(english.success, 'Copied.', 'English success text changed');
  assert.equal(hindi.success, 'ईमेल पता कॉपी हो गया।', 'Hindi success text changed');
  assert.match(english.html, />\s*Copy email\s*<\/button>/, 'English button text changed');
  assert.match(hindi.html, />\s*ईमेल कॉपी करें\s*<\/button>/, 'Hindi button text changed');

  await verifySuccessfulCopy(english.success);
  await verifySuccessfulCopy(hindi.success);
  await verifyFailedCopy(english.success);

  const unsupported = createHarness({ successMessage: english.success });
  assert.equal(unsupported.button.hidden, true, 'Unsupported browsers expose an unusable Copy email button');
  assert.equal(unsupported.listeners.size, 0, 'Unsupported browsers received a legacy clipboard handler');

  console.log('✓ Copy Email: modern clipboard, localization, failure, keyboard, and deprecation guards passed.');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
