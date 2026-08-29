import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HEKTOR_ORGANISATION_HEADER } from '@hektor/api-client';
import {
  OrganisationProvisionImportAction,
  OrganisationRole,
} from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { fromMock, getUserMock, previewMock, rpcMock, serviceMock } = vi.hoisted(
  () => ({
    fromMock: vi.fn(),
    getUserMock: vi.fn(),
    previewMock: vi.fn(),
    rpcMock: vi.fn(),
    serviceMock: vi.fn(),
  }),
);

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: getUserMock },
    from: fromMock,
    rpc: rpcMock,
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ privileged: true }),
}));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationsService: serviceMock,
}));

import { POST } from './route';

describe('POST /api/organisation/user-provisions/import/preview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({
      previewOrganisationProvisionImport: previewMock,
    });
    getUserMock.mockResolvedValue({
      data: { user: { id: 'actor-user', app_metadata: {} } },
      error: null,
    });
    rpcMock.mockResolvedValue({ data: true, error: null });
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { role: OrganisationRole.OrganisationAdmin },
      error: null,
    });
    const thirdEq = vi.fn().mockReturnValue({ maybeSingle });
    const secondEq = vi.fn().mockReturnValue({ eq: thirdEq });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: firstEq }),
    });
  });

  it('hides whether ready rows create provisions or link accounts', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const rows = [row(2, 'new@example.com'), row(3, 'known@example.com')];
    previewMock.mockResolvedValue({
      data: {
        rows: [
          {
            ...rows[0],
            action: OrganisationProvisionImportAction.CreateProvision,
          },
          {
            ...rows[1],
            action: OrganisationProvisionImportAction.LinkExistingUser,
          },
        ],
        summary: { errors: 0, ready: 2, unchanged: 0 },
      },
    });

    const response = await callApiEndpoint(POST, {
      body: { rows },
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
      method: 'POST',
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.rows).toEqual([
      expect.objectContaining({ action: 'ready', message: 'Ready to process' }),
      expect.objectContaining({ action: 'ready', message: 'Ready to process' }),
    ]);
    expect(JSON.stringify(payload)).not.toContain('link_existing_user');
    expect(previewMock).toHaveBeenCalledWith({ organisationId }, { rows });
  });
});

function row(rowNumber: number, email: string) {
  return {
    email,
    firstName: 'Test',
    lastName: 'User',
    role: OrganisationRole.Learner,
    rowNumber,
  };
}
