import { EhrSectionType } from '@hektor/types';
import { describe, expect, it } from 'vitest';

import {
  defaultPatientProfileEhrConfiguration,
  resolveEhrSections,
} from './PatientEhrSections';

describe('EHR section composition', () => {
  it('provides all core sections at sparse order values', () => {
    const sections = resolveEhrSections(defaultPatientProfileEhrConfiguration);

    expect(sections).toHaveLength(13);
    expect(sections.map(({ order }) => order)).toEqual([
      10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130,
    ]);
    expect(sections[0]?.type).toBe(EhrSectionType.DemographicAndAdministrative);
  });

  it('orders an inserted section without mutating the input', () => {
    const sections = [
      {
        id: 'later',
        order: 20,
        type: EhrSectionType.AboutMe,
      },
      {
        id: 'inserted',
        order: 15,
        type: EhrSectionType.DocumentsAndCorrespondence,
      },
      {
        id: 'earlier',
        order: 10,
        type: EhrSectionType.DemographicAndAdministrative,
      },
    ];

    expect(resolveEhrSections({ sections }).map(({ id }) => id)).toEqual([
      'earlier',
      'inserted',
      'later',
    ]);
    expect(sections.map(({ id }) => id)).toEqual([
      'later',
      'inserted',
      'earlier',
    ]);
  });

  it('uses stable identity to break equal-order ties', () => {
    const sections = resolveEhrSections({
      sections: [
        {
          id: 'section-b',
          order: 10,
          type: EhrSectionType.AboutMe,
        },
        {
          id: 'section-a',
          order: 10,
          type: EhrSectionType.DemographicAndAdministrative,
        },
      ],
    });

    expect(sections.map(({ id }) => id)).toEqual(['section-a', 'section-b']);
  });
});
