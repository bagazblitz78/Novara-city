import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError, BadRequestError, toErrorBody } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * API error boundary.
 *
 * Wraps a route handler so every failure leaves through one place: typed
 * AppErrors become their documented status/body, Zod errors become a 422 with
 * field messages, and anything unexpected is logged server-side then returned
 * as an opaque 500 that leaks no internals.
 */

export type ApiHandler<T> = () => Promise<T>;

export async function handleApiError(error: unknown): Promise<NextResponse> {
  if (error instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = issue.path.join('.') || '_';
      if (!fields[key]) fields[key] = issue.message;
    }
    const { body } = toErrorBody(
      new AppError('Please check the highlighted fields.', 'VALIDATION_ERROR', 422, fields),
    );
    return NextResponse.json(body, { status: 422 });
  }

  if (error instanceof AppError) {
    const { status, body } = toErrorBody(error);
    return NextResponse.json(body, { status });
  }

  logger.error({ err: error }, 'unhandled API error');
  const { status, body } = toErrorBody(error);
  return NextResponse.json(body, { status });
}

/** Runs an API handler, funneling all errors through handleApiError. */
export async function withApiErrorHandling<T>(handler: ApiHandler<T>): Promise<NextResponse | T> {
  try {
    return await handler();
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Reads and parses a JSON request body.
 *
 * A body that isn't valid JSON is the client's mistake, not ours, so it maps
 * to a 400 rather than falling through to the opaque 500 that `request.json()`
 * would otherwise produce. The raw parser error is never surfaced — it can
 * echo attacker-controlled fragments back into logs and responses.
 */
export async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new BadRequestError('The request body must be valid JSON.', {
      _: 'Malformed JSON body.',
    });
  }
}
