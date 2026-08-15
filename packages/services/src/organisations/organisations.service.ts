import type {
  GetOrganisationParams,
  GetOrganisationResponse,
  ListOrganisationsQuery,
  ListOrganisationsResponse,
} from '@hektor/types/contracts/organisations';
import { HektorErrorCode } from '@hektor/types/contracts';

import { createServiceError } from '../errors';
import type { DatabaseClient } from '../database';

import {
  mapOrganisation,
  mapOrganisationSummary,
} from './organisations.mappers';
import {
  buildOrganisationDetailQuery,
  buildOrganisationSummariesQuery,
} from './organisations.queries';

export async function listOrganisations(
  client: DatabaseClient,
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

export async function getOrganisation(
  client: DatabaseClient,
  params: GetOrganisationParams,
): Promise<GetOrganisationResponse> {
  const { data, error } = await buildOrganisationDetailQuery(
    client,
    params.organisationId,
  );

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

  return { data: mapOrganisation(data) };
}
