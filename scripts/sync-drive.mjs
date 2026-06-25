/**
 * Pulls photos from a PUBLIC Google Drive folder at build time and writes
 * src/data/gallery.json + downloads images into public/gallery/drive/.
 *
 * Setup (one-time):
 *   1. Put Noah's photos in a Google Drive folder.
 *   2. Share it: "Anyone with the link → Viewer".
 *   3. Get a Google API key with the Drive API enabled.
 *   4. Set env vars (locally or in Netlify):
 *        GDRIVE_FOLDER_ID = the folder id from its share URL
 *        GDRIVE_API_KEY   = your Drive API key
 *
 * If the env vars are absent, this script does nothing and the existing
 * seed gallery.json is kept — so local dev and builds never break.
 *
 * Newest photos (by Drive "created time") drive the home page's recent
 * section; the Work page shows everything.
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const FOLDER_ID = process.env.GDRIVE_FOLDER_ID;
const API_KEY = process.env.GDRIVE_API_KEY;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outImgDir = join(root, 'public', 'gallery', 'drive');
const manifest = join(root, 'src', 'data', 'gallery.json');

if (!FOLDER_ID || !API_KEY) {
  console.log('[sync-drive] GDRIVE_FOLDER_ID / GDRIVE_API_KEY not set — keeping seed gallery.');
  process.exit(0);
}

const API = 'https://www.googleapis.com/drive/v3/files';

async function listAll() {
  const files = [];
  let pageToken;
  do {
    const params = new URLSearchParams({
      q: `'${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'nextPageToken, files(id, name, createdTime, modifiedTime, mimeType)',
      orderBy: 'createdTime desc',
      pageSize: '1000',
      key: API_KEY,
    });
    if (pageToken) params.set('pageToken', pageToken);
    const res = await fetch(`${API}?${params}`);
    if (!res.ok) throw new Error(`Drive list failed: ${res.status} ${await res.text()}`);
    const json = await res.json();
    files.push(...(json.files ?? []));
    pageToken = json.nextPageToken;
  } while (pageToken);
  return files;
}

async function download(id, dest) {
  const res = await fetch(`${API}/${id}?alt=media&key=${API_KEY}`);
  if (!res.ok) throw new Error(`Download ${id} failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
}

const extFor = (name, mime) => {
  const m = name.match(/\.[a-z0-9]+$/i);
  if (m) return m[0].toLowerCase();
  return '.' + (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
};

try {
  console.log('[sync-drive] Fetching photo list from Google Drive…');
  const files = await listAll();
  console.log(`[sync-drive] Found ${files.length} photo(s).`);

  rmSync(outImgDir, { recursive: true, force: true });
  mkdirSync(outImgDir, { recursive: true });

  const photos = [];
  for (const [i, f] of files.entries()) {
    const ext = extFor(f.name, f.mimeType);
    const fileName = `${String(i + 1).padStart(3, '0')}-${f.id}${ext}`;
    await download(f.id, join(outImgDir, fileName));
    photos.push({
      src: `/gallery/drive/${fileName}`,
      addedAt: (f.createdTime || f.modifiedTime || '').slice(0, 10),
      alt: f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' '),
    });
  }

  writeFileSync(
    manifest,
    JSON.stringify(
      { comment: 'Auto-generated from Google Drive by scripts/sync-drive.mjs.', photos },
      null,
      2
    ) + '\n'
  );
  console.log(`[sync-drive] Wrote ${photos.length} photo(s) to gallery.json.`);
} catch (err) {
  console.error('[sync-drive] Error:', err.message);
  // Don't fail the build — fall back to whatever manifest exists.
  process.exit(0);
}
