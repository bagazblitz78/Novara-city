import { NextResponse } from 'next/server';
import packageJson from '../../../../../package.json';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/health
 *
 * Public liveness/readiness probe used by deployment checks. Deliberately
 * reveals nothing beyond status, version and timings.
 */
export async function GET(): Promise<NextResponse> {
  const startedAt = Date.now();
  let database: 'up' | 'down' = 'down';

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'up';
  } catch (error) {
    console.error('health check: database unreachable', error);
  }

  const healthy = database === 'up';

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      service: 'novara-city',
      version: packageJson.version,
      environment: env.NODE_ENV,
      database,
      uptimeSeconds: Math.round(process.uptime()),
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
