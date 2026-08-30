# Patient profiles — Slice 1 plan

Status: proposed document contract and database foundation for review.

Slice 1 defines what a reusable patient profile is and gives it a secure,
versioned persistence model. It deliberately stops before production content,
admin screens or any end-user workflow.

## In scope

- canonical TypeScript patient-profile types;
- Zod boundary schemas which satisfy those types;
- one new database migration for profile ownership and versions;
- five validated system-owned draft documents and a production-safe seed;
- conservative RLS which permits platform administration only;
- generated Supabase database types; and
- contract and database-integration tests.

## Not in scope

- publication or claims of clinical approval for the five draft imports;
- a general-purpose clinical-content import tool;
- services, API routes, queries or screens;
- authoring and publication workflows;
- cloning or entitlements;
- patient projects, layers, EHR data, assignments or learner work; and
- files, images, terminology services or FHIR integration.

Those become separate slices after the contract, schema and seeded draft content
have been reviewed in code.

## Seed extension

The implementation adds canonical JSON documents for Adebayo Omolade, Adam
Marsden, Emma Barlow, Amina Warsame and Esther Jenkins under
`supabase/seeds/patient-profiles`. The documents contain enduring patient-profile
content only; encounter, layer, EHR and pedagogy fields remain deferred.

A deterministic generator produces committed `supabase/seeds/production.sql`
with fixed profile/version UUIDs, source revision and content hashes. Local
Supabase applies it before the existing developer seed. Reapplying it is a no-op
when content matches and fails on document/hash drift rather than rewriting an
immutable known version.

The five initial versions are drafts. The prototype is clinically sophisticated,
but field-by-field extraction into a new contract has not received named clinical
approval and must not be represented as published review-complete content.

## Proposed TypeScript contract

The canonical types belong in `packages/types/src/patient-profiles.ts`. The names
below are proposed rather than final, but the shape is the Slice 1 design target.

```ts
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

export type AuthoredValue<T> =
  | { status: AuthoredValueStatus.Known; value: T }
  | { status: AuthoredValueStatus.Unknown }
  | { status: AuthoredValueStatus.NotApplicable };

export interface CodedDisplayValue {
  display: string;
  code?: string;
  system?: string;
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
  allergies: PatientAllergy[];
  baselineMedications: PatientBaselineMedication[];
  catalogue: PatientCatalogueMetadata;
}

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
  careSettings: string[];
  specialties: string[];
  tags: string[];
}
```

### Contract semantics

- Omission means the author has not provided the field. `AuthoredValue` records
  an explicit known, unknown or not-applicable statement where that distinction
  matters clinically.
- All IDs inside document collections are stable author-facing slugs. Later
  project layers can target them without depending on array order.
- `dateOfBirth`, onset and resolved dates are ISO calendar dates. They do not
  encode a scenario clock.
- `CodedDisplayValue` permits a reviewed display term before a terminology system
  is introduced. Code and system must be supplied together when either is used.
- Every identifier and address is explicitly synthetic. Validation must reject
  values which do not comply with the adopted simulation conventions.
- `background` contains enduring history only. Current encounters, observations,
  referrals and care plans remain outside this contract.
- `sensitivity` identifies content requiring a later presentation policy; it
  does not itself grant access.
- Catalogue arrays will be backed by TypeScript catalogues rather than accepting
  arbitrary author values. The initial members should be derived from the first
  five source patients during contract implementation.
- Boundary schemas set explicit string, array and document-size limits, reject
  unknown object keys, require collection IDs to be unique and reject markup in
  plain-text fields.

## Proposed database schema

Add one new migration containing two tables and supporting enums/functions. The
separate production seed runs after that migration.

### `patient_profiles`

| Column              | Type                     | Rule                                                           |
| ------------------- | ------------------------ | -------------------------------------------------------------- |
| `id`                | `uuid`                   | Primary key, generated UUID.                                   |
| `scope`             | `patient_profile_scope`  | System, user or organisation.                                  |
| `organisation_id`   | `uuid` nullable          | FK to organisations; organisation scope only.                  |
| `user_id`           | `uuid` nullable          | FK to `auth.users`; user scope only.                           |
| `slug`              | `text`                   | Normalized stable slug, unique within effective owner.         |
| `status`            | `patient_profile_status` | Active by default.                                             |
| `source_profile_id` | `uuid` nullable          | Clone lineage; dormant in Slice 1.                             |
| `source_version_id` | `uuid` nullable          | Exact cloned version; dormant in Slice 1.                      |
| `created_by`        | `uuid` nullable          | FK to `auth.users`; absent only for controlled system imports. |
| `created_at`        | `timestamptz`            | Database-generated.                                            |
| `updated_at`        | `timestamptz`            | Maintained by trigger.                                         |
| `archived_at`       | `timestamptz` nullable   | Required exactly when archived.                                |

Owner checks enforce:

```text
system       organisation_id IS NULL AND user_id IS NULL
user         organisation_id IS NULL AND user_id IS NOT NULL
organisation organisation_id IS NOT NULL AND user_id IS NULL
```

Use separate partial unique indexes for system slugs, per-user slugs and
per-organisation slugs. Source profile and version must be either both present or
both absent. A deferred foreign key from `source_version_id` is added after the
version table exists.

### `patient_profile_versions`

| Column               | Type                            | Rule                                                               |
| -------------------- | ------------------------------- | ------------------------------------------------------------------ |
| `id`                 | `uuid`                          | Primary key, generated UUID.                                       |
| `patient_profile_id` | `uuid`                          | FK to profile; retained versions prevent profile deletion.         |
| `version_number`     | positive integer                | Unique and monotonic within profile.                               |
| `state`              | `patient_profile_version_state` | Draft through withdrawn lifecycle.                                 |
| `schema_version`     | positive integer                | Must be `1` in this slice.                                         |
| `document`           | `jsonb`                         | Boundary-validated patient document.                               |
| `content_hash`       | `text`                          | SHA-256 of canonical document serialization.                       |
| `change_summary`     | `text`                          | Required human explanation.                                        |
| `authored_by`        | `uuid` nullable                 | FK to `auth.users`; absent only when source provenance is present. |
| `source_reference`   | `text` nullable                 | External or internal source for controlled imports.                |
| `source_revision`    | `text` nullable                 | Exact source revision; present with source reference.              |
| `reviewed_by`        | `uuid` nullable                 | Present after review.                                              |
| `published_by`       | `uuid` nullable                 | Present for published, superseded and withdrawn versions.          |
| lifecycle timestamps | `timestamptz` nullable          | Match the corresponding state transitions.                         |
| `created_at`         | `timestamptz`                   | Database-generated.                                                |
| `updated_at`         | `timestamptz`                   | Maintained by trigger.                                             |

Constraints and indexes enforce:

- unique `(patient_profile_id, version_number)`;
- one `draft` or `in_review` working version per profile;
- one current `published` version per profile;
- positive version and schema numbers;
- a 64-character lower-case hexadecimal content hash;
- non-empty change summary;
- internally consistent actor/timestamp fields for each state; and
- indexes for profile/version lookup and lifecycle state.

PostgreSQL cannot enforce the complete TypeScript document contract safely with
check constraints. The JSONB column receives basic checks for object shape,
`schemaVersion = 1` and `synthetic = true`; the trusted write boundary performs
the full Zod validation. Database integration tests must demonstrate that direct
application-role writes are unavailable.

### RLS in Slice 1

Enable RLS on both tables immediately.

- Platform administrators may read all profiles and versions.
- Platform-admin mutations will eventually use trusted server services; this
  slice may use test-only service-role setup to exercise constraints.
- Ordinary authenticated and anonymous roles receive no patient-profile access
  yet.
- User and organisation policies are added with their actual product workflows,
  so schema ownership does not accidentally grant premature access.

No delete policy is introduced. Later lifecycle code archives profiles and
retains versions.

## Implementation order

1. Add the TypeScript enums, types and exports.
2. Add Zod schemas derived from the TypeScript enums and contract tests using
   small representative documents for the five intended profile shapes.
3. Add the migration with enums, two tables, constraints, indexes and RLS.
4. Reset local Supabase and regenerate `packages/types/src/database.ts`.
5. Add and contract-test the five canonical JSON documents, then generate the
   production seed and configure it ahead of the developer seed.
6. Add database integration tests for ownership combinations, slug uniqueness,
   version uniqueness, JSONB guards, seed idempotency, immutability assumptions
   and access denial.
7. Run `yarn check`, unit tests, database integration tests and `yarn build`.

## Acceptance criteria

- The proposed document can represent the enduring profile content needed by all
  five initial patients without importing encounter or EHR data.
- Invalid unknown fields, dates, duplicate collection IDs, unsafe markup,
  non-synthetic identifiers and unsupported schema versions fail validation.
- Database ownership constraints accept exactly the three valid scope/owner
  combinations.
- Duplicate slugs are rejected only within the same effective owner.
- Version and lifecycle constraints reject contradictory records.
- Ordinary authenticated and anonymous database clients cannot read or write
  patient profiles.
- Platform-admin reads are tenant-safe and tested.
- A clean database reset applies the migration and generated database types match
  it.
- Exactly five deterministic system-owned draft profiles are produced by a clean
  reset, and applying the production seed twice changes nothing.
- Seeded JSON is identical to the contract-tested source documents; content drift
  fails verification.
- No API or UI behavior is introduced by Slice 1.

## Review questions

1. Is `AuthoredValue` useful enough to distinguish unknown and not applicable,
   or too heavy for authoring?
2. Should a related baby or dependant be a lightweight `relationship` here, or a
   reference to another patient profile when independently modeled?
3. Are `problems`, `allergies` and `baselineMedications` the right amount of
   enduring clinical structure for a reusable profile?
4. Should safeguarding content use the proposed `restricted` sensitivity marker
   before its downstream visibility policy is defined?
5. Are care settings, specialties and tags authored catalogue metadata, or
   should some be derived only after projects exist?
