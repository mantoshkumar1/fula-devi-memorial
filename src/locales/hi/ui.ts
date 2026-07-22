import type { SharedUi } from '../../i18n/ui.ts';

/** Approved Hindi Version 1.1 shared chrome. */
export const hindiUi = {
  locale: 'hi',
  institution: {
    displayName: 'फुला देवी मेमोरियल सेवा संस्थान',
  },
  metadata: {
    htmlLanguage: 'hi',
    openGraphLocale: 'hi_IN',
    titleSeparator: ' — ',
  },
  skipToContent: 'सीधे मुख्य सामग्री पर जाएँ',
  navigation: {
    primaryAriaLabel: 'मुख्य मेनू',
    footerAriaLabel: 'पृष्ठ के अंत के लिंक',
    languageAriaLabel: 'भाषा चुनें',
    labels: {
      home: 'मुखपृष्ठ',
      institution: 'संस्था',
      fulaDevi: 'फुला देवी',
      ourWork: 'हमारा कार्य',
      updates: 'प्रमुख घटनाक्रम',
      governance: 'संस्था संचालन',
      contact: 'संपर्क',
    },
  },
  footer: {
    locationLabel: 'पटना, बिहार, भारत',
    registrationNumberLabel: 'पंजीकरण संख्या',
  },
  breadcrumbs: {
    ariaLabel: 'पृष्ठ का मार्ग',
    homeLabel: 'मुखपृष्ठ',
  },
  documents: {
    notYetPublished: 'अभी प्रकाशित नहीं',
    pdfFallback: 'PDF',
  },
  resources: {
    draftLabel: 'मार्गदर्शिका का प्रारूप',
    opensNewTab: 'नए टैब में खुलेगा',
  },
  sectionPermalinkLabel: '“{section}” अनुभाग का सीधा लिंक',
  updatesEmptyState:
    'अभी कोई प्रमुख घटनाक्रम दर्ज नहीं है। संस्था का कार्य आगे बढ़ने के साथ इस पृष्ठ पर नई जानकारी जोड़ी जाएगी।',
  mediaViewer: {
    dialogLabel: 'चित्र और दस्तावेज़ देखने की विंडो',
    closeLabel: 'विंडो बंद करें',
    previousLabel: 'पिछली सामग्री देखें',
    nextLabel: 'अगली सामग्री देखें',
    statusTemplate: 'कुल {total} में से {current}',
    statusWithKindTemplate: 'कुल {total} में से {current}, {kind}',
    kindLabels: {
      'programme-photo': 'कार्यक्रम की तस्वीर',
      'independent-coverage': 'स्वतंत्र समाचार रिपोर्ट',
      'academic-record-page': 'शैक्षणिक अभिलेख',
    },
  },
} as const satisfies SharedUi;
