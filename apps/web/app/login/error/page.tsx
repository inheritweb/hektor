import Link from 'next/link';
import type { Route } from 'next';

import { UnauthenticatedTemplate } from '@hektor/ui/templates';

export default function LoginErrorPage() {
  return (
    <UnauthenticatedTemplate>
      <h1 className="text-3xl font-bold tracking-tight">
        We couldn&apos;t sign you in.
      </h1>
      <p className="mt-4 leading-7 text-muted-foreground">
        Please request another email code or try Google again. If the problem
        continues, contact Hektor support.
      </p>
      <Link
        className="mt-8 inline-block font-semibold text-primary"
        href={'/login' as Route}
      >
        Return to sign in
      </Link>
    </UnauthenticatedTemplate>
  );
}
