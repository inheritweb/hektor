import type {
  GetOrganisationParams,
  GetOrganisationResponse,
  ListOrganisationsQuery,
  ListOrganisationsResponse,
  ListOrganisationUsersParams,
  ListOrganisationUsersQuery,
  ListOrganisationUsersResponse,
} from '@hektor/types/contracts/organisations';
import { HektorErrorCode } from '@hektor/types/contracts';
import { OrganisationRole, OrganisationUserStatus } from '@hektor/types';

import { createServiceError } from '../errors';
import type { DatabaseClient } from '../database';

import {
  mapOrganisation,
  mapOrganisationSummary,
  mapOrganisationUserSummary,
} from './organisations.mappers';
import {
  buildOrganisationDetailQuery,
  buildOrganisationSummariesQuery,
  buildOrganisationUsersCountQuery,
  buildOrganisationUsersQuery,
} from './organisations.queries';

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
      total,
      linked,
      learners,
      tutors,
      organisationAdmins,
      suspended,
    ] = await Promise.all([
      buildOrganisationDetailQuery(client, params.organisationId),
      buildOrganisationUsersCountQuery(client, params.organisationId),
      buildOrganisationUsersCountQuery(client, params.organisationId, {
        linked: true,
      }),
      buildOrganisationUsersCountQuery(client, params.organisationId, {
        role: OrganisationRole.Learner,
      }),
      buildOrganisationUsersCountQuery(client, params.organisationId, {
        role: OrganisationRole.Tutor,
      }),
      buildOrganisationUsersCountQuery(client, params.organisationId, {
        role: OrganisationRole.OrganisationAdmin,
      }),
      buildOrganisationUsersCountQuery(client, params.organisationId, {
        status: OrganisationUserStatus.Suspended,
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

    const countError = [
      total,
      linked,
      learners,
      tutors,
      organisationAdmins,
      suspended,
    ].find((result) => result.error)?.error;

    if (countError) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to get organisation',
        internalMessage: countError.message,
        cause: countError,
      });
    }

    const totalUsers = total.count ?? 0;
    const linkedUsers = linked.count ?? 0;

    return {
      data: mapOrganisation(data, {
        total: totalUsers,
        linked: linkedUsers,
        awaitingAccountLinking: Math.max(totalUsers - linkedUsers, 0),
        learners: learners.count ?? 0,
        tutors: tutors.count ?? 0,
        organisationAdmins: organisationAdmins.count ?? 0,
        suspended: suspended.count ?? 0,
      }),
    };
  }

  async function listOrganisationUsers(
    params: ListOrganisationUsersParams,
    query: ListOrganisationUsersQuery,
  ): Promise<ListOrganisationUsersResponse> {
    const { data, error, count } = await buildOrganisationUsersQuery(
      client,
      params.organisationId,
      query,
    );

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list organisation users',
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
      data: data.map(mapOrganisationUserSummary),
    };
  }

  return { getOrganisation, listOrganisations, listOrganisationUsers };
}
