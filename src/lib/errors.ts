/**
 * Application error taxonomy.
 *
 * Every error carries a stable machine-readable `code`, an HTTP status and an
 * optional per-field message map so forms can show precise validation feedback.
 */

export type FieldErrors = Record<string, string>;

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fields?: FieldErrors;

  constructor(message: string, code: string, status: number, fields?: FieldErrors) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'The request could not be understood.', fields?: FieldErrors) {
    super(message, 'BAD_REQUEST', 400, fields);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Please check the highlighted fields.', fields?: FieldErrors) {
    super(message, 'VALIDATION_ERROR', 422, fields);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'You need to sign in to do that.') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to do that.') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'The requested resource does not exist.') {
    super(message, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, fields?: FieldErrors) {
    super(message, 'CONFLICT', 409, fields);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many attempts. Please wait and try again.') {
    super(message, 'RATE_LIMITED', 429);
  }
}

export type ErrorBody = {
  error: {
    code: string;
    message: string;
    fields?: FieldErrors;
  };
};

/**
 * Converts any thrown value into the public JSON error envelope.
 * Unknown errors are logged by the caller and returned as an opaque 500 so
 * internal details never leak to clients.
 */
export function toErrorBody(error: unknown): { status: number; body: ErrorBody } {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
          ...(error.fields ? { fields: error.fields } : {}),
        },
      },
    };
  }

  return {
    status: 500,
    body: {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong on our side. Please try again.',
      },
    },
  };
}
