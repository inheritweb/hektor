import { describe, expect, it, vi } from 'vitest';

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
});
