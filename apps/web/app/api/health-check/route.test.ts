import { describe, it } from 'vitest';

import {
  callApiEndpoint,
  expectApiResponse,
} from '@/tests/api/api-test-client';

import { GET } from './route';

describe('GET /api/health-check', () => {
  it('returns the system health in the standard response envelope', async () => {
    const response = await callApiEndpoint(GET, {
      path: '/api/health-check',
    });

    await expectApiResponse(response, { status: 'ok' });
  });
});
