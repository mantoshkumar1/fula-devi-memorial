import { site, formatLongDate } from '../../data/site.ts';
import type { PageContentByKey } from '../content-types.ts';

const registrationDate = formatLongDate(site.registrationDate);

export const englishPages = {
  home: {
    title: 'Home',
    heading: site.name,
    description: `Fula Devi Memorial Sewa Sansthan is a charitable institution registered in Bihar, India, on ${registrationDate}. Its work includes supporting the education of one child.`,
    paragraphs: [
      [`Fula Devi Memorial Sewa Sansthan is a charitable institution registered in Bihar, India, on ${registrationDate}.`],
      [
        'Established in memory of ',
        { route: 'fulaDevi', text: 'Fula Devi' },
        ', the institution seeks to continue the quiet kindness that defined her life.',
      ],
      [
        'Our work includes supporting the education of one child, providing warm blankets before winter and essential clothing during summer to families in need, helping eligible families access the Ayushman Bharat health insurance scheme, and providing financial assistance where it is needed.',
      ],
    ],
    imageAlt:
      "Blankets stacked beside a table where members of the institution hand out items to residents seated in a courtyard, under a banner bearing the institution's name.",
    quote: 'Remembrance gives love a home. Service gives it a future.',
    closing: [
      'Learn more about ',
      { route: 'ourWork', text: 'our work' },
      ' and ',
      { route: 'updates', text: 'recent updates' },
      '.',
    ],
  },
  institution: {
    title: 'The Institution',
    description:
      'Why Fula Devi Memorial Sewa Sansthan exists, the principles that guide its decisions, and the character it seeks to uphold.',
    opening: [
      'Every institution is shaped by the decisions it makes.',
      'Those decisions are guided by the principles behind them.',
      'Fula Devi Memorial Sewa Sansthan exists to ensure that every act of service remains faithful to those principles.',
    ],
    sections: [
      {
        heading: 'Why We Exist',
        paragraphs: [
          'Kindness is often personal.',
          'An institution can give it continuity.',
          'It allows acts of kindness to become lasting commitments rather than isolated moments.',
        ],
      },
      {
        heading: 'What Guides Our Work',
        paragraphs: ['Our work is guided by four principles.'],
        bullets: [
          'Every act of service should preserve the dignity of every person.',
          'Quiet work matters more than recognition.',
          'Consistency matters more than size.',
          'Responsibility is measured by what is sustained over time.',
        ],
      },
      {
        heading: 'Our Character',
        paragraphs: [
          'We believe institutions earn trust slowly.',
          'That trust is built through honesty, consistency, and work that speaks for itself.',
        ],
      },
      {
        heading: 'How We Work',
        paragraphs: [
          'We focus on practical service.',
          'We begin with what is possible today and build patiently over time.',
        ],
      },
    ],
    closing: [
      'Goodness is not something to admire.',
      'It is something to continue.',
    ],
  },
  fulaDevi: {
    title: 'Fula Devi',
    description:
      'Stories and photographs of Fula Devi, remembered for her everyday kindness, support for independence, and respect for people of different faiths.',
    opening: [
      "Fula Devi (1956 – 22 July 2006) lived in Bihar, India. This institution was established in her memory. She was the mother of the institution's co-founder and the wife of its first secretary.",
      'Those who knew her remember the quiet kindness with which she treated people in everyday life.',
    ],
    portraitAlt: 'Portrait of Fula Devi wearing a blue sari and looking toward the camera.',
    dignityHeading: 'She Preserved Dignity',
    dignityParagraphs: [
      'During a blanket distribution organised by the institution in 2025, a former daily labourer who had worked for the family shared a memory from many years earlier.',
      'He recalled that when he came to the house at the end of each working day, Fula Devi fed him and repeatedly asked him to eat a little more so that he would not feel shy about eating enough.',
    ],
    quietHelpHeading: 'She Helped Quietly',
    quietHelpParagraphs: [
      "A woman who later spoke to Fula Devi's son remembered that Fula Devi would quietly give her whatever money she could afford and always treated her with respect.",
    ],
    clayPotAlt: "Fula Devi holding a decorated clay pot during her daughter's wedding ceremony.",
    clayPotCaption: "Fula Devi holding a decorated clay pot during her daughter's wedding ceremony.",
    independenceHeading: 'She Encouraged Independence',
    independenceParagraphs: [
      'She encouraged her daughters to become educated and financially independent.',
      'She supported them in applying for demanding jobs that were often considered unsuitable for women at the time.',
    ],
    faithHeading: 'She Respected Every Faith',
    faithParagraphs: [
      'Although she was a deeply religious Hindu, she encouraged her children to learn about any religion they wished to explore.',
      'Her family remembers her saying that all gods are one and that religions teach the same lessons, like the same syllabus taught under different education boards.',
    ],
    pilgrimageAltHusband: 'Fula Devi and her husband during the Kanwar Yatra pilgrimage.',
    pilgrimageCaptionHusband: 'Fula Devi and her husband during the Kanwar Yatra.',
    pilgrimageAltDaughters: 'Fula Devi standing with her daughters during the Kanwar Yatra pilgrimage.',
    pilgrimageCaptionDaughters: 'Fula Devi with her daughters during the Kanwar Yatra.',
    pilgrimageNote:
      'These photographs were taken during a traditional Kanwar Yatra in which Fula Devi and her family walked approximately 105 km from Sultanganj to Deoghar while carrying holy water from the Ganges.',
    teachingHeading: 'A Teaching Remembered',
    teachingIntroduction: 'Her family remembers her saying:',
    teachingLines: [
      'Serve the living.',
      'Feed others. Give water to a cow.',
      "That's worship.",
    ],
    teachingAttribution: 'Translated into English.',
  },
  ourWork: {
    title: 'Our Work',
    description:
      'Education support, seasonal clothing distribution, public-health assistance, financial awareness and selected programme records from Fula Devi Memorial Sewa Sansthan.',
    opening:
      'We are a small charitable institution. Our work is focused and practical, and every commitment is made with the intention that it can continue.',
    education: {
      heading: 'Education',
      status: 'Ongoing · Since 2025',
      paragraphs: [
        'The institution has committed to supporting one child through graduation by meeting educational and essential living needs.',
      ],
      yearLabel: 'Academic Year 2025–2026',
      programmeLabel: 'Two-page academic record',
      coverAlt: 'The 2025–2026 report card, page 1, with identifying details removed.',
    },
    clothing: {
      heading: 'Seasonal Clothing Distribution',
      status: 'Recurring · Since 2020',
      paragraphs: [
        'Seasonal clothing is distributed in the village, with priority given to older adults, widows, persons with disabilities, and people with limited financial means, especially women.',
        'Warm blankets are distributed before winter. Summer clothing includes saris, blouses, petticoats, shirts, and dhotis. Smaller distributions also take place during village visits.',
        'The programme began in 2020, before the institution was formally registered. The December 2021 record documents an early community distribution, preceding the institution’s registration in February 2022.',
      ],
      recordsHeading: 'Programme Records',
      previews: {
        '2021': {
          yearLabel: 'December 2021',
          programmeLabel: 'Community work before formal registration',
          coverAlt: 'Villagers gathered on chairs in a tree-shaded courtyard at the December 2021 clothing distribution.',
        },
        '2024': {
          yearLabel: '2024',
          programmeLabel: 'Seasonal clothing distribution',
          coverAlt: 'Villagers seated beneath a pink canopy at the 2024 seasonal clothing distribution.',
        },
        '2025': {
          yearLabel: '2025',
          programmeLabel: 'Winter blanket distribution',
          coverAlt: 'Villagers in a courtyard at the 2025 winter blanket distribution beneath the institution’s banner.',
        },
      },
    },
    healthcare: {
      heading: 'Access to Public Healthcare',
      status: 'Completed · 2024',
      paragraphs: [
        'The institution helped eligible families throughout the village understand the Ayushman Bharat health insurance scheme, gather the required documents, complete application forms, and submit them.',
        'The work focused on helping people navigate procedures that many found difficult to understand or complete without assistance.',
      ],
      resource: {
        title: 'Ayushman Bharat Guide',
        scope: 'Bihar-focused',
        description: 'Eligibility, required documents and application steps.',
        scopeNote: 'PM-JAY is a national scheme. This guide includes practical information prepared mainly for people in Bihar.',
      },
    },
    financialAwareness: {
      heading: 'Financial Awareness',
      status: 'Completed · 2024',
      paragraphs: [
        'The institution helped villagers understand the Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY), including the purpose of the scheme and the enrolment process.',
        'Smaller awareness efforts concerning public schemes continue when practical needs arise.',
      ],
      resource: {
        title: 'PMJJBY Guide',
        scope: 'India-wide',
        description: 'An introduction to the scheme, eligibility and enrolment.',
        scopeNote: 'This guide explains the national PMJJBY scheme and is not limited to one state.',
      },
    },
    lookingAhead: {
      heading: 'Looking Ahead',
      paragraphs: [
        'The institution will undertake additional work only when existing commitments can continue responsibly.',
        'Scholarships are the next area of educational support under consideration. Practical public guides will be expanded as they are completed and verified.',
      ],
    },
    actions: {
      academicRecord: 'View academic record →',
      programmeRecord: 'View programme record →',
      openGuide: 'Open guide →',
    },
    summary: {
      photograph: 'photograph',
      photographs: 'photographs',
      independentCoverage: 'Independent coverage',
    },
  },
  updates: {
    title: 'Updates',
    description: 'A record of significant developments in Fula Devi Memorial Sewa Sansthan.',
    introduction: 'Significant developments in the institution are recorded here. Routine activities are not.',
    relatedLabel: 'Related:',
    entries: [
      {
        iso: '2026-07-22',
        date: '22 July 2026',
        title: 'Website published',
        body: [
          "The institution's website was published on the twentieth anniversary of ",
          { route: 'fulaDevi', text: 'Fula Devi' },
          "'s death, bringing together its purpose, governance, programme history, documentary evidence, and public guides into a single public record.",
        ],
        related: ['institution', 'governance', 'ourWork'],
      },
      {
        iso: '2022-02-27',
        date: '27 February 2022',
        title: 'Institution registered',
        body: [
          'Fula Devi Memorial Sewa Sansthan was formally registered in Bihar. Community work associated with the institution had begun before its registration.',
        ],
        related: ['institution', 'governance'],
      },
    ],
  },
  governance: {
    title: 'Governance',
    description: 'The registration of Fula Devi Memorial Sewa Sansthan in Bihar, India, and its principal governing documents.',
    introduction: `Fula Devi Memorial Sewa Sansthan was formally registered in ${site.jurisdiction}, on ${registrationDate}. Community work associated with the institution had begun before its registration.`,
    registrationHeading: 'Registration',
    registeredName: site.name,
    labels: {
      registeredName: 'Registered name',
      registrationNumber: 'Registration number',
      registrationDate: 'Registration date',
      registeredAddress: 'Registered address',
      jurisdiction: 'Jurisdiction',
    },
    jurisdiction: site.jurisdiction,
    documentsHeading: 'Governing documents',
    documentsIntroduction: "The institution's principal registration and governance documents are available below.",
    documentTitles: {
      'registration-certificate.pdf': 'Registration Certificate',
      'memorandum.pdf': 'Memorandum',
      'bylaws.pdf': 'By-Laws',
      'resolution.pdf': 'Resolution',
    },
  },
  contact: {
    title: 'Contact',
    description: 'How to reach Fula Devi Memorial Sewa Sansthan.',
    introduction: 'For enquiries concerning the institution, its programmes, governance, or public documents, please contact the institution by email.',
    emailHeading: 'Email',
    emailAction: 'Email the institution',
    copyEmailAction: 'Copy email',
    copySuccess: 'Copied.',
    emailFallback: 'An official contact email will be published here.',
    officeHeading: 'Registered office',
    officeAddressLines: [
      'Saraswati Vihar Colony, Saichak',
      'P.O. & P.S. Beur',
      'Patna, Bihar 800002',
      'India',
    ],
    mapAction: 'View on Google Maps',
    visitNote: 'Please contact the institution before visiting.',
  },
  notFound: {
    title: 'Page not found',
    description: 'This page could not be found.',
    message: 'This page could not be found.',
    returnBefore: 'Return to the ',
    homeLink: 'home page',
    betweenLinks: ', or read ',
    updatesLink: 'recent updates',
    returnAfter: '.',
  },
} as const satisfies PageContentByKey;
