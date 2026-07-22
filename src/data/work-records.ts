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
 * What a single media item is. This distinction drives the record page (which
 * section it appears in) and the viewer (its type label in the counter).
 */
export type MediaKind =
  | 'programme-photo'
  | 'independent-coverage'
  | 'academic-record-page';

/** Human label for each media kind, shown in the viewer counter. */
export const MEDIA_KIND_LABEL: Record<MediaKind, string> = {
  'programme-photo': 'Programme photograph',
  'independent-coverage': 'Independent coverage',
  'academic-record-page': 'Academic record',
};

/**
 * One item in a record's single, ordered, visitor-facing media sequence.
 * Programme photographs always come first; independent coverage always comes
 * last. Both the page presentation and the viewer derive from this one order.
 */
export interface MediaItem {
  src: string;
  kind: MediaKind;
  /** Accessible description, doubling as the viewer caption. Never identifying. */
  alt: string;
  /** Position in the unified sequence, from 0. */
  order: number;
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
    /**
     * An optional one-line note shown on the preview, for a record that needs a
     * word of context. Used only where relevant (e.g. the pre-registration
     * chronology on the December 2021 record); omitted otherwise.
     */
    contextNote?: string;
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
 * A record appears here only after a full-resolution human privacy review of
 * every page confirms no child or third-party identifier remains — name,
 * parents' names, date of birth, roll number, any ID, QR/barcode, or any
 * signature and its date. See docs/ADDING_PUBLIC_RECORDS.md.
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
  /**
   * Geographic scope suffix appended to the title, e.g. 'Bihar-focused' or
   * 'India-wide'. Set ONLY once the PDF's own content confirms it — never label
   * a scope the document does not actually contain. Unset for the current
   * placeholder drafts, which contain no scheme guidance yet.
   */
  scope?: string;
  /** One-line scope clarification shown under the description. Same rule. */
  scopeNote?: string;
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
      contextNote:
        'This programme took place shortly before the institution was formally registered in February 2022.',
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
        {
          src: '/records/clothing/2024/distribution-05.jpg',
          alt: 'Organisers recording names at a registration table as villagers wait to collect clothing under a decorated canopy.',
          width: 1600,
          height: 1200,
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
        {
          src: '/records/clothing/2025/distribution-05.jpg',
          alt: 'An organiser handing a folded blanket to an elderly villager beside the institution’s banner.',
          width: 1600,
          height: 1200,
        },
      ],
    },
  },
  {
    type: 'education',
    slug: '2025-2026',
    route: '/records/education/2025-2026/',
    status: 'ongoing',
    page: {
      title: 'Education Support — Academic Year 2025–2026',
      description:
        'The 2025–2026 academic report card of the child the institution supports, published with all identifying information removed.',
      opening:
        'The institution began supporting this student in 2025 and has committed to continuing that support through graduation.',
      academicYear: '2025–2026',
      pages: [
        {
          src: '/records/education/report-card-2025-2026-page-1.jpg',
          alt: 'Report card for academic year 2025–2026, page 1 of 2, with identifying details removed.',
          width: 1182,
          height: 1578,
        },
        {
          src: '/records/education/report-card-2025-2026-page-2.jpg',
          alt: 'Report card for academic year 2025–2026, page 2 of 2, with identifying details removed.',
          width: 1200,
          height: 1600,
        },
      ],
    },
  },
];

/**
 * Public guides, surfaced as designed resource cards on Our Work. Both are
 * final, completed Hindi guides. Each scope was verified against the PDF's own
 * content (see docs/WRITING_PUBLIC_GUIDES.md): the Ayushman guide describes a
 * national scheme with practical help prepared mainly for Bihar; the PMJJBY
 * guide is national and presents no state-specific process as universal.
 */
export const resourceGuides: ResourceGuide[] = [
  {
    slug: 'ayushman-bharat-guide',
    title: 'Ayushman Bharat Guide',
    description: 'Eligibility, required documents and application steps.',
    state: 'final',
    href: '/records/healthcare/ayushman-bharat-guide.pdf',
    scope: 'Bihar-focused',
    scopeNote:
      'PM-JAY is a national scheme. This guide includes practical information prepared mainly for people in Bihar.',
  },
  {
    slug: 'pmjjby-guide',
    title: 'PMJJBY Guide',
    description: 'An introduction to the scheme, eligibility and enrolment.',
    state: 'final',
    href: '/records/financial-awareness/pmjjby-guide.pdf',
    scope: 'India-wide',
    scopeNote:
      'This guide explains the national PMJJBY scheme and is not limited to one state.',
  },
];

/** All clothing records, in presentation order. */
export const clothingRecords = workRecords.filter(
  (r): r is ClothingRecord => r.type === 'clothing',
);

/**
 * All education records. Empty until a privacy-cleared academic record exists;
 * the `/records/education/<year>/` route then generates automatically. The
 * shared media viewer and the record page are already wired for it.
 */
export const educationRecords = workRecords.filter(
  (r): r is EducationRecord => r.type === 'education',
);

/** A resource guide by slug, for the Our Work resource cards. */
export function resourceBySlug(slug: string): ResourceGuide | undefined {
  return resourceGuides.find((g) => g.slug === slug);
}

/**
 * The one ordered, visitor-facing media sequence for a record. Programme
 * photographs first (lead, then gallery), independent coverage last; education
 * pages in reading order. Both the record page and the media viewer derive
 * from this, so they can never disagree.
 */
export function recordMedia(record: WorkRecord): MediaItem[] {
  if (record.type === 'clothing') {
    const photos = [record.page.lead, ...record.page.gallery];
    const items: MediaItem[] = photos.map((p, i) => ({
      src: p.src,
      kind: 'programme-photo',
      alt: p.alt,
      order: i,
      width: p.width,
      height: p.height,
    }));
    if (record.page.coverage) {
      const c = record.page.coverage;
      items.push({
        src: c.src,
        kind: 'independent-coverage',
        alt: c.alt,
        order: items.length,
        width: c.width,
        height: c.height,
      });
    }
    return items;
  }
  return record.page.pages.map((p, i) => ({
    src: p.src,
    kind: 'academic-record-page',
    alt: p.alt,
    order: i,
    width: p.width,
    height: p.height,
  }));
}

/** Number of programme photographs in a clothing record (lead + gallery). */
export function photoCount(record: ClothingRecord): number {
  return 1 + record.page.gallery.length;
}

/**
 * The Our Work preview summary, derived from the actual media so the count is
 * always accurate and photographs are counted separately from coverage.
 */
export function recordSummary(record: ClothingRecord): string {
  const n = photoCount(record);
  const photos = `${n} photograph${n === 1 ? '' : 's'}`;
  return record.page.coverage ? `${photos} · Independent coverage` : photos;
}
