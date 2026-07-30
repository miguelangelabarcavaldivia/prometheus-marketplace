#!/usr/bin/env node
/**
 * Create remaining Gumroad bundles after rate limit reset
 * Run this at midnight UTC after the 10 product/day limit resets
 */

import { URLSearchParams } from 'url';

const ACCESS_TOKEN = process.env.GUMROAD_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌ GUMROAD_ACCESS_TOKEN not set');
  process.exit(1);
}

const bundles = [
  {
    name: 'RAG + Curso Bundle — RAG + Prompt Avanzado',
    price: 5900,
    description: `🚀 RAG + Curso Bundle — Domina el procesamiento de lenguaje

✅ RAG System Template ($39) — QA sobre documentos con LangChain
✅ Prompt Engineering Avanzado ($29) — Curso para desarrolladores

🔥 Ahorra $9 vs comprar por separado ($68 → $59)

✅ Contenido incluido:
- Sistema RAG completo con LangChain
- 8 módulos de curso con 120+ páginas
- Cheatsheet de técnicas de prompting para RAG
- Calculadora de costos de LLMs

📥 Descarga inmediata.`,
    tags: ['bundle', 'rag', 'prompts', 'course']
  },
  {
    name: 'Prompt Pro Bundle — Playbook + Curso Avanzado',
    price: 3900,
    description: `🚀 Prompt Pro Bundle — Domina el prompt engineering

✅ Prompt Engineering Playbook ($19) — 200+ prompts para devs
✅ Curso de Prompt Engineering Avanzado ($29) — 8 módulos, 120+ páginas

🔥 Ahorra $9 vs comprar por separado ($48 → $39)

📦 Incluye:
- 200+ prompts organizados por categoría
- 8 módulos de curso con ejercicios prácticos
- Cheatsheet de técnicas de prompting
- Calculadora de costos de LLMs

📥 Descarga inmediata.`,
    tags: ['bundle', 'prompts', 'prompt-engineering', 'course']
  }
];

async function createBundle(bundle) {
  const params = new URLSearchParams({
    access_token: ACCESS_TOKEN,
    name: bundle.name,
    price: String(bundle.price),
    description: bundle.description,
    customizable_price: 'true',
    suggested_price: String(bundle.price),
    native_type: 'bundle',
    ...bundle.tags.reduce((acc, tag, i) => ({ ...acc, [`tags[]`]: tag }), {})
  });

  const response = await fetch('https://api.gumroad.com/v2/products', {
    method: 'POST',
    body: params
  });

  const result = await response.json();

  if (result.success) {
    console.log(`✅ Created bundle: ${bundle.name} (ID: ${result.product.id})`);
    
    // Enable the bundle
    const enableParams = new URLSearchParams({ access_token: ACCESS_TOKEN });
    const enableRes = await fetch(
      `https://api.gumroad.com/v2/products/${result.product.id}/enable`,
      { method: 'PUT', body: enableParams }
    );
    const enableResult = await enableRes.json();
    if (enableResult.success) {
      console.log(`   ✅ Enabled bundle`);
    } else {
      console.log(`   ⚠️ Enable failed: ${enableResult.message}`);
    }
  } else {
    console.error(`❌ Failed to create ${bundle.name}: ${result.message}`);
  }

  return result;
}

console.log('⏰ Creating remaining bundles after rate limit reset...\n');

for (const bundle of bundles) {
  await createBundle(bundle);
}

console.log('\n✅ All bundles created!');
