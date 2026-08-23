import { Logo } from '../../molecules';

export function InvitationUnavailablePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-foreground">
      <Logo className="mb-8" size="lg" />
      <section className="w-full max-w-md bg-card p-8 shadow-[0_0_24px_-12px_rgb(0_0_0/0.18)] sm:p-10">
        <p className="text-sm font-semibold text-primary">
          Organisation invitation
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          This invitation is no longer available.
        </h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          It may have expired, already been used, or been replaced by a newer
          invitation. Please ask your organisation administrator to send another
          one.
        </p>
      </section>
    </main>
  );
}
