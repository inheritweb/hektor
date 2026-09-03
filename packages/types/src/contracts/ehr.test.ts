import { describe, expect, it } from 'vitest';

import { EhrConfigurationChangeType, EhrSectionType } from '../ehr';
import { ehrConfigurationChangeSchema } from './ehr';

describe('EHR contracts', () => {
  it('accepts only controlled EHR section changes', () => {
    expect(
      ehrConfigurationChangeSchema.safeParse({
        operation: EhrConfigurationChangeType.Insert,
        section: {
          id: 'acute-presentation',
          type: EhrSectionType.CareEncountersAndTransitions,
          order: 15,
          label: 'Acute stroke presentation',
        },
      }).success,
    ).toBe(true);

    expect(
      ehrConfigurationChangeSchema.safeParse({
        operation: 'execute-javascript',
        script: 'anything',
      }).success,
    ).toBe(false);
  });
});
