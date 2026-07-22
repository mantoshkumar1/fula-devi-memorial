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
    openGraphLocale: 'en',
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
    registrationNumberLabel: 'Registration No.',
  },
  breadcrumbs: {
    ariaLabel: 'Breadcrumb',
    homeLabel: 'Home',
  },
} as const satisfies SharedUi;
