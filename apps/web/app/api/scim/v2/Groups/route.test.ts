import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SCIM_GROUP_SCHEMA, SCIM_LIST_RESPONSE_SCHEMA } from '@hektor/types';

const { authenticateMock, listGroupsMock, serviceMock, synchronizeGroupMock } =
  vi.hoisted(() => ({
    authenticateMock: vi.fn(),
    listGroupsMock: vi.fn(),
    serviceMock: vi.fn(),
    synchronizeGroupMock: vi.fn(),
  }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ privileged: true }),
}));

vi.mock('@hektor/services/scim', () => ({ createScimService: serviceMock }));

import { GET, POST } from './route';

describe('/api/scim/v2/Groups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({
      authenticate: authenticateMock,
      listGroups: listGroupsMock,
      synchronizeGroup: synchronizeGroupMock,
    });
    authenticateMock.mockResolvedValue({ organisationId: 'organisation-1' });
  });

  it('filters and paginates groups inside the token tenant', async () => {
    listGroupsMock.mockResolvedValue({
      Resources: [],
      itemsPerPage: 0,
      schemas: [SCIM_LIST_RESPONSE_SCHEMA],
      startIndex: 21,
      totalResults: 0,
    });
    const response = await GET(
      request(
        '/Groups?filter=displayName%20eq%20%22Clinical%20Year%201%22&startIndex=21&count=20',
      ),
    );

    expect(response.status).toBe(200);
    expect(listGroupsMock).toHaveBeenCalledWith(
      { organisationId: 'organisation-1' },
      expect.objectContaining({
        count: 20,
        displayName: 'Clinical Year 1',
        startIndex: 21,
      }),
      'http://localhost/api/scim/v2',
    );
  });

  it('returns invalidFilter for unsupported filters', async () => {
    const response = await GET(request('/Groups?filter=id%20eq%20%22x%22'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      scimType: 'invalidFilter',
      status: '400',
    });
  });

  it('creates a group and returns its location', async () => {
    synchronizeGroupMock.mockResolvedValue(groupFixture());
    const response = await POST(
      request('/Groups', {
        body: JSON.stringify({
          displayName: 'Clinical Year 1',
          schemas: [SCIM_GROUP_SCHEMA],
        }),
        method: 'POST',
      }),
    );

    expect(response.status).toBe(201);
    expect(response.headers.get('location')).toContain('/Groups/group-1');
  });

  it('returns a SCIM syntax error for malformed JSON', async () => {
    const response = await POST(
      request('/Groups', { body: '{', method: 'POST' }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      scimType: 'invalidSyntax',
      status: '400',
    });
  });
});

function request(path: string, init?: RequestInit) {
  return new Request(`http://localhost/api/scim/v2${path}`, {
    ...init,
    headers: { authorization: 'Bearer tenant-token', ...init?.headers },
  });
}

function groupFixture() {
  return {
    displayName: 'Clinical Year 1',
    id: 'group-1',
    members: [],
    meta: {
      created: '2026-08-30T00:00:00.000Z',
      lastModified: '2026-08-30T00:00:00.000Z',
      location: 'http://localhost/api/scim/v2/Groups/group-1',
      resourceType: 'Group',
    },
    schemas: [SCIM_GROUP_SCHEMA],
  };
}
