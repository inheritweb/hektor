import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { UserStatus } from '@hektor/types';

import {
  createIntegrationAuthClient,
  createIntegrationDatabaseClient,
} from '../testing/local-supabase';
import { createUsersService } from './users.service';

const adminClient = createIntegrationDatabaseClient();

const authClient = createIntegrationAuthClient();

const password = `Hektor-${randomUUID()}!`;

const email = `suspension-${randomUUID()}@example.com`;

let userId = '';

describe('user suspension lifecycle', () => {
  beforeAll(async () => {
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: 'Session', last_name: 'Tester' },
    });
    if (error) throw error;
    userId = data.user.id;
  });

  afterAll(async () => {
    if (userId) await adminClient.auth.admin.deleteUser(userId);
  });

  it('blocks login, revokes refresh sessions, and permits login after reactivation', async () => {
    const signedIn = await authClient.auth.signInWithPassword({
      email,
      password,
    });
    expect(signedIn.error).toBeNull();
    expect(signedIn.data.session).not.toBeNull();
    const refreshToken = signedIn.data.session!.refresh_token;

    const service = createUsersService(adminClient);
    const current = await service.getUser({ userId });
    await service.updateUser(
      { userId },
      {
        expectedUpdatedAt: current.data.updatedAt,
        firstName: 'Session',
        lastName: 'Tester',
        status: UserStatus.Suspended,
      },
      randomUUID(),
    );

    const freshLogin =
      await createIntegrationAuthClient().auth.signInWithPassword({
        email,
        password,
      });
    expect(freshLogin.error).not.toBeNull();

    const refresh = await createIntegrationAuthClient().auth.refreshSession({
      refresh_token: refreshToken,
    });
    expect(refresh.error).not.toBeNull();
    expect(refresh.data.session).toBeNull();

    const suspended = await service.getUser({ userId });
    await service.updateUser(
      { userId },
      {
        expectedUpdatedAt: suspended.data.updatedAt,
        firstName: 'Session',
        lastName: 'Tester',
        status: UserStatus.Active,
      },
      randomUUID(),
    );

    const reactivatedLogin =
      await createIntegrationAuthClient().auth.signInWithPassword({
        email,
        password,
      });
    expect(reactivatedLogin.error).toBeNull();
    expect(reactivatedLogin.data.user?.id).toBe(userId);
  }, 30_000);
});
