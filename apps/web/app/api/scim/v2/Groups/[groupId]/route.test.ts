import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SCIM_GROUP_SCHEMA } from '@hektor/types';

const { authenticateMock, getGroupMock, serviceMock, synchronizeGroupMock } =
  vi.hoisted(() => ({
    authenticateMock: vi.fn(),
    getGroupMock: vi.fn(),
    serviceMock: vi.fn(),
    synchronizeGroupMock: vi.fn(),
  }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ privileged: true }),
}));

vi.mock('@hektor/services/scim', () => ({ createScimService: serviceMock }));

import { PATCH } from './route';

describe('PATCH /api/scim/v2/Groups/:groupId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({
      authenticate: authenticateMock,
      getGroup: getGroupMock,
      synchronizeGroup: synchronizeGroupMock,
    });
    authenticateMock.mockResolvedValue({ organisationId: 'organisation-1' });
    getGroupMock.mockResolvedValue(groupFixture());
    synchronizeGroupMock.mockImplementation(
      async (_context, input: object) => ({ ...groupFixture(), ...input }),
    );
  });

  it('accepts title-case provider operations and filtered member removal', async () => {
    const response = await PATCH(
      new Request('http://localhost/api/scim/v2/Groups/group-1', {
        body: JSON.stringify({
          Operations: [
            {
              op: 'Remove',
              path: 'members[value eq "11111111-1111-4111-8111-111111111111"]',
            },
          ],
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
        }),
        headers: { authorization: 'Bearer tenant-token' },
        method: 'PATCH',
      }),
      { params: Promise.resolve({ groupId: 'group-1' }) },
    );

    expect(response.status).toBe(200);
    expect(synchronizeGroupMock).toHaveBeenCalledWith(
      { organisationId: 'organisation-1' },
      expect.objectContaining({ members: [] }),
      'http://localhost/api/scim/v2',
      'group-1',
    );
  });
});

function groupFixture() {
  return {
    displayName: 'Clinical Year 1',
    id: 'group-1',
    members: [{ value: '11111111-1111-4111-8111-111111111111' }],
    meta: {
      created: '2026-08-30T00:00:00.000Z',
      lastModified: '2026-08-30T00:00:00.000Z',
      location: 'http://localhost/api/scim/v2/Groups/group-1',
      resourceType: 'Group',
    },
    schemas: [SCIM_GROUP_SCHEMA],
  };
}
