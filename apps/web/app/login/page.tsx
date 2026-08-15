import Link from 'next/link';
import type { Route } from 'next';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="w-full max-w-md bg-card p-10 shadow-sm">
        <p className="text-primary text-xs font-bold tracking-[0.24em]">
          HEKTOR
        </p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight">
          Welcome back.
        </h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          Sign in with Google to use your personal account or join your
          university.
        </p>
        <Link
          className="mt-10 flex min-h-12 items-center justify-center bg-primary px-6 font-semibold text-primary-foreground hover:opacity-90"
          href={'/auth/google' as Route}
        >
          Continue with Google
        </Link>
      </section>
    </main>
  );
}
