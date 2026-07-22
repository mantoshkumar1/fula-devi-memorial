import { site } from '../../data/site.ts';
import type { SharedUi } from '../../i18n/ui.ts';

/** English Version 1.0 shared chrome, extracted without editorial changes. */
export const englishUi = {
  locale: 'en',
  institution: {
    displayName: site.name,
    mastheadSubtitle: {
      text: 'फुला देवी मेमोरियल सेवा संस्थान',
      language: 'hi',
    },
  },
  metadata: {
    htmlLanguage: 'en',
    openGraphLocale: 'en_IN',
    titleSeparator: ' — ',
  },
  skipToContent: 'Skip to content',
  navigation: {
    primaryAriaLabel: 'Primary',
    footerAriaLabel: 'Footer',
    languageAriaLabel: 'Language',
    labels: {
      home: 'Home',
      institution: 'The Institution',
      fulaDevi: 'Fula Devi',
      ourWork: 'Our Work',
      updates: 'Updates',
      governance: 'Governance',
      contact: 'Contact',
    },
  },
  footer: {
    locationLabel: `${site.registeredCity}, ${site.jurisdiction}`,
    registrationNumberLabel: 'Registration No.',
  },
  breadcrumbs: {
    ariaLabel: 'Breadcrumb',
    homeLabel: 'Home',
  },
  documents: {
    notYetPublished: 'Not yet published',
    pdfFallback: 'PDF',
  },
  resources: {
    draftLabel: 'Draft resource',
    opensNewTab: 'opens in a new tab',
  },
  sectionPermalinkLabel: 'Permanent link to the {section} section',
  updatesEmptyState:
    "There are no updates yet. This page will grow as the institution's work continues.",
  mediaViewer: {
    dialogLabel: 'Media viewer',
    closeLabel: 'Close viewer',
    previousLabel: 'Previous item',
    nextLabel: 'Next item',
    statusTemplate: '{current} of {total}',
    statusWithKindTemplate: '{current} of {total} · {kind}',
    kindLabels: {
      'programme-photo': 'Programme photograph',
      'independent-coverage': 'Independent coverage',
      'academic-record-page': 'Academic record',
    },
  },
} as const satisfies SharedUi;
