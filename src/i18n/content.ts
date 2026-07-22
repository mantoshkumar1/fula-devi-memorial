import { englishPages } from '../locales/en/pages.ts';
import {
  englishClothingRecords,
  englishEducationRecords,
} from '../locales/en/records.ts';
import { hindiPages } from '../locales/hi/pages.ts';
import {
  hindiClothingRecords,
  hindiEducationRecords,
} from '../locales/hi/records.ts';
import type {
  ClothingRecordsContent,
  EducationRecordsContent,
  PageContentByKey,
} from '../locales/content-types.ts';
import {
  defineVersionedTranslation,
  type VersionedTranslation,
} from './translations.ts';
import type { PublishedLocale } from './types.ts';

type PageKey = keyof PageContentByKey;

function approvedTranslation<T>(
  id: string,
  sourceVersion: string,
  english: T,
  hindi: T,
): VersionedTranslation<T> {
  return defineVersionedTranslation(id, {
    en: { sourceVersion, content: english },
    hi: {
      translatedFrom: sourceVersion,
      status: 'approved',
      content: hindi,
    },
  });
}

function approvedPageTranslation<K extends PageKey>(
  key: K,
  sourceVersion: string,
): VersionedTranslation<PageContentByKey[K]> {
  return approvedTranslation<PageContentByKey[K]>(
    key,
    sourceVersion,
    englishPages[key] as PageContentByKey[K],
    hindiPages[key] as PageContentByKey[K],
  );
}

export const PAGE_TRANSLATIONS = {
  home: approvedPageTranslation('home', 'home-v1.0'),
  institution: approvedPageTranslation(
    'institution',
    'institution-v1.0',
  ),
  fulaDevi: approvedPageTranslation(
    'fulaDevi',
    'fula-devi-v1.0',
  ),
  ourWork: approvedPageTranslation(
    'ourWork',
    'our-work-v1.0',
  ),
  updates: approvedPageTranslation(
    'updates',
    'updates-v1.0',
  ),
  governance: approvedPageTranslation(
    'governance',
    'governance-v1.0',
  ),
  contact: approvedPageTranslation(
    'contact',
    'contact-v1.0',
  ),
  notFound: approvedPageTranslation(
    'notFound',
    'not-found-v1.0',
  ),
} as const;

export const CLOTHING_RECORD_TRANSLATION = approvedTranslation(
  'clothingRecord',
  'clothing-records-v1.0',
  englishClothingRecords,
  hindiClothingRecords,
);

export const EDUCATION_RECORD_TRANSLATION = approvedTranslation(
  'educationRecord',
  'education-records-v1.0',
  englishEducationRecords,
  hindiEducationRecords,
);

export const TRANSLATIONS_BY_ROUTE = {
  ...PAGE_TRANSLATIONS,
  clothingRecord: CLOTHING_RECORD_TRANSLATION,
  educationRecord: EDUCATION_RECORD_TRANSLATION,
};

export function pageContentFor<K extends PageKey>(
  key: K,
  locale: PublishedLocale,
): PageContentByKey[K] {
  const translation = PAGE_TRANSLATIONS[key] as VersionedTranslation<
    PageContentByKey[K]
  >;
  return locale === 'en'
    ? translation.en.content
    : translation.hi.content;
}

export function clothingRecordsContentFor(
  locale: PublishedLocale,
): ClothingRecordsContent {
  return locale === 'en'
    ? CLOTHING_RECORD_TRANSLATION.en.content
    : CLOTHING_RECORD_TRANSLATION.hi.content;
}

export function educationRecordsContentFor(
  locale: PublishedLocale,
): EducationRecordsContent {
  return locale === 'en'
    ? EDUCATION_RECORD_TRANSLATION.en.content
    : EDUCATION_RECORD_TRANSLATION.hi.content;
}
