import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/v1/health/route';

describe('GET /api/v1/health', () => {
  it('reports ok with a reachable database', async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('novara-city');
    expect(body.database).toBe('up');
    expect(typeof body.version).toBe('string');
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('is never cached', async () => {
    const response = await GET();
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('exposes no internal configuration', async () => {
    const response = await GET();
    const text = JSON.stringify(await response.json());

    expect(text).not.toContain('DATABASE_URL');
    expect(text).not.toContain('SESSION_SECRET');
    expect(text).not.toContain('file:');
  });
});
