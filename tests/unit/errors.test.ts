import { describe, expect, it } from 'vitest';
import {
  AppError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
  toErrorBody,
} from '@/lib/errors';

describe('error taxonomy', () => {
  it('maps known errors to their status and stable code', () => {
    expect(new ValidationError()).toMatchObject({
      status: 422,
      code: 'VALIDATION_ERROR',
    });
    expect(new UnauthorizedError()).toMatchObject({ status: 401, code: 'UNAUTHORIZED' });
    expect(new ForbiddenError()).toMatchObject({ status: 403, code: 'FORBIDDEN' });
    expect(new NotFoundError()).toMatchObject({ status: 404, code: 'NOT_FOUND' });
    expect(new RateLimitError()).toMatchObject({ status: 429, code: 'RATE_LIMITED' });
  });

  it('carries per-field validation messages to the client', () => {
    const error = new ValidationError('Check the form.', {
      username: 'This username is already taken.',
    });
    const { status, body } = toErrorBody(error);

    expect(status).toBe(422);
    expect(body.error.fields?.username).toBe('This username is already taken.');
  });

  it('never leaks internals for unknown errors', () => {
    const { status, body } = toErrorBody(new Error('connection string: postgres://…'));

    expect(status).toBe(500);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(body)).not.toContain('postgres://');
  });

  it('keeps custom AppErrors intact end to end', () => {
    const { status, body } = toErrorBody(new AppError('Taken', 'CONFLICT', 409));

    expect(status).toBe(409);
    expect(body.error).toEqual({ code: 'CONFLICT', message: 'Taken' });
  });
});
