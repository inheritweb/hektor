import { NavigationLink } from '../../context';

export interface DashboardPod {
  description: string;
  href: string;
  label: string;
  value: number;
}

export interface DashboardPageProps {
  error?: string;
  eyebrow: string;
  loading?: boolean;
  pods: readonly DashboardPod[];
  title: string;
}

export function DashboardPage({
  error,
  eyebrow,
  loading,
  pods,
  title,
}: DashboardPageProps) {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">{title}</h1>
      </header>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: Math.max(pods.length, 2) }, (_, index) => (
                <div
                  aria-label="Loading dashboard statistic"
                  className="h-40 animate-pulse bg-accent/40"
                  key={index}
                />
              ))
            : pods.map((pod) => (
                <NavigationLink
                  className="group block bg-paper p-6 shadow-[0_0_18px_-10px_rgb(0_0_0/0.25)] transition hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href={pod.href}
                  key={pod.href}
                >
                  <p className="text-sm font-semibold text-primary">
                    {pod.label}
                  </p>
                  <p className="mt-4 text-5xl font-bold tracking-tight">
                    {pod.value.toLocaleString('en-GB')}
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {pod.description}
                  </p>
                </NavigationLink>
              ))}
        </div>
      )}
    </div>
  );
}
