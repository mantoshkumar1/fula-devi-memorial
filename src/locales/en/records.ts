import {
  clothingRecords,
  educationRecords,
} from '../../data/work-records.ts';
import type {
  ClothingRecordsContent,
  EducationRecordsContent,
} from '../content-types.ts';

export const englishClothingRecords: ClothingRecordsContent = {
  records: Object.fromEntries(
    clothingRecords.map((record) => [
      record.slug,
      {
        title: record.page.title,
        description: record.page.description,
        opening: record.page.opening,
        leadAlt: record.page.lead.alt,
        coverageAlt: record.page.coverage?.alt,
        galleryAlts: record.page.gallery.map((image) => image.alt),
      },
    ]),
  ),
  independentCoverageHeading: 'Independent Coverage',
  photographsHeading: 'Photographs',
  backToOurWork: '← Back to Our Work',
};

export const englishEducationRecords: EducationRecordsContent = {
  records: Object.fromEntries(
    educationRecords.map((record) => [
      record.slug,
      {
        title: record.page.title,
        description: record.page.description,
        opening: record.page.opening,
        pageAlts: record.page.pages.map((page) => page.alt),
      },
    ]),
  ),
  privacyNote:
    'Identifying information has been removed to protect the child’s privacy.',
  backToOurWork: '← Back to Our Work',
};
