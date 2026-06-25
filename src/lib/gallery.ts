import data from '../data/gallery.json';

export interface Photo {
  src: string;
  addedAt: string; // ISO date
  alt?: string;
}

const photos: Photo[] = (data.photos as Photo[])
  .slice()
  .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

/** Every photo, newest first — used on the Work page. */
export function allPhotos(): Photo[] {
  return photos;
}

/**
 * A real gallery photo by position (newest first), or `fallback` if there
 * aren't that many yet. Lets the hero / category cards show real work while
 * degrading gracefully to seed placeholders. Never breaks when photos change.
 */
export function featuredImage(index: number, fallback: string): string {
  return photos[index]?.src ?? fallback;
}

/**
 * Recent photos for the home page. Returns everything added within the last
 * `months` months; if that's too few, falls back to the newest `min`.
 */
export function recentPhotos(months = 3, min = 6): Photo[] {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const recent = photos.filter((p) => new Date(p.addedAt) >= cutoff);
  return recent.length >= min ? recent : photos.slice(0, Math.max(min, recent.length));
}
