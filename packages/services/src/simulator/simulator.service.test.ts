import { describe, expect, it, vi } from 'vitest';

import type { DatabaseClient } from '../database';
import { createSimulatorService } from './simulator.service';

describe('simulator service', () => {
  it('does not create a user or session for an unreserved SSO identity', async () => {
    const generateLink = vi.fn();
    const verifyOtp = vi.fn();
    const adminClient = clientWithProvision(null, { generateLink });
    const service = createSimulatorService({
      adminClient,
      sessionClient: { auth: { verifyOtp } } as unknown as DatabaseClient,
    });

    const result = await service.startScenario({
      identityEmail: 'nora.hughes@northbridge.example',
      institutionName: 'Northbridge University',
      mode: 'sso',
    });

    expect(result).toEqual({
      destination: 'web',
      path: '/auth/institutional/access-unavailable?institution=Northbridge%20University',
    });
    expect(generateLink).not.toHaveBeenCalled();
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it('returns a simulator callback for a tokenised invitation', async () => {
    const generateLink = vi.fn().mockResolvedValue({
      data: {
        properties: {
          hashed_token: 'hashed-invitation-token',
          verification_type: 'magiclink',
        },
      },
      error: null,
    });
    const verifyOtp = vi.fn();
    const service = createSimulatorService({
      adminClient: clientWithProvision(
        {
          id: '81a74c23-9202-44f1-86ec-fb92da500735',
          provisioned_user_name: 'harvey.reid@northbridge.example',
          status: 'pending',
        },
        { generateLink },
      ),
      sessionClient: { auth: { verifyOtp } } as unknown as DatabaseClient,
    });

    const result = await service.startScenario({
      identityEmail: 'harvey.reid@northbridge.example',
      institutionName: 'Northbridge University',
      mode: 'invitation',
    });

    expect(result.destination).toBe('simulator');
    expect(result.path).toContain('/api/session?');
    expect(result.path).toContain('token_hash=hashed-invitation-token');
    expect(verifyOtp).not.toHaveBeenCalled();
  });
});

function clientWithProvision(
  provision: unknown,
  authAdmin: { generateLink: ReturnType<typeof vi.fn> },
) {
  const query = {
    eq: vi.fn(),
    in: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data: provision, error: null }),
    select: vi.fn(),
  };
  query.eq.mockReturnValue(query);
  query.in.mockReturnValue(query);
  query.select.mockReturnValue(query);

  return {
    auth: { admin: authAdmin },
    from: vi.fn().mockReturnValue(query),
  } as unknown as DatabaseClient;
}
