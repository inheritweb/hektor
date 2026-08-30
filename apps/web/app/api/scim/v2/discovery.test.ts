import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authenticateMock, serviceMock } = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  serviceMock: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ privileged: true }),
}));

vi.mock('@hektor/services/scim', () => ({ createScimService: serviceMock }));

import { GET as getResourceTypes } from './ResourceTypes/route';
import { GET as getSchemas } from './Schemas/route';
import { GET as getServiceProviderConfig } from './ServiceProviderConfig/route';

describe('SCIM discovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({ authenticate: authenticateMock });
    authenticateMock.mockResolvedValue({ organisationId: 'organisation-1' });
  });

  it.each([
    ['ServiceProviderConfig', getServiceProviderConfig],
    ['ResourceTypes', getResourceTypes],
    ['Schemas', getSchemas],
  ])('serves authenticated %s metadata', async (path, handler) => {
    const response = await handler(
      new Request(`http://localhost/api/scim/v2/${path}`, {
        headers: { authorization: 'Bearer tenant-token' },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain(
      'application/scim+json',
    );
    expect(authenticateMock).toHaveBeenCalledWith('tenant-token');
  });
});
