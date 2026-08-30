import { z } from 'zod';

import {
  AuthoredValueStatus,
  type CodedDisplayValue,
  PatientAllergySeverity,
  type PatientAllergy,
  PatientAllergyVerificationStatus,
  type PatientBackgroundFact,
  PatientBackgroundCategory,
  type PatientBaselineMedication,
  type PatientCatalogueMetadata,
  PatientCareSetting,
  PatientClinicalStatus,
  type PatientCommunication,
  type PatientCommunicationNeed,
  type PatientContact,
  PatientDataSensitivity,
  type PatientDemographics,
  type PatientIdentity,
  PatientLanguageProficiency,
  type PatientLanguage,
  PatientLifeStage,
  PatientMedicationStatus,
  type PatientProblem,
  type PatientProfileDocumentV1,
  PatientProfileTag,
  PatientProfileVersionState,
  PatientRelationshipRole,
  type PatientRelationship,
  PatientSexAtBirth,
  PatientSpecialty,
  SimulationIdentifierKind,
  type SimulationIdentifier,
  type SyntheticAddress,
} from '../patient-profiles';
import type {
  PatientProfileCatalogueItem,
  PatientProfileDetail,
} from '../patient-profiles';
import { PlatformRole } from '../users';
import { defineContract, hektorResponseSchema } from './base';

const plainText = (maximum: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(maximum)
    .refine((value) => !/[<>]/u.test(value), 'Markup is not permitted');

const itemIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
  .max(80);

const authoredValueSchema = <T extends z.ZodType>(valueSchema: T) =>
  z.discriminatedUnion('status', [
    z
      .object({
        status: z.literal(AuthoredValueStatus.Known),
        value: valueSchema,
      })
      .strict(),
    z.object({ status: z.literal(AuthoredValueStatus.Unknown) }).strict(),
    z.object({ status: z.literal(AuthoredValueStatus.NotApplicable) }).strict(),
  ]);

export const codedDisplayValueSchema = z
  .object({
    display: plainText(200),
    code: plainText(100).optional(),
    system: plainText(500).optional(),
  })
  .strict()
  .refine((value) => Boolean(value.code) === Boolean(value.system), {
    message: 'Code and system must be supplied together',
  }) satisfies z.ZodType<CodedDisplayValue>;

export const patientIdentitySchema = z
  .object({
    givenNames: z.array(plainText(100)).min(1).max(5),
    familyName: plainText(100),
    preferredName: plainText(100).optional(),
    dateOfBirth: z.iso.date(),
    pronouns: authoredValueSchema(
      z.array(plainText(50)).min(1).max(5),
    ).optional(),
    sexAtBirth: authoredValueSchema(z.enum(PatientSexAtBirth)).optional(),
    genderIdentity: authoredValueSchema(plainText(100)).optional(),
  })
  .strict() satisfies z.ZodType<PatientIdentity>;

export const simulationIdentifierSchema = z
  .object({
    id: itemIdSchema,
    kind: z.enum(SimulationIdentifierKind),
    value: z.string().regex(/^SIM-[A-Z0-9-]{3,40}$/u),
    display: plainText(100).optional(),
    issuer: plainText(200).optional(),
    synthetic: z.literal(true),
  })
  .strict() satisfies z.ZodType<SimulationIdentifier>;

export const patientDemographicsSchema = z
  .object({
    ethnicity: authoredValueSchema(codedDisplayValueSchema).optional(),
    faithOrBelief: authoredValueSchema(codedDisplayValueSchema).optional(),
    nationality: authoredValueSchema(codedDisplayValueSchema).optional(),
  })
  .strict() satisfies z.ZodType<PatientDemographics>;

export const patientLanguageSchema = z
  .object({
    id: itemIdSchema,
    language: codedDisplayValueSchema,
    proficiency: z.enum(PatientLanguageProficiency).optional(),
    interpreterRequired: authoredValueSchema(z.boolean()).optional(),
  })
  .strict() satisfies z.ZodType<PatientLanguage>;

export const patientCommunicationNeedSchema = z
  .object({
    id: itemIdSchema,
    summary: plainText(200),
    details: plainText(2000).optional(),
  })
  .strict() satisfies z.ZodType<PatientCommunicationNeed>;

export const patientCommunicationSchema = z
  .object({
    languages: z.array(patientLanguageSchema).max(20),
    preferredLanguageId: itemIdSchema.optional(),
    preferences: z.array(patientCommunicationNeedSchema).max(30),
    accessibilityNeeds: z.array(patientCommunicationNeedSchema).max(30),
  })
  .strict()
  .refine(
    (value) =>
      !value.preferredLanguageId ||
      value.languages.some(({ id }) => id === value.preferredLanguageId),
    {
      message: 'Preferred language must reference a language',
      path: ['preferredLanguageId'],
    },
  ) satisfies z.ZodType<PatientCommunication>;

export const syntheticAddressSchema = z
  .object({
    lines: z.array(plainText(150)).min(1).max(4),
    city: plainText(100).optional(),
    region: plainText(100).optional(),
    postalCode: plainText(20).optional(),
    country: plainText(100).optional(),
    synthetic: z.literal(true),
  })
  .strict() satisfies z.ZodType<SyntheticAddress>;

export const patientContactSchema = z
  .object({
    address: syntheticAddressSchema.optional(),
    phone: plainText(50).optional(),
    email: z.email().max(254).optional(),
  })
  .strict() satisfies z.ZodType<PatientContact>;

export const patientRelationshipSchema = z
  .object({
    id: itemIdSchema,
    name: plainText(200),
    relationship: codedDisplayValueSchema,
    roles: z.array(z.enum(PatientRelationshipRole)).min(1).max(5),
    contact: patientContactSchema.optional(),
    notes: plainText(2000).optional(),
  })
  .strict() satisfies z.ZodType<PatientRelationship>;

export const patientBackgroundFactSchema = z
  .object({
    id: itemIdSchema,
    category: z.enum(PatientBackgroundCategory),
    summary: plainText(300),
    details: plainText(4000).optional(),
    sensitivity: z.enum(PatientDataSensitivity),
  })
  .strict() satisfies z.ZodType<PatientBackgroundFact>;

export const patientProblemSchema = z
  .object({
    id: itemIdSchema,
    problem: codedDisplayValueSchema,
    clinicalStatus: z.enum(PatientClinicalStatus),
    onsetDate: z.iso.date().optional(),
    resolvedDate: z.iso.date().optional(),
    details: plainText(2000).optional(),
  })
  .strict()
  .refine(
    ({ onsetDate, resolvedDate }) =>
      !onsetDate || !resolvedDate || resolvedDate >= onsetDate,
    {
      message: 'Resolved date must not precede onset date',
      path: ['resolvedDate'],
    },
  ) satisfies z.ZodType<PatientProblem>;

export const patientAllergySchema = z
  .object({
    id: itemIdSchema,
    substance: codedDisplayValueSchema,
    clinicalStatus: z.enum(PatientClinicalStatus),
    verificationStatus: z.enum(PatientAllergyVerificationStatus),
    reactions: z.array(plainText(300)).max(20),
    severity: z.enum(PatientAllergySeverity).optional(),
    details: plainText(2000).optional(),
  })
  .strict() satisfies z.ZodType<PatientAllergy>;

export const patientBaselineMedicationSchema = z
  .object({
    id: itemIdSchema,
    medication: codedDisplayValueSchema,
    status: z.enum(PatientMedicationStatus),
    dose: plainText(200).optional(),
    route: codedDisplayValueSchema.optional(),
    frequency: plainText(200).optional(),
    indication: plainText(500).optional(),
    details: plainText(2000).optional(),
  })
  .strict() satisfies z.ZodType<PatientBaselineMedication>;

export const patientCatalogueMetadataSchema = z
  .object({
    synopsis: plainText(1000),
    lifeStage: z.enum(PatientLifeStage),
    careSettings: z.array(z.enum(PatientCareSetting)).min(1).max(20),
    specialties: z.array(z.enum(PatientSpecialty)).min(1).max(20),
    tags: z.array(z.enum(PatientProfileTag)).max(30),
  })
  .strict() satisfies z.ZodType<PatientCatalogueMetadata>;

const uniqueIds = (
  document: PatientProfileDocumentV1,
  context: z.RefinementCtx,
) => {
  const collections = [
    ['identifiers', document.identifiers],
    ['communication.languages', document.communication.languages],
    ['communication.preferences', document.communication.preferences],
    [
      'communication.accessibilityNeeds',
      document.communication.accessibilityNeeds,
    ],
    ['relationships', document.relationships],
    ['background', document.background],
    ['problems', document.problems],
    ['allergies', document.allergies],
    ['baselineMedications', document.baselineMedications],
  ] as const;

  for (const [name, values] of collections) {
    if (new Set(values.map(({ id }) => id)).size !== values.length)
      context.addIssue({
        code: 'custom',
        message: `Duplicate IDs in ${name}`,
        path: name.split('.'),
      });
  }
};

export const patientProfileDocumentV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    synthetic: z.literal(true),
    identity: patientIdentitySchema,
    identifiers: z.array(simulationIdentifierSchema).min(1).max(20),
    demographics: patientDemographicsSchema,
    communication: patientCommunicationSchema,
    contact: patientContactSchema.optional(),
    relationships: z.array(patientRelationshipSchema).max(30),
    background: z.array(patientBackgroundFactSchema).max(100),
    problems: z.array(patientProblemSchema).max(100),
    allergies: z.array(patientAllergySchema).max(100),
    baselineMedications: z.array(patientBaselineMedicationSchema).max(100),
    catalogue: patientCatalogueMetadataSchema,
  })
  .strict()
  .refine((document) => JSON.stringify(document).length <= 100_000, {
    message: 'Patient profile document exceeds 100 KB',
  })
  .superRefine(uniqueIds) satisfies z.ZodType<PatientProfileDocumentV1>;

export const patientProfileCatalogueItemSchema = z.object({
  id: z.uuid(),
  slug: z.string().min(1),
  displayName: z.string().min(1),
  dateOfBirth: z.iso.date(),
  versionId: z.uuid(),
  versionNumber: z.number().int().positive(),
  versionState: z.enum(PatientProfileVersionState),
  synopsis: z.string().min(1),
  lifeStage: z.enum(PatientLifeStage),
  careSettings: z.array(z.enum(PatientCareSetting)),
  specialties: z.array(z.enum(PatientSpecialty)),
  tags: z.array(z.enum(PatientProfileTag)),
}) satisfies z.ZodType<PatientProfileCatalogueItem>;

export const patientProfileDetailSchema =
  patientProfileCatalogueItemSchema.extend({
    document: patientProfileDocumentV1Schema,
    changeSummary: z.string().min(1),
    sourceReference: z.string().min(1).optional(),
    sourceRevision: z.string().min(1).optional(),
    updatedAt: z.iso.datetime(),
  }) satisfies z.ZodType<PatientProfileDetail>;

const adminPatientProfileAccess = {
  type: 'platform',
  roles: [PlatformRole.Admin],
} as const;

export const listAdminPatientProfilesContract = defineContract({
  method: 'GET',
  path: '/api/admin/patient-profiles',
  access: adminPatientProfileAccess,
  output: hektorResponseSchema(z.array(patientProfileCatalogueItemSchema)),
});

export const getAdminPatientProfileContract = defineContract({
  method: 'GET',
  path: '/api/admin/patient-profiles/:profileId',
  access: adminPatientProfileAccess,
  params: z.object({ profileId: z.uuid() }),
  output: hektorResponseSchema(patientProfileDetailSchema),
});
