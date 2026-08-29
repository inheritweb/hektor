import { describe, expect, it, vi } from 'vitest';

import type { DatabaseClient } from '../database';

import { createStatisticsService } from './statistics.service';

describe('createStatisticsService', () => {
  it('counts platform users and organisations', async () => {
    const client = {
      auth: {
        admin: {
          listUsers: vi.fn().mockResolvedValue({
            data: { total: 53, users: [{}] },
            error: null,
          }),
        },
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ count: 4, error: null }),
      }),
    } as unknown as DatabaseClient;

    await expect(
      createStatisticsService(client).getPlatformStatistics(),
    ).resolves.toEqual({ organisationCount: 4, userCount: 53 });
  });

  it('applies the organisation boundary to every tenant count', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const counts = new Map([
      ['organisation_users', 18],
      ['organisation_cohorts', 3],
      ['organisation_groups', 7],
      ['organisation_user_provisions', 5],
    ]);
    const eqMocks: ReturnType<typeof vi.fn>[] = [];
    const client = {
      from: vi.fn((table: string) => ({
        select: vi.fn().mockReturnValue({
          eq: (() => {
            const eq = vi
              .fn()
              .mockResolvedValue({ count: counts.get(table), error: null });
            eqMocks.push(eq);
            return eq;
          })(),
        }),
      })),
    } as unknown as DatabaseClient;

    await expect(
      createStatisticsService(client).getOrganisationStatistics(organisationId),
    ).resolves.toEqual({
      cohortCount: 3,
      groupCount: 7,
      provisionCount: 5,
      userCount: 18,
    });
    for (const eq of eqMocks) {
      expect(eq).toHaveBeenCalledWith('organisation_id', organisationId);
    }
  });
});
