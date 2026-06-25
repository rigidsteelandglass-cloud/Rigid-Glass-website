// Generates lightweight SVG placeholder "photos" so the site looks populated
// before Noah adds real ones. Safe to delete after real photos are in.
import { mkdirSync, writeFileSync } from 'node:fs';

const outDir = new URL('../public/images/uploads/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const tile = (w, h, { a, b, grout, label, ratio = 0.62 }) => {
  const cols = 6;
  const rows = Math.round((cols * h) / w);
  const cw = w / cols;
  const ch = h / rows;
  let rects = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // brick offset every other row
      const x = c * cw + (r % 2 ? cw / 2 : 0) - (r % 2 ? cw / 2 : 0);
      const shade = (r * cols + c) % 5 === 0 ? 0.92 : (c % 3 === 0 ? 1.05 : 1);
      rects += `<rect x="${(c * cw).toFixed(1)}" y="${(r * ch).toFixed(1)}" width="${(cw - 2).toFixed(1)}" height="${(ch - 2).toFixed(1)}" rx="2" fill="url(#g)" opacity="${(0.55 * shade).toFixed(2)}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${grout}"/>
  ${rects}
  <rect width="${w}" height="${h}" fill="url(#sheen)"/>
  <g opacity="0.85" transform="translate(${w / 2}, ${h * ratio})">
    <circle r="34" fill="#ffffff" opacity="0.12"/>
    <path d="M0 -22 C 0 -22 -13 -6 -13 2 a 13 13 0 0 0 26 0 C 13 -6 0 -22 0 -22 Z" fill="#ffffff" opacity="0.9"/>
  </g>
  <text x="${w / 2}" y="${h - 22}" text-anchor="middle" font-family="Inter, sans-serif" font-size="15" fill="#ffffff" opacity="0.7">${label}</text>
</svg>`;
};

const palettes = [
  { a: '#0d9488', b: '#0f766e', grout: '#0b3b39' },
  { a: '#475569', b: '#1e293b', grout: '#0f172a' },
  { a: '#0ea5e9', b: '#0369a1', grout: '#082f49' },
  { a: '#a8a29e', b: '#57534e', grout: '#292524' },
  { a: '#14b8a6', b: '#0d9488', grout: '#0b3b39' },
  { a: '#64748b', b: '#334155', grout: '#1e293b' },
];

// Project covers (4:3-ish, tall enough for hero crop)
for (let i = 1; i <= 6; i++) {
  const p = palettes[(i - 1) % palettes.length];
  writeFileSync(new URL(`sample-${i}.svg`, outDir), tile(1200, 1500, { ...p, label: 'Sample photo' }));
}

// Noah portrait placeholder
writeFileSync(
  new URL('noah.svg', outDir),
  tile(900, 1125, { a: '#0f766e', b: '#0f172a', grout: '#0b3b39', label: 'Photo of Noah', ratio: 0.4 })
);

console.log('Placeholder images written to public/images/uploads/');
