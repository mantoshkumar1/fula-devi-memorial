/**
 * Register of governing documents shown on the Governance page.
 *
 * Each `file` must point to a real PDF under /public/documents/.
 * Documents are served AS-IS. Do not transcribe or separately expose personal
 * data from inside the PDFs (see docs/architecture.md §9).
 *
 * File size is NOT stored here: it is derived from the actual PDF bytes at
 * build time, so a replaced document can never disagree with its label.
 *
 * `date` is stored explicitly and only when the date is clearly established
 * from the visible document itself — the metadata date is stripped by the
 * privacy pipeline and cannot be trusted. Documents without a confidently
 * readable date carry `null` and show no date.
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
  /** Document date (ISO string) — only when clear from the document; else null. */
  date: string | null;
  /** True until the cleared PDF is supplied. Pending docs are not linked. */
  pending: boolean;
}

export const governanceDocs: GovernanceDoc[] = [
  {
    title: 'Registration Certificate',
    file: '/documents/registration-certificate.pdf',
    date: '2022-02-27', // "27 Feb 2022" printed on the certificate
    pending: false,
  },
  {
    title: 'Memorandum',
    file: '/documents/memorandum.pdf',
    date: null, // no date printed on the document
    pending: false,
  },
  {
    title: 'By-Laws',
    file: '/documents/bylaws.pdf',
    date: null, // no date printed on the document
    pending: false,
  },
  {
    title: 'Resolution',
    file: '/documents/resolution.pdf',
    date: '2022-01-01', // "दिनांक 01-01-2022" printed on the resolution
    pending: false,
  },
];
