export default function HomePage() {
  return (
    <div className="space-y-16">
      <section>
        <p className="text-primary text-xs font-bold tracking-[0.24em]">
          HEKTOR
        </p>
        <h1 className="mt-4 max-w-[12ch] text-5xl leading-[0.9] font-bold tracking-[-0.06em] sm:text-7xl lg:text-8xl">
          The workspace is ready.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground">
          Next.js, Turborepo, Yarn, Tailwind, and local Supabase are running
          together.
        </p>
      </section>

      {Array.from({ length: 10 }, (_, index) => (
        <section
          className="grid gap-6 border-t border-border pt-10 md:grid-cols-[12rem_minmax(0,1fr)]"
          key={index}
        >
          <h2 className="text-xl font-semibold tracking-tight">
            Working area {index + 1}
          </h2>
          <div className="max-w-3xl space-y-5 text-base leading-7 text-muted-foreground">
            <p>
              This is representative long-form content for reviewing the paper
              layout. It creates enough vertical depth to exercise scrolling
              without adding application behavior or committing to final copy.
            </p>
            <p>
              The surrounding application shell should remain still while this
              paper surface moves independently. Spacing stays generous so the
              page remains light, calm, and easy to scan.
            </p>
          </div>
        </section>
      ))}
    </div>
  );
}
