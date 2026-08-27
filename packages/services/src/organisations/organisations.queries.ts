import type { QueryData } from '@supabase/supabase-js';

import {
  type GroupStatus,
  type OrganisationRole,
  OrganisationStatus,
  type OrganisationUserStatus,
  type ProvisioningMethod,
  ProvisioningStatus,
} from '@hektor/types';

import type { DatabaseClient } from '../database';

export function buildOrganisationSummariesQuery(
  client: DatabaseClient,
  options: {
    archived: boolean;
    page: number;
    pageSize: number;
    order: 'name' | 'createdAt';
    dir: 'asc' | 'desc';
  },
) {
  const first = (options.page - 1) * options.pageSize;
  const order = options.order === 'createdAt' ? 'created_at' : 'name';

  let query = client
    .from('organisations')
    .select('id, name, slug, status', { count: 'exact' })
    .order(order, { ascending: options.dir === 'asc' });

  query = options.archived
    ? query.eq('status', OrganisationStatus.Archived)
    : query.neq('status', OrganisationStatus.Archived);

  return query.range(first, first + options.pageSize - 1);
}

export type OrganisationSummariesQueryResult = QueryData<
  ReturnType<typeof buildOrganisationSummariesQuery>
>;

export type OrganisationSummaryQueryResult =
  OrganisationSummariesQueryResult[number];

export function createOrganisationQuery(
  client: DatabaseClient,
  values: { name: string; slug: string },
) {
  return client
    .from('organisations')
    .insert(values)
    .select('id, name, slug, status')
    .single();
}

export function updateOrganisationQuery(
  client: DatabaseClient,
  values: {
    expectedStatus: OrganisationStatus;
    name: string;
    organisationId: string;
    slug: string;
    status: OrganisationStatus;
  },
) {
  return client.rpc('update_organisation', {
    expected_status: values.expectedStatus,
    target_name: values.name,
    target_organisation_id: values.organisationId,
    target_slug: values.slug,
    target_status: values.status,
  });
}

export function buildOrganisationDetailQuery(
  client: DatabaseClient,
  organisationId: string,
) {
  return client
    .from('organisations')
    .select(
      `
    id, name, slug, status, created_at, updated_at,
    contractPeriods:organisation_contract_periods (
      id, starts_on, ends_on, learner_seat_allowance, created_at, updated_at,
      activations:organisation_seat_activations (organisation_user_id, released_at)
    ),
    cohorts:organisation_cohorts (id, name, starts_on, ends_on, status),
    groups:organisation_groups (
      id, name, status, provisioning_method, source_external_id
    )
  `,
    )
    .eq('id', organisationId)
    .single();
}

export type OrganisationDetailQueryResult = QueryData<
  ReturnType<typeof buildOrganisationDetailQuery>
>;

export function buildOrganisationContractPeriodsQuery(
  client: DatabaseClient,
  organisationId: string,
  options: {
    page: number;
    pageSize: number;
    order: 'startsOn' | 'endsOn';
    dir: 'asc' | 'desc';
  },
) {
  const first = (options.page - 1) * options.pageSize;
  const order = options.order === 'endsOn' ? 'ends_on' : 'starts_on';

  return client
    .from('organisation_contract_periods')
    .select(
      `
      id, starts_on, ends_on, learner_seat_allowance, created_at, updated_at,
      activations:organisation_seat_activations (organisation_user_id, released_at)
    `,
      { count: 'exact' },
    )
    .eq('organisation_id', organisationId)
    .order(order, { ascending: options.dir === 'asc' })
    .range(first, first + options.pageSize - 1);
}

export type OrganisationContractPeriodsQueryResult = QueryData<
  ReturnType<typeof buildOrganisationContractPeriodsQuery>
>;

export function buildOrganisationContractPeriodQuery(
  client: DatabaseClient,
  organisationId: string,
  contractPeriodId: string,
) {
  return client
    .from('organisation_contract_periods')
    .select(
      `
      id, starts_on, ends_on, learner_seat_allowance, created_at, updated_at,
      activations:organisation_seat_activations (organisation_user_id, released_at)
    `,
    )
    .eq('organisation_id', organisationId)
    .eq('id', contractPeriodId)
    .single();
}

export type OrganisationContractPeriodQueryResult = QueryData<
  ReturnType<typeof buildOrganisationContractPeriodQuery>
>;

export function createOrganisationContractPeriodQuery(
  client: DatabaseClient,
  values: {
    endsOn: string;
    learnerSeatAllowance: number;
    organisationId: string;
    startsOn: string;
  },
) {
  return client.rpc('create_organisation_contract_period', {
    target_ends_on: values.endsOn,
    target_learner_seat_allowance: values.learnerSeatAllowance,
    target_organisation_id: values.organisationId,
    target_starts_on: values.startsOn,
  });
}

export function updateOrganisationContractPeriodQuery(
  client: DatabaseClient,
  values: {
    contractPeriodId: string;
    endsOn: string;
    expectedUpdatedAt: string;
    learnerSeatAllowance: number;
    organisationId: string;
    startsOn: string;
  },
) {
  return client.rpc('update_organisation_contract_period', {
    expected_updated_at: values.expectedUpdatedAt,
    target_contract_period_id: values.contractPeriodId,
    target_ends_on: values.endsOn,
    target_learner_seat_allowance: values.learnerSeatAllowance,
    target_organisation_id: values.organisationId,
    target_starts_on: values.startsOn,
  });
}

export function buildOrganisationCohortsQuery(
  client: DatabaseClient,
  organisationId: string,
  options: {
    page: number;
    pageSize: number;
    order: 'name' | 'startsOn' | 'endsOn';
    dir: 'asc' | 'desc';
    status?: GroupStatus;
  },
) {
  const first = (options.page - 1) * options.pageSize;
  const order =
    options.order === 'endsOn'
      ? 'ends_on'
      : options.order === 'startsOn'
        ? 'starts_on'
        : 'name';
  let query = client
    .from('organisation_cohorts')
    .select('id, name, starts_on, ends_on, status', { count: 'exact' })
    .eq('organisation_id', organisationId)
    .order(order, { ascending: options.dir === 'asc' })
    .range(first, first + options.pageSize - 1);

  if (options.status) query = query.eq('status', options.status);
  return query;
}

export type OrganisationCohortsQueryResult = QueryData<
  ReturnType<typeof buildOrganisationCohortsQuery>
>;

export function buildOrganisationCohortDetailQuery(
  client: DatabaseClient,
  organisationId: string,
  cohortId: string,
) {
  return client
    .from('organisation_cohorts')
    .select(
      `
      id, name, starts_on, ends_on, status, created_at, updated_at,
      organisation:organisations (id, name, slug, status),
      groups:organisation_groups (
        id, name, status, provisioning_method, source_external_id
      ),
      memberships:organisation_users (id, user_id, role, status)
    `,
    )
    .eq('organisation_id', organisationId)
    .eq('id', cohortId)
    .single();
}

export type OrganisationCohortDetailQueryResult = QueryData<
  ReturnType<typeof buildOrganisationCohortDetailQuery>
>;

export function createOrganisationCohortQuery(
  client: DatabaseClient,
  values: {
    endsOn: string;
    name: string;
    organisationId: string;
    startsOn: string;
  },
) {
  return client.rpc('create_organisation_cohort', {
    target_ends_on: values.endsOn,
    target_name: values.name,
    target_organisation_id: values.organisationId,
    target_starts_on: values.startsOn,
  });
}

export function updateOrganisationCohortQuery(
  client: DatabaseClient,
  values: {
    cohortId: string;
    endsOn: string;
    expectedUpdatedAt: string;
    name: string;
    organisationId: string;
    startsOn: string;
    status: GroupStatus;
  },
) {
  return client.rpc('update_organisation_cohort', {
    expected_updated_at: values.expectedUpdatedAt,
    target_cohort_id: values.cohortId,
    target_ends_on: values.endsOn,
    target_name: values.name,
    target_organisation_id: values.organisationId,
    target_starts_on: values.startsOn,
    target_status: values.status,
  });
}

export function buildOrganisationGroupsQuery(
  client: DatabaseClient,
  organisationId: string,
  options: {
    page: number;
    pageSize: number;
    order: 'name' | 'createdAt';
    dir: 'asc' | 'desc';
    status?: GroupStatus;
    provisioningMethod?: ProvisioningMethod;
  },
) {
  const first = (options.page - 1) * options.pageSize;
  const order = options.order === 'createdAt' ? 'created_at' : 'name';
  let query = client
    .from('organisation_groups')
    .select('id, name, status, provisioning_method, source_external_id', {
      count: 'exact',
    })
    .eq('organisation_id', organisationId)
    .order(order, { ascending: options.dir === 'asc' })
    .range(first, first + options.pageSize - 1);

  if (options.status) query = query.eq('status', options.status);
  if (options.provisioningMethod) {
    query = query.eq('provisioning_method', options.provisioningMethod);
  }
  return query;
}

export type OrganisationGroupsQueryResult = QueryData<
  ReturnType<typeof buildOrganisationGroupsQuery>
>;

export function createOrganisationGroupQuery(
  client: DatabaseClient,
  values: { cohortId?: string; name: string; organisationId: string },
) {
  return client.rpc('create_organisation_group', {
    target_cohort_id: values.cohortId,
    target_name: values.name,
    target_organisation_id: values.organisationId,
  });
}

export function updateOrganisationGroupQuery(
  client: DatabaseClient,
  values: {
    cohortId?: string;
    expectedUpdatedAt: string;
    groupId: string;
    name: string;
    organisationId: string;
    status: GroupStatus;
  },
) {
  return client.rpc('update_organisation_group', {
    expected_updated_at: values.expectedUpdatedAt,
    target_cohort_id: values.cohortId,
    target_group_id: values.groupId,
    target_name: values.name,
    target_organisation_id: values.organisationId,
    target_status: values.status,
  });
}

export function buildOrganisationGroupDetailQuery(
  client: DatabaseClient,
  organisationId: string,
  groupId: string,
) {
  return client
    .from('organisation_groups')
    .select(
      `
      id, name, status, provisioning_method, source_external_id,
      last_synchronized_at, source_deleted_at, created_at, updated_at,
      organisation:organisations (id, name, slug, status),
      cohort:organisation_cohorts (id, name, starts_on, ends_on, status),
      userLinks:organisation_group_users (
        membership:organisation_users (id, user_id, role, status)
      ),
      provisionLinks:organisation_provisioned_group_users (
        provision:organisation_user_provisions (
          id, provisioning_method, provisioned_user_name,
          provisioned_display_name, provisioned_role, status
        )
      )
    `,
    )
    .eq('organisation_id', organisationId)
    .eq('id', groupId)
    .single();
}

export type OrganisationGroupDetailQueryResult = QueryData<
  ReturnType<typeof buildOrganisationGroupDetailQuery>
>;

export function updateOrganisationGroupMembershipQuery(
  client: DatabaseClient,
  values: {
    addProvisionIds: string[];
    addUserIds: string[];
    groupId: string;
    organisationId: string;
    removeProvisionIds: string[];
    removeUserIds: string[];
  },
) {
  return client.rpc('update_organisation_group_membership', {
    add_provision_ids: values.addProvisionIds,
    add_user_ids: values.addUserIds,
    remove_provision_ids: values.removeProvisionIds,
    remove_user_ids: values.removeUserIds,
    target_group_id: values.groupId,
    target_organisation_id: values.organisationId,
  });
}

export function buildOrganisationMembershipsCountQuery(
  client: DatabaseClient,
  organisationId: string,
  filters: {
    provisioningMethod?: ProvisioningMethod;
    role?: OrganisationRole;
    status?: OrganisationUserStatus;
  } = {},
) {
  let query = client
    .from('organisation_users')
    .select('id', { count: 'exact', head: true })
    .eq('organisation_id', organisationId);

  if (filters.role) query = query.eq('role', filters.role);
  if (filters.status) query = query.eq('status', filters.status);

  return query;
}

export function searchOrganisationMembershipCandidatesQuery(
  client: DatabaseClient,
  values: {
    organisationId: string;
    page: number;
    pageSize: number;
    query?: string;
  },
) {
  return client.rpc('search_organisation_membership_candidates', {
    page_number: values.page,
    page_size: values.pageSize,
    search_query: values.query,
    target_organisation_id: values.organisationId,
  });
}

export function createOrganisationMembershipsQuery(
  client: DatabaseClient,
  values: {
    cohortId?: string;
    organisationId: string;
    role: OrganisationRole;
    userIds: string[];
  },
) {
  return client.rpc('create_organisation_memberships', {
    target_cohort_id: values.cohortId,
    target_organisation_id: values.organisationId,
    target_role: values.role,
    target_user_ids: values.userIds,
  });
}

export function buildOrganisationUserProvisionsCountQuery(
  client: DatabaseClient,
  organisationId: string,
  filters: {
    role?: OrganisationRole;
    status?: ProvisioningStatus;
  } = {},
) {
  let query = client
    .from('organisation_user_provisions')
    .select('id', { count: 'exact', head: true })
    .eq('organisation_id', organisationId);

  if (filters.role) query = query.eq('provisioned_role', filters.role);
  if (filters.status) query = query.eq('status', filters.status);

  return query;
}

export function buildOrganisationMembershipsQuery(
  client: DatabaseClient,
  organisationId: string,
  filters: {
    role?: OrganisationRole;
    status?: OrganisationUserStatus;
  } = {},
) {
  let query = client
    .from('organisation_users')
    .select('id, user_id, role, status, created_at, updated_at')
    .eq('organisation_id', organisationId);

  if (filters.role) query = query.eq('role', filters.role);
  if (filters.status) query = query.eq('status', filters.status);

  return query;
}

export type OrganisationMembershipsQueryResult = QueryData<
  ReturnType<typeof buildOrganisationMembershipsQuery>
>;

export function buildOrganisationMembershipDetailQuery(
  client: DatabaseClient,
  organisationId: string,
  membershipId: string,
) {
  return client
    .from('organisation_users')
    .select(
      `
      id, user_id, role, status, created_at, updated_at,
      organisation:organisations (id, name, slug, status),
      cohort:organisation_cohorts (id, name, starts_on, ends_on, status),
      groupLinks:organisation_group_users (
        group:organisation_groups (
          id, name, status, provisioning_method, source_external_id
        )
      ),
      provisions:organisation_user_provisions (
        id, provisioning_method, status, created_at
      ),
      seatActivations:organisation_seat_activations (
        organisation_contract_period_id, activated_at, released_at
      )
    `,
    )
    .eq('organisation_id', organisationId)
    .eq('id', membershipId)
    .single();
}

export type OrganisationMembershipDetailQueryResult = QueryData<
  ReturnType<typeof buildOrganisationMembershipDetailQuery>
>;

export function updateOrganisationMembershipQuery(
  client: DatabaseClient,
  values: {
    cohortId?: string;
    expectedUpdatedAt: string;
    membershipId: string;
    organisationId: string;
    role: OrganisationRole;
    status: OrganisationUserStatus;
  },
) {
  return client.rpc('update_organisation_membership', {
    expected_updated_at: values.expectedUpdatedAt,
    target_cohort_id: values.cohortId,
    target_membership_id: values.membershipId,
    target_organisation_id: values.organisationId,
    target_role: values.role,
    target_status: values.status,
  });
}

export function buildOrganisationUserProvisionsQuery(
  client: DatabaseClient,
  organisationId: string,
  filters: {
    provisioningMethod?: ProvisioningMethod;
    role?: OrganisationRole;
    status?: ProvisioningStatus;
  } = {},
) {
  let query = client
    .from('organisation_user_provisions')
    .select(
      `
      id,
      organisation_user_id,
      provisioning_method,
      source_external_id,
      provisioned_user_name,
      provisioned_display_name,
      provisioned_given_name,
      provisioned_family_name,
      provisioned_role,
      status,
      last_synchronized_at,
      linked_at,
      revoked_at,
      invitation_sent_at,
      invitation_expires_at,
      invitation_consumed_at,
      invitation_send_count,
      created_at,
      updated_at,
      organisation:organisations (id, name, slug, status),
      cohort:organisation_cohorts (id, name, starts_on, ends_on, status),
      groupLinks:organisation_provisioned_group_users (
        group:organisation_groups (
          id, name, status, provisioning_method, source_external_id
        )
      )
    `,
    )
    .eq('organisation_id', organisationId);

  if (filters.role) query = query.eq('provisioned_role', filters.role);
  if (filters.provisioningMethod)
    query = query.eq('provisioning_method', filters.provisioningMethod);
  if (filters.status) query = query.eq('status', filters.status);

  return query;
}

export type OrganisationUserProvisionsQueryResult = QueryData<
  ReturnType<typeof buildOrganisationUserProvisionsQuery>
>;

export function buildOrganisationUserProvisionDetailQuery(
  client: DatabaseClient,
  organisationId: string,
  provisionId: string,
) {
  return client
    .from('organisation_user_provisions')
    .select(
      `
      id,
      organisation_user_id,
      provisioning_method,
      source_external_id,
      provisioned_user_name,
      provisioned_display_name,
      provisioned_given_name,
      provisioned_family_name,
      provisioned_role,
      status,
      last_synchronized_at,
      linked_at,
      revoked_at,
      invitation_sent_at,
      invitation_expires_at,
      invitation_consumed_at,
      invitation_send_count,
      created_at,
      updated_at,
      organisation:organisations (id, name, slug, status),
      cohort:organisation_cohorts (id, name, starts_on, ends_on, status),
      membership:organisation_users (id, user_id, role, status),
      groupLinks:organisation_provisioned_group_users (
        group:organisation_groups (
          id, name, status, provisioning_method, source_external_id
        )
      )
    `,
    )
    .eq('organisation_id', organisationId)
    .eq('id', provisionId)
    .single();
}

export type OrganisationUserProvisionDetailQueryResult = QueryData<
  ReturnType<typeof buildOrganisationUserProvisionDetailQuery>
>;

export function buildOrganisationMembershipForUserQuery(
  client: DatabaseClient,
  organisationId: string,
  userId: string,
) {
  return client
    .from('organisation_users')
    .select('id, user_id, role, status')
    .eq('organisation_id', organisationId)
    .eq('user_id', userId)
    .maybeSingle();
}

export function transitionOrganisationUserProvisionQuery(
  client: DatabaseClient,
  options: {
    provisionId: string;
    expectedStatus: ProvisioningStatus;
    action: string;
    organisationUserId?: string;
  },
) {
  return client.rpc('transition_organisation_user_provision', {
    target_provision_id: options.provisionId,
    expected_status: options.expectedStatus,
    lifecycle_action: options.action,
    ...(options.organisationUserId
      ? { target_organisation_user_id: options.organisationUserId }
      : {}),
  });
}

export function buildProvisionAcceptanceQuery(
  client: DatabaseClient,
  provisionId: string,
) {
  return client
    .from('organisation_user_provisions')
    .select(
      `
      id, organisation_user_id, provisioning_method, source_external_id,
      provisioned_user_name, provisioned_display_name, provisioned_given_name,
      provisioned_family_name, provisioned_role, status, last_synchronized_at,
      linked_at, revoked_at, created_at, updated_at,
      invitation_sent_at, invitation_expires_at, invitation_consumed_at,
      invitation_send_count, invitation_token_hash,
      organisation:organisations (id, name, slug, status),
      cohort:organisation_cohorts (id, name, starts_on, ends_on, status),
      membership:organisation_users (id, user_id, role, status),
      groupLinks:organisation_provisioned_group_users (
        group:organisation_groups (
          id, name, status, provisioning_method, source_external_id
        )
      )
    `,
    )
    .eq('id', provisionId)
    .single();
}

export function acceptOrganisationUserProvisionQuery(
  client: DatabaseClient,
  provisionId: string,
  userId: string,
) {
  return client.rpc('accept_organisation_user_provision', {
    target_provision_id: provisionId,
    expected_status: ProvisioningStatus.Pending,
    target_user_id: userId,
  });
}

export function issueOrganisationProvisionInvitationQuery(
  client: DatabaseClient,
  options: {
    cooldownSeconds: number;
    expiresAt: string;
    organisationId: string;
    provisionId: string;
    tokenHash: string;
  },
) {
  return client.rpc('issue_organisation_provision_invitation', {
    resend_cooldown_seconds: options.cooldownSeconds,
    target_expires_at: options.expiresAt,
    target_organisation_id: options.organisationId,
    target_provision_id: options.provisionId,
    target_token_hash: options.tokenHash,
  });
}

export function consumeOrganisationProvisionInvitationQuery(
  client: DatabaseClient,
  provisionId: string,
  tokenHash: string,
) {
  return client.rpc('consume_organisation_provision_invitation', {
    expected_token_hash: tokenHash,
    target_provision_id: provisionId,
  });
}

export function clearOrganisationProvisionInvitationQuery(
  client: DatabaseClient,
  provisionId: string,
  tokenHash: string,
) {
  return client.rpc('clear_organisation_provision_invitation', {
    expected_token_hash: tokenHash,
    target_provision_id: provisionId,
  });
}

export function buildOrganisationProvisionImportContextQuery(
  client: DatabaseClient,
  organisationId: string,
) {
  return Promise.all([
    client
      .from('organisations')
      .select('id, status')
      .eq('id', organisationId)
      .single(),
    client
      .from('organisation_cohorts')
      .select('id, name, status')
      .eq('organisation_id', organisationId),
    client
      .from('organisation_user_provisions')
      .select('id, provisioned_user_name, status')
      .eq('organisation_id', organisationId)
      .neq('status', ProvisioningStatus.Revoked),
    client
      .from('organisation_users')
      .select('id, user_id')
      .eq('organisation_id', organisationId),
  ]);
}

export function importOrganisationUserProvisionsQuery(
  client: DatabaseClient,
  organisationId: string,
  rows: Array<{
    cohortId?: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    rowNumber: number;
  }>,
) {
  return client.rpc('import_organisation_user_provisions', {
    target_organisation_id: organisationId,
    import_rows: rows,
  });
}
