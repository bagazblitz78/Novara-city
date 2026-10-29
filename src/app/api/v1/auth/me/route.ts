import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/server/auth/guards';
import { withApiErrorHandling } from '@/server/api/http';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/auth/me
 *
 * Returns the signed-in user, or null when signed out. Never 401s — the UI
 * calls this on load to decide between signed-in and signed-out chrome.
 */
export async function GET(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const user = await getCurrentUser(request);
    return NextResponse.json({ user });
  });
}
