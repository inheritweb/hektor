import { describe, expect, it } from 'vitest';

import { HektorErrorCode } from '@hektor/types/contracts';

import { createServiceError, toErrorResponse } from './errors';

describe('service errors', () => {
  it('keeps internal messages out of API responses', () => {
    const error = createServiceError(HektorErrorCode.NotFound, {
      message: 'Organisation not found',
      internalMessage: 'PGRST116 returned no rows',
      data: { organisationId: 'missing' },
    });

    expect(toErrorResponse(error)).toEqual({
      error: {
        code: HektorErrorCode.NotFound,
        message: 'Organisation not found',
        data: { organisationId: 'missing' },
      },
    });
  });

  it('normalises unknown failures without exposing their message', () => {
    expect(toErrorResponse(new Error('database password leaked'))).toEqual({
      error: {
        code: HektorErrorCode.InternalServerError,
        message: 'An unexpected error occurred',
      },
    });
  });
});
