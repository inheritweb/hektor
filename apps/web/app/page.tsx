export default function HomePage() {
  return (
    <main className="grid min-h-screen content-center bg-[radial-gradient(circle_at_15%_15%,rgb(62_207_142_/_20%),transparent_35%)] px-8 py-16 sm:px-[8vw]">
      <p className="text-hektor-green text-xs font-bold tracking-[0.24em]">
        HEKTOR
      </p>
      <h1 className="mt-4 max-w-[12ch] text-5xl leading-[0.9] font-bold tracking-[-0.06em] sm:text-7xl lg:text-9xl">
        The workspace is ready.
      </h1>
      <p className="mt-8 max-w-2xl text-lg text-[#b8c2bb]">
        Next.js, Turborepo, Yarn, Tailwind, and local Supabase are running
        together.
      </p>
    </main>
  );
}
