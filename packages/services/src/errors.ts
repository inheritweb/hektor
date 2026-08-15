import {
  HektorErrorCode,
  type HektorErrorResponse,
} from '@hektor/types/contracts';

export interface HektorServiceErrorOptions {
  message: string;
  internalMessage?: string;
  data?: Record<string, string>;
  cause?: unknown;
}

export class HektorServiceError extends Error {
  readonly code: HektorErrorCode;
  readonly internalMessage?: string;
  readonly data?: Record<string, string>;

  constructor(code: HektorErrorCode, options: HektorServiceErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = 'HektorServiceError';
    this.code = code;
    this.internalMessage = options.internalMessage;
    this.data = options.data;
  }
}

export function createServiceError(
  code: HektorErrorCode,
  options: HektorServiceErrorOptions,
) {
  return new HektorServiceError(code, options);
}

export function normaliseServiceError(error: unknown): HektorServiceError {
  if (error instanceof HektorServiceError) return error;
  return new HektorServiceError(HektorErrorCode.InternalServerError, {
    message: 'An unexpected error occurred',
    internalMessage: error instanceof Error ? error.message : String(error),
    cause: error,
  });
}

export function toErrorResponse(error: unknown): HektorErrorResponse {
  const serviceError = normaliseServiceError(error);
  return {
    error: {
      code: serviceError.code,
      message: serviceError.message,
      ...(serviceError.data ? { data: serviceError.data } : {}),
    },
  };
}
