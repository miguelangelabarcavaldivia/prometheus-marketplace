import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function loadToken() {
  const paths = [
    'D:\\Proyectos Opencode\\Content Multiplier\\.env',
    'D:\\Proyectos Opencode\\Gumroad MailZero\\.env',
    'D:\\Proyectos Opencode\\Gumroad prompts\\auto-multi-agent-prompts\\.env',
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      for (const line of readFileSync(p, 'utf-8').split('\n')) {
        const t = line.trim();
        if (t.startsWith('GUMROAD_ACCESS_TOKEN=')) return t.split('=').slice(1).join('=').trim();
      }
    }
  }
  throw new Error('Token not found');
}

const TOKEN = loadToken();
const API = 'https://api.gumroad.com/v2';

function toFormBody(params) {
  const parts = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v)) {
      const key = k.includes('[]') ? k : `${k}[]`;
      for (const item of v) {
        if (typeof item === 'object') {
          for (const [sk, sv] of Object.entries(item)) {
            if (sv !== null && sv !== undefined)
              parts.push(`${encodeURIComponent(key.replace(/\[\]$/, '') + '[][' + sk + ']')}=${encodeURIComponent(String(sv))}`);
          }
        } else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
      }
    } else parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.join('&');
}

async function api(method, ep, params = {}) {
  const body = toFormBody({ ...params, access_token: TOKEN });
  const res = await fetch(`${API}${ep}`, {
    method,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || JSON.stringify(data).slice(0, 200));
  return data;
}

async function uploadToFreeImage(buf) {
  const fd = new FormData();
  fd.append('source', new Blob([buf], { type: 'image/jpeg' }), 'cover.jpg');
  fd.append('type', 'file');
  fd.append('action', 'upload');
  fd.append('timestamp', Date.now().toString());
  fd.append('auth_token', 'guest');
  const r = await fetch('https://freeimage.host/json', { method: 'POST', body: fd, redirect: 'manual' });
  const data = await r.json();
  if (data.status_code !== 200 || !data.image?.url) throw new Error(`FreeImage fail: ${JSON.stringify(data).slice(0, 200)}`);
  return data.image.url;
}

const products = [
  { id: 'lU_-_PPe82uRJhdY4Ix7sg==', name: 'Prompt Engineering Curso', price: 29 },
  { id: 'JGw7jLEQllo50Nga_YeWuA==', name: 'AI Agent Pipeline', price: 59 },
  { id: 'j5GzAveDP0dpGhb6gV0rgg==', name: 'De Cero a AI Agent', price: 24 },
  { id: 'N-x0W15BcgXDdpvxneGk_w==', name: 'CLI AI Commit Tool', price: 14 },
  { id: '6l4jMUU7SqICfmsVf2cPYw==', name: 'Next.js AI Starter Kit', price: 49 },
  { id: 'YlEytwzXGqCiyL7xqCnT3g==', name: 'Prompt Engineering Playbook', price: 19 },
  { id: '_D_0wwNrBOVIJtSkTb3Rcw==', name: 'RAG System Template', price: 39 },
];

const colors = [
  ['#1a1a2e', '#16213e', '#0f3460'],
  ['#0d1b2a', '#1b2838', '#415a77'],
  ['#2d1b69', '#2d1b69', '#11998e'],
  ['#0f0c29', '#302b63', '#24243e'],
  ['#1a1a2e', '#e94560', '#0f3460'],
  ['#000428', '#004e92', '#00d2ff'],
  ['#141e30', '#243b55', '#00b4db'],
];

async function generateCover(name, price, colors_arr, idx) {
  const size = 1280;
  const buf = await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: colors_arr[0],
    },
  })
    .composite([
      {
        input: Buffer.from(`<svg width="${size}" height="${size}">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${colors_arr[0]};stop-opacity:1" />
              <stop offset="50%" style="stop-color:${colors_arr[1]};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${colors_arr[2]};stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${size}" height="${size}" fill="url(#bg)" rx="40"/>
          <circle cx="1100" cy="200" r="300" fill="rgba(255,255,255,0.04)"/>
          <circle cx="200" cy="1100" r="250" fill="rgba(255,255,255,0.03)"/>
          <text x="640" y="360" text-anchor="middle" font-family="Segoe UI, system-ui, sans-serif" font-size="48" font-weight="700" fill="white">PROMETHEUS 3.0</text>
          <text x="640" y="440" text-anchor="middle" font-family="Segoe UI, system-ui, sans-serif" font-size="22" fill="rgba(255,255,255,0.5)">IA + Development Marketplace</text>
          <rect x="160" y="520" width="960" height="420" rx="30" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
          <text x="640" y="620" text-anchor="middle" font-family="Segoe UI, system-ui, sans-serif" font-size="${name.length > 30 ? 32 : 38}" font-weight="700" fill="white">${name.replace(/&/g, '&amp;')}</text>
          <text x="640" y="780" text-anchor="middle" font-family="Segoe UI, system-ui, sans-serif" font-size="60" font-weight="800" fill="#00d2ff">$${price}</text>
          <text x="640" y="850" text-anchor="middle" font-family="Segoe UI, system-ui, sans-serif" font-size="20" fill="rgba(255,255,255,0.4)">Gumroad / miguelabarca</text>
          <rect x="440" y="890" width="400" height="4" rx="2" fill="rgba(0,210,255,0.3)"/>
        </svg>`),
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 88 })
    .toBuffer();
  return buf;
}

async function main() {
  console.log('\n=== GENERATE & UPLOAD COVERS FOR 7 PRODUCTS ===\n');

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`[${i + 1}/7] Generating cover for "${p.name}"...`);
    try {
      const buf = await generateCover(p.name, p.price, colors[i], i);
      console.log(`  ✅ Generated (${(buf.length / 1024).toFixed(1)} KB)`);

      console.log(`  Uploading to FreeImage.host...`);
      const url = await uploadToFreeImage(buf);
      console.log(`  ✅ Uploaded: ${url}`);

      console.log(`  Setting cover on Gumroad...`);
      await api(`/products/${p.id}/covers`, { url });
      console.log(`  ✅ Cover set!`);
    } catch (err) {
      console.log(`  ❌ ${err.message.slice(0, 120)}`);
    }
    console.log('');
  }

  console.log('=== ALL COVERS DONE ===\n');
}

main().catch(err => { console.error(`\nFATAL: ${err.message}`); process.exit(1); });
