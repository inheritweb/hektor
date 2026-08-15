'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import type { Route } from 'next';

import { emailIdentityConfig } from '@hektor/config/identity';
import { Button, Input, buttonVariants } from '@hektor/ui/atoms';

import { createBrowserSupabaseClient } from '../../lib/supabase/client';

interface LoginScreenProps {
  next: string;
}

export function LoginScreen({ next }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googlePath = `/auth/google?next=${encodeURIComponent(next)}`;

  const requestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    setIsSubmitting(true);

    const client = createBrowserSupabaseClient();
    const { error: signInError } = await client.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setIsSubmitting(false);

    if (signInError) {
      setError('We could not send a sign-in code. Please try again.');
      return;
    }

    setCodeSent(true);
  };

  const verifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    setIsSubmitting(true);

    const client = createBrowserSupabaseClient();
    const { error: verificationError } = await client.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });

    if (verificationError) {
      setIsSubmitting(false);
      setError('That code is invalid or has expired. Request a new code.');
      return;
    }

    window.location.assign(next);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="w-full max-w-md bg-card p-10 shadow-sm">
        <p className="text-xs font-bold tracking-[0.24em] text-primary">
          HEKTOR
        </p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight">
          Welcome back.
        </h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          Sign in to your Hektor account with an email code or Google.
        </p>

        {codeSent ? (
          <form className="mt-8 space-y-4" onSubmit={verifyCode}>
            <div>
              <label className="text-sm font-semibold" htmlFor="code">
                Sign-in code
              </label>
              <Input
                autoComplete="one-time-code"
                className="mt-2"
                id="code"
                inputMode="numeric"
                maxLength={emailIdentityConfig.codeLength}
                onChange={(event) => setCode(event.target.value)}
                pattern={`[0-9]{${emailIdentityConfig.codeLength}}`}
                required
                value={code}
              />
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a six-digit code to {email}.
              </p>
            </div>
            <Button
              className="h-11 w-full"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Checking code…' : 'Continue'}
            </Button>
            <Button
              className="h-11 w-full"
              onClick={() => {
                setCode('');
                setCodeSent(false);
                setError(undefined);
              }}
              type="button"
              variant="ghost"
            >
              Use a different email
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={requestCode}>
            <div>
              <label className="text-sm font-semibold" htmlFor="email">
                Email address
              </label>
              <Input
                autoComplete="email"
                className="mt-2"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </div>
            <Button
              className="h-11 w-full"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Sending code…' : 'Continue with email'}
            </Button>
          </form>
        )}

        {error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="my-7 flex items-center gap-4 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <Link
          className={buttonVariants({
            className: 'h-11 w-full',
            variant: 'outline',
          })}
          href={googlePath as Route}
        >
          Continue with Google
        </Link>
      </section>
    </main>
  );
}
