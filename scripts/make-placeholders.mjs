// Generates light, on-brand "glass panel" placeholder images so the gallery
// looks populated before real photos sync from Google Drive.
// These live in public/gallery/ and are replaced by real Drive photos.
import { mkdirSync, writeFileSync } from 'node:fs';

const outDir = new URL('../public/gallery/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const mountains = (x, y, s, color) =>
  `<g transform="translate(${x},${y}) scale(${s})" opacity="0.9">
     <path d="M0,30 L8,12 L13,20 L21,4 L29,18 L37,10 L48,30 Z" fill="${color}"/>
     <path d="M18,9 L21,4 L24,9 Z" fill="var(--red)"/>
   </g>`;

function panel(w, h, { label }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="--red:#d81f26">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7f8f9"/>
      <stop offset="1" stop-color="#e7e9ec"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.4"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <!-- glass reflection bands -->
  <g opacity="0.7">
    <rect x="${w * 0.12}" y="-20" width="${w * 0.16}" height="${h + 40}" fill="url(#glass)" transform="skewX(-12)"/>
    <rect x="${w * 0.55}" y="-20" width="${w * 0.10}" height="${h + 40}" fill="url(#glass)" transform="skewX(-12)"/>
  </g>
  <!-- thin frame -->
  <rect x="6" y="6" width="${w - 12}" height="${h - 12}" rx="6" fill="none" stroke="#11111422" stroke-width="2"/>
  <!-- red corner accent -->
  <rect x="6" y="${h - 14}" width="${w * 0.32}" height="4" fill="var(--red)"/>
  <!-- mark -->
  ${mountains(w / 2 - 24, h / 2 - 24, 1.0, '#11111e')}
  <text x="${w / 2}" y="${h / 2 + 26}" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="800" font-size="14" letter-spacing="2" fill="#11111e" opacity="0.55">RIGID</text>
  <text x="${w / 2}" y="${h - 26}" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#44464d" opacity="0.6">${label}</text>
</svg>`;
}

// Varied aspect ratios for a natural gallery feel.
const sizes = [
  [1200, 1500], // portrait
  [1200, 900], // landscape
  [1200, 1200], // square
  [1200, 1500],
  [1200, 800],
  [1200, 1300],
  [1200, 1000],
  [1200, 1500],
  [1200, 900],
];

sizes.forEach((dim, i) => {
  writeFileSync(new URL(`seed-${i + 1}.svg`, outDir), panel(dim[0], dim[1], { label: 'Photo coming soon' }));
});

console.log(`Wrote ${sizes.length} placeholder images to public/gallery/`);
