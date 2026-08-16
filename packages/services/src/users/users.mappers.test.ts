import { describe, expect, it } from 'vitest';

import {
  PlatformRole,
  OrganisationRole,
  OrganisationStatus,
  OrganisationUserStatus,
} from '@hektor/types';
import type { User } from '@supabase/supabase-js';

import { mapCurrentUser } from './users.mappers';
import type { CurrentUserOrganisationsQueryResult } from './users.queries';

describe('user mappers', () => {
  it('combines Supabase identities with independent organisation memberships', () => {
    const user = {
      id: 'ab720a62-06df-408d-9e8c-0201ac69269a',
      email: 'alex@example.com',
      created_at: '2026-08-15T10:00:00.000Z',
      updated_at: '2026-08-15T11:00:00.000Z',
      user_metadata: { full_name: 'Alex Morgan' },
      app_metadata: { role: 'admin' },
      aud: 'authenticated',
      identities: [
        {
          id: '46e0d4f0-c6fd-456b-937c-b95997c93d0d',
          user_id: 'ab720a62-06df-408d-9e8c-0201ac69269a',
          identity_data: { email: 'alex@example.com' },
          identity_id: 'google-subject',
          provider: 'google',
          created_at: '2026-08-15T10:00:00.000Z',
          updated_at: '2026-08-15T10:00:00.000Z',
          last_sign_in_at: '2026-08-15T11:00:00.000Z',
        },
      ],
    } as User;
    const memberships = [
      {
        id: 'ecbfcbf1-ea33-47cd-a2a2-bbc87d21f8cd',
        role: 'tutor',
        status: 'active',
        organisation: {
          id: '6b14eb81-81f9-47e9-b55e-a78f6a4c4013',
          name: 'Northshire University',
          slug: 'northshire-university',
          status: 'active',
        },
      },
    ] satisfies CurrentUserOrganisationsQueryResult;

    expect(mapCurrentUser(user, memberships)).toEqual({
      id: user.id,
      displayName: 'Alex Morgan',
      platformRole: PlatformRole.Admin,
      email: 'alex@example.com',
      avatarUrl: undefined,
      identities: [
        {
          id: '46e0d4f0-c6fd-456b-937c-b95997c93d0d',
          provider: 'google',
          email: 'alex@example.com',
          createdAt: '2026-08-15T10:00:00.000Z',
          lastSignInAt: '2026-08-15T11:00:00.000Z',
        },
      ],
      memberships: [
        {
          id: 'ecbfcbf1-ea33-47cd-a2a2-bbc87d21f8cd',
          organisation: {
            id: '6b14eb81-81f9-47e9-b55e-a78f6a4c4013',
            name: 'Northshire University',
            slug: 'northshire-university',
            status: OrganisationStatus.Active,
          },
          role: OrganisationRole.Tutor,
          status: OrganisationUserStatus.Active,
        },
      ],
      createdAt: '2026-08-15T10:00:00.000Z',
      updatedAt: '2026-08-15T11:00:00.000Z',
    });
  });
});
