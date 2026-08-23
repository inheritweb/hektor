import type {
  GetOrganisationParams,
  GetOrganisationResponse,
  CreateOrganisationContractPeriodBody,
  CreateOrganisationContractPeriodParams,
  CreateOrganisationContractPeriodResponse,
  GetOrganisationContractPeriodParams,
  GetOrganisationContractPeriodResponse,
  CreateOrganisationBody,
  CreateOrganisationResponse,
  GetOrganisationCohortParams,
  GetOrganisationCohortResponse,
  GetOrganisationGroupParams,
  GetOrganisationGroupResponse,
  GetOrganisationUserProvisionParams,
  GetOrganisationUserProvisionResponse,
  ListOrganisationContractPeriodsParams,
  ListOrganisationContractPeriodsQuery,
  ListOrganisationContractPeriodsResponse,
  ListOrganisationCohortsParams,
  ListOrganisationCohortsQuery,
  ListOrganisationCohortsResponse,
  ListOrganisationGroupsParams,
  ListOrganisationGroupsQuery,
  ListOrganisationGroupsResponse,
  ListOrganisationUserProvisionsParams,
  ListOrganisationUserProvisionsQuery,
  ListOrganisationUserProvisionsResponse,
  ListOrganisationUsersParams,
  ListOrganisationUsersQuery,
  ListOrganisationUsersResponse,
  ListOrganisationsQuery,
  ListOrganisationsResponse,
  UpdateOrganisationBody,
  UpdateOrganisationResponse,
  UpdateOrganisationContractPeriodBody,
  UpdateOrganisationContractPeriodParams,
  UpdateOrganisationContractPeriodResponse,
} from '@hektor/types/contracts/organisations';
import { HektorErrorCode } from '@hektor/types/contracts';
import {
  ProvisioningAutoLinkOutcome,
  ProvisioningLifecycleAction,
  OrganisationRole,
  OrganisationStatus,
  OrganisationUserStatus,
  ProvisioningStatus,
} from '@hektor/types';

import type { DatabaseClient } from '../database';
import { createServiceError } from '../errors';
import { mapUserSummary } from '../users/users.mappers';

import {
  mapOrganisation,
  mapOrganisationCohort,
  mapOrganisationContractPeriod,
  mapOrganisationCohortSummary,
  mapOrganisationGroupSummary,
  mapOrganisationGroup,
  mapOrganisationMembershipUserSummary,
  mapOrganisationSummary,
  mapOrganisationUserProvision,
  mapOrganisationUserProvisionDetail,
} from './organisations.mappers';
import {
  buildOrganisationDetailQuery,
  buildOrganisationCohortDetailQuery,
  buildOrganisationContractPeriodsQuery,
  buildOrganisationContractPeriodQuery,
  buildOrganisationCohortsQuery,
  buildOrganisationGroupsQuery,
  buildOrganisationGroupDetailQuery,
  buildOrganisationMembershipsCountQuery,
  buildOrganisationMembershipsQuery,
  buildOrganisationSummariesQuery,
  createOrganisationQuery,
  createOrganisationContractPeriodQuery,
  buildOrganisationUserProvisionsCountQuery,
  buildOrganisationUserProvisionsQuery,
  buildOrganisationUserProvisionDetailQuery,
  buildProvisionAcceptanceQuery,
  acceptOrganisationUserProvisionQuery,
  buildOrganisationMembershipForUserQuery,
  transitionOrganisationUserProvisionQuery,
  updateOrganisationQuery,
  updateOrganisationContractPeriodQuery,
} from './organisations.queries';
import {
  canTransitionProvisioningStatus,
  getProvisioningTransition,
} from './provisioning-lifecycle';

function paginate<T>(items: T[], page: number, pageSize: number) {
  const first = (page - 1) * pageSize;
  return items.slice(first, first + pageSize);
}

function includesQuery(values: Array<string | undefined>, query?: string) {
  if (!query) return true;
  const normalized = query.toLocaleLowerCase();
  return values.some((value) =>
    value?.toLocaleLowerCase().includes(normalized),
  );
}

export function createOrganisationsService(client: DatabaseClient) {
  async function createOrganisation(
    body: CreateOrganisationBody,
  ): Promise<CreateOrganisationResponse> {
    const { data, error } = await createOrganisationQuery(client, body);

    if (error) {
      throw createServiceError(
        error.code === '23505'
          ? HektorErrorCode.Conflict
          : HektorErrorCode.InternalServerError,
        {
          message:
            error.code === '23505'
              ? 'An organisation with this slug already exists'
              : 'Unable to create organisation',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return { data: mapOrganisationSummary(data) };
  }

  async function updateOrganisation(
    organisationId: string,
    body: UpdateOrganisationBody,
  ): Promise<UpdateOrganisationResponse> {
    const { data, error } = await updateOrganisationQuery(client, {
      ...body,
      organisationId,
    });

    if (error) {
      const conflict =
        error.code === '23505' ||
        error.message.includes('organisation_status_conflict');
      throw createServiceError(
        error.message.includes('organisation_not_found')
          ? HektorErrorCode.NotFound
          : conflict
            ? HektorErrorCode.Conflict
            : HektorErrorCode.InternalServerError,
        {
          message:
            error.code === '23505'
              ? 'An organisation with this slug already exists'
              : conflict
                ? 'The organisation changed while you were editing it'
                : 'Unable to update organisation',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return { data: mapOrganisationSummary(data) };
  }

  async function getProvisionAcceptance(options: {
    provisionId: string;
    userId: string;
    email?: string;
    emailVerified: boolean;
  }) {
    const { data, error } = await buildProvisionAcceptanceQuery(
      client,
      options.provisionId,
    );
    const identityMatches =
      options.emailVerified &&
      options.email?.trim().toLocaleLowerCase() ===
        data?.provisioned_user_name.trim().toLocaleLowerCase();

    if (error || !data || !identityMatches) {
      throw createServiceError(HektorErrorCode.NotFound, {
        message: 'Provision invitation not found',
        internalMessage: error?.message,
        cause: error,
      });
    }
    if (data.status !== ProvisioningStatus.Pending) {
      throw createServiceError(HektorErrorCode.Conflict, {
        message: 'This provision invitation is no longer available',
      });
    }
    if (data.organisation.status !== OrganisationStatus.Active) {
      throw createServiceError(HektorErrorCode.Conflict, {
        message: 'This organisation is not currently accepting invitations',
      });
    }

    return { data: mapOrganisationUserProvisionDetail(data) };
  }

  async function acceptOrganisationUserProvision(options: {
    provisionId: string;
    userId: string;
    email?: string;
    emailVerified: boolean;
  }) {
    await getProvisionAcceptance(options);
    const { data, error } = await acceptOrganisationUserProvisionQuery(
      client,
      options.provisionId,
      options.userId,
    );

    if (error) {
      const conflict =
        error.message.includes('provision_status_conflict') ||
        error.message.includes('learner_seat_capacity_exhausted') ||
        error.message.includes('organisation_not_active');
      throw createServiceError(
        conflict
          ? HektorErrorCode.Conflict
          : HektorErrorCode.InternalServerError,
        {
          message: error.message.includes('learner_seat_capacity_exhausted')
            ? 'The organisation has no learner seats available'
            : 'Unable to accept provision invitation',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return { data: { id: data.id, status: ProvisioningStatus.Linked } };
  }

  async function transitionOrganisationUserProvision(options: {
    provisionId: string;
    expectedStatus: ProvisioningStatus;
    action: ProvisioningLifecycleAction;
    organisationUserId?: string;
  }) {
    if (
      !canTransitionProvisioningStatus(options.expectedStatus, options.action)
    ) {
      throw createServiceError(HektorErrorCode.UnprocessableEntity, {
        message: 'Invalid provision lifecycle transition',
      });
    }

    const { data, error } = await transitionOrganisationUserProvisionQuery(
      client,
      options,
    );

    if (error) {
      const isConflict =
        error.message.includes('provision_status_conflict') ||
        error.message.includes('learner_seat_capacity_exhausted');
      throw createServiceError(
        isConflict
          ? HektorErrorCode.Conflict
          : HektorErrorCode.UnprocessableEntity,
        {
          message: error.message.includes('learner_seat_capacity_exhausted')
            ? 'The current contract period has no learner seats available'
            : 'Unable to transition provision lifecycle',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return {
      data: {
        id: data.id,
        status: getProvisioningTransition(
          options.expectedStatus,
          options.action,
        )!,
      },
    };
  }

  async function autoLinkOrganisationUserProvision(options: {
    organisationId: string;
    provisionId: string;
  }) {
    const { data: provision, error: provisionError } =
      await buildOrganisationUserProvisionDetailQuery(
        client,
        options.organisationId,
        options.provisionId,
      );

    if (provisionError) {
      throw createServiceError(
        provisionError.code === 'PGRST116'
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message:
            provisionError.code === 'PGRST116'
              ? 'Provisioned user not found'
              : 'Unable to resolve provisioned user',
          internalMessage: provisionError.message,
          cause: provisionError,
        },
      );
    }

    if (provision.status !== ProvisioningStatus.Pending) {
      throw createServiceError(HektorErrorCode.Conflict, {
        message: 'Only a pending provision can be linked automatically',
      });
    }

    const normalizedUserName = provision.provisioned_user_name
      .trim()
      .toLocaleLowerCase();
    const { data: authData, error: authError } =
      await client.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (authError) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to resolve provisioned user',
        internalMessage: authError.message,
        cause: authError,
      });
    }

    const user = authData.users.find(
      (candidate) =>
        candidate.email_confirmed_at &&
        candidate.email?.trim().toLocaleLowerCase() === normalizedUserName,
    );

    if (!user) {
      return {
        data: {
          outcome: ProvisioningAutoLinkOutcome.PendingIdentityVerification,
        },
      };
    }

    const { data: membership, error: membershipError } =
      await buildOrganisationMembershipForUserQuery(
        client,
        options.organisationId,
        user.id,
      );

    if (membershipError) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to resolve provisioned user membership',
        internalMessage: membershipError.message,
        cause: membershipError,
      });
    }

    if (!membership) {
      return {
        data: {
          outcome: ProvisioningAutoLinkOutcome.PendingMembershipAcceptance,
        },
      };
    }

    await transitionOrganisationUserProvision({
      provisionId: provision.id,
      expectedStatus: ProvisioningStatus.Pending,
      action: ProvisioningLifecycleAction.Link,
      organisationUserId: membership.id,
    });

    return {
      data: {
        outcome: ProvisioningAutoLinkOutcome.Linked,
        organisationUserId: membership.id,
      },
    };
  }

  async function listOrganisations(
    query: ListOrganisationsQuery,
  ): Promise<ListOrganisationsResponse> {
    const { data, error, count } = await buildOrganisationSummariesQuery(
      client,
      query,
    );

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list organisations',
        internalMessage: error.message,
        cause: error,
      });
    }

    return {
      context: {
        page: query.page,
        pageSize: query.pageSize,
        totalRecords: count ?? 0,
        sort: { order: query.order, dir: query.dir },
      },
      data: data.map(mapOrganisationSummary),
    };
  }

  async function getOrganisation(
    params: GetOrganisationParams,
  ): Promise<GetOrganisationResponse> {
    const [
      detail,
      users,
      learners,
      tutors,
      organisationAdmins,
      suspended,
      provisions,
      pendingProvisions,
      inactiveProvisions,
      failedProvisions,
    ] = await Promise.all([
      buildOrganisationDetailQuery(client, params.organisationId),
      buildOrganisationMembershipsCountQuery(client, params.organisationId),
      buildOrganisationMembershipsCountQuery(client, params.organisationId, {
        role: OrganisationRole.Learner,
      }),
      buildOrganisationMembershipsCountQuery(client, params.organisationId, {
        role: OrganisationRole.Tutor,
      }),
      buildOrganisationMembershipsCountQuery(client, params.organisationId, {
        role: OrganisationRole.OrganisationAdmin,
      }),
      buildOrganisationMembershipsCountQuery(client, params.organisationId, {
        status: OrganisationUserStatus.Suspended,
      }),
      buildOrganisationUserProvisionsCountQuery(client, params.organisationId),
      buildOrganisationUserProvisionsCountQuery(client, params.organisationId, {
        status: ProvisioningStatus.Pending,
      }),
      buildOrganisationUserProvisionsCountQuery(client, params.organisationId, {
        status: ProvisioningStatus.Inactive,
      }),
      buildOrganisationUserProvisionsCountQuery(client, params.organisationId, {
        status: ProvisioningStatus.Failed,
      }),
    ]);
    const { data, error } = detail;

    if (error) {
      throw createServiceError(
        error.code === 'PGRST116'
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message:
            error.code === 'PGRST116'
              ? 'Organisation not found'
              : 'Unable to get organisation',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    const counts = [
      users,
      learners,
      tutors,
      organisationAdmins,
      suspended,
      provisions,
      pendingProvisions,
      inactiveProvisions,
      failedProvisions,
    ];
    const countError = counts.find((result) => result.error)?.error;

    if (countError) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to get organisation',
        internalMessage: countError.message,
        cause: countError,
      });
    }

    return {
      data: mapOrganisation(
        data,
        {
          total: users.count ?? 0,
          learners: learners.count ?? 0,
          tutors: tutors.count ?? 0,
          organisationAdmins: organisationAdmins.count ?? 0,
          suspended: suspended.count ?? 0,
        },
        {
          total: provisions.count ?? 0,
          pending: pendingProvisions.count ?? 0,
          inactive: inactiveProvisions.count ?? 0,
          failed: failedProvisions.count ?? 0,
        },
      ),
    };
  }

  async function listOrganisationUsers(
    params: ListOrganisationUsersParams,
    query: ListOrganisationUsersQuery,
  ): Promise<ListOrganisationUsersResponse> {
    const { data, error } = await buildOrganisationMembershipsQuery(
      client,
      params.organisationId,
      { role: query.role, status: query.status },
    );

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list organisation users',
        internalMessage: error.message,
        cause: error,
      });
    }

    const users = await Promise.all(
      data.map(async (membership) => {
        const { data: authData, error: authError } =
          await client.auth.admin.getUserById(membership.user_id);
        if (authError) {
          throw createServiceError(HektorErrorCode.InternalServerError, {
            message: 'Unable to list organisation users',
            internalMessage: authError.message,
            cause: authError,
          });
        }
        return mapOrganisationMembershipUserSummary(
          membership,
          mapUserSummary(authData.user),
        );
      }),
    );
    const filtered = users.filter(({ user }) =>
      includesQuery([user.displayName, user.email], query.query),
    );
    const direction = query.dir === 'asc' ? 1 : -1;
    filtered.sort((left, right) => {
      const leftValue =
        query.order === 'role' ? left.role : left.user.displayName;
      const rightValue =
        query.order === 'role' ? right.role : right.user.displayName;
      return leftValue.localeCompare(rightValue) * direction;
    });

    return {
      context: {
        page: query.page,
        pageSize: query.pageSize,
        totalRecords: filtered.length,
        sort: { order: query.order, dir: query.dir },
      },
      data: paginate(filtered, query.page, query.pageSize),
    };
  }

  async function listOrganisationContractPeriods(
    params: ListOrganisationContractPeriodsParams,
    query: ListOrganisationContractPeriodsQuery,
  ): Promise<ListOrganisationContractPeriodsResponse> {
    const { data, error, count } = await buildOrganisationContractPeriodsQuery(
      client,
      params.organisationId,
      query,
    );

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list organisation contract periods',
        internalMessage: error.message,
        cause: error,
      });
    }

    return {
      context: {
        page: query.page,
        pageSize: query.pageSize,
        totalRecords: count ?? 0,
        sort: { order: query.order, dir: query.dir },
      },
      data: data.map(mapOrganisationContractPeriod),
    };
  }

  async function getOrganisationContractPeriod(
    params: GetOrganisationContractPeriodParams,
  ): Promise<GetOrganisationContractPeriodResponse> {
    const { data, error } = await buildOrganisationContractPeriodQuery(
      client,
      params.organisationId,
      params.contractPeriodId,
    );

    if (error) {
      throw createServiceError(
        error.code === 'PGRST116'
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message:
            error.code === 'PGRST116'
              ? 'Contract period not found'
              : 'Unable to get contract period',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return { data: mapOrganisationContractPeriod(data) };
  }

  async function createOrganisationContractPeriod(
    params: CreateOrganisationContractPeriodParams,
    body: CreateOrganisationContractPeriodBody,
  ): Promise<CreateOrganisationContractPeriodResponse> {
    const { data, error } = await createOrganisationContractPeriodQuery(
      client,
      { ...body, organisationId: params.organisationId },
    );

    if (error) {
      throw createServiceError(
        error.message.includes('organisation_not_found')
          ? HektorErrorCode.NotFound
          : error.message.includes('contract_period_overlap')
            ? HektorErrorCode.Conflict
            : HektorErrorCode.InternalServerError,
        {
          message: error.message.includes('organisation_not_found')
            ? 'Organisation not found'
            : error.message.includes('contract_period_overlap')
              ? 'Contract periods cannot overlap'
              : 'Unable to create contract period',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return getOrganisationContractPeriod({
      organisationId: params.organisationId,
      contractPeriodId: data.id,
    });
  }

  async function updateOrganisationContractPeriod(
    params: UpdateOrganisationContractPeriodParams,
    body: UpdateOrganisationContractPeriodBody,
  ): Promise<UpdateOrganisationContractPeriodResponse> {
    const { error } = await updateOrganisationContractPeriodQuery(client, {
      ...body,
      ...params,
    });

    if (error) {
      const conflict =
        error.message.includes('contract_period_conflict') ||
        error.message.includes('contract_period_overlap');
      throw createServiceError(
        error.message.includes('contract_period_not_found') ||
          error.message.includes('organisation_not_found')
          ? HektorErrorCode.NotFound
          : conflict
            ? HektorErrorCode.Conflict
            : error.message.includes('learner_seat_allowance_below_usage')
              ? HektorErrorCode.UnprocessableEntity
              : HektorErrorCode.InternalServerError,
        {
          message: error.message.includes('contract_period_not_found')
            ? 'Contract period not found'
            : error.message.includes('organisation_not_found')
              ? 'Organisation not found'
              : error.message.includes('contract_period_overlap')
                ? 'Contract periods cannot overlap'
                : error.message.includes('contract_period_conflict')
                  ? 'The contract period changed while you were editing it'
                  : error.message.includes('learner_seat_allowance_below_usage')
                    ? 'Learner seat allowance cannot be lower than current usage'
                    : 'Unable to update contract period',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return getOrganisationContractPeriod(params);
  }

  async function listOrganisationCohorts(
    params: ListOrganisationCohortsParams,
    query: ListOrganisationCohortsQuery,
  ): Promise<ListOrganisationCohortsResponse> {
    const { data, error, count } = await buildOrganisationCohortsQuery(
      client,
      params.organisationId,
      query,
    );

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list organisation cohorts',
        internalMessage: error.message,
        cause: error,
      });
    }

    return {
      context: {
        page: query.page,
        pageSize: query.pageSize,
        totalRecords: count ?? 0,
        sort: { order: query.order, dir: query.dir },
      },
      data: data.map(mapOrganisationCohortSummary),
    };
  }

  async function getOrganisationCohort(
    params: GetOrganisationCohortParams,
  ): Promise<GetOrganisationCohortResponse> {
    const { data, error } = await buildOrganisationCohortDetailQuery(
      client,
      params.organisationId,
      params.cohortId,
    );

    if (error) {
      throw createServiceError(
        error.code === 'PGRST116'
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message:
            error.code === 'PGRST116'
              ? 'Organisation cohort not found'
              : 'Unable to get organisation cohort',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    const learners = await Promise.all(
      data.memberships
        .filter((membership) => membership.role === OrganisationRole.Learner)
        .map(async (membership) => {
          const { data: authData, error: authError } =
            await client.auth.admin.getUserById(membership.user_id);
          if (authError) {
            throw createServiceError(HektorErrorCode.InternalServerError, {
              message: 'Unable to get organisation cohort',
              internalMessage: authError.message,
              cause: authError,
            });
          }
          return mapOrganisationMembershipUserSummary(
            membership,
            mapUserSummary(authData.user),
          );
        }),
    );

    return { data: mapOrganisationCohort(data, learners) };
  }

  async function listOrganisationGroups(
    params: ListOrganisationGroupsParams,
    query: ListOrganisationGroupsQuery,
  ): Promise<ListOrganisationGroupsResponse> {
    const { data, error, count } = await buildOrganisationGroupsQuery(
      client,
      params.organisationId,
      query,
    );

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list organisation groups',
        internalMessage: error.message,
        cause: error,
      });
    }

    return {
      context: {
        page: query.page,
        pageSize: query.pageSize,
        totalRecords: count ?? 0,
        sort: { order: query.order, dir: query.dir },
      },
      data: data.map(mapOrganisationGroupSummary),
    };
  }

  async function getOrganisationGroup(
    params: GetOrganisationGroupParams,
  ): Promise<GetOrganisationGroupResponse> {
    const { data, error } = await buildOrganisationGroupDetailQuery(
      client,
      params.organisationId,
      params.groupId,
    );

    if (error) {
      throw createServiceError(
        error.code === 'PGRST116'
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message:
            error.code === 'PGRST116'
              ? 'Organisation group not found'
              : 'Unable to get organisation group',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    const users = await Promise.all(
      data.userLinks.map(async ({ membership }) => {
        const { data: authData, error: authError } =
          await client.auth.admin.getUserById(membership.user_id);
        if (authError) {
          throw createServiceError(HektorErrorCode.InternalServerError, {
            message: 'Unable to get organisation group',
            internalMessage: authError.message,
            cause: authError,
          });
        }
        return mapOrganisationMembershipUserSummary(
          membership,
          mapUserSummary(authData.user),
        );
      }),
    );

    return { data: mapOrganisationGroup(data, users) };
  }

  async function listOrganisationUserProvisions(
    params: ListOrganisationUserProvisionsParams,
    query: ListOrganisationUserProvisionsQuery,
  ): Promise<ListOrganisationUserProvisionsResponse> {
    const { data, error } = await buildOrganisationUserProvisionsQuery(
      client,
      params.organisationId,
      { role: query.role, status: query.status },
    );

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list provisioned users',
        internalMessage: error.message,
        cause: error,
      });
    }

    const provisions = data
      .map(mapOrganisationUserProvision)
      .filter((item) =>
        includesQuery(
          [item.provisionedDisplayName, item.provisionedUserName],
          query.query,
        ),
      );
    const direction = query.dir === 'asc' ? 1 : -1;
    provisions.sort((left, right) => {
      const leftValue =
        query.order === 'role'
          ? left.provisionedRole
          : (left.provisionedDisplayName ?? left.provisionedUserName);
      const rightValue =
        query.order === 'role'
          ? right.provisionedRole
          : (right.provisionedDisplayName ?? right.provisionedUserName);
      return leftValue.localeCompare(rightValue) * direction;
    });

    return {
      context: {
        page: query.page,
        pageSize: query.pageSize,
        totalRecords: provisions.length,
        sort: { order: query.order, dir: query.dir },
      },
      data: paginate(provisions, query.page, query.pageSize),
    };
  }

  async function getOrganisationUserProvision(
    params: GetOrganisationUserProvisionParams,
  ): Promise<GetOrganisationUserProvisionResponse> {
    const { data, error } = await buildOrganisationUserProvisionDetailQuery(
      client,
      params.organisationId,
      params.provisionId,
    );

    if (error) {
      throw createServiceError(
        error.code === 'PGRST116'
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message:
            error.code === 'PGRST116'
              ? 'Provisioned user not found'
              : 'Unable to get provisioned user',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    let linkedUser;
    if (data.membership) {
      const { data: authData, error: authError } =
        await client.auth.admin.getUserById(data.membership.user_id);
      if (authError) {
        throw createServiceError(HektorErrorCode.InternalServerError, {
          message: 'Unable to get provisioned user',
          internalMessage: authError.message,
          cause: authError,
        });
      }
      linkedUser = mapUserSummary(authData.user);
    }

    return { data: mapOrganisationUserProvisionDetail(data, linkedUser) };
  }

  return {
    acceptOrganisationUserProvision,
    autoLinkOrganisationUserProvision,
    createOrganisation,
    createOrganisationContractPeriod,
    getOrganisationContractPeriod,
    getOrganisationCohort,
    getOrganisationGroup,
    getOrganisation,
    getOrganisationUserProvision,
    getProvisionAcceptance,
    listOrganisationCohorts,
    listOrganisationGroups,
    listOrganisationContractPeriods,
    listOrganisations,
    listOrganisationUserProvisions,
    listOrganisationUsers,
    transitionOrganisationUserProvision,
    updateOrganisation,
    updateOrganisationContractPeriod,
  };
}
