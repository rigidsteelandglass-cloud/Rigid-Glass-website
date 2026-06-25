/**
 * Single source of truth for Noah's business details.
 * Edit these values to update the whole site — name, phone, email, links.
 * (Project photos are managed separately in the /admin dashboard.)
 */
export const site = {
  businessName: "Noah's Showers",
  owner: 'Noah',
  tagline: 'Custom showers & bathroom remodels, done right',
  serviceArea: 'the local area',

  // Contact — UPDATE THESE with Noah's real details.
  phone: '(555) 555-1234',
  email: 'noah@example.com',

  // Optional social / review links. Leave as empty string '' to hide.
  instagram: '', // e.g. 'https://instagram.com/noahsshowers'
  facebook: '',
  googleReviews: '',
};

export type Site = typeof site;
