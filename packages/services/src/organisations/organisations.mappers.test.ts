import { describe, expect, it } from 'vitest';

import { OrganisationStatus } from '@hektor/types';

import { mapOrganisation } from './organisations.mappers';
import type { OrganisationDetailQueryResult } from './organisations.queries';

describe('organisation mappers', () => {
  it('maps an organisation aggregate and derives seat usage', () => {
    const record = {
      id: 'organisation-id',
      name: 'Example University',
      slug: 'example-university',
      status: 'active',
      created_at: '2026-08-14T10:00:00+00:00',
      updated_at: '2026-08-14T11:00:00+00:00',
      contractPeriods: [
        {
          id: 'contract-id',
          starts_on: '2026-09-01',
          ends_on: '2027-09-01',
          learner_seat_allowance: 100,
          created_at: '2026-08-14T10:00:00+00:00',
          updated_at: '2026-08-14T10:00:00+00:00',
          activations: [
            { organisation_user_id: 'learner-one' },
            { organisation_user_id: 'learner-two' },
          ],
        },
      ],
      cohorts: [
        {
          id: 'cohort-id',
          name: 'September 2026',
          starts_on: '2026-09-01',
          ends_on: '2029-09-01',
          status: 'active',
        },
      ],
      groups: [
        {
          id: 'group-id',
          name: 'Clinical Practice A',
          status: 'active',
          provisioning_method: null,
          source_external_id: null,
        },
      ],
    } satisfies OrganisationDetailQueryResult;

    expect(
      mapOrganisation(
        record,
        {
          total: 12,
          learners: 8,
          tutors: 3,
          organisationAdmins: 1,
          suspended: 1,
        },
        {
          total: 2,
          pending: 2,
          inactive: 0,
          failed: 0,
        },
      ),
    ).toEqual({
      id: 'organisation-id',
      name: 'Example University',
      slug: 'example-university',
      status: OrganisationStatus.Active,
      contractPeriods: [
        {
          id: 'contract-id',
          startsOn: '2026-09-01',
          endsOn: '2027-09-01',
          seats: {
            allowed: 100,
            activated: 2,
            remaining: 98,
          },
          createdAt: '2026-08-14T10:00:00.000Z',
          updatedAt: '2026-08-14T10:00:00.000Z',
        },
      ],
      cohorts: [
        {
          id: 'cohort-id',
          name: 'September 2026',
          startsOn: '2026-09-01',
          endsOn: '2029-09-01',
          status: 'active',
        },
      ],
      groups: [
        {
          id: 'group-id',
          name: 'Clinical Practice A',
          status: 'active',
          provisioningMethod: undefined,
          sourceExternalId: undefined,
        },
      ],
      usersSummary: {
        total: 12,
        learners: 8,
        tutors: 3,
        organisationAdmins: 1,
        suspended: 1,
      },
      userProvisionsSummary: {
        total: 2,
        pending: 2,
        inactive: 0,
        failed: 0,
      },
      createdAt: '2026-08-14T10:00:00.000Z',
      updatedAt: '2026-08-14T11:00:00.000Z',
    });
  });
});
