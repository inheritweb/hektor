import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { signInWithOtpMock, verifyOtpMock } = vi.hoisted(() => ({
  signInWithOtpMock: vi.fn(),
  verifyOtpMock: vi.fn(),
}));

vi.mock('../../lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    auth: {
      signInWithOtp: signInWithOtpMock,
      verifyOtp: verifyOtpMock,
    },
  }),
}));

import { LoginScreen } from './LoginScreen';

afterEach(cleanup);

describe('LoginScreen', () => {
  beforeEach(() => {
    signInWithOtpMock.mockReset();
    verifyOtpMock.mockReset();
  });

  it('requests a passwordless email code for a new or existing user', async () => {
    const user = userEvent.setup();
    signInWithOtpMock.mockResolvedValue({ error: null });
    render(createElement(LoginScreen, { next: '/' }));

    await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
    await user.click(
      screen.getByRole('button', { name: 'Continue with email' }),
    );

    expect(signInWithOtpMock).toHaveBeenCalledWith({
      email: 'alex@example.com',
      options: { shouldCreateUser: true },
    });
    expect(screen.getByLabelText('Sign-in code')).toBeTruthy();
  });

  it('verifies the email code without exposing provider errors', async () => {
    const user = userEvent.setup();
    signInWithOtpMock.mockResolvedValue({ error: null });
    verifyOtpMock.mockResolvedValue({ error: new Error('Provider detail') });
    render(createElement(LoginScreen, { next: '/' }));

    await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
    await user.click(
      screen.getByRole('button', { name: 'Continue with email' }),
    );
    await user.type(screen.getByLabelText('Sign-in code'), '123456');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(verifyOtpMock).toHaveBeenCalledWith({
      email: 'alex@example.com',
      token: '123456',
      type: 'email',
    });
    expect(screen.getByRole('alert').textContent).toContain(
      'invalid or has expired',
    );
  });

  it('preserves the allowed destination for Google sign-in', () => {
    render(createElement(LoginScreen, { next: '/' }));

    expect(
      screen
        .getByRole('link', { name: 'Continue with Google' })
        .getAttribute('href'),
    ).toBe('/auth/google?next=%2F');
  });
});
