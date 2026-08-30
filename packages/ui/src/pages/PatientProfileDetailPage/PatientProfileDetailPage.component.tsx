import {
  LuHeartPulse,
  LuLanguages,
  LuPill,
  LuTriangleAlert,
} from 'react-icons/lu';

export interface PatientProfileDetailViewModel {
  displayName: string;
  dateOfBirth: string;
  versionNumber: number;
  versionState: string;
  synopsis: string;
  document: {
    communication: {
      languages: readonly { language: { display: string } }[];
      accessibilityNeeds: readonly {
        id: string;
        summary: string;
        details?: string;
      }[];
    };
    background: readonly { id: string; summary: string; details?: string }[];
    problems: readonly {
      id: string;
      problem: { display: string };
      details?: string;
    }[];
    allergies: readonly {
      id: string;
      substance: { display: string };
      reactions: readonly string[];
    }[];
    baselineMedications: readonly {
      id: string;
      medication: { display: string };
      dose?: string;
      frequency?: string;
    }[];
    clinicalRecord?: {
      facts: readonly {
        id: string;
        category: string;
        summary: string;
        details?: string;
      }[];
    };
  };
}

export function PatientProfileDetailPage({
  profile,
}: {
  profile: PatientProfileDetailViewModel;
}) {
  const { document } = profile;
  return (
    <div className="space-y-10">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-primary">
            Synthetic patient
          </p>
          <span className="bg-accent/40 px-2 py-1 text-xs font-semibold capitalize">
            {profile.versionState === 'draft'
              ? 'Draft preview'
              : profile.versionState.replaceAll('_', ' ')}
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {profile.displayName}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Born{' '}
          {new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(
            new Date(`${profile.dateOfBirth}T00:00:00Z`),
          )}{' '}
          · Version {profile.versionNumber}
        </p>
        <p className="mt-5 max-w-4xl text-base leading-7">{profile.synopsis}</p>
      </header>

      {profile.versionState === 'draft' ? (
        <aside className="flex gap-3 border-l-4 border-primary bg-accent/20 p-4 text-sm">
          <LuTriangleAlert
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0"
          />
          <p>
            This is an internal teaching preview. It must not be used in a live
            learning experience until clinical review is complete.
          </p>
        </aside>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="problems-heading">
          <h2
            className="flex items-center gap-2 text-xl font-bold"
            id="problems-heading"
          >
            <LuHeartPulse aria-hidden="true" className="text-primary" />
            Problems and allergies
          </h2>
          <div className="mt-4 space-y-4">
            {document.problems.map((item) => (
              <article key={item.id}>
                <h3 className="font-semibold">{item.problem.display}</h3>
                {item.details ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.details}
                  </p>
                ) : null}
              </article>
            ))}
            {document.allergies.map((item) => (
              <article key={item.id}>
                <h3 className="font-semibold">
                  Allergy: {item.substance.display}
                </h3>
                {item.reactions.length ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reactions: {item.reactions.join(', ')}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="medications-heading">
          <h2
            className="flex items-center gap-2 text-xl font-bold"
            id="medications-heading"
          >
            <LuPill aria-hidden="true" className="text-primary" />
            Baseline medications
          </h2>
          <div className="mt-4 space-y-4">
            {document.baselineMedications.length ? (
              document.baselineMedications.map((item) => (
                <article key={item.id}>
                  <h3 className="font-semibold">{item.medication.display}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[item.dose, item.frequency].filter(Boolean).join(' · ')}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No baseline medications recorded.
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="communication-heading">
          <h2
            className="flex items-center gap-2 text-xl font-bold"
            id="communication-heading"
          >
            <LuLanguages aria-hidden="true" className="text-primary" />
            Communication
          </h2>
          <p className="mt-4 text-sm">
            Languages:{' '}
            {document.communication.languages
              .map(({ language }) => language.display)
              .join(', ') || 'None recorded'}
          </p>
          {document.communication.accessibilityNeeds.map((need) => (
            <article className="mt-3" key={need.id}>
              <h3 className="font-semibold">{need.summary}</h3>
              {need.details ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {need.details}
                </p>
              ) : null}
            </article>
          ))}
        </section>

        <section aria-labelledby="background-heading">
          <h2 className="text-xl font-bold" id="background-heading">
            Patient background
          </h2>
          <div className="mt-4 space-y-4">
            {document.background.map((item) => (
              <article key={item.id}>
                <h3 className="font-semibold">{item.summary}</h3>
                {item.details ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.details}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="clinical-record-heading">
          <h2 className="text-xl font-bold" id="clinical-record-heading">
            Clinical record
          </h2>
          {document.clinicalRecord?.facts.length ? (
            <div className="mt-4 space-y-4">
              {document.clinicalRecord.facts.map((fact) => (
                <article key={fact.id}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {fact.category.replaceAll('_', ' ')}
                  </p>
                  <h3 className="mt-1 font-semibold">{fact.summary}</h3>
                  {fact.details ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {fact.details}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No additional clinical-record facts are recorded.
            </p>
          )}
        </section>
      </div>

      <section aria-labelledby="patient-document-heading">
        <h2 className="text-xl font-bold" id="patient-document-heading">
          Patient document
        </h2>
        <pre className="mt-4 max-h-[36rem] overflow-auto bg-accent/20 p-4 text-xs leading-5 text-foreground">
          <code>{JSON.stringify(document, null, 2)}</code>
        </pre>
      </section>
    </div>
  );
}
