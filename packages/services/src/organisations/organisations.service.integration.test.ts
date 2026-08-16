import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { OrganisationStatus, SortDirection } from '@hektor/types';
import { HektorErrorCode } from '@hektor/types/contracts';
import { organisationSchema } from '@hektor/types/contracts/organisations';

import { HektorServiceError } from '../errors';
import { createIntegrationDatabaseClient } from '../testing/local-supabase';

import { createOrganisationsService } from './organisations.service';

const client = createIntegrationDatabaseClient();

const {
  getOrganisation,
  listOrganisationContractPeriods,
  listOrganisationCohorts,
  listOrganisations,
  listOrganisationUserProvisions,
  listOrganisationUsers,
} = createOrganisationsService(client);

const organisationId = randomUUID();

const cohortId = randomUUID();

const contractPeriodId = randomUUID();

const groupId = randomUUID();

const learnerMembershipId = randomUUID();

const tutorMembershipId = randomUUID();

const provisionId = randomUUID();

let learnerUserId: string;

let tutorUserId: string;

const slug = `integration-${organisationId}`;

describe('organisation services', () => {
  beforeAll(async () => {
    const learner = await client.auth.admin.createUser({
      email: `learner-${organisationId}@integration.example`,
      email_confirm: true,
      user_metadata: { full_name: 'Integration Learner' },
    });
    const tutor = await client.auth.admin.createUser({
      email: `tutor-${organisationId}@integration.example`,
      email_confirm: true,
      user_metadata: { full_name: 'Integration Tutor' },
    });
    if (learner.error) throw learner.error;
    if (tutor.error) throw tutor.error;
    learnerUserId = learner.data.user.id;
    tutorUserId = tutor.data.user.id;

    const { error: organisationError } = await client
      .from('organisations')
      .insert({
        id: organisationId,
        name: 'Integration Test University',
        slug,
      });

    if (organisationError) throw organisationError;

    const { error: cohortError } = await client
      .from('organisation_cohorts')
      .insert({
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

    const { error: groupError } = await client
      .from('organisation_groups')
      .insert({
        id: groupId,
        organisation_id: organisationId,
        organisation_cohort_id: cohortId,
        name: 'Clinical Practice A',
      });

    if (groupError) throw groupError;

    const { error: usersError } = await client
      .from('organisation_users')
      .insert([
        {
          id: learnerMembershipId,
          organisation_id: organisationId,
          organisation_cohort_id: cohortId,
          user_id: learnerUserId,
          role: 'learner',
          status: 'active',
        },
        {
          id: tutorMembershipId,
          organisation_id: organisationId,
          user_id: tutorUserId,
          role: 'tutor',
          status: 'suspended',
        },
      ]);

    if (usersError) throw usersError;

    const { error: provisionError } = await client
      .from('organisation_user_provisions')
      .insert({
        id: provisionId,
        organisation_id: organisationId,
        provisioning_method: 'csv',
        provisioned_user_name: 'pending@integration.example',
        provisioned_display_name: 'Pending Learner',
        provisioned_role: 'learner',
      });

    if (provisionError) throw provisionError;
  });

  afterAll(async () => {
    await client
      .from('organisation_user_provisions')
      .delete()
      .eq('organisation_id', organisationId);
    await client
      .from('organisation_users')
      .delete()
      .eq('organisation_id', organisationId);
    await client
      .from('organisation_groups')
      .delete()
      .eq('organisation_id', organisationId);
    await client
      .from('organisation_contract_periods')
      .delete()
      .eq('organisation_id', organisationId);
    await client
      .from('organisation_cohorts')
      .delete()
      .eq('organisation_id', organisationId);
    await client.from('organisations').delete().eq('id', organisationId);
    if (learnerUserId) await client.auth.admin.deleteUser(learnerUserId);
    if (tutorUserId) await client.auth.admin.deleteUser(tutorUserId);
  });

  it('lists organisations through the real Supabase query', async () => {
    const response = await listOrganisations({
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
    const response = await getOrganisation({ organisationId });

    expect(() => organisationSchema.parse(response.data)).not.toThrow();

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
      groups: [
        {
          id: groupId,
          name: 'Clinical Practice A',
        },
      ],
      usersSummary: {
        total: 2,
        learners: 1,
        tutors: 1,
        organisationAdmins: 0,
        suspended: 1,
      },
      userProvisionsSummary: {
        total: 1,
        pending: 1,
        inactive: 0,
        failed: 0,
      },
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

  it('lists canonical organisation users', async () => {
    const response = await listOrganisationUsers(
      { organisationId },
      {
        page: 1,
        pageSize: 20,
        order: 'displayName',
        dir: SortDirection.Ascending,
      },
    );

    expect(response.context.totalRecords).toBe(2);
    expect(response.data).toEqual([
      expect.objectContaining({
        id: learnerMembershipId,
        role: 'learner',
        user: expect.objectContaining({ displayName: 'Integration Learner' }),
      }),
      expect.objectContaining({
        id: tutorMembershipId,
        role: 'tutor',
        status: 'suspended',
        user: expect.objectContaining({ displayName: 'Integration Tutor' }),
      }),
    ]);
  });

  it('lists contract periods with derived seat usage', async () => {
    const response = await listOrganisationContractPeriods(
      { organisationId },
      {
        page: 1,
        pageSize: 20,
        order: 'startsOn',
        dir: SortDirection.Descending,
      },
    );

    expect(response.context.totalRecords).toBe(1);
    expect(response.data).toEqual([
      expect.objectContaining({
        id: contractPeriodId,
        startsOn: '2026-09-01',
        endsOn: '2027-09-01',
        seats: { allowed: 100, activated: 0, remaining: 100 },
      }),
    ]);
  });

  it('lists organisation cohorts', async () => {
    const response = await listOrganisationCohorts(
      { organisationId },
      {
        page: 1,
        pageSize: 20,
        order: 'startsOn',
        dir: SortDirection.Descending,
      },
    );

    expect(response.context.totalRecords).toBe(1);
    expect(response.data).toEqual([
      {
        id: cohortId,
        name: 'September 2026',
        startsOn: '2026-09-01',
        endsOn: '2029-09-01',
        status: 'active',
      },
    ]);
  });

  it('lists provisioned users independently', async () => {
    const response = await listOrganisationUserProvisions(
      { organisationId },
      {
        page: 1,
        pageSize: 20,
        order: 'displayName',
        dir: SortDirection.Ascending,
      },
    );

    expect(response.context.totalRecords).toBe(1);
    expect(response.data).toEqual([
      expect.objectContaining({
        id: provisionId,
        provisionedDisplayName: 'Pending Learner',
        provisionedUserName: 'pending@integration.example',
        status: 'pending',
      }),
    ]);
  });

  it('raises a not-found service error', async () => {
    await expect(
      getOrganisation({ organisationId: randomUUID() }),
    ).rejects.toMatchObject({
      code: HektorErrorCode.NotFound,
      message: 'Organisation not found',
    } satisfies Partial<HektorServiceError>);
  });
});
