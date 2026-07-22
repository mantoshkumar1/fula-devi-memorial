import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readHeaderIdentityPages } from './header-identity-output.mjs';

export const HINDI_REGISTERED_NAME = 'फुला देवी मेमोरियल सेवा संस्थान';
export const HINDI_REGISTERED_ADDRESS =
  'सरस्वती विहार कॉलोनी, साईचक, डाकघर एवं थाना — बेउर, जिला पटना, बिहार 800002';
export const HINDI_QUOTE =
  'स्मृति प्रेम को जीवित रखती है। सेवा उसे भविष्य तक ले जाती है।';
export const OLD_HINDI_QUOTE =
  'स्मृति प्रेम को ठिकाना देती है। सेवा उसे भविष्य देती है।';
const OLD_HINDI_QUOTE_PHRASE = 'स्मृति प्रेम को ठिकाना देती है';

const ENGLISH_REGISTERED_NAME = 'Fula Devi Memorial Sewa Sansthan';
const ENGLISH_REGISTERED_ADDRESS =
  'Sarswati Vihar Colony, Saichak, P.O. + P.S. Beur, Distt. Patna, Patna, Bihar 800002';
const ENGLISH_CONTACT_ADDRESS = [
  'Saraswati Vihar Colony, Saichak',
  'P.O. & P.S. Beur',
  'Patna, Bihar 800002',
  'India',
];
const ENGLISH_ADDRESS_LINES = [
  ENGLISH_REGISTERED_ADDRESS,
  ...ENGLISH_CONTACT_ADDRESS,
];
const HINDI_CONTACT_ADDRESS = [
  'सरस्वती विहार कॉलोनी, साईचक',
  'डाकघर एवं थाना — बेउर',
  'जिला पटना, बिहार 800002',
];
const ENGLISH_QUOTE =
  'Remembrance gives love a home. Service gives it a future.';
const APPROVED_HINDI_HOMEPAGE_SENTENCE =
  'फुला देवी की स्मृति में स्थापित यह संस्था उनके जीवन की दयालुता और सेवा-भाव को आगे बढ़ाने का प्रयास करती है।';
const APPROVED_FULA_DEVI_SENTENCE =
  'जो लोग उन्हें जानते थे, वे रोज़मर्रा के जीवन में लोगों के प्रति उनकी दयालुता और सेवा-भाव को याद करते हैं।';
const BANNED_HINDI_PHRASES = [
  'बिना दिखावे की दयालुता',
  'बिना दिखावे वाली दयालुता',
];

// These hashes lock the four published governing documents to their reviewed
// bytes. A deliberate document replacement must update the corresponding hash.
const GOVERNANCE_PDF_SHA256 = {
  'documents/bylaws.pdf':
    '33a95596d246e980cd54013a4fc75cc699ba2608690739e461b51fc645ca601a',
  'documents/memorandum.pdf':
    'b15203cf344ca2b016d7ae405b1eeb6cdbd879b1b3b3d60b92d724e7c4b15ae1',
  'documents/registration-certificate.pdf':
    '0d201c909a9bea040e3c7c621a6fafb4f69501cedc889b8bdaca83136d37dfdf',
  'documents/resolution.pdf':
    '0e88611c6a91049ef57878b657e1da83eed5eb21ffd767f23b624b77099773a8',
};

function decodedText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function elementWithClass(html, tagName, className) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>[\\s\\S]*?<\\/${tagName}>`, 'gi');
  for (const match of html.matchAll(pattern)) {
    const opening = match[0].match(new RegExp(`^<${tagName}\\b[^>]*>`, 'i'))?.[0] ?? '';
    const classes = opening.match(/\bclass=["']([^"']*)["']/i)?.[1].split(/\s+/) ?? [];
    if (classes.includes(className)) return match[0];
  }
  return null;
}

function blockquoteTexts(html) {
  return [...html.matchAll(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi)]
    .map((match) => decodedText(match[1]));
}

function requiredPage(pages, path, failures) {
  const html = pages.get(path);
  if (!html) failures.push(`Missing rendered content fixture: ${path}`);
  return html ?? '';
}

export function validateLocalizedContentPages(pages) {
  const failures = [];
  const enHome = requiredPage(pages, 'index.html', failures);
  const hiHome = requiredPage(pages, 'hi/index.html', failures);
  const hiFulaDevi = requiredPage(pages, 'hi/fula-devi/index.html', failures);
  const enGovernance = requiredPage(pages, 'governance/index.html', failures);
  const hiGovernance = requiredPage(pages, 'hi/governance/index.html', failures);
  const enContact = requiredPage(pages, 'contact/index.html', failures);
  const hiContact = requiredPage(pages, 'hi/contact/index.html', failures);

  const enGovernanceText = decodedText(enGovernance);
  const hiGovernanceText = decodedText(hiGovernance);
  if (!hiGovernanceText.includes(`पंजीकृत नाम — ${HINDI_REGISTERED_NAME}`)) {
    failures.push('hi/governance/index.html: approved Hindi registered name is missing');
  }
  if (!hiGovernanceText.includes(`पंजीकृत पता — ${HINDI_REGISTERED_ADDRESS}`)) {
    failures.push('hi/governance/index.html: approved Hindi registered address is missing');
  }
  if (
    hiGovernanceText.includes(ENGLISH_REGISTERED_NAME) ||
    ENGLISH_ADDRESS_LINES.some((line) => hiGovernanceText.includes(line))
  ) {
    failures.push('hi/governance/index.html: visible English registered name or address remains');
  }
  if (!enGovernanceText.includes(`Registered name — ${ENGLISH_REGISTERED_NAME}`)) {
    failures.push('governance/index.html: English registered name changed');
  }
  if (!enGovernanceText.includes(`Registered address — ${ENGLISH_REGISTERED_ADDRESS}`)) {
    failures.push('governance/index.html: English registered address changed');
  }

  const enOffice = elementWithClass(enContact, 'address', 'office');
  const hiOffice = elementWithClass(hiContact, 'address', 'office');
  const expectedEnglishOffice = [ENGLISH_REGISTERED_NAME, ...ENGLISH_CONTACT_ADDRESS].join(' ');
  const expectedHindiOffice = [HINDI_REGISTERED_NAME, ...HINDI_CONTACT_ADDRESS].join(' ');
  if (!enOffice || decodedText(enOffice) !== expectedEnglishOffice) {
    failures.push('contact/index.html: English registered-office block changed');
  }
  if (!hiOffice || decodedText(hiOffice) !== expectedHindiOffice) {
    failures.push('hi/contact/index.html: approved Hindi registered-office block is missing');
  }
  if (
    hiOffice &&
    (decodedText(hiOffice).includes(ENGLISH_REGISTERED_NAME) ||
      ENGLISH_ADDRESS_LINES.some((line) => decodedText(hiOffice).includes(line)))
  ) {
    failures.push('hi/contact/index.html: visible English office name or address remains');
  }

  const enQuotes = blockquoteTexts(enHome);
  const hiQuotes = blockquoteTexts(hiHome);
  if (enQuotes.length !== 1 || enQuotes[0] !== ENGLISH_QUOTE) {
    failures.push('index.html: English homepage quotation changed');
  }
  if (hiQuotes.length !== 1 || hiQuotes[0] !== HINDI_QUOTE) {
    failures.push('hi/index.html: approved Hindi homepage quotation is missing');
  }

  if (!decodedText(hiHome).includes(APPROVED_HINDI_HOMEPAGE_SENTENCE)) {
    failures.push('hi/index.html: approved kindness and service sentence is missing');
  }
  if (!decodedText(hiFulaDevi).includes(APPROVED_FULA_DEVI_SENTENCE)) {
    failures.push('hi/fula-devi/index.html: approved kindness and service wording is missing');
  }

  for (const [path, html] of pages) {
    if (!path.startsWith('hi/')) continue;
    if (html.includes(OLD_HINDI_QUOTE_PHRASE)) {
      failures.push(`${path}: old Hindi homepage quotation remains`);
    }
    for (const phrase of BANNED_HINDI_PHRASES) {
      if (html.includes(phrase)) failures.push(`${path}: banned literal phrase remains: ${phrase}`);
    }
  }

  return failures;
}

function validateGovernancePdfOutput(root) {
  const failures = [];
  for (const [path, expected] of Object.entries(GOVERNANCE_PDF_SHA256)) {
    const actual = createHash('sha256')
      .update(readFileSync(resolve(root, path)))
      .digest('hex');
    if (actual !== expected) failures.push(`${path}: published PDF bytes changed`);
  }
  return failures;
}

export function validateLocalizedContentOutput(root) {
  return [
    ...validateLocalizedContentPages(readHeaderIdentityPages(root)),
    ...validateGovernancePdfOutput(root),
  ];
}

export function assertLocalizedContentOutput(root) {
  const failures = validateLocalizedContentOutput(root);
  if (failures.length) {
    throw new Error(`Localized content validation failed:\n- ${failures.join('\n- ')}`);
  }
}

function mutatePage(pages, path, mutate) {
  const copy = new Map(pages);
  const html = copy.get(path);
  if (!html) throw new Error(`Missing localized-content mutation fixture: ${path}`);
  copy.set(path, mutate(html));
  return copy;
}

export function runLocalizedContentMutationTests(root) {
  const pages = readHeaderIdentityPages(root);
  const baseFailures = validateLocalizedContentPages(pages);
  if (baseFailures.length) {
    throw new Error(`Cannot run localized-content mutations against invalid output:\n- ${baseFailures.join('\n- ')}`);
  }

  const cases = [
    ['Hindi Governance reverts to English address', mutatePage(pages, 'hi/governance/index.html', (html) => html.replace(HINDI_REGISTERED_ADDRESS, ENGLISH_REGISTERED_ADDRESS))],
    ['Hindi Contact reverts to English office block', mutatePage(pages, 'hi/contact/index.html', (html) => html.replace(HINDI_CONTACT_ADDRESS[0], ENGLISH_REGISTERED_ADDRESS))],
    ['English Governance address changes', mutatePage(pages, 'governance/index.html', (html) => html.replace(ENGLISH_REGISTERED_ADDRESS, 'Changed address'))],
    ['English Contact office changes', mutatePage(pages, 'contact/index.html', (html) => html.replaceAll(ENGLISH_REGISTERED_NAME, 'Changed institution'))],
    ['Hindi homepage quotation reverts', mutatePage(pages, 'hi/index.html', (html) => html.replace(HINDI_QUOTE, OLD_HINDI_QUOTE))],
    ['English homepage quotation changes', mutatePage(pages, 'index.html', (html) => html.replace(ENGLISH_QUOTE, 'Changed quotation.'))],
    ['Approved Hindi homepage sentence disappears', mutatePage(pages, 'hi/index.html', (html) => html.replace('दयालुता और सेवा-भाव', 'बदला हुआ पाठ'))],
    ['Approved Fula Devi wording disappears', mutatePage(pages, 'hi/fula-devi/index.html', (html) => html.replace('दयालुता और सेवा-भाव', 'बदला हुआ पाठ'))],
    ['Banned literal Hindi phrase returns', mutatePage(pages, 'hi/index.html', (html) => html.replace(HINDI_QUOTE, `${HINDI_QUOTE} बिना दिखावे की दयालुता`))],
  ];

  for (const [name, mutatedPages] of cases) {
    if (validateLocalizedContentPages(mutatedPages).length === 0) {
      throw new Error(`Localized-content mutation was not rejected: ${name}`);
    }
  }

  return cases.map(([name]) => name);
}
