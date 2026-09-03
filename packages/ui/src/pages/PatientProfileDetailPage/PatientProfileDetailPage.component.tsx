'use client';

import { useState } from 'react';
import {
  LuHeartPulse,
  LuHistory,
  LuLanguages,
  LuPill,
  LuTriangleAlert,
} from 'react-icons/lu';

import {
  buttonVariants,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../atoms';
import { NavigationLink } from '../../context';

export interface PatientProfileDetailViewModel {
  displayName: string;
  dateOfBirth: string;
  versionNumber: number;
  versionState: string;
  versions: readonly {
    id: string;
    versionNumber: number;
    state: string;
  }[];
  synopsis: string;
  document: {
    identity: {
      givenNames: readonly string[];
      familyName: string;
      preferredName?: string;
      dateOfBirth: string;
      pronouns?: { status: string; value?: readonly string[] };
      sexAtBirth?: { status: string; value?: string };
      genderIdentity?: { status: string; value?: string };
    };
    identifiers: readonly {
      id: string;
      display?: string;
      value: string;
      issuer?: string;
    }[];
    demographics: {
      ethnicity?: { status: string; value?: { display: string } };
      faithOrBelief?: { status: string; value?: { display: string } };
      nationality?: { status: string; value?: { display: string } };
    };
    communication: {
      languages: readonly {
        id: string;
        language: { display: string };
        proficiency?: string;
        interpreterRequired?: { status: string; value?: boolean };
      }[];
      preferredLanguageId?: string;
      preferences: readonly { id: string; summary: string; details?: string }[];
      accessibilityNeeds: readonly {
        id: string;
        summary: string;
        details?: string;
      }[];
    };
    contact?: {
      address?: {
        lines: readonly string[];
        city?: string;
        region?: string;
        postalCode?: string;
        country?: string;
      };
      phone?: string;
      email?: string;
    };
    relationships: readonly {
      id: string;
      name: string;
      relationship: { display: string };
      roles: readonly string[];
      contact?: { phone?: string; email?: string };
      notes?: string;
    }[];
    background: readonly {
      id: string;
      category: string;
      summary: string;
      details?: string;
      sensitivity: string;
    }[];
    problems: readonly {
      id: string;
      problem: { display: string };
      clinicalStatus: string;
      onsetDate?: string;
      resolvedDate?: string;
      details?: string;
    }[];
    allergies: readonly {
      id: string;
      substance: { display: string };
      clinicalStatus: string;
      verificationStatus: string;
      reactions: readonly string[];
      severity?: string;
      details?: string;
    }[];
    baselineMedications: readonly {
      id: string;
      medication: { display: string };
      status: string;
      dose?: string;
      route?: { display: string };
      frequency?: string;
      indication?: string;
      details?: string;
    }[];
    history: {
      entries: readonly {
        id: string;
        type: string;
        summary: string;
        details?: string;
        sensitivity: string;
        occurred?: {
          start?: { value: string; precision: string; approximate?: boolean };
          end?: { value: string; precision: string; approximate?: boolean };
        };
        recordedOn?: {
          value: string;
          precision: string;
          approximate?: boolean;
        };
        author?: { name?: string; role?: string; service?: string };
        sourceReference?: string;
        encounterType?: string;
        careSetting?: string;
        observation?: { display: string };
        value?:
          | { type: 'quantity'; value: number; unit: string }
          | { type: 'text'; value: string }
          | { type: 'boolean'; value: boolean }
          | { type: 'coded'; value: { display: string } };
        assessment?: { display: string };
        score?: number;
        scale?: string;
        components?: readonly string[];
        service?: string;
        reason?: string;
        outcome?: string;
        investigation?: { display: string };
        conclusion?: string;
        results?: readonly {
          id: string;
          observation: { display: string };
          value:
            | { type: 'quantity'; value: number; unit: string }
            | { type: 'text'; value: string }
            | { type: 'boolean'; value: boolean }
            | { type: 'coded'; value: { display: string } };
          referenceRange?: string;
          interpretation?: string;
        }[];
        procedure?: { display: string };
        complications?: string;
        medication?: { display: string };
        status?: string;
        dose?: string;
        route?: { display: string };
        frequency?: string;
        response?: string;
        indication?: string;
        reasonEnded?: string;
        referredFrom?: string;
        referredTo?: string;
        documentType?: string;
        title?: string;
        body?: string;
        need?: string;
        goals?: readonly string[];
        interventions?: readonly string[];
        evaluation?: string;
      }[];
    };
  };
}

export interface PatientScenarioSummaryViewModel {
  id: string;
  title: string;
  description: string;
  careSetting: string;
  intendedClinicalAudiences: readonly string[];
  status: string;
  patientProfileVersion: {
    versionNumber: number;
  };
  beginningStep: {
    title: string;
  };
  previewHref?: string;
}

type HistoryEntry =
  PatientProfileDetailViewModel['document']['history']['entries'][number];

const historyDate = (entry: HistoryEntry) => {
  const { start, end } = entry.occurred ?? {};
  if (!start && !end) return undefined;
  const display = (date: NonNullable<typeof start>) =>
    `${date.approximate ? 'About ' : ''}${date.value}`;
  if (start && end) return `${display(start)} to ${display(end)}`;
  if (start) return display(start);
  return `Until ${display(end!)}`;
};

const observationValue = (value: NonNullable<HistoryEntry['value']>) => {
  if (value.type === 'quantity') return `${value.value} ${value.unit}`;
  if (value.type === 'coded') return value.value.display;
  if (value.type === 'boolean') return value.value ? 'Yes' : 'No';
  return value.value;
};

export function PatientProfileDetailPage({
  profile,
  editHref,
  nextProfile,
  previousProfile,
  previewHref,
  scenarios = [],
  scenariosError,
  scenariosLoading = false,
  onVersionChange,
}: {
  profile: PatientProfileDetailViewModel;
  editHref?: string;
  nextProfile?: { href: string; label: string };
  previousProfile?: { href: string; label: string };
  previewHref?: string;
  scenarios?: readonly PatientScenarioSummaryViewModel[];
  scenariosError?: string;
  scenariosLoading?: boolean;
  onVersionChange?: (versionId: string) => void;
}) {
  const { document } = profile;
  const [choosingVersion, setChoosingVersion] = useState(false);
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
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <p>
            Born{' '}
            {new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(
              new Date(`${profile.dateOfBirth}T00:00:00Z`),
            )}{' '}
            ·
          </p>
          {choosingVersion && profile.versions.length > 1 ? (
            <Select
              onValueChange={(versionId) => {
                if (
                  versionId &&
                  versionId !==
                    profile.versions.find(
                      ({ versionNumber }) =>
                        versionNumber === profile.versionNumber,
                    )?.id
                )
                  onVersionChange?.(versionId);
              }}
              value={
                profile.versions.find(
                  ({ versionNumber }) =>
                    versionNumber === profile.versionNumber,
                )?.id
              }
            >
              <SelectTrigger
                aria-label="Patient profile version"
                className="min-h-8 w-44 px-2.5"
              >
                <SelectValue>
                  Version {profile.versionNumber} ·{' '}
                  {profile.versionState.replaceAll('_', ' ')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {profile.versions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    Version {version.versionNumber} ·{' '}
                    {version.state.replaceAll('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span>Version {profile.versionNumber}</span>
          )}
          {profile.versions.length > 1 && !choosingVersion ? (
            <button
              aria-label="Choose a patient profile version"
              className="inline-flex size-6 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
              onClick={() => setChoosingVersion(true)}
              type="button"
            >
              <LuHistory aria-hidden="true" className="size-4" />
            </button>
          ) : null}
        </div>
        <p className="mt-5 max-w-4xl text-base leading-7">{profile.synopsis}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {previewHref ? (
            <NavigationLink
              className={buttonVariants()}
              href={previewHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              View in EHR
            </NavigationLink>
          ) : null}
          {editHref ? (
            <NavigationLink
              className={buttonVariants({ variant: 'outline' })}
              href={editHref}
            >
              Edit draft
            </NavigationLink>
          ) : null}
        </div>
      </header>

      <section aria-labelledby="patient-scenarios-heading">
        <div>
          <h2 className="text-xl font-bold" id="patient-scenarios-heading">
            Scenarios
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Presentations authored for this exact patient-profile version.
          </p>
        </div>
        {scenariosLoading ? (
          <div
            aria-label="Loading patient scenarios"
            className="mt-4 h-36 animate-pulse rounded-lg bg-accent/40"
          />
        ) : scenariosError ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {scenariosError}
          </p>
        ) : scenarios.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {scenarios.map((scenario) => (
              <article
                className="flex min-h-64 flex-col rounded-lg border border-border bg-surface p-5 shadow-sm"
                key={scenario.id}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="bg-accent/50 px-2 py-1 capitalize">
                    {scenario.status === 'draft'
                      ? 'Draft preview'
                      : scenario.status}
                  </span>
                  <span className="text-muted-foreground">
                    Profile version{' '}
                    {scenario.patientProfileVersion.versionNumber}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold">{scenario.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {scenario.description}
                </p>
                <dl className="mt-4 grid gap-3 text-sm">
                  <div>
                    <dt className="font-semibold">Beginning</dt>
                    <dd className="text-muted-foreground">
                      {scenario.beginningStep.title}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Care setting</dt>
                    <dd className="capitalize text-muted-foreground">
                      {scenario.careSetting.replaceAll('_', ' ')}
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto pt-5">
                  {scenario.previewHref ? (
                    <NavigationLink
                      className={buttonVariants({ variant: 'outline' })}
                      href={scenario.previewHref}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Preview scenario in EHR
                    </NavigationLink>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      EHR preview coming next
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-border p-6">
            <p className="font-semibold">No scenarios for this version</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The base patient profile can still be previewed in the EHR.
            </p>
          </div>
        )}
      </section>

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

      <section aria-labelledby="patient-details-heading">
        <h2 className="text-xl font-bold" id="patient-details-heading">
          Patient details
        </h2>
        <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Name
            </dt>
            <dd className="mt-1 text-sm">
              {document.identity.givenNames.join(' ')}{' '}
              {document.identity.familyName}
              {document.identity.preferredName
                ? ` (known as ${document.identity.preferredName})`
                : ''}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sex at birth
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {document.identity.sexAtBirth?.status === 'known'
                ? document.identity.sexAtBirth.value
                : document.identity.sexAtBirth?.status.replaceAll('_', ' ') ||
                  'Not recorded'}
            </dd>
          </div>
          {document.identity.pronouns?.status === 'known' ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pronouns
              </dt>
              <dd className="mt-1 text-sm">
                {document.identity.pronouns.value?.join('/')}
              </dd>
            </div>
          ) : null}
          {document.identity.genderIdentity?.status === 'known' ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Gender identity
              </dt>
              <dd className="mt-1 text-sm">
                {document.identity.genderIdentity.value}
              </dd>
            </div>
          ) : null}
          {document.identifiers.map((identifier) => (
            <div key={identifier.id}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {identifier.display || 'Identifier'}
              </dt>
              <dd className="mt-1 text-sm">
                {identifier.value}
                {identifier.issuer ? ` · ${identifier.issuer}` : ''}
              </dd>
            </div>
          ))}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ethnicity
            </dt>
            <dd className="mt-1 text-sm">
              {document.demographics.ethnicity?.status === 'known'
                ? document.demographics.ethnicity.value?.display
                : document.demographics.ethnicity?.status.replaceAll(
                    '_',
                    ' ',
                  ) || 'Not recorded'}
            </dd>
          </div>
          {document.demographics.nationality ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nationality
              </dt>
              <dd className="mt-1 text-sm">
                {document.demographics.nationality.status === 'known'
                  ? document.demographics.nationality.value?.display
                  : document.demographics.nationality.status.replaceAll(
                      '_',
                      ' ',
                    )}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Faith or belief
            </dt>
            <dd className="mt-1 text-sm">
              {document.demographics.faithOrBelief?.status === 'known'
                ? document.demographics.faithOrBelief.value?.display
                : document.demographics.faithOrBelief?.status.replaceAll(
                    '_',
                    ' ',
                  ) || 'Not recorded'}
            </dd>
          </div>
          {document.contact?.address ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Address
              </dt>
              <dd className="mt-1 text-sm">
                {[
                  ...document.contact.address.lines,
                  document.contact.address.city,
                  document.contact.address.region,
                  document.contact.address.postalCode,
                  document.contact.address.country,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </dd>
            </div>
          ) : null}
          {document.contact?.phone ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Telephone
              </dt>
              <dd className="mt-1 text-sm">{document.contact.phone}</dd>
            </div>
          ) : null}
          {document.contact?.email ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email
              </dt>
              <dd className="mt-1 text-sm">{document.contact.email}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <div className="columns-1 gap-10 lg:columns-2">
        <section
          aria-labelledby="problems-heading"
          className="mb-10 break-inside-avoid"
        >
          <h2
            className="flex items-center gap-2 text-xl font-bold"
            id="problems-heading"
          >
            <LuHeartPulse aria-hidden="true" className="text-primary" />
            Problems and allergies
          </h2>
          <div className="mt-4 space-y-4">
            {document.problems.length || document.allergies.length ? (
              <>
                {document.problems.map((item) => (
                  <article key={item.id}>
                    <h3 className="font-semibold">{item.problem.display}</h3>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {item.clinicalStatus}
                      {item.onsetDate ? ` · onset ${item.onsetDate}` : ''}
                      {item.resolvedDate
                        ? ` · resolved ${item.resolvedDate}`
                        : ''}
                    </p>
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
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {item.verificationStatus}
                      {item.severity ? ` · ${item.severity}` : ''}
                    </p>
                    {item.details ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.details}
                      </p>
                    ) : null}
                  </article>
                ))}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No problems or allergies recorded.
              </p>
            )}
          </div>
        </section>

        <section
          aria-labelledby="medications-heading"
          className="mb-10 break-inside-avoid"
        >
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
                    {[
                      item.dose,
                      item.route?.display,
                      item.frequency,
                      item.indication,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {item.details ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.details}
                    </p>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No baseline medications recorded.
              </p>
            )}
          </div>
        </section>

        <section
          aria-labelledby="communication-heading"
          className="mb-10 break-inside-avoid"
        >
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
              .map(({ language, proficiency }) =>
                [language.display, proficiency].filter(Boolean).join(' · '),
              )
              .join(', ') || 'None recorded'}
          </p>
          {document.communication.languages.map((language) =>
            language.interpreterRequired?.status === 'known' ? (
              <p className="mt-1 text-sm" key={`${language.id}-interpreter`}>
                {language.language.display} interpreter required:{' '}
                {language.interpreterRequired.value ? 'Yes' : 'No'}
              </p>
            ) : null,
          )}
          {document.communication.preferences.map((preference) => (
            <article className="mt-3" key={preference.id}>
              <h3 className="font-semibold">{preference.summary}</h3>
              {preference.details ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {preference.details}
                </p>
              ) : null}
            </article>
          ))}
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

        <section
          aria-labelledby="relationships-heading"
          className="mb-10 break-inside-avoid"
        >
          <h2 className="text-xl font-bold" id="relationships-heading">
            Relationships and support
          </h2>
          <div className="mt-4 space-y-4">
            {document.relationships.map((relationship) => (
              <article key={relationship.id}>
                <h3 className="font-semibold">
                  {relationship.name} · {relationship.relationship.display}
                </h3>
                <p className="mt-1 text-xs capitalize text-muted-foreground">
                  {relationship.roles
                    .map((role) => role.replaceAll('_', ' '))
                    .join(' · ')}
                  {relationship.contact?.phone
                    ? ` · ${relationship.contact.phone}`
                    : ''}
                </p>
                {relationship.notes ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {relationship.notes}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="background-heading"
          className="mb-10 break-inside-avoid"
        >
          <h2 className="text-xl font-bold" id="background-heading">
            Patient background
          </h2>
          <div className="mt-4 space-y-4">
            {document.background.map((item) => (
              <article key={item.id}>
                <h3 className="font-semibold">{item.summary}</h3>
                <p className="mt-1 text-xs capitalize text-muted-foreground">
                  {item.category.replaceAll('_', ' ')}
                  {item.sensitivity === 'restricted' ? ' · Restricted' : ''}
                </p>
                {item.details ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.details}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </div>

      <section aria-labelledby="patient-history-heading">
        <h2 className="text-xl font-bold" id="patient-history-heading">
          Patient history
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Clinical events and records from before the current learning scenario.
        </p>
        {document.history.entries.length ? (
          <div className="mt-5 columns-1 gap-5 lg:columns-2">
            {document.history.entries.map((entry) => (
              <article
                className="mb-5 break-inside-avoid border-l-4 border-primary bg-accent/10 p-4"
                key={entry.id}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <span>{entry.type.replaceAll('_', ' ')}</span>
                  {entry.sensitivity === 'restricted' ? (
                    <span className="bg-accent/50 px-2 py-0.5 text-foreground">
                      Restricted
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-2 font-semibold">{entry.summary}</h3>
                {entry.status ? (
                  <p className="mt-1 text-xs capitalize text-muted-foreground">
                    Status: {entry.status.replaceAll('_', ' ')}
                  </p>
                ) : null}
                {entry.encounterType || entry.careSetting ? (
                  <p className="mt-1 text-xs capitalize text-muted-foreground">
                    {[entry.encounterType, entry.careSetting]
                      .filter(Boolean)
                      .map((value) => value?.replaceAll('_', ' '))
                      .join(' · ')}
                  </p>
                ) : null}
                {historyDate(entry) ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {historyDate(entry)}
                  </p>
                ) : null}
                {entry.recordedOn ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Recorded {entry.recordedOn.approximate ? 'about ' : ''}
                    {entry.recordedOn.value}
                  </p>
                ) : null}
                {entry.author ? (
                  <p className="mt-2 text-sm">
                    Recorded by{' '}
                    {[
                      entry.author.name,
                      entry.author.role,
                      entry.author.service,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                ) : null}
                {entry.observation && entry.value ? (
                  <p className="mt-2 text-sm">
                    {entry.observation.display}: {observationValue(entry.value)}
                  </p>
                ) : null}
                {entry.assessment ? (
                  <p className="mt-2 text-sm">
                    {entry.assessment.display}
                    {entry.score !== undefined
                      ? `: ${entry.score}${entry.scale ? ` ${entry.scale}` : ''}`
                      : ''}
                    {entry.outcome ? `: ${entry.outcome}` : ''}
                  </p>
                ) : null}
                {entry.components?.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {entry.components.map((component) => (
                      <li key={component}>{component}</li>
                    ))}
                  </ul>
                ) : null}
                {entry.service ? (
                  <p className="mt-2 text-sm">Service: {entry.service}</p>
                ) : null}
                {entry.reason ? (
                  <p className="mt-2 text-sm">Reason: {entry.reason}</p>
                ) : null}
                {entry.outcome && !entry.assessment ? (
                  <p className="mt-2 text-sm">Outcome: {entry.outcome}</p>
                ) : null}
                {entry.investigation ? (
                  <div className="mt-2 text-sm">
                    <p>{entry.investigation.display}</p>
                    {entry.results?.length ? (
                      <ul className="mt-1 space-y-1">
                        {entry.results.map((result) => (
                          <li key={result.id}>
                            {result.observation.display}:{' '}
                            {observationValue(result.value)}
                            {result.referenceRange
                              ? ` (reference ${result.referenceRange})`
                              : ''}
                            {result.interpretation
                              ? ` · ${result.interpretation}`
                              : ''}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
                {entry.conclusion ? (
                  <p className="mt-2 text-sm">{entry.conclusion}</p>
                ) : null}
                {entry.procedure ? (
                  <p className="mt-2 text-sm">{entry.procedure.display}</p>
                ) : null}
                {entry.complications ? (
                  <p className="mt-2 text-sm">
                    Complications: {entry.complications}
                  </p>
                ) : null}
                {entry.medication ? (
                  <p className="mt-2 text-sm">
                    {[
                      entry.medication.display,
                      entry.dose,
                      entry.route?.display,
                      entry.frequency,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                ) : null}
                {entry.indication ? (
                  <p className="mt-2 text-sm">Indication: {entry.indication}</p>
                ) : null}
                {entry.reasonEnded ? (
                  <p className="mt-2 text-sm">Ended: {entry.reasonEnded}</p>
                ) : null}
                {entry.response ? (
                  <p className="mt-2 text-sm">Response: {entry.response}</p>
                ) : null}
                {entry.referredTo ? (
                  <p className="mt-2 text-sm">
                    {entry.referredFrom ? `${entry.referredFrom} → ` : ''}
                    {entry.referredTo}
                  </p>
                ) : null}
                {entry.title ? (
                  <p className="mt-2 text-sm font-semibold">
                    {entry.title}
                    {entry.documentType
                      ? ` · ${entry.documentType.replaceAll('_', ' ')}`
                      : ''}
                  </p>
                ) : null}
                {entry.need ? (
                  <p className="mt-2 text-sm">Need: {entry.need}</p>
                ) : null}
                {entry.goals?.length ? (
                  <p className="mt-2 text-sm">
                    Goals: {entry.goals.join('; ')}
                  </p>
                ) : null}
                {entry.interventions?.length ? (
                  <p className="mt-2 text-sm">
                    Interventions: {entry.interventions.join('; ')}
                  </p>
                ) : null}
                {entry.evaluation ? (
                  <p className="mt-2 text-sm">Evaluation: {entry.evaluation}</p>
                ) : null}
                {entry.body ? (
                  <p className="mt-2 whitespace-pre-line text-sm">
                    {entry.body}
                  </p>
                ) : null}
                {entry.details ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {entry.details}
                  </p>
                ) : null}
                {entry.sourceReference ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Source: {entry.sourceReference}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No structured patient history is recorded.
          </p>
        )}
      </section>

      <details className="border-t border-border pt-6">
        <summary className="cursor-pointer text-sm font-semibold text-primary">
          View patient document
        </summary>
        <pre className="mt-4 max-h-[36rem] overflow-auto bg-accent/20 p-4 text-xs leading-5 text-foreground">
          <code>{JSON.stringify(document, null, 2)}</code>
        </pre>
      </details>

      <nav
        aria-label="Patient profile navigation"
        className="grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
      >
        {previousProfile ? (
          <NavigationLink
            className="border border-border p-4 transition hover:bg-accent/20"
            href={previousProfile.href}
          >
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Previous patient
            </span>
            <span className="mt-1 block font-semibold">
              ← {previousProfile.label}
            </span>
          </NavigationLink>
        ) : (
          <span />
        )}
        {nextProfile ? (
          <NavigationLink
            className="border border-border p-4 text-right transition hover:bg-accent/20"
            href={nextProfile.href}
          >
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Next patient
            </span>
            <span className="mt-1 block font-semibold">
              {nextProfile.label} →
            </span>
          </NavigationLink>
        ) : null}
      </nav>
    </div>
  );
}
