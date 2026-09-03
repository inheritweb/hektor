import { z } from 'zod';

import {
  type PatientScenario,
  PatientScenarioClinicalAudience,
  type PatientScenarioSummary,
  type ResolvedPatientScenarioStep,
  type PatientScenarioStep,
  PatientScenarioStatus,
  PatientScenarioStepKind,
} from '../patient-scenarios';
import { PatientCareSetting, PatientProfileScope } from '../patient-profiles';
import { PlatformRole } from '../users';
import { defineContract, hektorResponseSchema } from './base';
import { ehrConfigurationChangeSchema } from './ehr';
import { ehrConfigurationSchema } from './ehr';
import {
  patientProfileDocumentV1Schema,
  patientProfileLayerSchema,
  patientProfileVersionSchema,
} from './patient-profiles';

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

export const patientScenarioStepSchema = z
  .object({
    id: z.uuid(),
    title: plainText(200),
    description: plainText(1000).optional(),
    position: z.number().int().min(1).max(100_000),
    kind: z.enum(PatientScenarioStepKind),
    patientProfileLayer: patientProfileLayerSchema,
    ehrChanges: z.array(ehrConfigurationChangeSchema).max(100),
  })
  .strict() satisfies z.ZodType<PatientScenarioStep>;

export const patientScenarioSchema = z
  .object({
    id: z.uuid(),
    slug: itemIdSchema,
    patientProfile: patientProfileVersionSchema,
    scope: z.enum(PatientProfileScope),
    title: plainText(200),
    description: plainText(1000),
    careSetting: z.enum(PatientCareSetting),
    intendedClinicalAudiences: z
      .array(z.enum(PatientScenarioClinicalAudience))
      .max(20),
    status: z.enum(PatientScenarioStatus),
    steps: z.array(patientScenarioStepSchema).min(1).max(100),
  })
  .strict()
  .superRefine((scenario, context) => {
    const beginningSteps = scenario.steps.filter(
      ({ kind }) => kind === PatientScenarioStepKind.Beginning,
    );
    if (beginningSteps.length !== 1) {
      context.addIssue({
        code: 'custom',
        message: 'A scenario must contain exactly one beginning step',
        path: ['steps'],
      });
    }

    const orderedSteps = scenario.steps.toSorted(
      (left, right) => left.position - right.position,
    );
    if (orderedSteps[0]?.kind !== PatientScenarioStepKind.Beginning) {
      context.addIssue({
        code: 'custom',
        message: 'The beginning step must be first',
        path: ['steps'],
      });
    }

    const positions = new Set<number>();
    scenario.steps.forEach((step, index) => {
      if (positions.has(step.position)) {
        context.addIssue({
          code: 'custom',
          message: 'Scenario step positions must be unique',
          path: ['steps', index, 'position'],
        });
      }
      positions.add(step.position);

      if (
        step.patientProfileLayer.patientProfileId !==
        scenario.patientProfile.patientProfileId
      ) {
        context.addIssue({
          code: 'custom',
          message: 'A scenario layer must belong to its patient profile',
          path: ['steps', index, 'patientProfileLayer', 'patientProfileId'],
        });
      }
    });
  }) satisfies z.ZodType<PatientScenario>;

export const patientScenarioSummarySchema = z
  .object({
    id: z.uuid(),
    slug: itemIdSchema,
    title: plainText(200),
    description: plainText(1000),
    careSetting: z.enum(PatientCareSetting),
    intendedClinicalAudiences: z
      .array(z.enum(PatientScenarioClinicalAudience))
      .max(20),
    status: z.enum(PatientScenarioStatus),
    patientProfileVersion: z.object({
      id: z.uuid(),
      versionNumber: z.number().int().positive(),
    }),
    beginningStep: z.object({
      id: z.uuid(),
      title: plainText(200),
    }),
  })
  .strict() satisfies z.ZodType<PatientScenarioSummary>;

const adminPatientScenarioAccess = {
  type: 'platform',
  roles: [PlatformRole.Admin],
} as const;

export const listAdminPatientScenariosContract = defineContract({
  method: 'GET',
  path: '/api/admin/patient-profiles/:profileId/scenarios',
  access: adminPatientScenarioAccess,
  params: z.object({ profileId: z.uuid() }),
  query: z.object({ versionId: z.uuid() }),
  output: hektorResponseSchema(z.array(patientScenarioSummarySchema)),
});

export const getAdminPatientScenarioContract = defineContract({
  method: 'GET',
  path: '/api/admin/patient-scenarios/:scenarioIdentifier',
  access: adminPatientScenarioAccess,
  params: z.object({ scenarioIdentifier: z.uuid() }),
  output: hektorResponseSchema(patientScenarioSchema),
});

export const resolvedPatientScenarioStepSchema = z
  .object({
    patient: patientProfileDocumentV1Schema,
    ehr: ehrConfigurationSchema,
    context: z.object({
      scenario: patientScenarioSchema,
      currentStep: patientScenarioStepSchema,
      previousStep: patientScenarioStepSchema.optional(),
      nextStep: patientScenarioStepSchema.optional(),
      appliedStepIds: z.array(z.uuid()).min(1).max(100),
      appliedLayerIds: z.array(z.uuid()).min(1).max(100),
    }),
  })
  .strict() satisfies z.ZodType<ResolvedPatientScenarioStep>;

export const getAdminPatientScenarioResolvedRecordContract = defineContract({
  method: 'GET',
  path: '/api/admin/patient-scenarios/:scenarioIdentifier/resolved-record',
  access: adminPatientScenarioAccess,
  params: z.object({ scenarioIdentifier: itemIdSchema }),
  query: z.object({ stepId: z.uuid().optional() }),
  output: hektorResponseSchema(resolvedPatientScenarioStepSchema),
});
