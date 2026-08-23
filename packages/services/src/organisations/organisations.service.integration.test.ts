import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  GroupStatus,
  OrganisationStatus,
  ProvisioningAutoLinkOutcome,
  ProvisioningLifecycleAction,
  ProvisioningStatus,
  SortDirection,
} from '@hektor/types';
import { HektorErrorCode } from '@hektor/types/contracts';
import { organisationSchema } from '@hektor/types/contracts/organisations';

import { HektorServiceError } from '../errors';
import { createIntegrationDatabaseClient } from '../testing/local-supabase';

import { createOrganisationsService } from './organisations.service';

const client = createIntegrationDatabaseClient();

const {
  acceptOrganisationUserProvision,
  autoLinkOrganisationUserProvision,
  createOrganisationContractPeriod,
  createOrganisationCohort,
  createOrganisationGroup,
  createOrganisation,
  getOrganisation,
  getOrganisationContractPeriod,
  getOrganisationCohort,
  getOrganisationGroup,
  getOrganisationUserProvision,
  getProvisionAcceptance,
  listOrganisationContractPeriods,
  listOrganisationCohorts,
  listOrganisationGroups,
  listOrganisations,
  listOrganisationUserProvisions,
  listOrganisationUsers,
  transitionOrganisationUserProvision,
  updateOrganisation,
  updateOrganisationContractPeriod,
  updateOrganisationCohort,
  updateOrganisationGroup,
} = createOrganisationsService(client);

const organisationId = randomUUID();

const cohortId = randomUUID();

const contractPeriodId = randomUUID();

const groupId = randomUUID();

const learnerMembershipId = randomUUID();

const tutorMembershipId = randomUUID();

const provisionId = randomUUID();

const linkedProvisionId = randomUUID();

let learnerUserId: string;

let tutorUserId: string;

const slug = `integration-${organisationId}`;

describe('organisation services', () => {
  it('creates and edits an organisation with optimistic lifecycle control', async () => {
    const managedId = randomUUID();
    const managedSlug = `managed-${managedId}`;
    const created = await createOrganisation({
      name: 'Managed University',
      slug: managedSlug,
    });

    try {
      expect(created.data).toMatchObject({
        name: 'Managed University',
        slug: managedSlug,
        status: OrganisationStatus.Active,
      });

      const suspended = await updateOrganisation(created.data.id, {
        expectedStatus: OrganisationStatus.Active,
        name: 'Managed University Updated',
        slug: managedSlug,
        status: OrganisationStatus.Suspended,
      });
      expect(suspended.data).toMatchObject({
        name: 'Managed University Updated',
        status: OrganisationStatus.Suspended,
      });

      const currentDirectory = await listOrganisations({
        archived: false,
        page: 1,
        pageSize: 100,
        order: 'name',
        dir: SortDirection.Ascending,
      });
      expect(currentDirectory.data).toContainEqual(suspended.data);

      await expect(
        updateOrganisation(created.data.id, {
          expectedStatus: OrganisationStatus.Active,
          name: 'Stale Update',
          slug: managedSlug,
          status: OrganisationStatus.Active,
        }),
      ).rejects.toMatchObject({ code: HektorErrorCode.Conflict });

      const archived = await updateOrganisation(created.data.id, {
        expectedStatus: OrganisationStatus.Suspended,
        name: 'Managed University Updated',
        slug: managedSlug,
        status: OrganisationStatus.Archived,
      });

      const [currentAfterArchive, archiveDirectory] = await Promise.all([
        listOrganisations({
          archived: false,
          page: 1,
          pageSize: 100,
          order: 'name',
          dir: SortDirection.Ascending,
        }),
        listOrganisations({
          archived: true,
          page: 1,
          pageSize: 100,
          order: 'name',
          dir: SortDirection.Ascending,
        }),
      ]);
      expect(currentAfterArchive.data).not.toContainEqual(archived.data);
      expect(archiveDirectory.data).toContainEqual(archived.data);

      const reactivated = await updateOrganisation(created.data.id, {
        expectedStatus: OrganisationStatus.Archived,
        name: 'Managed University Updated',
        slug: managedSlug,
        status: OrganisationStatus.Active,
      });
      expect(reactivated.data.status).toBe(OrganisationStatus.Active);
    } finally {
      await client.from('organisations').delete().eq('id', created.data.id);
    }
  });

  it('rejects a duplicate organisation slug', async () => {
    await expect(
      createOrganisation({ name: 'Duplicate', slug }),
    ).rejects.toMatchObject({ code: HektorErrorCode.Conflict });
  });

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
        starts_on: '2026-01-01',
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
      .insert([
        {
          id: provisionId,
          organisation_id: organisationId,
          organisation_cohort_id: cohortId,
          provisioning_method: 'csv',
          source_external_id: `csv-${provisionId}`,
          provisioned_user_name: 'pending@integration.example',
          provisioned_display_name: 'Pending Learner',
          provisioned_given_name: 'Pending',
          provisioned_family_name: 'Learner',
          provisioned_role: 'learner',
          status: 'pending',
        },
        {
          id: linkedProvisionId,
          organisation_id: organisationId,
          organisation_user_id: learnerMembershipId,
          organisation_cohort_id: cohortId,
          provisioning_method: 'scim',
          source_external_id: `scim-${linkedProvisionId}`,
          provisioned_user_name: `learner-${organisationId}@integration.example`,
          provisioned_display_name: 'Provisioned Integration Learner',
          provisioned_role: 'learner',
          status: 'linked',
          linked_at: '2026-08-16T11:00:00.000Z',
          last_synchronized_at: '2026-08-16T10:00:00.000Z',
        },
      ]);

    if (provisionError) throw provisionError;

    const { error: groupUsersError } = await client
      .from('organisation_group_users')
      .insert({
        organisation_id: organisationId,
        organisation_group_id: groupId,
        organisation_user_id: learnerMembershipId,
      });
    if (groupUsersError) throw groupUsersError;

    const { error: provisionedGroupUsersError } = await client
      .from('organisation_provisioned_group_users')
      .insert({
        organisation_id: organisationId,
        organisation_group_id: groupId,
        organisation_user_provision_id: provisionId,
      });
    if (provisionedGroupUsersError) throw provisionedGroupUsersError;
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
      archived: false,
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
        total: 2,
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
        startsOn: '2026-01-01',
        endsOn: '2027-09-01',
        seats: { allowed: 100, activated: 0, remaining: 100 },
      }),
    ]);
  });

  it('creates and edits non-overlapping contract periods with optimistic control', async () => {
    const created = await createOrganisationContractPeriod(
      { organisationId },
      {
        startsOn: '2027-09-01',
        endsOn: '2028-09-01',
        learnerSeatAllowance: 120,
      },
    );

    try {
      expect(created.data).toMatchObject({
        startsOn: '2027-09-01',
        endsOn: '2028-09-01',
        seats: { allowed: 120, activated: 0, remaining: 120 },
      });

      await expect(
        createOrganisationContractPeriod(
          { organisationId },
          {
            startsOn: '2028-01-01',
            endsOn: '2029-01-01',
            learnerSeatAllowance: 100,
          },
        ),
      ).rejects.toMatchObject({
        code: HektorErrorCode.Conflict,
        message: 'Contract periods cannot overlap',
      });

      const updated = await updateOrganisationContractPeriod(
        { organisationId, contractPeriodId: created.data.id },
        {
          expectedUpdatedAt: created.data.updatedAt,
          startsOn: '2027-09-01',
          endsOn: '2028-09-01',
          learnerSeatAllowance: 140,
        },
      );
      expect(updated.data.seats.allowed).toBe(140);

      await expect(
        updateOrganisationContractPeriod(
          { organisationId, contractPeriodId: created.data.id },
          {
            expectedUpdatedAt: created.data.updatedAt,
            startsOn: '2027-09-01',
            endsOn: '2028-09-01',
            learnerSeatAllowance: 150,
          },
        ),
      ).rejects.toMatchObject({ code: HektorErrorCode.Conflict });

      await expect(
        getOrganisationContractPeriod({
          organisationId,
          contractPeriodId: created.data.id,
        }),
      ).resolves.toMatchObject({ data: { seats: { allowed: 140 } } });
    } finally {
      await client
        .from('organisation_contract_periods')
        .delete()
        .eq('id', created.data.id);
    }
  });

  it('does not reduce learner allowance below current seat usage', async () => {
    const { error } = await client
      .from('organisation_seat_activations')
      .insert({
        organisation_contract_period_id: contractPeriodId,
        organisation_id: organisationId,
        organisation_user_id: learnerMembershipId,
      });
    if (error) throw error;

    try {
      const current = await getOrganisationContractPeriod({
        organisationId,
        contractPeriodId,
      });
      await expect(
        updateOrganisationContractPeriod(
          { organisationId, contractPeriodId },
          {
            expectedUpdatedAt: current.data.updatedAt,
            startsOn: current.data.startsOn,
            endsOn: current.data.endsOn,
            learnerSeatAllowance: 0,
          },
        ),
      ).rejects.toMatchObject({
        code: HektorErrorCode.UnprocessableEntity,
        message: 'Learner seat allowance cannot be lower than current usage',
      });
    } finally {
      await client
        .from('organisation_seat_activations')
        .delete()
        .eq('organisation_contract_period_id', contractPeriodId)
        .eq('organisation_user_id', learnerMembershipId);
    }
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

  it('creates, archives and reactivates overlapping cohorts with optimistic control', async () => {
    const created = await createOrganisationCohort(
      { organisationId },
      {
        name: 'Managed Cohort',
        startsOn: '2027-01-01',
        endsOn: '2027-12-31',
      },
    );
    const overlapping = await createOrganisationCohort(
      { organisationId },
      {
        name: 'Overlapping Cohort',
        startsOn: '2027-06-01',
        endsOn: '2028-05-31',
      },
    );

    try {
      expect(created.data).toMatchObject({
        name: 'Managed Cohort',
        status: GroupStatus.Active,
      });
      expect(overlapping.data.name).toBe('Overlapping Cohort');

      const archived = await updateOrganisationCohort(
        { organisationId, cohortId: created.data.id },
        {
          expectedUpdatedAt: created.data.updatedAt,
          name: created.data.name,
          startsOn: created.data.startsOn,
          endsOn: created.data.endsOn,
          status: GroupStatus.Archived,
        },
      );
      expect(archived.data.status).toBe(GroupStatus.Archived);

      await expect(
        updateOrganisationCohort(
          { organisationId, cohortId: created.data.id },
          {
            expectedUpdatedAt: created.data.updatedAt,
            name: created.data.name,
            startsOn: created.data.startsOn,
            endsOn: created.data.endsOn,
            status: GroupStatus.Active,
          },
        ),
      ).rejects.toMatchObject({ code: HektorErrorCode.Conflict });

      const reactivated = await updateOrganisationCohort(
        { organisationId, cohortId: created.data.id },
        {
          expectedUpdatedAt: archived.data.updatedAt,
          name: archived.data.name,
          startsOn: archived.data.startsOn,
          endsOn: archived.data.endsOn,
          status: GroupStatus.Active,
        },
      );
      expect(reactivated.data.status).toBe(GroupStatus.Active);
    } finally {
      await client
        .from('organisation_cohorts')
        .delete()
        .in('id', [created.data.id, overlapping.data.id]);
    }
  });

  it('creates, archives and reactivates groups with optimistic control', async () => {
    const created = await createOrganisationGroup(
      { organisationId },
      { cohortId, name: `Managed Group ${randomUUID()}` },
    );

    try {
      expect(created.data).toMatchObject({
        cohort: { id: cohortId },
        provisioningMethod: undefined,
        status: GroupStatus.Active,
      });

      const archived = await updateOrganisationGroup(
        { organisationId, groupId: created.data.id },
        {
          cohortId,
          expectedUpdatedAt: created.data.updatedAt,
          name: created.data.name,
          status: GroupStatus.Archived,
        },
      );
      expect(archived.data.status).toBe(GroupStatus.Archived);

      await expect(
        updateOrganisationGroup(
          { organisationId, groupId: created.data.id },
          {
            cohortId,
            expectedUpdatedAt: created.data.updatedAt,
            name: created.data.name,
            status: GroupStatus.Active,
          },
        ),
      ).rejects.toMatchObject({ code: HektorErrorCode.Conflict });

      const reactivated = await updateOrganisationGroup(
        { organisationId, groupId: created.data.id },
        {
          cohortId,
          expectedUpdatedAt: archived.data.updatedAt,
          name: archived.data.name,
          status: GroupStatus.Active,
        },
      );
      expect(reactivated.data.status).toBe(GroupStatus.Active);
    } finally {
      await client
        .from('organisation_groups')
        .delete()
        .eq('id', created.data.id);
    }
  });

  it('rejects cohorts belonging to another organisation when managing groups', async () => {
    const otherOrganisationId = randomUUID();
    const otherCohortId = randomUUID();
    await client.from('organisations').insert({
      id: otherOrganisationId,
      name: `Other ${otherOrganisationId}`,
      slug: `other-${otherOrganisationId}`,
    });
    await client.from('organisation_cohorts').insert({
      id: otherCohortId,
      organisation_id: otherOrganisationId,
      name: 'Other cohort',
      starts_on: '2026-01-01',
      ends_on: '2027-01-01',
    });

    try {
      await expect(
        createOrganisationGroup(
          { organisationId },
          { cohortId: otherCohortId, name: `Invalid ${randomUUID()}` },
        ),
      ).rejects.toMatchObject({ code: HektorErrorCode.NotFound });
    } finally {
      await client
        .from('organisation_cohorts')
        .delete()
        .eq('id', otherCohortId);
      await client.from('organisations').delete().eq('id', otherOrganisationId);
    }
  });

  it('loads a cohort with canonical learners and groups', async () => {
    const response = await getOrganisationCohort({
      cohortId,
      organisationId,
    });

    expect(response.data).toMatchObject({
      id: cohortId,
      name: 'September 2026',
      organisation: { id: organisationId },
      groups: [{ id: groupId, name: 'Clinical Practice A' }],
      learners: [
        {
          id: learnerMembershipId,
          role: 'learner',
          user: {
            id: learnerUserId,
            displayName: 'Integration Learner',
          },
        },
      ],
    });
  });

  it('lists the unified organisation groups', async () => {
    const response = await listOrganisationGroups(
      { organisationId },
      {
        page: 1,
        pageSize: 20,
        order: 'name',
        dir: SortDirection.Ascending,
      },
    );

    expect(response.context.totalRecords).toBe(1);
    expect(response.data).toEqual([
      {
        id: groupId,
        name: 'Clinical Practice A',
        status: 'active',
        provisioningMethod: undefined,
        sourceExternalId: undefined,
      },
    ]);
  });

  it('loads linked and provisioned group members independently', async () => {
    const response = await getOrganisationGroup({
      groupId,
      organisationId,
    });

    expect(response.data).toMatchObject({
      id: groupId,
      cohort: { id: cohortId },
      users: [
        {
          id: learnerMembershipId,
          user: { id: learnerUserId, displayName: 'Integration Learner' },
        },
      ],
      provisionedUsers: [
        {
          id: provisionId,
          provisionedDisplayName: 'Pending Learner',
          provisionedUserName: 'pending@integration.example',
          status: 'pending',
        },
      ],
    });
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

    expect(response.context.totalRecords).toBe(2);
    expect(response.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: provisionId,
          provisionedDisplayName: 'Pending Learner',
          provisionedUserName: 'pending@integration.example',
          status: 'pending',
        }),
        expect.objectContaining({
          id: linkedProvisionId,
          organisationUserId: learnerMembershipId,
          status: 'linked',
        }),
      ]),
    );
  });

  it('loads provision detail with assignments and optional canonical user', async () => {
    const pending = await getOrganisationUserProvision({
      organisationId,
      provisionId,
    });
    expect(pending.data).toMatchObject({
      id: provisionId,
      cohort: { id: cohortId },
      groups: [{ id: groupId }],
      linkedUser: undefined,
      provisionedGivenName: 'Pending',
      sourceExternalId: `csv-${provisionId}`,
    });

    const linked = await getOrganisationUserProvision({
      organisationId,
      provisionId: linkedProvisionId,
    });
    expect(linked.data).toMatchObject({
      id: linkedProvisionId,
      organisationUserId: learnerMembershipId,
      linkedUser: {
        id: learnerUserId,
        displayName: 'Integration Learner',
      },
      status: 'linked',
    });
  });

  it('suspends and reactivates a durable membership with its provision', async () => {
    await transitionOrganisationUserProvision({
      provisionId: linkedProvisionId,
      expectedStatus: ProvisioningStatus.Linked,
      action: ProvisioningLifecycleAction.Deactivate,
    });

    const inactiveProvision = await getOrganisationUserProvision({
      organisationId,
      provisionId: linkedProvisionId,
    });
    expect(inactiveProvision.data.status).toBe(ProvisioningStatus.Inactive);

    const { data: suspendedMembership } = await client
      .from('organisation_users')
      .select('status')
      .eq('id', learnerMembershipId)
      .single();
    expect(suspendedMembership?.status).toBe('suspended');
    const { data: releasedSeat } = await client
      .from('organisation_seat_activations')
      .select('released_at')
      .eq('organisation_contract_period_id', contractPeriodId)
      .eq('organisation_user_id', learnerMembershipId)
      .single();
    expect(releasedSeat?.released_at).not.toBeNull();

    await transitionOrganisationUserProvision({
      provisionId: linkedProvisionId,
      expectedStatus: ProvisioningStatus.Inactive,
      action: ProvisioningLifecycleAction.Reactivate,
    });

    const { data: activeMembership } = await client
      .from('organisation_users')
      .select('status')
      .eq('id', learnerMembershipId)
      .single();
    expect(activeMembership?.status).toBe('active');
    const { data: activeSeat } = await client
      .from('organisation_seat_activations')
      .select('released_at')
      .eq('organisation_contract_period_id', contractPeriodId)
      .eq('organisation_user_id', learnerMembershipId)
      .single();
    expect(activeSeat?.released_at).toBeNull();
  });

  it('automatically links a verified identity with an existing membership', async () => {
    const automaticProvisionId = randomUUID();
    const { error } = await client.from('organisation_user_provisions').insert({
      id: automaticProvisionId,
      organisation_id: organisationId,
      provisioning_method: 'scim',
      provisioned_user_name: `tutor-${organisationId}@integration.example`,
      provisioned_role: 'org_admin',
      status: 'pending',
    });
    if (error) throw error;

    const result = await autoLinkOrganisationUserProvision({
      organisationId,
      provisionId: automaticProvisionId,
    });

    expect(result.data).toEqual({
      outcome: ProvisioningAutoLinkOutcome.Linked,
      organisationUserId: tutorMembershipId,
    });

    const linked = await getOrganisationUserProvision({
      organisationId,
      provisionId: automaticProvisionId,
    });
    expect(linked.data).toMatchObject({
      organisationUserId: tutorMembershipId,
      status: ProvisioningStatus.Linked,
    });
    const { data: assertedMembership } = await client
      .from('organisation_users')
      .select('role, status')
      .eq('id', tutorMembershipId)
      .single();
    expect(assertedMembership).toEqual({
      role: 'org_admin',
      status: 'active',
    });
  });

  it('accepts a matching institutional provision and materialises its assignments', async () => {
    const email = `institutional-${organisationId}@integration.example`;
    const user = await client.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: 'Institutional Learner' },
    });
    if (user.error) throw user.error;
    const acceptanceProvisionId = randomUUID();
    const { error: provisionError } = await client
      .from('organisation_user_provisions')
      .insert({
        id: acceptanceProvisionId,
        organisation_id: organisationId,
        organisation_cohort_id: cohortId,
        provisioning_method: 'scim',
        provisioned_user_name: email,
        provisioned_display_name: 'Institutional Learner',
        provisioned_role: 'learner',
      });
    if (provisionError) throw provisionError;
    const { error: groupError } = await client
      .from('organisation_provisioned_group_users')
      .insert({
        organisation_id: organisationId,
        organisation_group_id: groupId,
        organisation_user_provision_id: acceptanceProvisionId,
      });
    if (groupError) throw groupError;

    const identity = {
      provisionId: acceptanceProvisionId,
      userId: user.data.user.id,
      email,
      emailVerified: true,
    };
    const preview = await getProvisionAcceptance(identity);
    expect(preview.data.organisation.name).toBe('Integration Test University');

    await acceptOrganisationUserProvision(identity);
    const { data: membership } = await client
      .from('organisation_users')
      .select('id, role, status, organisation_cohort_id')
      .eq('organisation_id', organisationId)
      .eq('user_id', user.data.user.id)
      .single();
    expect(membership).toMatchObject({
      role: 'learner',
      status: 'active',
      organisation_cohort_id: cohortId,
    });
    const { count } = await client
      .from('organisation_group_users')
      .select('organisation_user_id', { count: 'exact', head: true })
      .eq('organisation_group_id', groupId)
      .eq('organisation_user_id', membership!.id);
    expect(count).toBe(1);
    await expect(
      acceptOrganisationUserProvision(identity),
    ).rejects.toMatchObject({
      code: HektorErrorCode.Conflict,
    });

    await client
      .from('organisation_user_provisions')
      .delete()
      .eq('id', acceptanceProvisionId);
    await client
      .from('organisation_seat_activations')
      .delete()
      .eq('organisation_user_id', membership!.id);
    await client.from('organisation_users').delete().eq('id', membership!.id);
    await client.auth.admin.deleteUser(user.data.user.id);
  });

  it('does not disclose a provision to a different institutional identity', async () => {
    await expect(
      getProvisionAcceptance({
        provisionId,
        userId: learnerUserId,
        email: 'different@integration.example',
        emailVerified: true,
      }),
    ).rejects.toMatchObject({ code: HektorErrorCode.NotFound });
  });

  it('leaves an unmatched identity pending', async () => {
    const result = await autoLinkOrganisationUserProvision({
      organisationId,
      provisionId,
    });

    expect(result.data).toEqual({
      outcome: ProvisioningAutoLinkOutcome.PendingIdentityVerification,
    });
  });

  it('persists failure and retry without allowing stale transitions', async () => {
    await transitionOrganisationUserProvision({
      provisionId,
      expectedStatus: ProvisioningStatus.Pending,
      action: ProvisioningLifecycleAction.Fail,
    });
    await expect(
      transitionOrganisationUserProvision({
        provisionId,
        expectedStatus: ProvisioningStatus.Pending,
        action: ProvisioningLifecycleAction.Revoke,
      }),
    ).rejects.toMatchObject({ code: HektorErrorCode.Conflict });
    await transitionOrganisationUserProvision({
      provisionId,
      expectedStatus: ProvisioningStatus.Failed,
      action: ProvisioningLifecycleAction.Retry,
    });

    const retried = await getOrganisationUserProvision({
      organisationId,
      provisionId,
    });
    expect(retried.data.status).toBe(ProvisioningStatus.Pending);
  });

  it('revokes terminally and permits a new provision for the durable membership', async () => {
    const { data: tutorProvision } = await client
      .from('organisation_user_provisions')
      .select('id')
      .eq('organisation_user_id', tutorMembershipId)
      .eq('status', 'linked')
      .single();
    if (!tutorProvision) throw new Error('Expected linked tutor provision');

    await transitionOrganisationUserProvision({
      provisionId: tutorProvision.id,
      expectedStatus: ProvisioningStatus.Linked,
      action: ProvisioningLifecycleAction.Revoke,
    });
    await expect(
      transitionOrganisationUserProvision({
        provisionId: tutorProvision.id,
        expectedStatus: ProvisioningStatus.Revoked,
        action: ProvisioningLifecycleAction.Reactivate,
      }),
    ).rejects.toMatchObject({ code: HektorErrorCode.UnprocessableEntity });

    const replacementId = randomUUID();
    const { error } = await client.from('organisation_user_provisions').insert({
      id: replacementId,
      organisation_id: organisationId,
      provisioning_method: 'scim',
      source_external_id: `replacement-${replacementId}`,
      provisioned_user_name: `tutor-${organisationId}@integration.example`,
      provisioned_role: 'tutor',
    });
    if (error) throw error;

    const replacement = await autoLinkOrganisationUserProvision({
      organisationId,
      provisionId: replacementId,
    });
    expect(replacement.data.outcome).toBe(ProvisioningAutoLinkOutcome.Linked);
    const { data: updatedMembership } = await client
      .from('organisation_users')
      .select('role, status')
      .eq('id', tutorMembershipId)
      .single();
    expect(updatedMembership).toEqual({ role: 'tutor', status: 'active' });
  });

  it('requires acceptance when a verified account has no organisation membership', async () => {
    const user = await client.auth.admin.createUser({
      email: `acceptance-${organisationId}@integration.example`,
      email_confirm: true,
    });
    if (user.error) throw user.error;
    const acceptanceProvisionId = randomUUID();
    const { error } = await client.from('organisation_user_provisions').insert({
      id: acceptanceProvisionId,
      organisation_id: organisationId,
      provisioning_method: 'manual',
      provisioned_user_name: `acceptance-${organisationId}@integration.example`,
      provisioned_role: 'learner',
    });
    if (error) throw error;

    const result = await autoLinkOrganisationUserProvision({
      organisationId,
      provisionId: acceptanceProvisionId,
    });
    expect(result.data.outcome).toBe(
      ProvisioningAutoLinkOutcome.PendingMembershipAcceptance,
    );
    await client
      .from('organisation_user_provisions')
      .delete()
      .eq('id', acceptanceProvisionId);
    await client.auth.admin.deleteUser(user.data.user.id);
  });

  it('leaves provision and membership unchanged when learner capacity is exhausted', async () => {
    await client
      .from('organisation_contract_periods')
      .update({ learner_seat_allowance: 1 })
      .eq('id', contractPeriodId);
    const secondLearner = await client.auth.admin.createUser({
      email: `capacity-${organisationId}@integration.example`,
      email_confirm: true,
    });
    if (secondLearner.error) throw secondLearner.error;
    const secondMembershipId = randomUUID();
    const capacityProvisionId = randomUUID();
    const { error: membershipError } = await client
      .from('organisation_users')
      .insert({
        id: secondMembershipId,
        organisation_id: organisationId,
        user_id: secondLearner.data.user.id,
        role: 'learner',
        status: 'suspended',
      });
    if (membershipError) throw membershipError;
    const { error: provisionError } = await client
      .from('organisation_user_provisions')
      .insert({
        id: capacityProvisionId,
        organisation_id: organisationId,
        provisioning_method: 'manual',
        provisioned_user_name: `capacity-${organisationId}@integration.example`,
        provisioned_role: 'learner',
      });
    if (provisionError) throw provisionError;

    await expect(
      autoLinkOrganisationUserProvision({
        organisationId,
        provisionId: capacityProvisionId,
      }),
    ).rejects.toMatchObject({ code: HektorErrorCode.Conflict });
    const [provision, membership] = await Promise.all([
      client
        .from('organisation_user_provisions')
        .select('status, organisation_user_id')
        .eq('id', capacityProvisionId)
        .single(),
      client
        .from('organisation_users')
        .select('status')
        .eq('id', secondMembershipId)
        .single(),
    ]);
    expect(provision.data).toEqual({
      status: 'pending',
      organisation_user_id: null,
    });
    expect(membership.data?.status).toBe('suspended');
    await client
      .from('organisation_user_provisions')
      .delete()
      .eq('id', capacityProvisionId);
    await client
      .from('organisation_users')
      .delete()
      .eq('id', secondMembershipId);
    await client.auth.admin.deleteUser(secondLearner.data.user.id);
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
