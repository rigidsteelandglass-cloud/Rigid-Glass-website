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
 * Recent photos for the home page. Returns everything added within the last
 * `months` months; if that's too few, falls back to the newest `min`.
 */
export function recentPhotos(months = 3, min = 6): Photo[] {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const recent = photos.filter((p) => new Date(p.addedAt) >= cutoff);
  return recent.length >= min ? recent : photos.slice(0, Math.max(min, recent.length));
}
