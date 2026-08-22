import { Logo } from '../../molecules';

export interface InstitutionalAccessUnavailablePageProps {
  institutionName: string;
}

export function InstitutionalAccessUnavailablePage({
  institutionName,
}: InstitutionalAccessUnavailablePageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-foreground">
      <Logo className="mb-8" size="lg" />
      <section className="w-full max-w-md bg-card p-8 shadow-[0_0_24px_-12px_rgb(0_0_0/0.18)] sm:p-10">
        <p className="text-sm font-semibold text-primary">
          Institutional access
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Your Hektor access isn&apos;t ready yet.
        </h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          We recognised {institutionName}, but it hasn&apos;t reserved a Hektor
          seat for your account.
        </p>
        <p className="mt-4 leading-7 text-muted-foreground">
          Please contact your institutional administrator and ask them to add
          you to Hektor. No Hektor account has been created.
        </p>
      </section>
    </main>
  );
}
