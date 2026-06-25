/**
 * Single source of truth for RIGID's business details.
 * Edit these values to update the whole site.
 * (Project photos are pulled from Google Drive — see scripts/sync-drive.mjs.)
 */
export const site = {
  businessName: 'RIGID',
  legalName: 'RIGID Steel & Glass',
  owner: 'Noah Jacobson',

  tagline: 'Custom Steel & Glass Solutions',
  motto: 'Handcrafted. Built Rigid. Designed to last.',
  closer: 'Built with strength. Designed to inspire.',
  intro:
    'Specializing in custom glass railings, shower doors, storefront glass, and custom metal & glass work.',

  // Contact
  phone: '(435) 200-7219',
  email: 'rigidsteelandglass@gmail.com',
  instagram: '', // e.g. 'https://instagram.com/...'

  // Service area
  serviceArea: 'Summit & Utah Counties',
  cities: ['Park City', 'Heber City', 'Utah County'],
};

/** The three things RIGID does — mirrors the business card & flyer. */
export const categories = [
  {
    slug: 'custom-glass',
    name: 'Custom Glass',
    blurb:
      'Storefront glass, partitions, mirrors, and custom metal-and-glass work — measured and cut to fit your space.',
    image: '/gallery/seed-1.svg',
  },
  {
    slug: 'handrailing',
    name: 'Handrailing',
    blurb:
      'Modern glass and steel railing for stairs, balconies, and decks — strong, clean, and built to last.',
    image: '/gallery/seed-3.svg',
  },
  {
    slug: 'european-shower-doors',
    name: 'European Shower Doors',
    blurb:
      'Frameless, custom-fit European shower enclosures with heavy glass and minimal hardware.',
    image: '/gallery/seed-2.svg',
  },
];

/** Trust badges from the brand flyer. */
export const features = [
  'Premium Quality',
  'Expert Craftsmanship',
  'Custom Design',
  'Residential & Commercial',
  'Reliable & Professional',
];

export type Site = typeof site;
