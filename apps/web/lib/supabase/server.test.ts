import { beforeEach, describe, expect, it, vi } from 'vitest';

const { cookieSetMock, createServerClientMock } = vi.hoisted(() => ({
  cookieSetMock: vi.fn(),
  createServerClientMock: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({ getAll: () => [], set: cookieSetMock }),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: createServerClientMock,
}));

vi.mock('../../env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  },
}));

import { createServerSupabaseClient } from './server';

describe('createServerSupabaseClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createServerClientMock.mockReturnValue({});
  });

  it('does not attempt cookie writes from a Server Component client', async () => {
    await createServerSupabaseClient();
    const options = createServerClientMock.mock.calls[0]![2];

    options.cookies.setAll([{ name: 'session', value: 'value', options: {} }]);

    expect(cookieSetMock).not.toHaveBeenCalled();
  });

  it('allows cookie writes when explicitly created inside a Route Handler', async () => {
    await createServerSupabaseClient({ allowCookieWrites: true });
    const options = createServerClientMock.mock.calls[0]![2];

    options.cookies.setAll([{ name: 'session', value: 'value', options: {} }]);

    expect(cookieSetMock).toHaveBeenCalledWith('session', 'value', {});
  });
});
