import type {
  GetOrganisationParams,
  GetOrganisationResponse,
  GetOrganisationCohortParams,
  GetOrganisationCohortResponse,
  ListOrganisationContractPeriodsParams,
  ListOrganisationContractPeriodsQuery,
  ListOrganisationContractPeriodsResponse,
  ListOrganisationCohortsParams,
  ListOrganisationCohortsQuery,
  ListOrganisationCohortsResponse,
  ListOrganisationUserProvisionsParams,
  ListOrganisationUserProvisionsQuery,
  ListOrganisationUserProvisionsResponse,
  ListOrganisationUsersParams,
  ListOrganisationUsersQuery,
  ListOrganisationUsersResponse,
  ListOrganisationsQuery,
  ListOrganisationsResponse,
} from '@hektor/types/contracts/organisations';
import { HektorErrorCode } from '@hektor/types/contracts';
import {
  OrganisationRole,
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
  mapOrganisationMembershipUserSummary,
  mapOrganisationSummary,
  mapOrganisationUserProvision,
} from './organisations.mappers';
import {
  buildOrganisationDetailQuery,
  buildOrganisationCohortDetailQuery,
  buildOrganisationContractPeriodsQuery,
  buildOrganisationCohortsQuery,
  buildOrganisationMembershipsCountQuery,
  buildOrganisationMembershipsQuery,
  buildOrganisationSummariesQuery,
  buildOrganisationUserProvisionsCountQuery,
  buildOrganisationUserProvisionsQuery,
} from './organisations.queries';

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

  return {
    getOrganisationCohort,
    getOrganisation,
    listOrganisationCohorts,
    listOrganisationContractPeriods,
    listOrganisations,
    listOrganisationUserProvisions,
    listOrganisationUsers,
  };
}
