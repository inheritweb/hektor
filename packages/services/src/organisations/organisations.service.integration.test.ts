import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { OrganisationStatus, SortDirection } from '@hektor/types';
import { HektorErrorCode } from '@hektor/types/contracts';

import { HektorServiceError } from '../errors';
import { createIntegrationDatabaseClient } from '../testing/local-supabase';

import { getOrganisation, listOrganisations } from './organisations.service';

const client = createIntegrationDatabaseClient();

const organisationId = randomUUID();

const cohortId = randomUUID();

const contractPeriodId = randomUUID();

const slug = `integration-${organisationId}`;

describe('organisation services', () => {
  beforeAll(async () => {
    const { error: organisationError } = await client
      .from('organisations')
      .insert({
        id: organisationId,
        name: 'Integration Test University',
        slug,
      });

    if (organisationError) throw organisationError;

    const { error: cohortError } = await client.from('cohorts').insert({
      id: cohortId,
      organisation_id: organisationId,
      name: 'September 2026',
      starts_on: '2026-09-01',
      ends_on: '2029-09-01',
    });

    if (cohortError) throw cohortError;

    const { error: contractError } = await client
      .from('organisation_contract_periods')
      .insert({
        id: contractPeriodId,
        organisation_id: organisationId,
        starts_on: '2026-09-01',
        ends_on: '2027-09-01',
        learner_seat_allowance: 100,
      });

    if (contractError) throw contractError;
  });

  afterAll(async () => {
    await client
      .from('organisation_contract_periods')
      .delete()
      .eq('organisation_id', organisationId);
    await client.from('cohorts').delete().eq('organisation_id', organisationId);
    await client.from('organisations').delete().eq('id', organisationId);
  });

  it('lists organisations through the real Supabase query', async () => {
    const response = await listOrganisations(client, {
      page: 1,
      pageSize: 100,
      order: 'name',
      dir: SortDirection.Ascending,
    });

    expect(response.data).toContainEqual({
      id: organisationId,
      name: 'Integration Test University',
      slug,
      status: OrganisationStatus.Active,
    });
    expect(response.context.totalRecords).toBeGreaterThanOrEqual(1);
  });

  it('loads and maps an organisation aggregate', async () => {
    const response = await getOrganisation(client, { organisationId });

    expect(response.data).toMatchObject({
      id: organisationId,
      name: 'Integration Test University',
      slug,
      status: OrganisationStatus.Active,
      cohorts: [
        {
          id: cohortId,
          name: 'September 2026',
        },
      ],
      contractPeriods: [
        {
          id: contractPeriodId,
          seats: {
            allowed: 100,
            activated: 0,
            remaining: 100,
          },
        },
      ],
    });
  });

  it('raises a not-found service error', async () => {
    await expect(
      getOrganisation(client, { organisationId: randomUUID() }),
    ).rejects.toMatchObject({
      code: HektorErrorCode.NotFound,
      message: 'Organisation not found',
    } satisfies Partial<HektorServiceError>);
  });
});
