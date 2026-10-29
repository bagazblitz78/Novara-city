import { DISTRICTS } from '@/lib/districts';

/**
 * District picker options for the registration form.
 *
 * A tiny server component that passes the authoritative district list to the
 * client form, so the choices shown always match the seed data — no duplicated
 * copy that could drift out of sync.
 */
export function DistrictOptions() {
  return (
    <>
      {DISTRICTS.map((district) => (
        <option key={district.slug} value={district.slug}>
          {district.name}
        </option>
      ))}
    </>
  );
}
