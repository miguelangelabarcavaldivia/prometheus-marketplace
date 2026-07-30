import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

async function uploadCover(buf, name) {
  const presign = await api('POST', '/files/presign', { filename: name, file_size: buf.length });
  const up = await fetch(presign.presigned_url, { method: 'PUT', body: buf });
  if (!up.ok) throw new Error(`Upload failed: ${up.status}`);
  const complete = await api('POST', '/files/complete', { key: presign.key, part_number: 1, part_signed_url: presign.presigned_url });
  return complete.url;
}

const products = [
  {
    name: 'Prompt Engineering Avanzado — Curso para Desarrolladores',
    price: 2900,
    description: `🚀 Prompt Engineering Avanzado — Curso completo para desarrolladores

✅ 8 módulos (120+ páginas) enfocados 100% en programación
✅ Chain-of-thought, few-shot, tree-of-thought, system prompts
✅ 50+ ejemplos de código con ejercicios prácticos

🔥 ¿Por qué comprar esto?
- No es un curso genérico — diseñado para devs
- Cubre producción, no solo teoría
- Técnicas que ahorran $500+/mes en APIs de IA

📦 Contenido:
- 8 módulos en PDF
- Ejercicios prácticos con soluciones
- Templates de system prompts reutilizables

🎁 Bonos:
- Cheatsheet de técnicas de prompting
- Calculadora de costos de LLMs
- Acceso a comunidad de alumni

📥 Descarga inmediata.`,
    tags: ['course', 'prompt-engineering', 'AI', 'tutorial', 'developers'],
    customizable_price: true,
    suggested_price: 2900,
  },
  {
    name: 'AI Agent Pipeline — Multi-Agent Orchestration System',
    price: 5900,
    description: `🚀 AI Agent Pipeline — Sistema de orquestación multi-agente con 3 templates

✅ Customer Support Agent + Research Agent + Code Review Agent
✅ Python + LangGraph + Multi-provider (OpenAI, Anthropic, Gemini)
✅ Memoria conversacional, human-in-the-loop, logging estructurado

🔥 ¿Por qué comprar esto?
- 3 agentes listos para producción
- Arquitectura extensible (agrega tus propios agentes)
- Pipeline completo: input → procesamiento → output

📦 Contenido:
- Código fuente de los 3 agentes
- Templates para crear nuevos agentes
- API REST para integración externa

🎁 Bonos:
- Dashboard de monitoreo con Streamlit
- Scripts de testing para cada agente
- Guía de deployment a producción

📥 Descarga inmediata.`,
    tags: ['AI-agents', 'langgraph', 'orchestration', 'multi-agent', 'pipeline'],
    customizable_price: true,
    suggested_price: 5900,
  },
  {
    name: 'De Cero a AI Agent — Guía Práctica Paso a Paso',
    price: 2400,
    description: `🚀 De Cero a AI Agent — Construye tu primer AI Agent desde cero

✅ 8 capítulos (80+ páginas) con 3 proyectos completos
✅ LangChain, LangGraph, CrewAI, AutoGen — todos cubiertos
✅ Funciona con OpenAI, Anthropic, Gemini y Ollama

🔥 ¿Por qué comprar esto?
- Empieza desde 0 y termina con un agente en producción
- Proyectos progresivos: básico → intermedio → avanzado
- Diagramas de arquitectura incluidos

📦 Contenido:
- 8 capítulos en PDF
- 3 proyectos completos con código
- Comparativa de frameworks

🎁 Bonos:
- Template de AI Agent básico (código listo)
- Cheatsheet de herramientas de agentes
- Calculadora de costos por agente

📥 Descarga inmediata.`,
    tags: ['AI-agents', 'tutorial', 'guide', 'beginners', 'python'],
    customizable_price: true,
    suggested_price: 2400,
  },
  {
    name: 'CLI AI Commit + Code Review Assistant',
    price: 1400,
    description: `🚀 CLI AI Commit Tool — Genera commits y code reviews con IA

✅ aicommit generate | review | suggest | changelog
✅ Multi-modelo: OpenAI, Anthropic, Gemini (configurable)
✅ Conventional commits, emoji, o formato personalizado

🔥 ¿Por qué comprar esto?
- Commits profesionales en segundos
- Code reviews automáticos antes de cada push
- Ahorra 5h/semana en tareas de git

📦 Contenido:
- CLI tool completa (Node.js/TypeScript)
- Documentación y ejemplos
- Integración con Husky y GitHub Actions

🎁 Bonos:
- Husky hook pre-commit (auto-instalación)
- GitHub Action para PR reviews
- Templates de commit personalizables

📥 Descarga inmediata.`,
    tags: ['CLI', 'git', 'AI', 'commit', 'code-review'],
    customizable_price: true,
    suggested_price: 1400,
  },
];

async function main() {
  console.log('\n=== PUBLISHING PRODUCTS 4-7 TO GUMROAD ===\n');

  const startNum = 4;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const num = startNum + i;
    console.log(`[${num}/7] Creating "${p.name}"...`);
    try {
      const res = await api('POST', '/products', {
        name: p.name,
        price: p.price,
        description: p.description,
        tags: p.tags,
        customizable_price: 'true',
        suggested_price: p.suggested_price,
      });
      const id = res.product?.id || res.id;
      console.log(`  ✅ Created! ID: ${id}`);
      console.log(`  URL: https://gumroad.com/l/${res.product?.custom_permalink || id}`);

      // Enable product
      await api('PUT', `/products/${id}/enable`);
      console.log(`  ✅ Enabled`);
    } catch (err) {
      const msg = err.message;
      if (msg.includes('rate limit') || msg.includes('10 products')) {
        console.log(`  ⏸️  Rate limit reached. Stopping.`);
        break;
      }
      console.log(`  ❌ ${err.message.slice(0, 120)}`);
    }
    console.log('');
  }

  console.log('=== PUBLISH COMPLETE ===\n');
}

main().catch(err => { console.error(`\nFATAL: ${err.message}`); process.exit(1); });
