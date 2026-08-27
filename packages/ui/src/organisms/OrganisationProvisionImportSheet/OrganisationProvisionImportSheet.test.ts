import { describe, expect, it } from 'vitest';

import { parseProvisionCsv } from './OrganisationProvisionImportSheet.component';

describe('parseProvisionCsv', () => {
  it('parses quoted names and optional cohorts', () => {
    expect(
      parseProvisionCsv(
        'first_name,last_name,email,role,cohort\n"Ada, A.",Lovelace,ADA@example.com,learner,Autumn',
      ),
    ).toEqual([
      {
        cohortName: 'Autumn',
        email: 'ada@example.com',
        firstName: 'Ada, A.',
        lastName: 'Lovelace',
        role: 'learner',
        rowNumber: 2,
      },
    ]);
  });

  it('rejects unknown roles', () => {
    expect(() =>
      parseProvisionCsv(
        'first_name,last_name,email,role\nAda,Lovelace,ada@example.com,manager',
      ),
    ).toThrow('Row 2 has an invalid role');
  });
});
