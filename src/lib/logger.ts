import pino from 'pino';
import { env } from '@/lib/env';

/**
 * Structured application logging.
 *
 * Anything sensitive is redacted at the logger level so credentials can never
 * reach log output, even if a caller passes a whole request object through.
 */
export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
  base: { app: 'novara-city', env: env.NODE_ENV },
  redact: {
    paths: [
      'password',
      '*.password',
      'passwordHash',
      '*.passwordHash',
      'token',
      '*.token',
      'tokenHash',
      '*.tokenHash',
      'SESSION_SECRET',
      'req.headers.cookie',
      'req.headers.authorization',
      'headers.cookie',
      'headers.authorization',
      '*.email',
    ],
    censor: '[redacted]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/** A child logger tagged with the current request id. */
export function requestLogger(requestId: string) {
  return logger.child({ requestId });
}
