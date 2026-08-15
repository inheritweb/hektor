import Link from 'next/link';
import type { Route } from 'next';

export default function LoginErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="w-full max-w-md bg-card p-10 shadow-sm">
        <p className="text-primary text-xs font-bold tracking-[0.24em]">
          HEKTOR
        </p>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          We couldn&apos;t sign you in.
        </h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          Please try Google sign-in again. If the problem continues, contact
          Hektor support.
        </p>
        <Link
          className="mt-8 inline-block font-semibold text-primary"
          href={'/login' as Route}
        >
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
