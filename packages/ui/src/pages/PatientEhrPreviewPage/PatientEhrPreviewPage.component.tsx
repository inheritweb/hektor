'use client';

import {
  EhrSectionType,
  PatientHistoryEntryType,
  type EhrSectionConfiguration,
  type PatientHistoryEntry,
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
  historyEntries: readonly PatientHistoryEntry[];
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
  nextPatient?: PatientEhrPreviewNavigationItem;
  patient: PatientEhrPreviewViewModel;
  previousPatient?: PatientEhrPreviewNavigationItem;
}

export interface PatientEhrPreviewNavigationItem {
  href: string;
  label: string;
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
  nextPatient,
  patient,
  previousPatient,
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
          nextPreview={nextPatient}
          previousPreview={previousPatient}
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
          ) : activeSection ===
            EhrSectionType.MedicationsAndMedicinesOptimisation ? (
            <MedicationsAndMedicinesOptimisationSection
              headingRef={sectionHeading}
              patient={patient}
            />
          ) : activeSection === EhrSectionType.ProblemListAndClinicalHistory ? (
            <ProblemListAndClinicalHistorySection
              headingRef={sectionHeading}
              patient={patient}
            />
          ) : activeSection ===
            EhrSectionType.StandardisedAssessmentsAndRiskScreening ? (
            <StandardisedAssessmentsAndRiskScreeningSection
              headingRef={sectionHeading}
              patient={patient}
            />
          ) : activeSection === EhrSectionType.CareAndSupportPlanning ? (
            <CareAndSupportPlanningSection
              headingRef={sectionHeading}
              patient={patient}
            />
          ) : activeSection ===
            EhrSectionType.ObservationsInvestigationsAndProcedures ? (
            <ObservationsInvestigationsAndProceduresSection
              headingRef={sectionHeading}
              patient={patient}
            />
          ) : activeSection === EhrSectionType.CareEncountersAndTransitions ? (
            <CareEncountersAndTransitionsSection
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

function CareEncountersAndTransitionsSection({
  headingRef,
  patient,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  patient: PatientEhrPreviewViewModel;
}) {
  const encounters = patient.historyEntries.filter(
    (
      entry,
    ): entry is Extract<
      PatientHistoryEntry,
      { type: PatientHistoryEntryType.Encounter }
    > => entry.type === PatientHistoryEntryType.Encounter,
  );
  const referrals = patient.historyEntries.filter(
    (
      entry,
    ): entry is Extract<
      PatientHistoryEntry,
      { type: PatientHistoryEntryType.Referral }
    > => entry.type === PatientHistoryEntryType.Referral,
  );

  return (
    <EhrSection
      badge="PATIENT PROFILE"
      headingRef={headingRef}
      id={EhrSectionType.CareEncountersAndTransitions}
      title="Care encounters and transitions"
    >
      <div className="border-l-4 border-[#0072ce] bg-[#e8f3fb] px-3 py-2 text-[11px] leading-5 text-[#003b6f]">
        This view contains encounters and referral pathways completed before the
        scenario boundary. A scenario may add a current admission, transfer,
        discharge or new referral without changing the base Patient Profile.
      </div>

      <div>
        <ClinicalPrompt>Care encounters</ClinicalPrompt>
        {encounters.length ? (
          <ol className="relative space-y-3 border-l-2 border-[#8fb5da] pl-5">
            {encounters.map((encounter) => (
              <li className="relative" key={encounter.id}>
                <span
                  aria-hidden="true"
                  className="absolute top-3 -left-[1.55rem] size-2.5 rounded-full border-2 border-white bg-[#1460aa]"
                />
                <article className="overflow-hidden rounded-[3px] border border-[#b8cfe8] bg-white">
                  <div className="flex flex-wrap items-start justify-between gap-2 bg-[#edf3fb] px-3 py-2">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#52657a]">
                        {encounter.encounterType.replaceAll('_', ' ')}
                        {encounter.careSetting
                          ? ` · ${encounter.careSetting.replaceAll('_', ' ')}`
                          : ''}
                      </p>
                      <h3 className="mt-0.5 text-xs font-bold text-[#1c3a5c]">
                        {encounter.summary}
                      </h3>
                    </div>
                    {historicalPeriodLabel(encounter) ? (
                      <span className="text-[10px] font-semibold text-[#52657a]">
                        {historicalPeriodLabel(encounter)}
                      </span>
                    ) : null}
                  </div>
                  <dl className="grid gap-x-5 gap-y-2 px-3 py-3 md:grid-cols-2">
                    <ClinicalDefinition
                      label="Service"
                      value={encounter.service}
                    />
                    <ClinicalDefinition
                      label="Reason for encounter"
                      value={encounter.reason}
                    />
                    <div className="md:col-span-2">
                      <ClinicalDefinition
                        label="Outcome or transition"
                        value={encounter.outcome}
                      />
                    </div>
                    {encounter.details ? (
                      <div className="md:col-span-2">
                        <ClinicalDefinition
                          label="Additional detail"
                          value={encounter.details}
                        />
                      </div>
                    ) : null}
                  </dl>
                  <div className="px-3 pb-3">
                    <HistoricalRecordMeta entry={encounter} />
                  </div>
                </article>
              </li>
            ))}
          </ol>
        ) : (
          <NeutralRecordMessage>
            No durable care encounters recorded
          </NeutralRecordMessage>
        )}
      </div>

      <Divider />

      <div>
        <ClinicalPrompt>Referrals and care transitions</ClinicalPrompt>
        {referrals.length ? (
          <div className="grid gap-2.5 xl:grid-cols-2">
            {referrals.map((referral) => (
              <article
                className="overflow-hidden rounded-[3px] border border-[#b8cfe8] bg-white"
                key={referral.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 bg-[#d0e4f7] px-3 py-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#52657a]">
                      Referral
                    </p>
                    <h3 className="mt-0.5 text-xs font-bold text-[#1c3a5c]">
                      {referral.summary}
                    </h3>
                  </div>
                  <ReferralStatus status={referral.status} />
                </div>
                <dl className="grid gap-x-5 gap-y-2 px-3 py-3 md:grid-cols-2">
                  <ClinicalDefinition
                    label="Referred from"
                    value={referral.referredFrom}
                  />
                  <ClinicalDefinition
                    label="Referred to"
                    value={referral.referredTo}
                  />
                  <div className="md:col-span-2">
                    <ClinicalDefinition
                      label="Reason for referral"
                      value={referral.reason}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ClinicalDefinition
                      label="Outcome"
                      value={referral.outcome}
                    />
                  </div>
                  {referral.details ? (
                    <div className="md:col-span-2">
                      <ClinicalDefinition
                        label="Additional detail"
                        value={referral.details}
                      />
                    </div>
                  ) : null}
                </dl>
                <div className="px-3 pb-3">
                  <HistoricalRecordMeta entry={referral} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <NeutralRecordMessage>
            No durable referrals or care transitions recorded
          </NeutralRecordMessage>
        )}
      </div>
    </EhrSection>
  );
}

function ReferralStatus({ status }: { status: string }) {
  const classes =
    status === 'accepted' || status === 'completed'
      ? 'bg-[#dcfce7] text-[#166534]'
      : status === 'requested'
        ? 'bg-[#dbeafe] text-[#1e40af]'
        : 'bg-[#e5e7eb] text-[#4b5563]';

  return (
    <span
      className={`rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] ${classes}`}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}

function ObservationsInvestigationsAndProceduresSection({
  headingRef,
  patient,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  patient: PatientEhrPreviewViewModel;
}) {
  const observations = patient.historyEntries.filter(
    (
      entry,
    ): entry is Extract<
      PatientHistoryEntry,
      { type: PatientHistoryEntryType.Observation }
    > => entry.type === PatientHistoryEntryType.Observation,
  );
  const investigations = patient.historyEntries.filter(
    (
      entry,
    ): entry is Extract<
      PatientHistoryEntry,
      { type: PatientHistoryEntryType.Investigation }
    > => entry.type === PatientHistoryEntryType.Investigation,
  );
  const procedures = patient.historyEntries.filter(
    (
      entry,
    ): entry is Extract<
      PatientHistoryEntry,
      { type: PatientHistoryEntryType.Procedure }
    > => entry.type === PatientHistoryEntryType.Procedure,
  );

  return (
    <EhrSection
      badge="PATIENT PROFILE"
      headingRef={headingRef}
      id={EhrSectionType.ObservationsInvestigationsAndProcedures}
      title="Observations, investigations and procedures"
    >
      <div className="border-l-4 border-[#0072ce] bg-[#e8f3fb] px-3 py-2 text-[11px] leading-5 text-[#003b6f]">
        These are durable records from before the scenario boundary. Current
        observations, episode investigations and procedures appear only when a
        scenario layer supplies them.
      </div>

      <div>
        <ClinicalPrompt>Recorded observations</ClinicalPrompt>
        {observations.length ? (
          <div className="overflow-x-auto rounded-[3px] border border-[#b8cfe8] bg-white">
            <table className="w-full min-w-[44rem] border-collapse text-[11px]">
              <thead>
                <tr className="bg-[#d0e4f7] text-left text-[10px] uppercase tracking-[0.04em] text-[#1c3a5c]">
                  <th className="px-2 py-2">Observation</th>
                  <th className="px-2 py-2">Value</th>
                  <th className="px-2 py-2">Reference range</th>
                  <th className="px-2 py-2">Interpretation</th>
                  <th className="px-2 py-2">When</th>
                  <th className="px-2 py-2">Context</th>
                </tr>
              </thead>
              <tbody>
                {observations.map((observation, index) => (
                  <tr
                    className={index % 2 ? 'bg-[#f9fafb]' : 'bg-white'}
                    key={observation.id}
                  >
                    <td className="border-b border-[#d8dee8] px-2 py-2 font-bold text-[#1c2b4a]">
                      {observation.observation.display}
                    </td>
                    <td className="border-b border-[#d8dee8] px-2 py-2 font-semibold">
                      {observationValueLabel(observation.value)}
                    </td>
                    <ClinicalTableValue value={observation.referenceRange} />
                    <td className="border-b border-[#d8dee8] px-2 py-2">
                      <ResultInterpretation
                        interpretation={observation.interpretation}
                      />
                    </td>
                    <ClinicalTableValue
                      value={historicalPeriodLabel(observation)}
                    />
                    <ClinicalTableValue
                      value={observation.details ?? observation.summary}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <NeutralRecordMessage>
            No durable observations recorded
          </NeutralRecordMessage>
        )}
      </div>

      <Divider />

      <div>
        <ClinicalPrompt>Investigations and results</ClinicalPrompt>
        {investigations.length ? (
          <div className="space-y-3">
            {investigations.map((investigation) => (
              <InvestigationCard
                investigation={investigation}
                key={investigation.id}
              />
            ))}
          </div>
        ) : (
          <NeutralRecordMessage>
            No durable investigations recorded
          </NeutralRecordMessage>
        )}
      </div>

      <Divider />

      <div>
        <ClinicalPrompt>Procedures</ClinicalPrompt>
        {procedures.length ? (
          <div className="grid gap-2.5 xl:grid-cols-2">
            {procedures.map((procedure) => (
              <article
                className="overflow-hidden rounded-[3px] border border-[#b8cfe8] bg-white"
                key={procedure.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 bg-[#d0e4f7] px-3 py-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#52657a]">
                      Recorded procedure
                    </p>
                    <h3 className="mt-0.5 text-xs font-bold text-[#1c3a5c]">
                      {procedure.procedure.display}
                    </h3>
                  </div>
                  {procedure.sensitivity === 'restricted' ? (
                    <span className="rounded-sm bg-[#fef3c7] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#92400e]">
                      Restricted
                    </span>
                  ) : null}
                </div>
                <dl className="grid gap-x-4 gap-y-2 px-3 py-3 md:grid-cols-2">
                  <ClinicalDefinition
                    label="Record summary"
                    value={procedure.summary}
                  />
                  <ClinicalDefinition
                    label="Indication"
                    value={procedure.indication}
                  />
                  <ClinicalDefinition
                    label="Outcome"
                    value={procedure.outcome}
                  />
                  <ClinicalDefinition
                    label="Complications"
                    value={procedure.complications}
                  />
                  {procedure.details ? (
                    <div className="md:col-span-2">
                      <ClinicalDefinition
                        label="Additional detail"
                        value={procedure.details}
                      />
                    </div>
                  ) : null}
                </dl>
                <div className="px-3 pb-3">
                  <HistoricalRecordMeta entry={procedure} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <NeutralRecordMessage>
            No durable procedures recorded
          </NeutralRecordMessage>
        )}
      </div>
    </EhrSection>
  );
}

function InvestigationCard({
  investigation,
}: {
  investigation: Extract<
    PatientHistoryEntry,
    { type: PatientHistoryEntryType.Investigation }
  >;
}) {
  return (
    <article className="overflow-hidden rounded-[3px] border border-[#b8cfe8] bg-white">
      <div className="flex flex-wrap items-start justify-between gap-2 bg-[#d0e4f7] px-3 py-2">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#52657a]">
            {investigation.kind.replaceAll('_', ' ')} investigation
          </p>
          <h3 className="mt-0.5 text-xs font-bold text-[#1c3a5c]">
            {investigation.investigation.display}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#1c3a5c]">
            {investigation.status.replaceAll('_', ' ')}
          </span>
          {investigation.sensitivity === 'restricted' ? (
            <span className="rounded-sm bg-[#fef3c7] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#92400e]">
              Restricted
            </span>
          ) : null}
        </div>
      </div>
      <div className="space-y-3 px-3 py-3">
        <p className="text-[11px] leading-5 text-[#1c2b4a]">
          {investigation.summary}
        </p>
        {investigation.results.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[38rem] border-collapse text-[11px]">
              <thead>
                <tr className="bg-[#edf3fb] text-left text-[10px] uppercase tracking-[0.04em] text-[#1c3a5c]">
                  <th className="px-2 py-1.5">Result</th>
                  <th className="px-2 py-1.5">Value</th>
                  <th className="px-2 py-1.5">Reference range</th>
                  <th className="px-2 py-1.5">Flag</th>
                </tr>
              </thead>
              <tbody>
                {investigation.results.map((result) => (
                  <tr key={result.id}>
                    <td className="border-b border-[#d8dee8] px-2 py-2 font-semibold">
                      {result.observation.display}
                    </td>
                    <td className="border-b border-[#d8dee8] px-2 py-2">
                      {observationValueLabel(result.value)}
                    </td>
                    <ClinicalTableValue value={result.referenceRange} />
                    <td className="border-b border-[#d8dee8] px-2 py-2">
                      <ResultInterpretation
                        interpretation={result.interpretation}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[11px] italic text-[#6b7280]">
            No discrete result values recorded
          </p>
        )}
        <dl>
          <ClinicalDefinition
            label="Conclusion"
            value={investigation.conclusion}
          />
        </dl>
        {investigation.details ? (
          <dl>
            <ClinicalDefinition
              label="Additional detail"
              value={investigation.details}
            />
          </dl>
        ) : null}
        <HistoricalRecordMeta entry={investigation} />
      </div>
    </article>
  );
}

function ClinicalTableValue({ value }: { value?: string }) {
  return (
    <td className="border-b border-[#d8dee8] px-2 py-2 align-top leading-5">
      {value ?? 'Not recorded'}
    </td>
  );
}

function ResultInterpretation({ interpretation }: { interpretation?: string }) {
  if (!interpretation)
    return <span className="text-[#6b7280]">Not recorded</span>;
  const highlighted = interpretation !== 'normal';
  return (
    <span
      className={
        highlighted
          ? 'font-bold text-[#92400e]'
          : 'font-semibold text-[#166534]'
      }
    >
      {interpretation.replaceAll('_', ' ')}
    </span>
  );
}

function ClinicalDefinition({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div>
      <dt className="text-[9px] font-bold uppercase tracking-[0.04em] text-[#52657a]">
        {label}
      </dt>
      <dd
        className={`mt-0.5 text-[11px] leading-5 ${value ? 'text-[#1c2b4a]' : 'italic text-[#6b7280]'}`}
      >
        {value ?? 'Not recorded'}
      </dd>
    </div>
  );
}

function CareAndSupportPlanningSection({
  headingRef,
  patient,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  patient: PatientEhrPreviewViewModel;
}) {
  const carePlans = patient.historyEntries.filter(
    (
      entry,
    ): entry is Extract<
      PatientHistoryEntry,
      { type: PatientHistoryEntryType.CarePlan }
    > => entry.type === PatientHistoryEntryType.CarePlan,
  );

  return (
    <EhrSection
      badge="PATIENT PROFILE"
      headingRef={headingRef}
      id={EhrSectionType.CareAndSupportPlanning}
      title="Care and support planning"
    >
      <div className="border-l-4 border-[#0072ce] bg-[#e8f3fb] px-3 py-2 text-[11px] leading-5 text-[#003b6f]">
        This view contains authored care and support plans that form part of the
        durable Patient Profile. It does not infer a plan from diagnoses,
        relationships or background facts.
      </div>

      <div>
        <ClinicalPrompt>Recorded care and support plans</ClinicalPrompt>
        {carePlans.length ? (
          <div className="space-y-3">
            {carePlans.map((carePlan) => (
              <article
                className="overflow-hidden rounded-[3px] border border-[#b8cfe8] bg-white"
                key={carePlan.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 bg-[#d0e4f7] px-3 py-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#52657a]">
                      Care and support plan
                    </p>
                    <h3 className="mt-0.5 text-xs font-bold text-[#1c3a5c]">
                      {carePlan.summary}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <CarePlanStatus status={carePlan.status} />
                    {carePlan.sensitivity === 'restricted' ? (
                      <span className="rounded-sm bg-[#fef3c7] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#92400e]">
                        Restricted
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-4 px-3 py-3">
                  {carePlan.details ? (
                    <p className="text-[11px] leading-5 text-[#374151]">
                      {carePlan.details}
                    </p>
                  ) : null}
                  <div>
                    <FieldLabel>Identified need</FieldLabel>
                    <p className="text-[11px] leading-5 text-[#1c2b4a]">
                      {carePlan.need}
                    </p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <CarePlanList
                      emptyLabel="No goals recorded"
                      items={carePlan.goals}
                      label="Goals"
                    />
                    <CarePlanList
                      emptyLabel="No interventions recorded"
                      items={carePlan.interventions}
                      label="Planned interventions and support"
                    />
                  </div>
                  <div>
                    <FieldLabel>Evaluation</FieldLabel>
                    <p
                      className={`text-[11px] leading-5 ${carePlan.evaluation ? 'text-[#1c2b4a]' : 'italic text-[#6b7280]'}`}
                    >
                      {carePlan.evaluation ?? 'No evaluation recorded'}
                    </p>
                  </div>
                  <HistoricalRecordMeta entry={carePlan} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-l-4 border-[#6b7280] bg-[#f3f4f6] px-3 py-3 text-[11px] leading-5 text-[#374151]">
            <strong>
              No durable care or support plan is recorded in this base Patient
              Profile.
            </strong>{' '}
            This does not mean that the person has no care needs or that a
            scenario contains no care-planning activity.
          </div>
        )}
      </div>
    </EhrSection>
  );
}

function CarePlanStatus({ status }: { status: string }) {
  const classes =
    status === 'active_at_boundary'
      ? 'bg-[#dcfce7] text-[#166534]'
      : status === 'completed'
        ? 'bg-[#e0e7ff] text-[#3730a3]'
        : 'bg-[#fef3c7] text-[#92400e]';

  return (
    <span
      className={`rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] ${classes}`}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}

function CarePlanList({
  emptyLabel,
  items,
  label,
}: {
  emptyLabel: string;
  items: readonly string[];
  label: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {items.length ? (
        <ul className="mt-1 space-y-1">
          {items.map((item) => (
            <li
              className="border-l-2 border-[#8fb5da] bg-[#f3f7fd] px-2 py-1 text-[11px] leading-5"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-[11px] italic text-[#6b7280]">{emptyLabel}</p>
      )}
    </div>
  );
}

function HistoricalRecordMeta({ entry }: { entry: PatientHistoryEntry }) {
  const occurred = historicalPeriodLabel(entry);
  const author = entry.author
    ? [entry.author.name, entry.author.role, entry.author.service]
        .filter(Boolean)
        .join(' · ')
    : undefined;
  const parts = [
    occurred,
    entry.recordedOn
      ? `Recorded ${historicalDateLabel(entry.recordedOn)}`
      : undefined,
    author ? `By ${author}` : undefined,
  ].filter(Boolean);

  return parts.length ? (
    <p className="border-t border-[#e5e7eb] pt-2 text-[10px] text-[#6b7280]">
      {parts.join(' · ')}
    </p>
  ) : null;
}

function StandardisedAssessmentsAndRiskScreeningSection({
  headingRef,
  patient,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  patient: PatientEhrPreviewViewModel;
}) {
  const assessments = patient.historyEntries.filter(
    (
      entry,
    ): entry is Extract<
      PatientHistoryEntry,
      { type: PatientHistoryEntryType.Assessment }
    > =>
      entry.type === PatientHistoryEntryType.Assessment &&
      (entry.score !== undefined ||
        Boolean(entry.scale) ||
        Boolean(entry.components?.length)),
  );

  return (
    <EhrSection
      badge="PATIENT PROFILE"
      headingRef={headingRef}
      id={EhrSectionType.StandardisedAssessmentsAndRiskScreening}
      title="Standardised assessments and risk screening"
    >
      <div className="border-l-4 border-[#0072ce] bg-[#e8f3fb] px-3 py-2 text-[11px] leading-5 text-[#003b6f]">
        This view contains completed structured assessments recorded before the
        scenario boundary. Current risk screens and learner-entered assessments
        appear only when supplied by a scenario or activity.
      </div>

      <div>
        <ClinicalPrompt>Recorded assessments and screens</ClinicalPrompt>
        {assessments.length ? (
          <div className="grid gap-2.5 xl:grid-cols-2">
            {assessments.map((assessment) => (
              <article
                className="overflow-hidden rounded-[3px] border border-[#b8cfe8] bg-white"
                key={assessment.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 bg-[#d0e4f7] px-3 py-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#52657a]">
                      Recorded assessment
                    </p>
                    <h3 className="mt-0.5 text-xs font-bold text-[#1c3a5c]">
                      {assessment.assessment.display}
                    </h3>
                  </div>
                  {assessment.score !== undefined ? (
                    <div className="min-w-16 rounded-[3px] border border-[#8fb5da] bg-white px-2 py-1 text-center">
                      <span className="block text-[9px] font-bold uppercase text-[#52657a]">
                        Score
                      </span>
                      <strong className="text-sm text-[#1c2b4a]">
                        {assessment.score}
                        {assessment.scale ? ` ${assessment.scale}` : ''}
                      </strong>
                    </div>
                  ) : assessment.scale ? (
                    <span className="rounded-sm bg-white px-2 py-1 text-[10px] font-semibold text-[#1c3a5c]">
                      {assessment.scale}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-3 px-3 py-3">
                  <div>
                    <FieldLabel>Record summary</FieldLabel>
                    <p className="text-[11px] leading-5 text-[#1c2b4a]">
                      {assessment.summary}
                    </p>
                  </div>
                  <div>
                    <FieldLabel>Outcome</FieldLabel>
                    <p className="text-[11px] leading-5 text-[#1c2b4a]">
                      {assessment.outcome}
                    </p>
                  </div>
                  {assessment.components?.length ? (
                    <div>
                      <FieldLabel>Recorded components</FieldLabel>
                      <ul className="mt-1 grid gap-1 md:grid-cols-2">
                        {assessment.components.map((component) => (
                          <li
                            className="border-l-2 border-[#8fb5da] bg-[#f3f7fd] px-2 py-1 text-[11px] leading-5"
                            key={component}
                          >
                            {component}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <AssessmentRecordMeta assessment={assessment} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-l-4 border-[#6b7280] bg-[#f3f4f6] px-3 py-3 text-[11px] leading-5 text-[#374151]">
            <strong>
              No standardised assessments or risk screens are recorded in this
              base Patient Profile.
            </strong>{' '}
            This does not mean that screening has been completed or that no
            risks are present. Scenario-specific assessments will appear here
            when scenario layers are introduced.
          </div>
        )}
      </div>
    </EhrSection>
  );
}

function AssessmentRecordMeta({
  assessment,
}: {
  assessment: Extract<
    PatientHistoryEntry,
    { type: PatientHistoryEntryType.Assessment }
  >;
}) {
  const occurred = historicalPeriodLabel(assessment);
  const author = assessment.author
    ? [
        assessment.author.name,
        assessment.author.role,
        assessment.author.service,
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined;

  if (!occurred && !assessment.recordedOn && !author) return null;

  return (
    <p className="border-t border-[#e5e7eb] pt-2 text-[10px] text-[#6b7280]">
      {[
        occurred,
        assessment.recordedOn
          ? `Recorded ${historicalDateLabel(assessment.recordedOn)}`
          : undefined,
        author ? `By ${author}` : undefined,
      ]
        .filter(Boolean)
        .join(' · ')}
    </p>
  );
}

function ProblemListAndClinicalHistorySection({
  headingRef,
  patient,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  patient: PatientEhrPreviewViewModel;
}) {
  const problems = patient.problems
    .map((problem, sourceIndex) => ({ problem, sourceIndex }))
    .sort((left, right) => {
      const statusOrder = { active: 0, inactive: 1, resolved: 2 };
      return (
        (statusOrder[left.problem.clinicalStatus as keyof typeof statusOrder] ??
          3) -
          (statusOrder[
            right.problem.clinicalStatus as keyof typeof statusOrder
          ] ?? 3) || left.sourceIndex - right.sourceIndex
      );
    })
    .map(({ problem }) => problem);

  return (
    <EhrSection
      badge="PATIENT PROFILE"
      headingRef={headingRef}
      id={EhrSectionType.ProblemListAndClinicalHistory}
      title="Problem list / clinical history"
    >
      <div className="border-l-4 border-[#0072ce] bg-[#e8f3fb] px-3 py-2 text-[11px] leading-5 text-[#003b6f]">
        This module contains durable problems and historical records from the
        selected Patient Profile version. A current presentation or episode is
        added by a scenario.
      </div>

      <div>
        <ClinicalPrompt>Problem list</ClinicalPrompt>
        {problems.length ? (
          <div className="overflow-hidden rounded-[3px] border border-[#b8cfe8] bg-white">
            <div className="hidden grid-cols-[minmax(12rem,2fr)_7rem_8rem_8rem_minmax(12rem,2fr)] bg-[#d0e4f7] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.04em] text-[#1c3a5c] md:grid">
              <span>Problem</span>
              <span>Status</span>
              <span>Onset</span>
              <span>Resolved</span>
              <span>Details</span>
            </div>
            {problems.map((problem, index) => (
              <article
                className={`grid gap-2 border-t border-[#d8dee8] px-3 py-3 first:border-t-0 md:grid-cols-[minmax(12rem,2fr)_7rem_8rem_8rem_minmax(12rem,2fr)] md:items-start ${index % 2 ? 'bg-[#f9fafb]' : 'bg-white'}`}
                key={problem.id}
              >
                <h3 className="text-xs font-bold text-[#1c2b4a]">
                  {problem.problem}
                </h3>
                <ProblemStatus status={problem.clinicalStatus} />
                <CompactClinicalValue label="Onset" value={problem.onsetDate} />
                <CompactClinicalValue
                  label="Resolved"
                  value={problem.resolvedDate}
                />
                <CompactClinicalValue label="Details" value={problem.details} />
              </article>
            ))}
          </div>
        ) : (
          <NeutralRecordMessage>No problems recorded</NeutralRecordMessage>
        )}
      </div>

      <Divider />

      <div>
        <ClinicalPrompt>Clinical history</ClinicalPrompt>
        {patient.historyEntries.length ? (
          <div className="space-y-2.5">
            {patient.historyEntries.map((entry) => (
              <HistoryEntryCard entry={entry} key={entry.id} />
            ))}
          </div>
        ) : (
          <NeutralRecordMessage>
            No historical records documented
          </NeutralRecordMessage>
        )}
      </div>
    </EhrSection>
  );
}

function ProblemStatus({ status }: { status: string }) {
  const classes =
    status === 'active'
      ? 'bg-[#dcfce7] text-[#166534]'
      : status === 'resolved'
        ? 'bg-[#e0e7ff] text-[#3730a3]'
        : 'bg-[#e5e7eb] text-[#4b5563]';
  return (
    <span
      className={`w-fit rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] ${classes}`}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}

function CompactClinicalValue({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="text-[11px] leading-5">
      <span className="mr-1 font-bold text-[#52657a] md:hidden">{label}:</span>
      <span>{value ?? 'Not recorded'}</span>
    </div>
  );
}

function HistoryEntryCard({ entry }: { entry: PatientHistoryEntry }) {
  const details = historyEntryDetails(entry);
  const occurred = historicalPeriodLabel(entry);
  const author = entry.author
    ? [entry.author.name, entry.author.role, entry.author.service]
        .filter(Boolean)
        .join(' · ')
    : undefined;

  return (
    <article className="overflow-hidden rounded-[3px] border border-[#b8cfe8] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#edf3fb] px-3 py-2">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#52657a]">
            {entry.type.replaceAll('_', ' ')}
          </p>
          <h3 className="mt-0.5 text-xs font-bold text-[#1c2b4a]">
            {entry.summary}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {occurred ? (
            <span className="text-[10px] font-semibold text-[#52657a]">
              {occurred}
            </span>
          ) : null}
          {entry.sensitivity === 'restricted' ? (
            <span className="rounded-sm bg-[#fef3c7] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#92400e]">
              Restricted
            </span>
          ) : null}
        </div>
      </div>
      <div className="px-3 py-3">
        {entry.details ? (
          <p className="mb-3 text-[11px] leading-5 text-[#374151]">
            {entry.details}
          </p>
        ) : null}
        {details.length ? (
          <dl className="grid gap-x-5 gap-y-2 md:grid-cols-2">
            {details.map(({ label, value }) => (
              <div key={`${entry.id}-${label}`}>
                <dt className="text-[9px] font-bold uppercase tracking-[0.04em] text-[#52657a]">
                  {label}
                </dt>
                <dd className="mt-0.5 whitespace-pre-line text-[11px] leading-5 text-[#1c2b4a]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {entry.recordedOn || author ? (
          <p className="mt-3 border-t border-[#e5e7eb] pt-2 text-[10px] text-[#6b7280]">
            {entry.recordedOn
              ? `Recorded ${historicalDateLabel(entry.recordedOn)}`
              : ''}
            {entry.recordedOn && author ? ' · ' : ''}
            {author ? `By ${author}` : ''}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function historyEntryDetails(entry: PatientHistoryEntry) {
  const details: { label: string; value: string }[] = [];
  const add = (label: string, value?: string | number) => {
    if (value !== undefined && value !== '')
      details.push({ label, value: String(value) });
  };

  switch (entry.type) {
    case PatientHistoryEntryType.Encounter:
      add('Encounter', entry.encounterType.replaceAll('_', ' '));
      add('Care setting', entry.careSetting?.replaceAll('_', ' '));
      add('Service', entry.service);
      add('Reason', entry.reason);
      add('Outcome', entry.outcome);
      break;
    case PatientHistoryEntryType.Observation:
      add('Observation', entry.observation.display);
      add('Value', observationValueLabel(entry.value));
      add('Reference range', entry.referenceRange);
      add('Interpretation', entry.interpretation);
      break;
    case PatientHistoryEntryType.Assessment:
      add('Assessment', entry.assessment.display);
      add(
        'Score',
        entry.score === undefined
          ? undefined
          : `${entry.score}${entry.scale ? ` ${entry.scale}` : ''}`,
      );
      add('Outcome', entry.outcome);
      add('Components', entry.components?.join('\n'));
      break;
    case PatientHistoryEntryType.Investigation:
      add('Investigation', entry.investigation.display);
      add('Kind', entry.kind.replaceAll('_', ' '));
      add('Status', entry.status.replaceAll('_', ' '));
      add(
        'Results',
        entry.results
          .map(
            (result) =>
              `${result.observation.display}: ${observationValueLabel(result.value)}${result.referenceRange ? ` (range ${result.referenceRange})` : ''}${result.interpretation ? ` — ${result.interpretation}` : ''}`,
          )
          .join('\n'),
      );
      add('Conclusion', entry.conclusion);
      break;
    case PatientHistoryEntryType.Procedure:
      add('Procedure', entry.procedure.display);
      add('Indication', entry.indication);
      add('Outcome', entry.outcome);
      add('Complications', entry.complications);
      break;
    case PatientHistoryEntryType.MedicationCourse:
      add('Medicine', entry.medication.display);
      add('Status', entry.status.replaceAll('_', ' '));
      add('Dose', entry.dose);
      add('Route', entry.route?.display);
      add('Frequency', entry.frequency);
      add('Indication', entry.indication);
      add('Reason ended', entry.reasonEnded);
      add('Response', entry.response);
      break;
    case PatientHistoryEntryType.Referral:
      add('Status', entry.status.replaceAll('_', ' '));
      add('Referred from', entry.referredFrom);
      add('Referred to', entry.referredTo);
      add('Reason', entry.reason);
      add('Outcome', entry.outcome);
      break;
    case PatientHistoryEntryType.ClinicalDocument:
      add('Document type', entry.documentType.replaceAll('_', ' '));
      add('Title', entry.title);
      add('Document', entry.body);
      break;
    case PatientHistoryEntryType.CarePlan:
      add('Status', entry.status.replaceAll('_', ' '));
      add('Need', entry.need);
      add('Goals', entry.goals.join('\n'));
      add('Interventions', entry.interventions.join('\n'));
      add('Evaluation', entry.evaluation);
      break;
  }

  return details;
}

function observationValueLabel(
  value: Extract<
    PatientHistoryEntry,
    { type: PatientHistoryEntryType.Observation }
  >['value'],
) {
  if (value.type === 'quantity') return `${value.value} ${value.unit}`;
  if (value.type === 'coded') return value.value.display;
  if (value.type === 'boolean') return value.value ? 'Yes' : 'No';
  return value.value;
}

function historicalPeriodLabel(entry: PatientHistoryEntry) {
  const { start, end } = entry.occurred ?? {};
  if (start && end)
    return `${historicalDateLabel(start)} to ${historicalDateLabel(end)}`;
  if (start) return historicalDateLabel(start);
  if (end) return `Until ${historicalDateLabel(end)}`;
  return undefined;
}

function historicalDateLabel(date: { approximate?: boolean; value: string }) {
  return `${date.approximate ? 'About ' : ''}${date.value}`;
}

function MedicationsAndMedicinesOptimisationSection({
  headingRef,
  patient,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  patient: PatientEhrPreviewViewModel;
}) {
  const medications = patient.baselineMedications
    .map((medication, sourceIndex) => ({ medication, sourceIndex }))
    .sort((left, right) => {
      const leftActive = left.medication.status === 'active' ? 0 : 1;
      const rightActive = right.medication.status === 'active' ? 0 : 1;
      return leftActive - rightActive || left.sourceIndex - right.sourceIndex;
    })
    .map(({ medication }) => medication);
  const activeAllergies = patient.allergies.filter(
    ({ clinicalStatus }) => clinicalStatus === 'active',
  );

  return (
    <EhrSection
      badge="REVIEW & VERIFY"
      evidenceHref="https://bnf.nice.org.uk/"
      headingRef={headingRef}
      id={EhrSectionType.MedicationsAndMedicinesOptimisation}
      title="Medications / medicines optimisation"
    >
      <div className="border-l-4 border-[#0072ce] bg-[#e8f3fb] px-3 py-2 text-[11px] leading-5 text-[#003b6f]">
        These are baseline medicines recorded in the Patient Profile. They are
        not a prescription, administration record or completed medicines
        reconciliation.
      </div>

      {activeAllergies.length ? (
        <div className="border-l-4 border-[#ae1c28] bg-[#fee2e2] px-3 py-2 text-[11px] leading-5 text-[#991b1b]">
          ⚠ <strong>Active allergy alert:</strong>{' '}
          {activeAllergies
            .map(
              ({ reactions, substance }) =>
                `${substance} — ${reactions.join(', ') || 'reaction not recorded'}`,
            )
            .join('; ')}
        </div>
      ) : patient.allergyRecordStatus ===
        PatientAllergyRecordStatus.NoKnownDrugAllergies ? (
        <div className="border-l-4 border-[#15803d] bg-[#f0fdf4] px-3 py-2 text-[11px] font-semibold text-[#14532d]">
          ✓ No known drug allergies (NKDA) recorded.
        </div>
      ) : (
        <div className="border-l-4 border-[#d97706] bg-[#fffbeb] px-3 py-2 text-[11px] text-[#92400e]">
          ⚠ Allergy status is not recorded. Confirm before clinical use.
        </div>
      )}

      <div>
        <ClinicalPrompt>Baseline medicines</ClinicalPrompt>
        {medications.length ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[52rem] border-collapse text-[11px]">
                <thead>
                  <tr className="bg-[#d0e4f7] text-left text-[10px] uppercase tracking-[0.04em] text-[#1c3a5c]">
                    <th className="px-2 py-2">Medicine</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Dose</th>
                    <th className="px-2 py-2">Route</th>
                    <th className="px-2 py-2">Frequency</th>
                    <th className="px-2 py-2">Indication</th>
                    <th className="px-2 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((medication, index) => (
                    <MedicationTableRow
                      index={index}
                      key={medication.id}
                      medication={medication}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-2 md:hidden">
              {medications.map((medication) => (
                <MedicationCard key={medication.id} medication={medication} />
              ))}
            </div>
          </>
        ) : (
          <NeutralRecordMessage>
            No baseline medications recorded
          </NeutralRecordMessage>
        )}
      </div>
    </EhrSection>
  );
}

type PreviewMedication =
  PatientEhrPreviewViewModel['baselineMedications'][number];

function MedicationTableRow({
  index,
  medication,
}: {
  index: number;
  medication: PreviewMedication;
}) {
  return (
    <tr className={index % 2 ? 'bg-[#f9fafb]' : 'bg-white'}>
      <td className="border-b border-[#d8dee8] px-2 py-2 font-bold text-[#1c2b4a]">
        {medication.medication}
      </td>
      <td className="border-b border-[#d8dee8] px-2 py-2">
        <MedicationStatus status={medication.status} />
      </td>
      <MedicationTableValue value={medication.dose} />
      <MedicationTableValue value={medication.route} />
      <MedicationTableValue value={medication.frequency} />
      <MedicationTableValue value={medication.indication} />
      <MedicationTableValue value={medication.details} />
    </tr>
  );
}

function MedicationTableValue({ value }: { value?: string }) {
  return (
    <td className="border-b border-[#d8dee8] px-2 py-2 align-top leading-5">
      {value ?? 'Not recorded'}
    </td>
  );
}

function MedicationCard({ medication }: { medication: PreviewMedication }) {
  return (
    <article className="overflow-hidden rounded-[3px] border border-[#b8cfe8] bg-white">
      <div className="flex items-center justify-between gap-2 bg-[#d0e4f7] px-3 py-2">
        <h3 className="text-xs font-bold text-[#1c3a5c]">
          {medication.medication}
        </h3>
        <MedicationStatus status={medication.status} />
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 px-3 py-3 text-[11px]">
        <MedicationCardValue label="Dose" value={medication.dose} />
        <MedicationCardValue label="Route" value={medication.route} />
        <MedicationCardValue label="Frequency" value={medication.frequency} />
        <MedicationCardValue label="Indication" value={medication.indication} />
        <div className="col-span-2">
          <MedicationCardValue label="Notes" value={medication.details} />
        </div>
      </dl>
    </article>
  );
}

function MedicationCardValue({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div>
      <dt className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#52657a]">
        {label}
      </dt>
      <dd className="mt-0.5 leading-5 text-[#1c2b4a]">
        {value ?? 'Not recorded'}
      </dd>
    </div>
  );
}

function MedicationStatus({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] ${
        status === 'active'
          ? 'bg-[#dcfce7] text-[#166534]'
          : 'bg-[#e5e7eb] text-[#4b5563]'
      }`}
    >
      {status.replaceAll('_', ' ')}
    </span>
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
