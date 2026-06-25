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
import sharp from 'sharp';

// Noah's public "RIGID" photos folder. Override with env if it ever changes.
const FOLDER_ID = process.env.GDRIVE_FOLDER_ID || '1WgfoLI9nC_EO41i9Mqk3qe9qz0iBvlWW';
// The API key is the only secret — never commit it. Set it via env / Netlify.
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Download via Google's public image CDN instead of the Drive API's download
// endpoint. The CDN isn't subject to the API download quota (no 403 throttling),
// pre-resizes (=s2000), and serves JPEG even for HEIC originals.
async function fetchImage(id) {
  let lastStatus;
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt) await sleep(800 * attempt);
    const res = await fetch(`https://lh3.googleusercontent.com/d/${id}=s2000`);
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    lastStatus = res.status;
  }
  throw new Error(`CDN download ${id} failed: ${lastStatus}`);
}

// Recompress + ensure correct orientation. Web-friendly, optimized JPEG.
async function toWebJpeg(buf) {
  return sharp(buf)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

try {
  console.log('[sync-drive] Fetching photo list from Google Drive…');
  const files = await listAll();
  console.log(`[sync-drive] Found ${files.length} photo(s).`);

  rmSync(outImgDir, { recursive: true, force: true });
  mkdirSync(outImgDir, { recursive: true });

  const photos = [];
  for (const [i, f] of files.entries()) {
    try {
      const raw = await fetchImage(f.id);
      const jpeg = await toWebJpeg(raw);
      const fileName = `${String(i + 1).padStart(3, '0')}-${f.id}.jpg`;
      writeFileSync(join(outImgDir, fileName), jpeg);
      photos.push({
        src: `/gallery/drive/${fileName}`,
        addedAt: (f.createdTime || f.modifiedTime || '').slice(0, 10),
        alt: 'RIGID custom glass & steel project',
      });
      console.log(`[sync-drive]   ${i + 1}/${files.length}  ${f.name} → jpg`);
    } catch (e) {
      console.warn(`[sync-drive]   skipped ${f.name}: ${e.message}`);
    }
  }

  // Safety: if a pull comes back empty (e.g. Drive throttled every download),
  // keep the last good manifest rather than wiping the gallery.
  if (photos.length === 0 && files.length > 0) {
    console.warn('[sync-drive] All downloads failed — keeping existing gallery.json.');
    process.exit(0);
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
