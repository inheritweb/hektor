import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  OrganisationRole,
  OrganisationUserStatus,
  PlatformRole,
} from '@hektor/types';
import { callApiEndpoint } from '@/tests/api/api-test-client';

const {
  createServiceMock,
  getMembershipMock,
  getUserMock,
  updateMembershipMock,
} = vi.hoisted(() => ({
  createServiceMock: vi.fn(),
  getMembershipMock: vi.fn(),
  getUserMock: vi.fn(),
  updateMembershipMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: getUserMock } }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ auth: { admin: {} } }),
}));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationsService: createServiceMock,
}));

import { GET, PATCH } from './route';

const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';

const membershipId = '03d946de-8938-46d8-93a4-e3917df0928e';

const membership = {
  id: membershipId,
  organisation: {
    id: organisationId,
    name: 'Northbridge',
    slug: 'northbridge',
    status: 'active',
  },
  role: OrganisationRole.Tutor,
  status: OrganisationUserStatus.Active,
  user: {
    id: '938b99c0-5355-4dd2-9358-c8fbb99e3f49',
    displayName: 'Isla Phillips',
    email: 'isla@example.edu',
  },
  groups: [],
  createdAt: '2026-08-23T10:00:00.000Z',
  updatedAt: '2026-08-23T10:00:00.000Z',
};

describe('/api/admin/organisations/:organisationId/users/:membershipId', () => {
  beforeEach(() => {
    createServiceMock.mockReturnValue({
      getOrganisationMembership: getMembershipMock,
      updateOrganisationMembership: updateMembershipMock,
    });
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    getMembershipMock.mockReset();
    updateMembershipMock.mockReset();
  });

  it('gets a contextual membership for a platform admin', async () => {
    getMembershipMock.mockResolvedValue({ data: membership });
    const response = await callApiEndpoint(GET, {
      method: 'GET',
      path: `/api/admin/organisations/${organisationId}/users/${membershipId}`,
      params: { membershipId, organisationId },
    });
    expect(response.status).toBe(200);
    expect(getMembershipMock).toHaveBeenCalledWith({
      membershipId,
      organisationId,
    });
  });

  it('updates a contextual membership for a platform admin', async () => {
    const body = {
      expectedUpdatedAt: membership.updatedAt,
      role: OrganisationRole.Learner,
      status: OrganisationUserStatus.Active,
    };
    updateMembershipMock.mockResolvedValue({
      data: { ...membership, role: body.role },
    });
    const response = await callApiEndpoint(PATCH, {
      body,
      method: 'PATCH',
      path: `/api/admin/organisations/${organisationId}/users/${membershipId}`,
      params: { membershipId, organisationId },
    });
    expect(response.status).toBe(200);
    expect(updateMembershipMock).toHaveBeenCalledWith(
      { membershipId, organisationId },
      body,
    );
  });
});
