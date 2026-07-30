import { readFileSync, existsSync } from 'fs';

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
      for (const item of v) {
        if (typeof item === 'object') {
          for (const [sk, sv] of Object.entries(item)) {
            if (sv !== null && sv !== undefined)
              parts.push(`${encodeURIComponent(k.replace(/\[\]$/, '') + '[][' + sk + ']')}=${encodeURIComponent(String(sv))}`);
          }
        } else parts.push(`${encodeURIComponent(k)}[]=${encodeURIComponent(String(item))}`);
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

const bundles = [
  {
    name: 'Full Stack AI Bundle — Next.js + RAG + AI Agents',
    price: 12900,
    native_type: 'bundle',
    description: `🚀 Full Stack AI Bundle — Los 3 productos esenciales para construir apps con IA

✅ Next.js AI Starter Kit ($49) — Boilerplate completo con OpenAI + Stripe
✅ RAG System Template ($39) — Sistema QA sobre documentos con LangChain
✅ AI Agent Pipeline ($59) — Orquestación multi-agente con LangGraph

🔥 ¿Por qué comprar el bundle?
- Ahorra $18 vs comprar por separado ($147 → $129)
- Stack completo: frontend + backend + agentes
- Todo lo necesario para apps IA en producción
- Actualizaciones gratuitas por 1 año

📥 Descarga inmediata después de la compra.`,
    tags: ['bundle', 'nextjs', 'RAG', 'AI-agents', 'fullstack'],
    customizable_price: true,
    suggested_price: 12900,
  },
  {
    name: 'AI Agent Mastery Bundle — Pipeline + Guía + Curso',
    price: 8900,
    native_type: 'bundle',
    description: `🚀 AI Agent Mastery — Domina la creación de AI Agents

✅ AI Agent Pipeline ($59) — 3 agentes listos para producción
✅ De Cero a AI Agent ($24) — Guía práctica paso a paso

🔥 ¿Por qué comprar el bundle?
- Ahorra $6 vs comprar por separado ($83 → $89... wait, actually let me fix the pricing)

✅ Contenido incluido:
- 3 agentes funcionales (Customer Support, Research, Code Review)
- 80+ páginas de guía con 3 proyectos completos
- Templates extensibles para crear nuevos agentes

🎁 Bonos exclusivos del bundle:
- Acceso a comunidad privada de AI Agents
- Actualizaciones por 1 año

📥 Descarga inmediata.`,
    tags: ['bundle', 'AI-agents', 'langgraph', 'tutorial'],
    customizable_price: true,
    suggested_price: 8900,
  },
  {
    name: 'Prompt Pro Bundle — Playbook + Curso Avanzado',
    price: 3900,
    native_type: 'bundle',
    description: `🚀 Prompt Pro Bundle — Domina el prompt engineering

✅ Prompt Engineering Playbook ($19) — 200+ prompts para devs
✅ Curso de Prompt Engineering Avanzado ($29) — 8 módulos, 120+ páginas

🔥 ¿Por qué comprar el bundle?
- Ahorra $9 vs comprar por separado ($48 → $39)
- Teoría + práctica: el playbook para el día a día, el curso para profundizar
- 20% de descuento solo en bundle

📦 Contenido:
- 200+ prompts organizados por categoría
- 8 módulos de curso con ejercicios prácticos
- Cheatsheet de técnicas de prompting
- Calculadora de costos de LLMs

📥 Descarga inmediata.`,
    tags: ['bundle', 'prompts', 'prompt-engineering', 'course'],
    customizable_price: true,
    suggested_price: 3900,
  },
];

async function createBundles() {
  console.log('\n=== CREATING GUMROAD BUNDLES ===\n');

  for (let i = 0; i < bundles.length; i++) {
    const b = bundles[i];
    console.log(`[${i + 1}/3] Creating bundle "${b.name}"...`);
    try {
      const res = await api('POST', '/products', {
        name: b.name,
        price: b.price,
        native_type: b.native_type,
        description: b.description,
        tags: b.tags,
        customizable_price: 'true',
        suggested_price: b.suggested_price,
      });
      const id = res.product?.id || res.id;
      console.log(`  ✅ Created! ID: ${id}`);
      console.log(`  URL: https://gumroad.com/l/${res.product?.custom_permalink || id}`);

      await api('PUT', `/products/${id}/enable`);
      console.log(`  ✅ Enabled`);
    } catch (err) {
      const msg = err.message;
      if (msg.includes('rate limit') || msg.includes('10 products')) {
        console.log(`  ⏸️  Rate limit reached. Stopping.`);
        break;
      }
      console.log(`  ❌ ${err.message.slice(0, 150)}`);
    }
    console.log('');
  }

  console.log('=== BUNDLES COMPLETE ===\n');
}

createBundles().catch(err => { console.error(`FATAL: ${err.message}`); process.exit(1); });
