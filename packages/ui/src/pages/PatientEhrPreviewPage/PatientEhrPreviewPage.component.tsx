import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

import { SimulationTools } from '../../organisms';
import { SimulationTemplate } from '../../templates';

export interface PatientEhrAuthoredDetail {
  status: 'known' | 'unknown' | 'not_applicable' | 'not_recorded';
  value?: string;
}

export interface PatientEhrPreviewViewModel {
  organisationName: string;
  recordContext: string;
  dateOfBirth: string;
  displayName: string;
  identifiers: readonly { display: string; value: string }[];
  details: {
    sexAtBirth: PatientEhrAuthoredDetail;
    pronouns: PatientEhrAuthoredDetail;
    ethnicity: PatientEhrAuthoredDetail;
    faithOrBelief: PatientEhrAuthoredDetail;
    nationality: PatientEhrAuthoredDetail;
    address?: readonly string[];
    phone?: string;
    email?: string;
    nextOfKin: readonly string[];
    occupationAndSocial?: string;
  };
  communication: {
    languages: readonly {
      id: string;
      language: string;
      proficiency?: string;
      preferred: boolean;
      interpreterRequirement: PatientEhrAuthoredDetail;
    }[];
    preferences: readonly { id: string; summary: string; details?: string }[];
    accessibilityNeeds: readonly {
      id: string;
      summary: string;
      details?: string;
    }[];
  };
  relationships: readonly {
    id: string;
    name: string;
    relationship: string;
    roles: readonly string[];
    phone?: string;
    email?: string;
    notes?: string;
  }[];
  versionNumber: number;
  versionState: string;
}

export interface PatientEhrPreviewPageProps {
  exitHref: string;
  initialSection?: 'patient-details' | 'communication-relationships';
  patient: PatientEhrPreviewViewModel;
}

const futureRecordSections = [
  ['C', 'Clinical history'],
  ['D', 'Medications'],
  ['E', 'Allergies'],
] as const;

function authoredDetailLabel(detail: PatientEhrAuthoredDetail) {
  if (detail.status === 'known') return detail.value ?? 'Not recorded';
  if (detail.status === 'not_applicable') return 'Not applicable';
  if (detail.status === 'unknown') return 'Unknown';
  return 'Not recorded';
}

function patientAge(dateOfBirth: string) {
  const today = new Date();
  const birth = new Date(`${dateOfBirth}T00:00:00Z`);
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  if (
    today.getUTCMonth() < birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() &&
      today.getUTCDate() < birth.getUTCDate())
  )
    age -= 1;
  return `${age} years`;
}

export function PatientEhrPreviewPage({
  exitHref,
  initialSection = 'patient-details',
  patient,
}: PatientEhrPreviewPageProps) {
  const primaryIdentifier = patient.identifiers[0];
  const [activeSection, setActiveSection] = useState(initialSection);
  const sectionHeading = useRef<HTMLHeadingElement>(null);
  const focusAfterNavigation = useRef(false);

  useEffect(() => {
    if (!focusAfterNavigation.current) return;
    sectionHeading.current?.focus();
    focusAfterNavigation.current = false;
  }, [activeSection]);

  const selectSection = (
    section: 'patient-details' | 'communication-relationships',
  ) => {
    if (section === activeSection) return;
    focusAfterNavigation.current = true;
    setActiveSection(section);
  };

  return (
    <SimulationTemplate
      header={
        <div className="font-[Arial,'Segoe_UI',sans-serif]">
          <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 bg-[#7c0000] px-3 py-1.5 text-[11px] font-bold tracking-[0.05em] text-white">
            <span>⚠ SIMULATED TRAINING RECORD — FICTIONAL PATIENT</span>
            <span>
              NOT FOR USE IN REAL PATIENT CARE — EDUCATIONAL PURPOSES ONLY
            </span>
            <span>{patient.organisationName}</span>
          </div>
          <div className="flex min-h-14 flex-wrap items-stretch bg-[#1c2b4a] text-white">
            <div className="flex min-w-56 items-center bg-[#0072ce] px-5 py-3 text-2xl font-black tracking-wide sm:text-4xl">
              {patient.organisationName}
            </div>
            <div className="flex min-w-0 flex-1 items-center px-4 py-2 text-[11px] text-white/70">
              {patient.recordContext}
            </div>
            <div className="flex items-center px-4 py-2 text-[10px] text-white/50">
              Session: PLATFORM ADMIN PREVIEW
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t-2 border-[#1c2b4a] border-b-[3px] border-b-[#0072ce] bg-white px-4 py-2.5 text-[#1a1a2e]">
            <h1 className="min-w-52 text-lg font-bold text-[#1c2b4a]">
              {patient.displayName}
            </h1>
            <PatientChip
              label="DOB"
              value={`${new Intl.DateTimeFormat('en-GB').format(
                new Date(`${patient.dateOfBirth}T00:00:00Z`),
              )} (${patientAge(patient.dateOfBirth)})`}
            />
            {primaryIdentifier ? (
              <PatientChip
                label={primaryIdentifier.display}
                value={primaryIdentifier.value}
              />
            ) : null}
            <PatientChip
              label="Sex / pronouns"
              value={`${authoredDetailLabel(patient.details.sexAtBirth)} · ${authoredDetailLabel(patient.details.pronouns)}`}
            />
            <PatientChip
              label="Profile version"
              value={`${patient.versionNumber} · ${patient.versionState.replaceAll('_', ' ')}`}
            />
          </div>
        </div>
      }
      tools={
        <SimulationTools
          exitHref={exitHref}
          previewLabel="Platform-admin patient-profile preview"
        />
      }
    >
      <div className="flex min-h-[calc(100dvh-10rem)] w-full bg-[#eef1f6] font-[Arial,'Segoe_UI',sans-serif] text-[13px] text-[#1a1a2e] max-md:flex-col">
        <nav
          aria-label="Patient record sections"
          className="w-[195px] shrink-0 border-r-2 border-[#c1d3ec] bg-[#f3f7fd] max-md:w-full max-md:overflow-x-auto max-md:border-r-0 max-md:border-b-2"
        >
          <div className="bg-[#1460aa] px-2.5 py-2 text-[10px] font-bold uppercase tracking-[0.05em] text-white max-md:hidden">
            Navigation
          </div>
          <div className="bg-[#e4eff9] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-[#4a7ba7] max-md:hidden">
            Patient record
          </div>
          <div className="max-md:flex max-md:min-w-max">
            <RecordSectionButton
              active={activeSection === 'patient-details'}
              code="A"
              label="Patient Details"
              onClick={() => selectSection('patient-details')}
            />
            <RecordSectionButton
              active={activeSection === 'communication-relationships'}
              code="B"
              label="Communication & relationships"
              onClick={() => selectSection('communication-relationships')}
            />
            {futureRecordSections.map(([code, label]) => (
              <span
                aria-disabled="true"
                className="flex items-center gap-2 border-b border-[#e4eff9] px-2.5 py-2 text-left text-[11px] text-[#6b7280] max-md:border-r max-md:border-b-0"
                key={code}
              >
                <NavCode muted>{code}</NavCode>
                {label}
              </span>
            ))}
          </div>
        </nav>

        <div className="min-w-0 flex-1 p-2.5 sm:p-4">
          {activeSection === 'patient-details' ? (
            <section
              className="w-full overflow-hidden rounded-[2px] border border-[#b8cce0] bg-white"
              id="patient-details"
            >
              <header className="flex items-center justify-between gap-4 border-b border-[#b0cce4] border-l-[3px] border-l-[#1460aa] bg-[#d0e4f7] px-3 py-1.5 text-[#1c3a5c]">
                <h2
                  className="text-[11px] font-bold uppercase tracking-[0.04em] outline-none"
                  ref={sectionHeading}
                  tabIndex={-1}
                >
                  A — Patient Details
                </h2>
                <span className="bg-[#1460aa] px-2 py-0.5 text-[10px] font-semibold text-white">
                  PRE-POPULATED
                </span>
              </header>

              <div className="space-y-2.5 p-3">
                <FieldGrid columns={3}>
                  <ReadOnlyField
                    label="Full name"
                    value={patient.displayName}
                  />
                  <ReadOnlyField
                    label="Date of birth"
                    value={new Intl.DateTimeFormat('en-GB', {
                      dateStyle: 'long',
                    }).format(new Date(`${patient.dateOfBirth}T00:00:00Z`))}
                  />
                  <ReadOnlyField
                    label="Age"
                    value={patientAge(patient.dateOfBirth)}
                  />
                </FieldGrid>

                <FieldGrid columns={3}>
                  <ReadOnlyField
                    label={primaryIdentifier?.display ?? 'Patient number'}
                    value={primaryIdentifier?.value ?? 'Not recorded'}
                  />
                  <ReadOnlyField
                    label="Sex at birth"
                    value={authoredDetailLabel(patient.details.sexAtBirth)}
                  />
                  <ReadOnlyField
                    label="Pronouns"
                    value={authoredDetailLabel(patient.details.pronouns)}
                  />
                </FieldGrid>

                <FieldGrid columns={3}>
                  <ReadOnlyField
                    label="Ethnicity"
                    value={authoredDetailLabel(patient.details.ethnicity)}
                  />
                  <ReadOnlyField
                    label="Faith or belief"
                    value={authoredDetailLabel(patient.details.faithOrBelief)}
                  />
                  <ReadOnlyField
                    label="Nationality"
                    value={authoredDetailLabel(patient.details.nationality)}
                  />
                </FieldGrid>

                <FieldGrid columns={2}>
                  <ReadOnlyField
                    label="Address"
                    value={
                      patient.details.address?.join(', ') ?? 'Not recorded'
                    }
                  />
                  <ReadOnlyField label="GP" value="Not recorded" />
                </FieldGrid>

                <FieldGrid columns={2}>
                  <ReadOnlyField
                    label="Next of kin"
                    value={
                      patient.details.nextOfKin.join('; ') || 'Not recorded'
                    }
                  />
                  <ReadOnlyField
                    label="Occupation / social"
                    value={
                      patient.details.occupationAndSocial ?? 'Not recorded'
                    }
                  />
                </FieldGrid>

                <div className="border-t border-[#e5e7eb] pt-2.5">
                  <FieldGrid columns={3}>
                    <ReadOnlyField
                      label="Telephone"
                      value={patient.details.phone ?? 'Not recorded'}
                    />
                    <ReadOnlyField
                      label="Email"
                      value={patient.details.email ?? 'Not recorded'}
                    />
                    <ReadOnlyField label="Handedness" value="Not recorded" />
                  </FieldGrid>
                </div>

                {patient.identifiers.length > 1 ? (
                  <div className="border-t border-[#e5e7eb] pt-2.5">
                    <FieldGrid columns={3}>
                      {patient.identifiers.slice(1).map((identifier) => (
                        <ReadOnlyField
                          key={`${identifier.display}-${identifier.value}`}
                          label={identifier.display}
                          value={identifier.value}
                        />
                      ))}
                    </FieldGrid>
                  </div>
                ) : null}
              </div>
            </section>
          ) : (
            <CommunicationRelationshipsSection
              headingRef={sectionHeading}
              patient={patient}
            />
          )}
        </div>
      </div>
    </SimulationTemplate>
  );
}

function CommunicationRelationshipsSection({
  headingRef,
  patient,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  patient: PatientEhrPreviewViewModel;
}) {
  const hasAdjustments =
    patient.communication.preferences.length > 0 ||
    patient.communication.accessibilityNeeds.length > 0 ||
    patient.communication.languages.some(
      ({ interpreterRequirement }) =>
        interpreterRequirement.status === 'unknown' ||
        (interpreterRequirement.status === 'known' &&
          interpreterRequirement.value === 'Required'),
    );

  return (
    <section
      className="w-full overflow-hidden rounded-[2px] border border-[#b8cce0] bg-white"
      id="communication-relationships"
    >
      <header className="flex items-center justify-between gap-4 border-b border-[#b0cce4] border-l-[3px] border-l-[#1460aa] bg-[#d0e4f7] px-3 py-1.5 text-[#1c3a5c]">
        <h2
          className="text-[11px] font-bold uppercase tracking-[0.04em] outline-none"
          ref={headingRef}
          tabIndex={-1}
        >
          B — Communication & relationships
        </h2>
        <span className="bg-[#1460aa] px-2 py-0.5 text-[10px] font-semibold text-white">
          PRE-POPULATED
        </span>
      </header>

      <div className="space-y-3 p-3">
        {hasAdjustments ? (
          <div className="border-l-4 border-[#0072ce] bg-[#e8f3fb] px-3 py-2 text-[11px] leading-5 text-[#003b6f]">
            <strong>Communication adjustments are recorded.</strong> Review the
            patient's preferred language, interpreter status and individual
            communication or accessibility needs before interaction.
          </div>
        ) : null}

        <ClinicalSubsection title="Languages">
          {patient.communication.languages.length ? (
            <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
              {patient.communication.languages.map((language) => (
                <div
                  className="border border-[#c8d8ec] bg-[#f8fbff] p-2.5"
                  key={language.id}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-[#1c2b4a]">
                      {language.language}
                    </p>
                    {language.preferred ? (
                      <span className="bg-[#1460aa] px-1.5 py-0.5 text-[9px] font-bold text-white">
                        PREFERRED
                      </span>
                    ) : null}
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-2">
                    <CompactDetail
                      label="Proficiency"
                      value={language.proficiency ?? 'Not recorded'}
                    />
                    <CompactDetail
                      label="Interpreter"
                      value={authoredDetailLabel(
                        language.interpreterRequirement,
                      )}
                    />
                  </dl>
                </div>
              ))}
            </div>
          ) : (
            <EmptyClinicalValue />
          )}
        </ClinicalSubsection>

        <div className="grid gap-3 lg:grid-cols-2">
          <ClinicalSubsection title="Communication preferences">
            <ClinicalFactList facts={patient.communication.preferences} />
          </ClinicalSubsection>
          <ClinicalSubsection title="Accessibility needs">
            <ClinicalFactList
              facts={patient.communication.accessibilityNeeds}
            />
          </ClinicalSubsection>
        </div>

        <ClinicalSubsection title="Relationships and support">
          {patient.relationships.length ? (
            <div className="grid gap-2.5 xl:grid-cols-2">
              {patient.relationships.map((relationship) => (
                <article
                  className="border border-[#c8d8ec] bg-[#f8fbff] p-2.5"
                  key={relationship.id}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="font-bold text-[#1c2b4a]">
                      {relationship.name}
                    </h4>
                    <span className="text-[11px] font-semibold text-[#4a7ba7]">
                      {relationship.relationship}
                    </span>
                  </div>
                  <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                    <CompactDetail
                      label="Role"
                      value={
                        relationship.roles
                          .map((role) => role.replaceAll('_', ' '))
                          .join(', ') || 'Not recorded'
                      }
                    />
                    <CompactDetail
                      label="Contact"
                      value={
                        [relationship.phone, relationship.email]
                          .filter(Boolean)
                          .join(' / ') || 'Not recorded'
                      }
                    />
                  </dl>
                  {relationship.notes ? (
                    <p className="mt-2 border-t border-[#e5e7eb] pt-2 text-[11px] leading-5 text-[#374151]">
                      {relationship.notes}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <EmptyClinicalValue />
          )}
        </ClinicalSubsection>
      </div>
    </section>
  );
}

function RecordSectionButton({
  active,
  code,
  label,
  onClick,
}: {
  active: boolean;
  code: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-current={active ? 'page' : undefined}
      className={`flex w-full items-center gap-2 border-b border-[#e4eff9] px-2.5 py-2 text-left text-[11px] max-md:w-auto max-md:border-r max-md:border-b-0 ${
        active
          ? 'border-l-[3px] border-l-[#0072ce] bg-[#bdd9ff] font-bold text-[#0a3a7a]'
          : 'text-[#1c3a5c] hover:bg-[#d6ecff] hover:text-[#1460aa]'
      }`}
      onClick={onClick}
      type="button"
    >
      <NavCode>{code}</NavCode>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function ClinicalSubsection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="border border-[#b8cce0]">
      <h3 className="border-b border-[#b0cce4] bg-[#edf3fb] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.03em] text-[#1c3a5c]">
        {title}
      </h3>
      <div className="p-2.5">{children}</div>
    </section>
  );
}

function ClinicalFactList({
  facts,
}: {
  facts: readonly { id: string; summary: string; details?: string }[];
}) {
  if (!facts.length) return <EmptyClinicalValue />;
  return (
    <ul className="space-y-2">
      {facts.map((fact) => (
        <li
          className="border-l-[3px] border-[#7f9bb5] bg-[#f8fbff] px-2.5 py-2"
          key={fact.id}
        >
          <p className="text-xs font-semibold text-[#1c2b4a]">{fact.summary}</p>
          {fact.details ? (
            <p className="mt-1 text-[11px] leading-5 text-[#374151]">
              {fact.details}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function CompactDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[9px] font-bold uppercase text-[#6b7280]">{label}</dt>
      <dd className="mt-0.5 break-words text-[11px] capitalize text-[#1c2b4a]">
        {value}
      </dd>
    </div>
  );
}

function EmptyClinicalValue() {
  return <p className="text-[11px] italic text-[#6b7280]">None recorded</p>;
}

function PatientChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex flex-col rounded-[3px] border border-[#c8d8ec] bg-[#f0f5fc] px-2.5 py-1 text-[11px]">
      <span className="text-[10px] font-bold uppercase text-[#6b7280]">
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function NavCode({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={`inline-flex size-4 shrink-0 items-center justify-center rounded-[2px] text-[9px] font-bold text-white ${muted ? 'bg-[#7f9bb5]' : 'bg-[#1460aa]'}`}
    >
      {children}
    </span>
  );
}

function FieldGrid({
  children,
  columns,
}: {
  children: ReactNode;
  columns: 2 | 3;
}) {
  return (
    <div
      className={`grid gap-2.5 ${columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}
    >
      {children}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-0.5 text-[10px] font-bold uppercase text-[#6b7280]">
        {label}
      </p>
      <p className="min-h-7 break-words rounded-[3px] border border-[#b8cfe8] bg-[#edf3fb] px-2 py-1.5 text-xs font-medium text-[#1c2b4a]">
        {value}
      </p>
    </div>
  );
}
