import type { StaticRouteKey } from '../i18n/routes.ts';

export interface PageMeta {
  title: string;
  description: string;
}

export type InlinePart =
  | string
  | {
      route: StaticRouteKey;
      text: string;
    };

export interface HomeContent extends PageMeta {
  heading: string;
  paragraphs: readonly (readonly InlinePart[])[];
  imageAlt: string;
  quote: string;
  closing: readonly InlinePart[];
}

export interface ContentSection {
  heading: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
}

export interface InstitutionContent extends PageMeta {
  opening: readonly string[];
  sections: readonly ContentSection[];
  closing: readonly string[];
}

export interface FulaDeviContent extends PageMeta {
  opening: readonly string[];
  portraitAlt: string;
  dignityHeading: string;
  dignityParagraphs: readonly string[];
  quietHelpHeading: string;
  quietHelpParagraphs: readonly string[];
  clayPotAlt: string;
  clayPotCaption: string;
  independenceHeading: string;
  independenceParagraphs: readonly string[];
  faithHeading: string;
  faithParagraphs: readonly string[];
  pilgrimageAltHusband: string;
  pilgrimageCaptionHusband: string;
  pilgrimageAltDaughters: string;
  pilgrimageCaptionDaughters: string;
  pilgrimageNote: string;
  teachingHeading: string;
  teachingIntroduction: string;
  teachingLines: readonly string[];
  teachingAttribution?: string;
}

export interface RecordPreviewCopy {
  yearLabel: string;
  programmeLabel: string;
  coverAlt: string;
}

export interface ResourceCopy {
  title: string;
  scope: string;
  description: string;
  scopeNote: string;
}

export interface OurWorkContent extends PageMeta {
  opening: string;
  education: {
    heading: string;
    status: string;
    paragraphs: readonly string[];
    yearLabel: string;
    programmeLabel: string;
    coverAlt: string;
  };
  clothing: {
    heading: string;
    status: string;
    paragraphs: readonly string[];
    recordsHeading: string;
    previews: Readonly<Record<string, RecordPreviewCopy>>;
  };
  healthcare: {
    heading: string;
    status: string;
    paragraphs: readonly string[];
    resource: ResourceCopy;
  };
  financialAwareness: {
    heading: string;
    status: string;
    paragraphs: readonly string[];
    resource: ResourceCopy;
  };
  lookingAhead: {
    heading: string;
    paragraphs: readonly string[];
  };
  actions: {
    academicRecord: string;
    programmeRecord: string;
    openGuide: string;
  };
  summary: {
    photograph: string;
    photographs: string;
    independentCoverage: string;
  };
}

export interface UpdateEntryContent {
  iso: string;
  date: string;
  title: string;
  body: readonly InlinePart[];
  related: readonly StaticRouteKey[];
}

export interface UpdatesContent extends PageMeta {
  introduction: string;
  relatedLabel: string;
  entries: readonly UpdateEntryContent[];
}

export interface GovernanceContent extends PageMeta {
  introduction: string;
  registrationHeading: string;
  registeredName: string;
  registeredAddress: string;
  labels: {
    registeredName: string;
    registrationNumber: string;
    registrationDate: string;
    registeredAddress: string;
    jurisdiction: string;
  };
  jurisdiction: string;
  documentsHeading: string;
  documentsIntroduction: string;
  documentTitles: Readonly<Record<string, string>>;
}

export interface ContactContent extends PageMeta {
  introduction: string;
  emailHeading: string;
  emailAction: string;
  copyEmailAction: string;
  copySuccess: string;
  emailFallback: string;
  officeHeading: string;
  officeName: string;
  officeAddressLines: readonly string[];
  mapAction: string;
  visitNote: string;
}

export interface NotFoundContent extends PageMeta {
  message: string;
  returnBefore: string;
  homeLink: string;
  betweenLinks: string;
  updatesLink: string;
  returnAfter: string;
}

export interface ClothingRecordCopy extends PageMeta {
  opening: string;
  leadAlt: string;
  coverageAlt?: string;
  galleryAlts: readonly string[];
}

export interface ClothingRecordsContent {
  records: Readonly<Record<string, ClothingRecordCopy>>;
  independentCoverageHeading: string;
  photographsHeading: string;
  backToOurWork: string;
}

export interface EducationRecordCopy extends PageMeta {
  opening: string;
  pageAlts: readonly string[];
}

export interface EducationRecordsContent {
  records: Readonly<Record<string, EducationRecordCopy>>;
  privacyNote: string;
  backToOurWork: string;
}

export interface PageContentByKey {
  home: HomeContent;
  institution: InstitutionContent;
  fulaDevi: FulaDeviContent;
  ourWork: OurWorkContent;
  updates: UpdatesContent;
  governance: GovernanceContent;
  contact: ContactContent;
  notFound: NotFoundContent;
}
