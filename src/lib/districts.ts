/**
 * Districts of Novara City.
 *
 * Original world-building data — single source of truth for the landing page
 * today and for the database seed in the backend milestone.
 */

export type District = {
  /** Stable slug, also used as the database key. */
  slug: string;
  name: string;
  tagline: string;
  description: string;
  /** District accent colour, decorative only. */
  color: string;
};

export const DISTRICTS: District[] = [
  {
    slug: 'harbor-point',
    name: 'Harbor Point',
    tagline: 'Cranes, cafés and the morning ferry.',
    description:
      'Working docks and converted warehouses, where the city meets the water and every day starts with tide times.',
    color: '#2f5d7c',
  },
  {
    slug: 'alder-park',
    name: 'Alder Park',
    tagline: 'Tree-lined streets and Saturday markets.',
    description:
      'A residential district of low terraces, community gardens and a market square that fills up by nine.',
    color: '#4b6b3c',
  },
  {
    slug: 'kestrel-heights',
    name: 'Kestrel Heights',
    tagline: 'High terraces above the fog line.',
    description:
      'Stacked apartment blocks and stairways climbing the ridge, with the best view of the city at dusk.',
    color: '#6b5b8e',
  },
  {
    slug: 'old-foundry',
    name: 'Old Foundry',
    tagline: 'Brick workshops turned into studios.',
    description:
      'The former industrial quarter, now full of makers, print shops and shared workshops with tall windows.',
    color: '#8a5a2b',
  },
  {
    slug: 'lantern-quarter',
    name: 'Lantern Quarter',
    tagline: 'Late kitchens and independent stages.',
    description:
      'Narrow lanes of small restaurants, record shops and theatres that stay busy long after dark.',
    color: '#7a3e63',
  },
  {
    slug: 'meridian-row',
    name: 'Meridian Row',
    tagline: 'Civic buildings and the city archive.',
    description:
      'Where Novara keeps its records: the archive, the registry, and the hall where residents meet.',
    color: '#375a5a',
  },
  {
    slug: 'sunfield',
    name: 'Sunfield',
    tagline: 'Allotments, quiet lanes, long light.',
    description:
      'The green edge of the city, made of garden plots, low houses and afternoons that run long.',
    color: '#a8791f',
  },
  {
    slug: 'northgate',
    name: 'Northgate',
    tagline: 'The rail head and everything arriving.',
    description:
      'Depots, platforms and freight yards — the point where new residents and goods enter Novara.',
    color: '#4a5568',
  },
];

export function getDistrict(slug: string): District | undefined {
  return DISTRICTS.find((district) => district.slug === slug);
}
