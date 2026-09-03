import { z } from 'zod';

import {
  type EhrConfiguration,
  type EhrConfigurationChange,
  EhrConfigurationChangeType,
  type EhrSectionConfiguration,
  EhrSectionType,
} from '../ehr';

const plainText = (maximum: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(maximum)
    .refine((value) => !/[<>]/u.test(value), 'Markup is not permitted');

const sectionIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/u)
  .max(80);

export const ehrSectionConfigurationSchema = z
  .object({
    id: sectionIdSchema,
    type: z.enum(EhrSectionType),
    order: z.number().int().min(1).max(100_000),
    label: plainText(100).optional(),
  })
  .strict() satisfies z.ZodType<EhrSectionConfiguration>;

export const ehrConfigurationSchema = z
  .object({
    sections: z.array(ehrSectionConfigurationSchema).max(100),
  })
  .strict() satisfies z.ZodType<EhrConfiguration>;

export const ehrConfigurationChangeSchema = z.discriminatedUnion('operation', [
  z
    .object({
      operation: z.literal(EhrConfigurationChangeType.Insert),
      section: ehrSectionConfigurationSchema,
    })
    .strict(),
  z
    .object({
      operation: z.literal(EhrConfigurationChangeType.Configure),
      sectionId: sectionIdSchema,
      label: plainText(100),
    })
    .strict(),
  z
    .object({
      operation: z.literal(EhrConfigurationChangeType.Hide),
      sectionId: sectionIdSchema,
    })
    .strict(),
  z
    .object({
      operation: z.literal(EhrConfigurationChangeType.Reveal),
      sectionId: sectionIdSchema,
    })
    .strict(),
  z
    .object({
      operation: z.literal(EhrConfigurationChangeType.Move),
      sectionId: sectionIdSchema,
      order: z.number().int().min(1).max(100_000),
    })
    .strict(),
]) satisfies z.ZodType<EhrConfigurationChange>;
