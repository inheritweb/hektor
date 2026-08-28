import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { OrganisationRole } from '@hektor/types';
import { defineContract, hektorResponseSchema } from '@hektor/types/contracts';
import { HealthStatus } from '@hektor/types/system';
import { getHealthCheckContract } from '@hektor/types/contracts/system';

import { registerApiMethod } from './api-method';
import { Client } from './client';

describe('registerApiMethod', () => {
  it('builds and validates a request from its contract', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ data: { status: HealthStatus.Ok } }));
    const client = new Client({
      baseUrl: 'https://hektor.test',
      fetch: fetcher,
    });
    const getHealthCheck = registerApiMethod(getHealthCheckContract);

    await expect(getHealthCheck(client)).resolves.toEqual({
      data: { status: HealthStatus.Ok },
    });
    expect(fetcher).toHaveBeenCalledWith(
      'https://hektor.test/api/health-check',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });

  it('attaches the selected organisation to tenant contracts', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ data: 'allowed' }));
    const client = new Client({
      fetch: fetcher,
      getOrganisationId: () => '3492a499-a216-4a30-8e3c-2c021d99d04f',
    });
    const method = registerApiMethod(
      defineContract({
        method: 'GET',
        path: '/api/tenant-example',
        access: {
          type: 'tenant',
          roles: [OrganisationRole.OrganisationAdmin],
        },
        output: hektorResponseSchema(z.string()),
      }),
    );

    await method(client);

    expect(fetcher).toHaveBeenCalledWith(
      '/api/tenant-example',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Hektor-Organisation-Id': '3492a499-a216-4a30-8e3c-2c021d99d04f',
        }),
      }),
    );
  });
});
