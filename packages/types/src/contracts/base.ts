import { z } from 'zod';

import type { OrganisationRole } from '../organisations';
import type { PlatformRole } from '../users';

export enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc',
}

export enum HektorErrorCode {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  Gone = 410,
  UnprocessableEntity = 422,
  InternalServerError = 500,
}

export interface HektorResponse<T> {
  data: T;
}

export interface HektorCollectionResponse<T> {
  context: {
    page: number;
    pageSize: number;
    totalRecords: number;
    sort: { order: string; dir: SortDirection };
  };
  data: T;
}

export interface HektorErrorDetail {
  code: HektorErrorCode;
  message: string;
  data?: Record<string, string>;
}

export interface HektorErrorResponse {
  error: HektorErrorDetail;
}

export const emptyObjectSchema = z.object({}).strict();

export const noBodySchema = z.undefined();

export const sortDirectionSchema = z.enum(SortDirection);

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  order: z.string().min(1),
  dir: sortDirectionSchema.default(SortDirection.Ascending),
});

export const hektorResponseSchema = <T extends z.ZodType>(data: T) =>
  z.object({ data });

export const hektorCollectionResponseSchema = <T extends z.ZodType>(data: T) =>
  z.object({
    context: z.object({
      page: z.number().int().positive(),
      pageSize: z.number().int().positive(),
      totalRecords: z.number().int().nonnegative(),
      sort: z.object({ order: z.string().min(1), dir: sortDirectionSchema }),
    }),
    data,
  });

export const hektorErrorCodeSchema = z.enum(HektorErrorCode);

export const hektorErrorResponseSchema: z.ZodType<HektorErrorResponse> =
  z.object({
    error: z.object({
      code: hektorErrorCodeSchema,
      message: z.string().min(1),
      data: z.record(z.string(), z.string()).optional(),
    }),
  });

type ContractSchema = z.ZodType;

export type ContractAccess =
  | { type: 'public' }
  | { type: 'authenticated' }
  | { type: 'platform'; roles: readonly PlatformRole[] }
  | {
      type: 'organisation';
      organisationIdParam: string;
      roles: readonly OrganisationRole[];
    };

export interface HektorContract<
  TParams extends ContractSchema = ContractSchema,
  TQuery extends ContractSchema = ContractSchema,
  TBody extends ContractSchema = ContractSchema,
  TOutput extends ContractSchema = ContractSchema,
> {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  access: ContractAccess;
  params?: TParams;
  query?: TQuery;
  body?: TBody;
  output: TOutput;
}

export function defineContract<const TContract extends HektorContract>(
  contract: TContract,
) {
  return contract;
}

export type AnyHektorContract = HektorContract;

type ContractSchemaAt<
  T extends AnyHektorContract,
  TKey extends 'params' | 'query' | 'body' | 'output',
> =
  T extends Record<TKey, infer TSchema>
    ? TSchema extends ContractSchema
      ? TSchema
      : never
    : never;

export type ContractParams<T extends AnyHektorContract> = z.output<
  ContractSchemaAt<T, 'params'>
>;

export type ContractQuery<T extends AnyHektorContract> = z.output<
  ContractSchemaAt<T, 'query'>
>;

export type ContractBody<T extends AnyHektorContract> = z.output<
  ContractSchemaAt<T, 'body'>
>;

export type ContractOutput<T extends AnyHektorContract> = z.output<
  ContractSchemaAt<T, 'output'>
>;

export type ContractParamsInput<T extends AnyHektorContract> = z.input<
  ContractSchemaAt<T, 'params'>
>;

export type ContractQueryInput<T extends AnyHektorContract> = z.input<
  ContractSchemaAt<T, 'query'>
>;

export type ContractBodyInput<T extends AnyHektorContract> = z.input<
  ContractSchemaAt<T, 'body'>
>;
