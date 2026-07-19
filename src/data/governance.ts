/**
 * Register of governing documents shown on the Governance page.
 *
 * Each `file` must point to a real PDF under /public/documents/.
 * Documents are served AS-IS. Do not transcribe or separately expose personal
 * data from inside the PDFs (see docs/architecture.md §9).
 *
 * `pending: true` means the file has not been supplied yet. Pending entries are
 * NOT rendered as live download links until the PDF exists and is cleared for
 * public posting.
 */

export interface GovernanceDoc {
  /** Human-readable title. */
  title: string;
  /** Path under /public — permanent once published. */
  file: string;
  /** Document date, if known (ISO string) — else null. */
  date: string | null;
  /** Human-readable size label for the link, e.g. "PDF, 320 KB". */
  sizeLabel: string | null;
  /** True until the cleared PDF is supplied. Pending docs are not linked. */
  pending: boolean;
}

export const governanceDocs: GovernanceDoc[] = [
  {
    title: 'Registration Certificate',
    file: '/documents/registration-certificate.pdf',
    date: null,
    sizeLabel: null,
    pending: true, // PENDING: awaiting web-ready, public-cleared PDF
  },
  {
    title: 'Memorandum',
    file: '/documents/memorandum.pdf',
    date: null,
    sizeLabel: null,
    pending: true, // PENDING
  },
  {
    title: 'Bylaws',
    file: '/documents/bylaws.pdf',
    date: null,
    sizeLabel: null,
    pending: true, // PENDING
  },
  {
    title: 'Resolution',
    file: '/documents/resolution.pdf',
    date: null,
    sizeLabel: null,
    pending: true, // PENDING
  },
];
