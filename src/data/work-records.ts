/**
 * Published work records — the single source of truth for the institution's
 * documented programmes.
 *
 * Both the Our Work page previews and the dedicated record pages derive from
 * this file. Nothing about a record is written twice: change it here and both
 * the preview and its record page follow.
 *
 * RULES (see docs/ADDING_PUBLIC_RECORDS.md for the full workflow):
 * - Every `src`/`cover`/`lead` path must resolve to a real file under
 *   `public/`. A referenced file that does not exist is a broken promise; the
 *   `records:check` script fails the build if one is missing.
 * - No personal identifiers anywhere in this file — not in copy, not in alt
 *   text, not in filenames. Beneficiaries are never named or made identifiable.
 * - Alt text describes what is visibly happening; it never mentions privacy
 *   blurring and never identifies a person.
 * - A record appears here only after its images have passed human privacy
 *   review. Automated checks cannot see a face.
 */

/** Whether a programme is still running, repeats, or has concluded. */
export type RecordStatus = 'ongoing' | 'recurring' | 'completed';

export interface GalleryImage {
  /** Absolute public path, e.g. /records/clothing/2021/distribution-02.jpg */
  src: string;
  /** Meaningful, non-identifying description of the visible scene. */
  alt: string;
  /** Intrinsic pixel dimensions — set to reserve space and avoid layout shift. */
  width: number;
  height: number;
}

/** Independent press coverage, kept separate from the programme photographs. */
export interface Coverage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * A seasonal clothing distribution, documented for one year.
 * `discriminator: type === 'clothing'`.
 */
export interface ClothingRecord {
  type: 'clothing';
  /** Four-digit year directory under public/records/clothing/. */
  slug: string;
  /** Public route for the dedicated record page. */
  route: string;
  status: RecordStatus;

  /** How the record is introduced on the Our Work page. */
  preview: {
    /** e.g. "December 2021" — a human date label, not just a year. */
    yearLabel: string;
    /** e.g. "Community work before formal registration". */
    programmeLabel: string;
    /** e.g. "7 photographs" or "4 photographs · Independent coverage". */
    recordSummary: string;
    /** Display-only cover derivative used only for the main-page preview. */
    cover: string;
    coverAlt: string;
    coverWidth: number;
    coverHeight: number;
  };

  /** The dedicated record page. */
  page: {
    /** The visible <h1> and breadcrumb leaf. */
    title: string;
    /** <title>/meta description for the record page. */
    description: string;
    /** The single opening paragraph. */
    opening: string;
    /** The large lead overview photograph, excluded from the gallery. */
    lead: GalleryImage;
    /** The remaining programme photographs, in a responsive grid. */
    gallery: GalleryImage[];
    /** Independent newspaper coverage, when it exists. */
    coverage?: Coverage;
  };
}

/**
 * An academic record the institution supports, published as one multi-page
 * document. `discriminator: type === 'education'`.
 *
 * No education record is published at present: the available report-card copies
 * still expose a signatory's handwriting, so the record is withheld under the
 * privacy rules above. The type is retained so a privacy-cleared record can be
 * added later without reshaping the data. See docs/ADDING_PUBLIC_RECORDS.md.
 */
export interface EducationRecord {
  type: 'education';
  slug: string;
  route: string;
  status: RecordStatus;
  page: {
    title: string;
    description: string;
    opening: string;
    /** The academic-year label, e.g. "2025–2026". */
    academicYear: string;
    /** The document pages, in reading order. */
    pages: GalleryImage[];
  };
}

export type WorkRecord = ClothingRecord | EducationRecord;

/** A designed public guide. Drafts are honestly marked and carry noindex. */
export interface ResourceGuide {
  slug: string;
  title: string;
  description: string;
  /** 'draft' resources are placeholders and are labelled as such in the UI. */
  state: 'draft' | 'final';
  /** Absolute public path to the PDF. */
  href: string;
}

/**
 * Published records, in the order their programmes are presented on Our Work.
 * Clothing only, for now. When a privacy-cleared education record exists, add
 * it here with `type: 'education'` and its dedicated route will generate.
 */
export const workRecords: WorkRecord[] = [
  {
    type: 'clothing',
    slug: '2021',
    route: '/records/clothing/2021/',
    status: 'recurring',
    preview: {
      yearLabel: 'December 2021',
      programmeLabel: 'Community work before formal registration',
      recordSummary: '7 photographs',
      cover: '/records/clothing/2021/cover.jpg',
      coverAlt:
        'Villagers gathered on chairs in a tree-shaded courtyard at the December 2021 clothing distribution.',
      coverWidth: 1280,
      coverHeight: 960,
    },
    page: {
      title: 'Seasonal Clothing Distribution — December 2021',
      description:
        'Photographs of the December 2021 seasonal clothing distribution — community work that immediately preceded the institution’s formal registration in February 2022.',
      opening:
        'This community work immediately preceded the institution’s formal registration in February 2022.',
      lead: {
        src: '/records/clothing/2021/distribution-01.jpg',
        alt: 'A gathering of villagers seated on chairs in an open, tree-shaded courtyard at a clothing distribution.',
        width: 1600,
        height: 1200,
      },
      gallery: [
        {
          src: '/records/clothing/2021/distribution-02.jpg',
          alt: 'A villager receiving a folded blanket from organisers across a cloth-covered table hung with festive streamers.',
          width: 1200,
          height: 1600,
        },
        {
          src: '/records/clothing/2021/distribution-03.jpg',
          alt: 'An organiser speaking into a microphone beside a table of folded blankets as people gather to collect them.',
          width: 1200,
          height: 1600,
        },
        {
          src: '/records/clothing/2021/distribution-04.jpg',
          alt: 'Organisers and villagers around tables laid with folded clothing during the distribution.',
          width: 1600,
          height: 1200,
        },
        {
          src: '/records/clothing/2021/distribution-05.jpg',
          alt: 'An organiser handing a folded blanket to an elderly villager across a decorated table.',
          width: 1600,
          height: 1200,
        },
        {
          src: '/records/clothing/2021/distribution-06.jpg',
          alt: 'An elderly villager receiving a folded blanket from an organiser at the distribution table.',
          width: 1200,
          height: 1600,
        },
        {
          src: '/records/clothing/2021/distribution-07.jpg',
          alt: 'An organiser handing folded blankets to a villager at the distribution table.',
          width: 1200,
          height: 1600,
        },
      ],
    },
  },
  {
    type: 'clothing',
    slug: '2024',
    route: '/records/clothing/2024/',
    status: 'recurring',
    preview: {
      yearLabel: '2024',
      programmeLabel: 'Seasonal clothing distribution',
      recordSummary: '4 photographs · Independent coverage',
      cover: '/records/clothing/2024/cover.jpg',
      coverAlt:
        'Villagers seated beneath a pink canopy at the 2024 seasonal clothing distribution.',
      coverWidth: 1280,
      coverHeight: 960,
    },
    page: {
      title: 'Seasonal Clothing Distribution — 2024',
      description:
        'Photographs and independent newspaper coverage of the institution’s 2024 seasonal clothing distribution in the village.',
      opening:
        'Seasonal clothing was distributed in the village, with priority given to older adults, widows, persons with disabilities, and people with limited financial means.',
      lead: {
        src: '/records/clothing/2024/distribution-04.jpg',
        alt: 'Villagers seated on rows of chairs beneath a pink canopy at a seasonal clothing distribution.',
        width: 1600,
        height: 1200,
      },
      coverage: {
        src: '/records/clothing/2024/newspaper-01.jpg',
        alt: 'A local Hindi newspaper clipping reporting the institution’s clothing distribution in the village.',
        width: 461,
        height: 837,
      },
      gallery: [
        {
          src: '/records/clothing/2024/distribution-01.jpg',
          alt: 'Villagers and organisers around a table piled with packaged clothing beneath a decorated canopy.',
          width: 1200,
          height: 1600,
        },
        {
          src: '/records/clothing/2024/distribution-02.jpg',
          alt: 'Organisers handing out folded white cloth and packaged garments to villagers at a cloth-covered table.',
          width: 1200,
          height: 1600,
        },
        {
          src: '/records/clothing/2024/distribution-03.jpg',
          alt: 'Villagers collecting folded cloth and packaged clothing from organisers under the canopy.',
          width: 1200,
          height: 1600,
        },
      ],
    },
  },
  {
    type: 'clothing',
    slug: '2025',
    route: '/records/clothing/2025/',
    status: 'recurring',
    preview: {
      yearLabel: '2025',
      programmeLabel: 'Winter blanket distribution',
      recordSummary: '4 photographs · Independent coverage',
      cover: '/records/clothing/2025/cover.jpg',
      coverAlt:
        'Villagers in a courtyard at the 2025 winter blanket distribution beneath the institution’s banner.',
      coverWidth: 1280,
      coverHeight: 960,
    },
    page: {
      title: 'Winter Blanket Distribution — 2025',
      description:
        'Photographs and independent newspaper coverage of the institution’s 2025 winter blanket distribution in the village.',
      opening:
        'Warm blankets were distributed before winter, with priority given to older adults, widows, persons with disabilities, and people with limited financial means.',
      lead: {
        src: '/records/clothing/2025/distribution-01.jpg',
        alt: 'Villagers seated on chairs in a courtyard as organisers distribute blankets beneath the institution’s banner.',
        width: 1600,
        height: 1200,
      },
      coverage: {
        src: '/records/clothing/2025/newspaper-01.jpg',
        alt: 'A local Hindi newspaper clipping reporting the institution’s winter blanket distribution.',
        width: 1125,
        height: 776,
      },
      gallery: [
        {
          src: '/records/clothing/2025/distribution-02.jpg',
          alt: 'An organiser handing a blanket to a seated elderly villager beneath the institution’s banner.',
          width: 1600,
          height: 1200,
        },
        {
          src: '/records/clothing/2025/distribution-03.jpg',
          alt: 'An organiser handing a patterned blanket to an elderly villager, with folded blankets stacked on the table.',
          width: 1600,
          height: 1200,
        },
        {
          src: '/records/clothing/2025/distribution-04.jpg',
          alt: 'Villagers seated in the courtyard receiving blankets from organisers beneath the institution’s banner.',
          width: 1600,
          height: 1200,
        },
      ],
    },
  },
];

/** Draft public guides, surfaced as designed resource cards on Our Work. */
export const resourceGuides: ResourceGuide[] = [
  {
    slug: 'ayushman-bharat-guide',
    title: 'Ayushman Bharat Guide',
    description: 'Eligibility, required documents and application steps.',
    state: 'draft',
    href: '/records/healthcare/ayushman-bharat-guide.pdf',
  },
  {
    slug: 'pmjjby-guide',
    title: 'PMJJBY Guide',
    description: 'An introduction to the scheme, eligibility and enrolment.',
    state: 'draft',
    href: '/records/financial-awareness/pmjjby-guide.pdf',
  },
];

/** All clothing records, in presentation order. */
export const clothingRecords = workRecords.filter(
  (r): r is ClothingRecord => r.type === 'clothing',
);

/** A resource guide by slug, for the Our Work resource cards. */
export function resourceBySlug(slug: string): ResourceGuide | undefined {
  return resourceGuides.find((g) => g.slug === slug);
}
