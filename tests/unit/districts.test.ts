import { describe, expect, it } from 'vitest';
import { DISTRICTS, getDistrict } from '@/lib/districts';

describe('district reference data', () => {
  it('ships exactly eight districts', () => {
    expect(DISTRICTS).toHaveLength(8);
  });

  it('uses unique, url-safe slugs', () => {
    const slugs = DISTRICTS.map((district) => district.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it('has complete display copy on every district', () => {
    for (const district of DISTRICTS) {
      expect(district.name.trim().length).toBeGreaterThan(0);
      expect(district.tagline.trim().length).toBeGreaterThan(0);
      expect(district.description.trim().length).toBeGreaterThan(20);
      expect(district.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('resolves districts by slug', () => {
    expect(getDistrict('harbor-point')?.name).toBe('Harbor Point');
    expect(getDistrict('does-not-exist')).toBeUndefined();
  });
});
