import { HektorErrorCode } from '@hektor/types/contracts';
import type {
  OrganisationStatistics,
  PlatformStatistics,
} from '@hektor/types/statistics';

import type { DatabaseClient } from '../database';
import { createServiceError } from '../errors';

export function createStatisticsService(client: DatabaseClient) {
  async function getPlatformStatistics(): Promise<PlatformStatistics> {
    const [organisations, users] = await Promise.all([
      client.from('organisations').select('id', { count: 'exact', head: true }),
      client.auth.admin.listUsers({ page: 1, perPage: 1 }),
    ]);

    if (organisations.error || users.error) {
      const error = organisations.error ?? users.error;
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to load platform statistics',
        internalMessage: error?.message,
        cause: error,
      });
    }

    return {
      organisationCount: organisations.count ?? 0,
      userCount: users.data.total || users.data.users.length,
    };
  }

  async function getOrganisationStatistics(
    organisationId: string,
  ): Promise<OrganisationStatistics> {
    const [users, provisions, cohorts, groups] = await Promise.all([
      countOrganisationRecords('organisation_users', organisationId),
      countOrganisationRecords('organisation_user_provisions', organisationId),
      countOrganisationRecords('organisation_cohorts', organisationId),
      countOrganisationRecords('organisation_groups', organisationId),
    ]);

    return {
      cohortCount: cohorts,
      groupCount: groups,
      provisionCount: provisions,
      userCount: users,
    };
  }

  async function countOrganisationRecords(
    table:
      | 'organisation_cohorts'
      | 'organisation_groups'
      | 'organisation_user_provisions'
      | 'organisation_users',
    organisationId: string,
  ) {
    const { count, error } = await client
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('organisation_id', organisationId);

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to load organisation statistics',
        internalMessage: error.message,
        cause: error,
      });
    }

    return count ?? 0;
  }

  return { getOrganisationStatistics, getPlatformStatistics };
}
