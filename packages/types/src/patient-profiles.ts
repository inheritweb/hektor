export enum PatientProfileScope {
  System = 'system',
  User = 'user',
  Organisation = 'organisation',
}

export enum PatientProfileStatus {
  Active = 'active',
  Archived = 'archived',
}

export enum PatientProfileVersionState {
  Draft = 'draft',
  InReview = 'in_review',
  Published = 'published',
  Superseded = 'superseded',
  Withdrawn = 'withdrawn',
}

export enum AuthoredValueStatus {
  Known = 'known',
  Unknown = 'unknown',
  NotApplicable = 'not_applicable',
}

export enum PatientSexAtBirth {
  Female = 'female',
  Male = 'male',
  Intersex = 'intersex',
}

export enum SimulationIdentifierKind {
  LocalPatientNumber = 'local_patient_number',
  NationalHealthIdentifier = 'national_health_identifier',
  Other = 'other',
}

export enum PatientLanguageProficiency {
  Basic = 'basic',
  Conversational = 'conversational',
  Fluent = 'fluent',
  Native = 'native',
}

export enum PatientRelationshipRole {
  NextOfKin = 'next_of_kin',
  Parent = 'parent',
  Guardian = 'guardian',
  Carer = 'carer',
  Other = 'other',
}

export enum PatientBackgroundCategory {
  Social = 'social',
  Cultural = 'cultural',
  Family = 'family',
  Education = 'education',
  Occupation = 'occupation',
  LivingArrangements = 'living_arrangements',
  Lifestyle = 'lifestyle',
  MedicalHistory = 'medical_history',
  SurgicalHistory = 'surgical_history',
  MentalHealthHistory = 'mental_health_history',
  ObstetricHistory = 'obstetric_history',
  FamilyHistory = 'family_history',
  Safeguarding = 'safeguarding',
  AdverseLifeEvent = 'adverse_life_event',
  Other = 'other',
}

export enum PatientDataSensitivity {
  Standard = 'standard',
  Restricted = 'restricted',
}

export enum PatientClinicalStatus {
  Active = 'active',
  Inactive = 'inactive',
  Resolved = 'resolved',
}

export enum PatientHistoryEntryType {
  Encounter = 'encounter',
  Observation = 'observation',
  Assessment = 'assessment',
  Investigation = 'investigation',
  Procedure = 'procedure',
  MedicationCourse = 'medication_course',
  Referral = 'referral',
  ClinicalDocument = 'clinical_document',
  CarePlan = 'care_plan',
}

export enum PatientHistoryDatePrecision {
  Day = 'day',
  Month = 'month',
  Year = 'year',
}

export enum PatientHistoricalEncounterType {
  Admission = 'admission',
  EmergencyAttendance = 'emergency_attendance',
  OutpatientAppointment = 'outpatient_appointment',
  PrimaryCareAppointment = 'primary_care_appointment',
  CommunityContact = 'community_contact',
  HomeVisit = 'home_visit',
  Birth = 'birth',
  Other = 'other',
}

export enum PatientObservationValueType {
  Quantity = 'quantity',
  Text = 'text',
  Boolean = 'boolean',
  Coded = 'coded',
}

export enum PatientObservationInterpretation {
  Normal = 'normal',
  High = 'high',
  Low = 'low',
  Abnormal = 'abnormal',
}

export enum PatientInvestigationKind {
  Laboratory = 'laboratory',
  Imaging = 'imaging',
  Microbiology = 'microbiology',
  Histopathology = 'histopathology',
  Other = 'other',
}

export enum PatientInvestigationStatus {
  Pending = 'pending',
  Preliminary = 'preliminary',
  Final = 'final',
  Corrected = 'corrected',
  Cancelled = 'cancelled',
}

export enum PatientHistoricalMedicationStatus {
  ActiveAtBoundary = 'active_at_boundary',
  Completed = 'completed',
  Stopped = 'stopped',
  Unknown = 'unknown',
}

export enum PatientReferralStatus {
  Requested = 'requested',
  Accepted = 'accepted',
  Completed = 'completed',
  Declined = 'declined',
  Cancelled = 'cancelled',
}

export enum PatientClinicalDocumentType {
  ClinicalNote = 'clinical_note',
  Letter = 'letter',
  DischargeSummary = 'discharge_summary',
  Handover = 'handover',
  Other = 'other',
}

export enum PatientHistoricalCarePlanStatus {
  ActiveAtBoundary = 'active_at_boundary',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum PatientAllergyVerificationStatus {
  Confirmed = 'confirmed',
  Unconfirmed = 'unconfirmed',
  Refuted = 'refuted',
}

export enum PatientAllergySeverity {
  Mild = 'mild',
  Moderate = 'moderate',
  Severe = 'severe',
}

export enum PatientAllergyRecordStatus {
  KnownAllergies = 'known_allergies',
  NoKnownDrugAllergies = 'no_known_drug_allergies',
  NotRecorded = 'not_recorded',
}

export enum PatientMedicationStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum PatientLifeStage {
  Child = 'child',
  YoungPerson = 'young_person',
  Adult = 'adult',
  OlderAdult = 'older_adult',
}

export enum PatientCareSetting {
  AcuteInpatient = 'acute_inpatient',
  Community = 'community',
  CommunityMentalHealth = 'community_mental_health',
  Home = 'home',
  Maternity = 'maternity',
  PaediatricCommunity = 'paediatric_community',
  Postnatal = 'postnatal',
  PrimaryCare = 'primary_care',
}

export enum PatientSpecialty {
  ChildrensNursing = 'childrens_nursing',
  Diabetes = 'diabetes',
  Interprofessional = 'interprofessional',
  LearningDisability = 'learning_disability',
  Maternity = 'maternity',
  MentalHealth = 'mental_health',
  Oncology = 'oncology',
  PalliativeCare = 'palliative_care',
  Stroke = 'stroke',
}

export enum PatientProfileTag {
  Accessibility = 'accessibility',
  CarerRelationship = 'carer_relationship',
  CulturalContext = 'cultural_context',
  LongTermCondition = 'long_term_condition',
  MentalHealth = 'mental_health',
  NewbornRelationship = 'newborn_relationship',
  Safeguarding = 'safeguarding',
}

export type AuthoredValue<T> =
  | { status: AuthoredValueStatus.Known; value: T }
  | { status: AuthoredValueStatus.Unknown }
  | { status: AuthoredValueStatus.NotApplicable };

export interface CodedDisplayValue {
  display: string;
  code?: string;
  system?: string;
}

export interface PatientProfile {
  id: string;
  scope: PatientProfileScope;
  organisationId?: string;
  userId?: string;
  slug: string;
  status: PatientProfileStatus;
  sourceProfileId?: string;
  sourceVersionId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface PatientProfileVersion {
  id: string;
  patientProfileId: string;
  versionNumber: number;
  state: PatientProfileVersionState;
  schemaVersion: 1;
  document: PatientProfileDocumentV1;
  contentHash: string;
  changeSummary: string;
  authoredBy?: string;
  sourceReference?: string;
  sourceRevision?: string;
  reviewedBy?: string;
  publishedBy?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  publishedAt?: string;
  withdrawnAt?: string;
}

export interface PatientProfileDocumentV1 {
  schemaVersion: 1;
  synthetic: true;
  identity: PatientIdentity;
  identifiers: SimulationIdentifier[];
  demographics: PatientDemographics;
  communication: PatientCommunication;
  contact?: PatientContact;
  relationships: PatientRelationship[];
  background: PatientBackgroundFact[];
  problems: PatientProblem[];
  allergyRecordStatus: PatientAllergyRecordStatus;
  allergies: PatientAllergy[];
  baselineMedications: PatientBaselineMedication[];
  history: PatientHistory;
  catalogue: PatientCatalogueMetadata;
}

export interface PatientHistory {
  entries: PatientHistoryEntry[];
}

export interface PatientHistoricalDate {
  value: string;
  precision: PatientHistoryDatePrecision;
  approximate?: boolean;
}

export interface PatientHistoricalPeriod {
  start?: PatientHistoricalDate;
  end?: PatientHistoricalDate;
}

export interface PatientHistoricalAuthor {
  name?: string;
  role?: string;
  service?: string;
}

export interface PatientHistoryEntryBase {
  id: string;
  type: PatientHistoryEntryType;
  summary: string;
  details?: string;
  sensitivity: PatientDataSensitivity;
  occurred?: PatientHistoricalPeriod;
  recordedOn?: PatientHistoricalDate;
  author?: PatientHistoricalAuthor;
  sourceReference?: string;
}

export interface PatientHistoricalEncounter extends PatientHistoryEntryBase {
  type: PatientHistoryEntryType.Encounter;
  encounterType: PatientHistoricalEncounterType;
  careSetting?: PatientCareSetting;
  service?: string;
  reason?: string;
  outcome?: string;
}

export type PatientObservationValue =
  | { type: PatientObservationValueType.Quantity; value: number; unit: string }
  | { type: PatientObservationValueType.Text; value: string }
  | { type: PatientObservationValueType.Boolean; value: boolean }
  | { type: PatientObservationValueType.Coded; value: CodedDisplayValue };

export interface PatientHistoricalObservation extends PatientHistoryEntryBase {
  type: PatientHistoryEntryType.Observation;
  observation: CodedDisplayValue;
  value: PatientObservationValue;
  referenceRange?: string;
  interpretation?: PatientObservationInterpretation;
}

export interface PatientHistoricalAssessment extends PatientHistoryEntryBase {
  type: PatientHistoryEntryType.Assessment;
  assessment: CodedDisplayValue;
  score?: number;
  scale?: string;
  outcome: string;
  components?: string[];
}

export interface PatientInvestigationResult {
  id: string;
  observation: CodedDisplayValue;
  value: PatientObservationValue;
  referenceRange?: string;
  interpretation?: PatientObservationInterpretation;
}

export interface PatientHistoricalInvestigation extends PatientHistoryEntryBase {
  type: PatientHistoryEntryType.Investigation;
  kind: PatientInvestigationKind;
  investigation: CodedDisplayValue;
  status: PatientInvestigationStatus;
  results: PatientInvestigationResult[];
  conclusion?: string;
}

export interface PatientHistoricalProcedure extends PatientHistoryEntryBase {
  type: PatientHistoryEntryType.Procedure;
  procedure: CodedDisplayValue;
  indication?: string;
  outcome?: string;
  complications?: string;
}

export interface PatientHistoricalMedicationCourse extends PatientHistoryEntryBase {
  type: PatientHistoryEntryType.MedicationCourse;
  medication: CodedDisplayValue;
  status: PatientHistoricalMedicationStatus;
  dose?: string;
  route?: CodedDisplayValue;
  frequency?: string;
  indication?: string;
  reasonEnded?: string;
  response?: string;
}

export interface PatientHistoricalReferral extends PatientHistoryEntryBase {
  type: PatientHistoryEntryType.Referral;
  status: PatientReferralStatus;
  referredFrom?: string;
  referredTo: string;
  reason: string;
  outcome?: string;
}

export interface PatientHistoricalDocument extends PatientHistoryEntryBase {
  type: PatientHistoryEntryType.ClinicalDocument;
  documentType: PatientClinicalDocumentType;
  title: string;
  body: string;
}

export interface PatientHistoricalCarePlan extends PatientHistoryEntryBase {
  type: PatientHistoryEntryType.CarePlan;
  status: PatientHistoricalCarePlanStatus;
  need: string;
  goals: string[];
  interventions: string[];
  evaluation?: string;
}

export type PatientHistoryEntry =
  | PatientHistoricalEncounter
  | PatientHistoricalObservation
  | PatientHistoricalAssessment
  | PatientHistoricalInvestigation
  | PatientHistoricalProcedure
  | PatientHistoricalMedicationCourse
  | PatientHistoricalReferral
  | PatientHistoricalDocument
  | PatientHistoricalCarePlan;

export interface PatientIdentity {
  givenNames: string[];
  familyName: string;
  preferredName?: string;
  dateOfBirth: string;
  pronouns?: AuthoredValue<string[]>;
  sexAtBirth?: AuthoredValue<PatientSexAtBirth>;
  genderIdentity?: AuthoredValue<string>;
}

export interface SimulationIdentifier {
  id: string;
  kind: SimulationIdentifierKind;
  value: string;
  display?: string;
  issuer?: string;
  synthetic: true;
}

export interface PatientDemographics {
  ethnicity?: AuthoredValue<CodedDisplayValue>;
  faithOrBelief?: AuthoredValue<CodedDisplayValue>;
  nationality?: AuthoredValue<CodedDisplayValue>;
}

export interface PatientCommunication {
  languages: PatientLanguage[];
  preferredLanguageId?: string;
  preferences: PatientCommunicationNeed[];
  accessibilityNeeds: PatientCommunicationNeed[];
}

export interface PatientLanguage {
  id: string;
  language: CodedDisplayValue;
  proficiency?: PatientLanguageProficiency;
  interpreterRequired?: AuthoredValue<boolean>;
}

export interface PatientCommunicationNeed {
  id: string;
  summary: string;
  details?: string;
}

export interface PatientContact {
  address?: SyntheticAddress;
  phone?: string;
  email?: string;
}

export interface SyntheticAddress {
  lines: string[];
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  synthetic: true;
}

export interface PatientRelationship {
  id: string;
  name: string;
  relationship: CodedDisplayValue;
  roles: PatientRelationshipRole[];
  contact?: PatientContact;
  notes?: string;
}

export interface PatientBackgroundFact {
  id: string;
  category: PatientBackgroundCategory;
  summary: string;
  details?: string;
  sensitivity: PatientDataSensitivity;
}

export interface PatientProblem {
  id: string;
  problem: CodedDisplayValue;
  clinicalStatus: PatientClinicalStatus;
  onsetDate?: string;
  resolvedDate?: string;
  details?: string;
}

export interface PatientAllergy {
  id: string;
  substance: CodedDisplayValue;
  clinicalStatus: PatientClinicalStatus;
  verificationStatus: PatientAllergyVerificationStatus;
  reactions: string[];
  severity?: PatientAllergySeverity;
  details?: string;
}

export interface PatientBaselineMedication {
  id: string;
  medication: CodedDisplayValue;
  status: PatientMedicationStatus;
  dose?: string;
  route?: CodedDisplayValue;
  frequency?: string;
  indication?: string;
  details?: string;
}

export interface PatientCatalogueMetadata {
  synopsis: string;
  lifeStage: PatientLifeStage;
  careSettings: PatientCareSetting[];
  specialties: PatientSpecialty[];
  tags: PatientProfileTag[];
}

export interface PatientProfileCatalogueItem {
  id: string;
  slug: string;
  displayName: string;
  dateOfBirth: string;
  versionId: string;
  versionNumber: number;
  versionState: PatientProfileVersionState;
  synopsis: string;
  lifeStage: PatientLifeStage;
  careSettings: PatientCareSetting[];
  specialties: PatientSpecialty[];
  tags: PatientProfileTag[];
}

export interface PatientProfileDetail extends PatientProfileCatalogueItem {
  document: PatientProfileDocumentV1;
  navigation: PatientProfileNavigation;
  versions: PatientProfileVersionNavigationItem[];
  changeSummary: string;
  sourceReference?: string;
  sourceRevision?: string;
  updatedAt: string;
}

export interface PatientProfileVersionNavigationItem {
  id: string;
  versionNumber: number;
  state: PatientProfileVersionState;
}

export interface PatientProfileNavigationItem {
  id: string;
  displayName: string;
}

export interface PatientProfileNavigation {
  previous?: PatientProfileNavigationItem;
  next?: PatientProfileNavigationItem;
}
