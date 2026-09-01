'use client';

import {
  EhrSectionType,
  type EhrSectionConfiguration,
  PatientAllergyRecordStatus,
} from '@hektor/types';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

import { SimulationTools } from '../../organisms';
import { SimulationTemplate } from '../../templates';
import {
  defaultPatientProfileEhrConfiguration,
  ehrSectionLabel,
  resolveEhrSections,
} from './PatientEhrSections';

export interface PatientEhrAuthoredDetail {
  status: 'known' | 'unknown' | 'not_applicable' | 'not_recorded';
  value?: string;
}

export interface PatientEhrPreviewViewModel {
  organisationName: string;
  recordContext: string;
  dateOfBirth: string;
  displayName: string;
  recordName: string;
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
    gpPractice?: string;
    handedness?: string;
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
  problems: readonly {
    id: string;
    problem: string;
    clinicalStatus: string;
    onsetDate?: string;
    resolvedDate?: string;
    details?: string;
  }[];
  allergies: readonly {
    id: string;
    substance: string;
    clinicalStatus: string;
    verificationStatus: string;
    reactions: readonly string[];
    severity?: string;
    details?: string;
  }[];
  allergyRecordStatus: PatientAllergyRecordStatus;
  baselineMedications: readonly {
    id: string;
    medication: string;
    status: string;
    dose?: string;
    route?: string;
    frequency?: string;
    indication?: string;
    details?: string;
  }[];
  clinicalHistory: {
    pastMedicalHistory: readonly string[];
    familyHistory: readonly string[];
    lifestyleAndSocialHistory: readonly string[];
  };
  personalContext: readonly {
    id: string;
    category: string;
    summary: string;
    details?: string;
  }[];
  versionNumber: number;
  versionState: string;
}

export interface PatientEhrPreviewPageProps {
  exitHref: string;
  initialSection?: EhrSectionType;
  patient: PatientEhrPreviewViewModel;
}

const recordSections = resolveEhrSections(
  defaultPatientProfileEhrConfiguration,
);

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
  initialSection = EhrSectionType.DemographicAndAdministrative,
  patient,
}: PatientEhrPreviewPageProps) {
  const [activeSection, setActiveSection] = useState(initialSection);
  const sectionHeading = useRef<HTMLHeadingElement>(null);
  const focusAfterNavigation = useRef(false);
  const primaryIdentifier = patient.identifiers[0];
  const activeAllergies = patient.allergies.filter(
    ({ clinicalStatus }) => clinicalStatus === 'active',
  );

  useEffect(() => {
    if (!focusAfterNavigation.current) return;
    sectionHeading.current?.focus();
    focusAfterNavigation.current = false;
  }, [activeSection]);

  const selectSection = (section: EhrSectionType) => {
    if (section === activeSection) return;
    focusAfterNavigation.current = true;
    setActiveSection(section);
  };

  return (
    <SimulationTemplate
      header={
        <EhrHeader
          activeAllergies={activeAllergies}
          patient={patient}
          primaryIdentifier={primaryIdentifier}
        />
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
          className="w-[210px] shrink-0 border-r-2 border-[#c1d3ec] bg-[#f3f7fd] max-md:w-full max-md:overflow-x-auto max-md:border-r-0 max-md:border-b-2"
        >
          <div className="bg-[#1460aa] px-2.5 py-2 text-[10px] font-bold uppercase tracking-[0.05em] text-white max-md:hidden">
            Navigation
          </div>
          <div className="bg-[#ebf3fc] px-2.5 py-2 text-[10px] font-semibold text-[#1460aa] max-md:hidden">
            Patient Selection
          </div>
          <div className="bg-[#e4eff9] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-[#4a7ba7] max-md:hidden">
            Core record
          </div>
          <div className="max-md:flex max-md:min-w-max">
            {recordSections.map((section, index) => (
              <RecordSectionButton
                active={activeSection === section.type}
                code={String(index + 1)}
                key={section.id}
                label={ehrSectionLabel(section)}
                onClick={() => selectSection(section.type)}
              />
            ))}
          </div>
        </nav>

        <div className="min-w-0 flex-1 p-2.5 sm:p-4">
          {activeSection === EhrSectionType.DemographicAndAdministrative ? (
            <DemographicAndAdministrativeSection
              headingRef={sectionHeading}
              patient={patient}
              primaryIdentifier={primaryIdentifier}
            />
          ) : activeSection === EhrSectionType.AboutMe ? (
            <AboutMeSection headingRef={sectionHeading} patient={patient} />
          ) : activeSection ===
            EhrSectionType.AllergiesAdverseReactionsAndAlerts ? (
            <AllergiesAdverseReactionsAndAlertsSection
              headingRef={sectionHeading}
              patient={patient}
            />
          ) : (
            <UnimplementedEhrSection
              headingRef={sectionHeading}
              section={
                recordSections.find(({ type }) => type === activeSection) ??
                recordSections[0]!
              }
            />
          )}
        </div>
      </div>
    </SimulationTemplate>
  );
}

function AllergiesAdverseReactionsAndAlertsSection({
  headingRef,
  patient,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  patient: PatientEhrPreviewViewModel;
}) {
  return (
    <EhrSection
      badge="REVIEW & VERIFY"
      evidenceHref="https://bnf.nice.org.uk/"
      headingRef={headingRef}
      id={EhrSectionType.AllergiesAdverseReactionsAndAlerts}
      title="Allergies, adverse reactions & alerts"
    >
      {patient.allergyRecordStatus ===
      PatientAllergyRecordStatus.NoKnownDrugAllergies ? (
        <div className="border-l-4 border-[#15803d] bg-[#f0fdf4] px-3 py-3 text-xs font-semibold text-[#14532d]">
          ✓ No known drug allergies (NKDA) are recorded in this Patient Profile.
        </div>
      ) : patient.allergyRecordStatus ===
        PatientAllergyRecordStatus.NotRecorded ? (
        <div className="border-l-4 border-[#d97706] bg-[#fffbeb] px-3 py-3 text-xs leading-5 text-[#92400e]">
          ⚠ No allergy status is recorded in this Patient Profile. This does not
          mean that the patient has no known allergies; allergy status must be
          confirmed before clinical use.
        </div>
      ) : (
        <div className="border-l-4 border-[#ae1c28] bg-[#fee2e2] px-3 py-3 text-xs font-semibold text-[#991b1b]">
          ⚠ One or more allergies or adverse reactions are recorded. Review the
          reaction and verification status before clinical use.
        </div>
      )}

      {patient.allergies.length ? (
        <div className="space-y-2.5">
          {patient.allergies.map((allergy) => (
            <article
              className="overflow-hidden rounded-[3px] border border-[#efb4b8] bg-white"
              key={allergy.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#fee2e2] px-3 py-2 text-[#991b1b]">
                <h3 className="text-xs font-bold uppercase">
                  {allergy.substance}
                </h3>
                <span className="text-[10px] font-bold uppercase">
                  {allergy.clinicalStatus} · {allergy.verificationStatus}
                </span>
              </div>
              <div className="grid gap-3 px-3 py-3 md:grid-cols-3">
                <AllergyDetail
                  label="Recorded reaction"
                  value={allergy.reactions.join(', ') || 'Not recorded'}
                />
                <AllergyDetail
                  label="Severity"
                  value={allergy.severity ?? 'Not recorded'}
                />
                <AllergyDetail
                  label="Additional information"
                  value={allergy.details ?? 'Not recorded'}
                />
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </EhrSection>
  );
}

function AllergyDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <p className="text-xs leading-5 text-[#1c2b4a]">{value}</p>
    </div>
  );
}

function AboutMeSection({
  headingRef,
  patient,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  patient: PatientEhrPreviewViewModel;
}) {
  const faithOrBelief = authoredDetailLabel(patient.details.faithOrBelief);

  return (
    <EhrSection
      badge="PATIENT PROFILE"
      headingRef={headingRef}
      id={EhrSectionType.AboutMe}
      title="About me"
    >
      <div className="border-l-4 border-[#0072ce] bg-[#e8f3fb] px-3 py-2 text-[11px] leading-5 text-[#003b6f]">
        This section brings together the person’s authored context, preferences
        and support network. It should inform care without replacing direct
        conversation with the person.
      </div>

      <div>
        <ClinicalPrompt>My life and what matters to me</ClinicalPrompt>
        {patient.personalContext.length ? (
          <div className="grid gap-2.5 md:grid-cols-2">
            {patient.personalContext.map((item) => (
              <div
                className="rounded-[3px] border border-[#b8cfe8] bg-[#edf3fb] px-3 py-2"
                key={item.id}
              >
                <FieldLabel>{personalContextLabel(item.category)}</FieldLabel>
                <p className="text-xs font-medium leading-5 text-[#1c2b4a]">
                  {item.summary}
                </p>
                {item.details ? (
                  <p className="mt-1 text-[11px] leading-5 text-[#4b5563]">
                    {item.details}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <NeutralRecordMessage>
            No personalised background has been recorded in this Patient
            Profile.
          </NeutralRecordMessage>
        )}
      </div>

      <FieldGrid columns={2}>
        <ReadOnlyField label="Faith or belief" value={faithOrBelief} />
        <ReadOnlyField
          label="Important people and support"
          value={
            patient.relationships
              .map(
                ({ name, notes, relationship }) =>
                  `${name} (${relationship})${notes ? ` — ${notes}` : ''}`,
              )
              .join('; ') || 'Not recorded'
          }
        />
      </FieldGrid>

      <FieldGrid columns={2}>
        <ReadOnlyListField
          items={patient.communication.preferences.map(
            ({ details, summary }) =>
              details ? `${summary} — ${details}` : summary,
          )}
          label="How I prefer to communicate"
          tall
        />
        <ReadOnlyListField
          items={patient.communication.accessibilityNeeds.map(
            ({ details, summary }) =>
              details ? `${summary} — ${details}` : summary,
          )}
          label="Communication and accessibility support"
          tall
        />
      </FieldGrid>
    </EhrSection>
  );
}

function personalContextLabel(category: string) {
  const labels: Record<string, string> = {
    adverse_life_event: 'Life experience',
    cultural: 'Culture and identity',
    education: 'Education',
    family: 'Family context',
    living_arrangements: 'Home and independence',
    occupation: 'Work and roles',
    social: 'Social context',
  };

  return labels[category] ?? 'Personal context';
}

function NeutralRecordMessage({ children }: { children: ReactNode }) {
  return (
    <p className="border-l-4 border-[#6b7280] bg-[#f3f4f6] px-3 py-2 text-xs text-[#374151]">
      {children}
    </p>
  );
}

function EhrHeader({
  activeAllergies,
  patient,
  primaryIdentifier,
}: {
  activeAllergies: PatientEhrPreviewViewModel['allergies'];
  patient: PatientEhrPreviewViewModel;
  primaryIdentifier?: PatientEhrPreviewViewModel['identifiers'][number];
}) {
  return (
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
          {patient.recordName}
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
          label="Gender / Pronouns"
          value={`${authoredDetailLabel(patient.details.sexAtBirth)} — ${authoredDetailLabel(patient.details.pronouns)}`}
        />
        <PatientChip label="Visit type" value="Requires scenario" />
        <PatientChip label="Ward / Bay" value="Requires scenario" />
        {activeAllergies.length ? (
          <div className="ml-auto rounded-[3px] border-2 border-[#ef4444] bg-[#fee2e2] px-3 py-1.5 text-[11px] font-bold text-[#991b1b]">
            ⚠{' '}
            {activeAllergies
              .map(({ substance }) => substance.toUpperCase())
              .join(', ')}{' '}
            — reported reaction
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DemographicAndAdministrativeSection({
  headingRef,
  patient,
  primaryIdentifier,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  patient: PatientEhrPreviewViewModel;
  primaryIdentifier?: PatientEhrPreviewViewModel['identifiers'][number];
}) {
  return (
    <EhrSection
      badge="PRE-POPULATED"
      headingRef={headingRef}
      id={EhrSectionType.DemographicAndAdministrative}
      title="Demographic and administrative"
    >
      <div className="border-l-4 border-[#7b3fa0] bg-[#f3ecf8] px-3 py-2 text-[11px] leading-5 text-[#4a1d66]">
        🏫 <strong>Shared FBMH Interprofessional Education case.</strong> This
        record is used by Nursing, Medicine, Pharmacy, Speech & Language Therapy
        and Social Work students. Complete the sections relevant to your
        professional role—the case is designed so that a full picture only
        emerges when perspectives are brought together.
      </div>
      <FieldGrid columns={3}>
        <ReadOnlyField label="Full name" value={patient.recordName} />
        <ReadOnlyField
          label="Date of birth"
          value={new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'long',
          }).format(new Date(`${patient.dateOfBirth}T00:00:00Z`))}
        />
        <ReadOnlyField label="Age" value={patientAge(patient.dateOfBirth)} />
      </FieldGrid>
      <FieldGrid columns={3}>
        <ReadOnlyField
          label={primaryIdentifier?.display ?? 'Patient number'}
          value={primaryIdentifier?.value ?? 'Not recorded'}
        />
        <ReadOnlyField
          label="Gender / Pronouns"
          value={`${authoredDetailLabel(patient.details.sexAtBirth)} — ${authoredDetailLabel(patient.details.pronouns)}`}
        />
        <ReadOnlyField
          label="Handedness"
          value={patient.details.handedness ?? 'Not recorded'}
        />
      </FieldGrid>
      <FieldGrid columns={2}>
        <ReadOnlyField
          label="Address"
          value={patient.details.address?.join(', ') ?? 'Not recorded'}
        />
        <ReadOnlyField
          label="GP"
          value={patient.details.gpPractice ?? 'Not recorded'}
        />
      </FieldGrid>
      <FieldGrid columns={2}>
        <ReadOnlyField
          label="Next of kin"
          value={patient.details.nextOfKin.join('; ') || 'Not recorded'}
        />
        <ReadOnlyField
          label="Occupation / social"
          value={patient.details.occupationAndSocial ?? 'Not recorded'}
        />
      </FieldGrid>
      <Divider />
      <FieldGrid columns={3}>
        <UnavailableField label="Admitted" source="scenario" />
        <UnavailableField label="Source of admission" source="scenario" />
        <UnavailableField label="Admitting team" source="scenario" />
      </FieldGrid>
      <UnavailableField label="Reason for admission" source="scenario" />
      <Divider />
      <FieldGrid columns={2}>
        <LearnerField
          label="Assessor name & role/PIN"
          placeholder="Full name, role and PIN/student ID"
          required
        />
        <LearnerField
          label="Professional programme"
          placeholder="Select"
          required
        />
        <LearnerField label="Date of this entry" placeholder="Date" required />
        <LearnerField label="Time of entry" placeholder="Time" required />
      </FieldGrid>
    </EhrSection>
  );
}

export function PresentingHistoryNeurologicalSection({
  headingRef,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <EhrSection
      badge="STUDENT TO COMPLETE"
      evidenceHref="https://www.stroke.org.uk/what-is-stroke/what-are-the-effects-of-stroke"
      headingRef={headingRef}
      id="presenting-history-neuro"
      title="B — Presenting History & Neurological Assessment"
    >
      <div className="border-l-4 border-[#0072ce] bg-[#e8f3fb] px-3 py-2 text-[11px] leading-5 text-[#003b6f]">
        ⓘ <strong>History as given by Esther and her daughter Tasha.</strong>{' '}
        Esther is talkative and answers open questions but tends to give only
        the information she is specifically asked for—a useful prompt to
        practise structured, systematic history-taking.
      </div>
      <UnavailableField
        label="Onset (2 days prior to admission, witnessed by daughter)"
        source="scenario"
        tall
      />
      <FieldGrid columns={2}>
        <UnavailableField
          label="Residual symptoms (current)"
          source="scenario"
          tall
        />
        <UnavailableField
          label="Pertinent negatives (patient-reported)"
          source="scenario"
          tall
        />
      </FieldGrid>
      <Divider />
      <ClinicalPrompt>
        FAST / neurological assessment — complete on examination
      </ClinicalPrompt>
      <FieldGrid columns={2}>
        <LearnerField label="Face" placeholder="Select" />
        <LearnerField label="Arms" placeholder="Select" />
        <LearnerField label="Speech" placeholder="Select" />
        <LearnerField
          label="Limb power — left arm/hand (document scale used)"
          placeholder="e.g. MRC grade"
        />
      </FieldGrid>
      <FieldGrid columns={3}>
        <LearnerField label="Pupils" placeholder="Size, equality, reactivity" />
        <LearnerField label="GCS" placeholder="3–15" />
        <LearnerField label="Time last known well" placeholder="Time" />
      </FieldGrid>
      <LearnerField
        label="Neurological examination findings & clinical reasoning"
        placeholder="Document examination findings, correlate with the history and record a clinical impression."
        tall
      />
    </EhrSection>
  );
}

export function ClinicalHistoryMedicationsAllergiesSection({
  headingRef,
  patient,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  patient: PatientEhrPreviewViewModel;
}) {
  const activeAllergies = patient.allergies.filter(
    ({ clinicalStatus }) => clinicalStatus === 'active',
  );
  const adherenceNotes = patient.baselineMedications
    .filter(({ details }) => details)
    .map(({ medication, details }) => `${medication}: ${details}`);

  return (
    <EhrSection
      badge="REVIEW & VERIFY"
      evidenceHref="https://bnf.nice.org.uk/"
      headingRef={headingRef}
      id="clinical-history-meds-allergies"
      title="C — Clinical History, Medications & Allergies"
    >
      {activeAllergies.length ? (
        <div className="border-l-4 border-[#ae1c28] bg-[#fee2e2] px-3 py-2 text-[11px] leading-5 text-[#991b1b]">
          ⚠ <strong>Reported allergy:</strong>{' '}
          {activeAllergies
            .map(
              (allergy) =>
                `${allergy.substance} — ${allergy.reactions.join(', ') || 'reaction not recorded'} (${allergy.verificationStatus})`,
            )
            .join('; ')}
          . Confirm whether the reported reaction represents an allergy or an
          intolerance before prescribing.
        </div>
      ) : (
        <div className="border-l-4 border-[#6b7280] bg-[#f3f4f6] px-3 py-2 text-[11px] text-[#374151]">
          No allergies recorded in the Patient Profile.
        </div>
      )}
      <FieldGrid columns={2}>
        <ReadOnlyListField
          items={patient.clinicalHistory.pastMedicalHistory}
          label="Past medical history"
          tall
        />
        <ReadOnlyListField
          items={patient.clinicalHistory.familyHistory}
          label="Family history"
          tall
        />
      </FieldGrid>
      <div>
        <ClinicalPrompt>
          Regular medications (as reported by patient)
        </ClinicalPrompt>
        {patient.baselineMedications.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-[11px]">
              <thead>
                <tr className="bg-[#d0e4f7] text-left text-[10px] uppercase tracking-[0.04em] text-[#1c3a5c]">
                  <th className="px-2 py-1.5">Drug</th>
                  <th className="px-2 py-1.5">Dose</th>
                  <th className="px-2 py-1.5">Route</th>
                  <th className="px-2 py-1.5">Frequency</th>
                  <th className="px-2 py-1.5">
                    Indication (patient's understanding)
                  </th>
                </tr>
              </thead>
              <tbody>
                {patient.baselineMedications.map((medication, index) => (
                  <tr
                    className={index % 2 ? 'bg-[#f9fafb]' : 'bg-white'}
                    key={medication.id}
                  >
                    <td className="border-b border-[#e5e7eb] px-2 py-2 font-semibold">
                      {medication.medication}
                    </td>
                    <td className="border-b border-[#e5e7eb] px-2 py-2">
                      {medication.dose ?? 'Not recorded'}
                    </td>
                    <td className="border-b border-[#e5e7eb] px-2 py-2">
                      {medication.route ?? 'Not recorded'}
                    </td>
                    <td className="border-b border-[#e5e7eb] px-2 py-2">
                      {medication.frequency ?? 'Not recorded'}
                    </td>
                    <td className="border-b border-[#e5e7eb] px-2 py-2 leading-5">
                      {medication.indication ?? 'Not recorded'}
                      {medication.details ? (
                        <span className="mt-1 block font-semibold text-[#92400e]">
                          {medication.details}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[11px] italic text-[#6b7280]">
            No baseline medications recorded
          </p>
        )}
      </div>
      {adherenceNotes.length ? (
        <div className="border-l-4 border-[#d97706] bg-[#fffbeb] px-3 py-2 text-[11px] leading-5 text-[#92400e]">
          ⚠ <strong>Medicines adherence and verification:</strong>{' '}
          {adherenceNotes.join(' ')}
        </div>
      ) : null}
      <ReadOnlyListField
        items={patient.clinicalHistory.lifestyleAndSocialHistory}
        label="Lifestyle & social history"
        tall
      />
      <LearnerField
        label="Medicines reconciliation notes & actions"
        placeholder="Available when this EHR is used in a learner activity."
        tall
      />
    </EhrSection>
  );
}

function UnimplementedEhrSection({
  headingRef,
  section,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  section: EhrSectionConfiguration;
}) {
  const label = ehrSectionLabel(section);

  return (
    <EhrSection
      badge="CORE MODULE"
      headingRef={headingRef}
      id={section.id}
      title={label}
    >
      <div className="border-l-4 border-[#6b7280] bg-[#f3f4f6] px-3 py-3 text-xs leading-5 text-[#374151]">
        <strong>{label}</strong> is part of this Patient Profile EHR. Its data
        projection will be added in a dedicated module slice.
      </div>
    </EhrSection>
  );
}

function EhrSection({
  badge,
  children,
  evidenceHref,
  headingRef,
  id,
  title,
}: {
  badge: string;
  children: ReactNode;
  evidenceHref?: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  id: string;
  title: string;
}) {
  return (
    <section
      className="w-full overflow-hidden rounded-[2px] border border-[#b8cce0] bg-white"
      id={id}
    >
      <header className="flex items-center justify-between gap-4 border-b border-[#b0cce4] border-l-[3px] border-l-[#1460aa] bg-[#d0e4f7] px-3 py-1.5 text-[#1c3a5c]">
        <h2
          className="text-[11px] font-bold uppercase tracking-[0.04em] outline-none"
          ref={headingRef}
          tabIndex={-1}
        >
          {title}{' '}
          {evidenceHref ? (
            <a
              className="ml-1 text-[9px] font-semibold normal-case text-[#0072ce] underline decoration-dotted underline-offset-2"
              href={evidenceHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              Evidence ↗
            </a>
          ) : null}
        </h2>
        <span className="shrink-0 bg-[#1460aa] px-2 py-0.5 text-[10px] font-semibold text-white">
          {badge}
        </span>
      </header>
      <div className="space-y-2.5 p-3">{children}</div>
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
      className={`flex w-full cursor-pointer items-center gap-2 border-b border-[#e4eff9] px-2.5 py-2 text-left text-[11px] max-md:w-auto max-md:border-r max-md:border-b-0 ${
        active
          ? 'border-l-[3px] border-l-[#0072ce] bg-[#bdd9ff] font-bold text-[#0a3a7a]'
          : 'text-[#1c3a5c] hover:bg-[#d6ecff] hover:text-[#1460aa]'
      }`}
      onClick={onClick}
      type="button"
    >
      <NavCode>{code}</NavCode>
      <span className="min-w-0 max-md:whitespace-nowrap">{label}</span>
    </button>
  );
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
      <FieldLabel>{label}</FieldLabel>
      <p className="min-h-7 break-words rounded-[3px] border border-[#b8cfe8] bg-[#edf3fb] px-2 py-1.5 text-xs font-medium text-[#1c2b4a]">
        {value}
      </p>
    </div>
  );
}

function ReadOnlyListField({
  items,
  label,
  tall = false,
}: {
  items: readonly string[];
  label: string;
  tall?: boolean;
}) {
  return (
    <div className="min-w-0">
      <FieldLabel>{label}</FieldLabel>
      <ul
        className={`space-y-1 rounded-[3px] border border-[#b8cfe8] bg-[#edf3fb] px-3 py-2 text-xs leading-5 text-[#1c2b4a] ${tall ? 'min-h-28' : ''}`}
      >
        {items.length ? (
          items.map((item, index) => <li key={`${index}-${item}`}>· {item}</li>)
        ) : (
          <li>Not recorded</li>
        )}
      </ul>
    </div>
  );
}

function UnavailableField({
  label,
  source,
  tall = false,
}: {
  label: string;
  source: 'scenario';
  tall?: boolean;
}) {
  return (
    <div className="min-w-0">
      <FieldLabel>{label}</FieldLabel>
      <p
        className={`rounded-[3px] border border-dashed border-[#aab7c4] bg-[#f3f4f6] px-2 py-1.5 text-xs italic text-[#6b7280] ${tall ? 'min-h-20' : 'min-h-7'}`}
      >
        Requires an Esther {source}.
      </p>
    </div>
  );
}

function LearnerField({
  label,
  placeholder,
  required = false,
  tall = false,
}: {
  label: string;
  placeholder: string;
  required?: boolean;
  tall?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-0.5 text-[10px] font-bold uppercase text-[#374151]">
        {label}
        {required ? <span className="ml-0.5 text-[#ae1c28]">*</span> : null}
      </p>
      <div
        aria-disabled="true"
        className={`rounded-[3px] border border-[#d1d5db] bg-[#f9fafb] px-2 py-1.5 text-xs text-[#6b7280] ${tall ? 'min-h-20' : 'min-h-7'}`}
      >
        {placeholder} · Available in learner activity
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-0.5 text-[10px] font-bold uppercase text-[#6b7280]">
      {children}
    </p>
  );
}

function ClinicalPrompt({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.03em] text-[#1c3a5c]">
      {children}
    </p>
  );
}

function Divider() {
  return <hr className="border-0 border-t border-[#e5e7eb]" />;
}
