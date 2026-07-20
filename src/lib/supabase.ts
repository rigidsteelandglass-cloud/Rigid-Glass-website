import { createClient } from '@supabase/supabase-js';
import { categories } from '../config';

/**
 * RIGID's Supabase project. Both values are public by design — the publishable
 * key only grants what Row Level Security allows (read the gallery; nothing else
 * without a login). Safe to commit and ship to the browser.
 */
export const SUPABASE_URL = 'https://hqucdpebfvssjhhwvjli.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_S3BIWcBqLuEnrCAAK_ZVow_rFBW3SSv';

/** Only this address may sign in to /admin. */
export const ADMIN_EMAIL = 'rigidsteelandglass@gmail.com';

export const BUCKET = 'gallery';

/** Where a photo can live. Mirrors the service pages, plus a catch-all. */
export const FOLDERS = [
  ...categories.map((c) => ({ slug: c.slug, name: c.name })),
  { slug: 'other', name: 'Other / General' },
];

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const publicUrl = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

export interface Photo {
  path: string;
  url: string;
  name: string;
  folder: string;
  createdAt: string;
}

/**
 * Display order is a 3-digit prefix on the filename ("020-1784-shot.jpg").
 *
 * ponytail: the filename carries the order, so there's still no database —
 * reordering is a storage rename, and the sort is a plain string compare.
 * Gaps of 10 mean a swap never has to renumber the whole folder.
 */
const ORDER_STEP = 10;
const orderOf = (name: string) => parseInt(name.slice(0, 3), 10) || 0;
export const withOrder = (n: number, rest: string) =>
  `${String(Math.min(n, 999)).padStart(3, '0')}-${rest}`;

/** Photos in one category folder, in Noah's chosen order. */
export async function listPhotos(folder: string): Promise<Photo[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(`photos/${folder}`, {
    limit: 200,
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error) {
    console.error('[gallery]', error.message);
    return [];
  }
  return (data ?? [])
    .filter((f) => f.id) // folders come back with a null id
    .map((f) => ({
      path: `photos/${folder}/${f.name}`,
      url: publicUrl(`photos/${folder}/${f.name}`),
      name: f.name,
      folder,
      createdAt: f.created_at ?? '',
    }));
}

/** Every photo across every category, in category order then Noah's order. */
export async function allPhotos(): Promise<Photo[]> {
  const perFolder = await Promise.all(FOLDERS.map((f) => listPhotos(f.slug)));
  return perFolder.flat();
}

/** Newest uploads first — what the home page shows. */
export async function recentPhotos(limit = 6): Promise<Photo[]> {
  const all = await allPhotos();
  return all
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

/** Next order prefix for a new upload in `folder`. */
export async function nextOrder(folder: string): Promise<number> {
  const photos = await listPhotos(folder);
  const max = photos.reduce((m, p) => Math.max(m, orderOf(p.name)), 0);
  return max + ORDER_STEP;
}

/**
 * Swap a photo with its neighbour by renaming both. `dir` is -1 (up) or 1 (down).
 * No-op at the ends of the list.
 *
 * ponytail: copy-then-delete rather than move(), so reordering needs only the
 * insert and delete permissions uploads already use — no extra storage policy.
 * No temp file either: each name keeps its own timestamp, so the swapped names
 * can't collide with the originals.
 */
export async function movePhoto(photo: Photo, dir: -1 | 1): Promise<void> {
  const photos = await listPhotos(photo.folder);
  const i = photos.findIndex((p) => p.path === photo.path);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= photos.length) return;

  const a = photos[i];
  const b = photos[j];
  const restOf = (name: string) => name.replace(/^\d{3}-/, '');
  const storage = supabase.storage.from(BUCKET);

  const rename = async (from: Photo, order: number) => {
    const to = `photos/${photo.folder}/${withOrder(order, restOf(from.name))}`;
    const { error: copyError } = await storage.copy(from.path, to);
    // Never swallow this: a refused rename looks identical to a working one.
    if (copyError) throw new Error(`Could not reorder: ${copyError.message}`);
    const { error: removeError } = await storage.remove([from.path]);
    if (removeError) throw new Error(`Reordered but left a copy behind: ${removeError.message}`);
  };

  await rename(a, orderOf(b.name));
  await rename(b, orderOf(a.name));
}

/**
 * The single "cover" photo shown at the top of a page. Keyed by slot so Noah
 * can set each one independently; the built-in art stays as the fallback.
 */
export const COVER_SLOTS = [
  { slot: 'home', name: 'Home page — main photo' },
  ...categories.map((c) => ({ slot: c.slug, name: `${c.name} — cover photo` })),
  { slot: 'about', name: 'About page — photo' },
];

/** Every cover Noah has set, as slot → public URL. */
export async function getCovers(): Promise<Record<string, string>> {
  const { data } = await supabase.storage.from(BUCKET).list('covers', { limit: 100 });
  const covers: Record<string, string> = {};
  for (const f of data ?? []) {
    if (!f.id) continue;
    const slot = f.name.replace(/__.*$/, ''); // "about__1784-shot.jpg" -> "about"
    covers[slot] = publicUrl(`covers/${f.name}`);
  }
  return covers;
}

/** Replace a cover: only one file per slot ever exists. */
export async function setCover(slot: string, file: File): Promise<void> {
  const storage = supabase.storage.from(BUCKET);
  const { data } = await storage.list('covers', { limit: 100 });
  const old = (data ?? [])
    .filter((f) => f.id && f.name.startsWith(`${slot}__`))
    .map((f) => `covers/${f.name}`);
  if (old.length) await storage.remove(old);

  const safe = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
  const { error } = await storage.upload(`covers/${slot}__${Date.now()}-${safe}`, file, {
    cacheControl: '3600',
  });
  if (error) throw new Error(`${file.name}: ${error.message}`);
}

/** The uploaded logo, or null to fall back to the built-in wordmark. */
export async function getLogoUrl(): Promise<string | null> {
  const { data } = await supabase.storage.from(BUCKET).list('logo', { limit: 1 });
  const file = data?.find((f) => f.id);
  return file ? publicUrl(`logo/${file.name}`) : null;
}
