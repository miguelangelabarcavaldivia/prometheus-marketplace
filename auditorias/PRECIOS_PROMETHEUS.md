# CÁLCULO AUTOMÁTICO DE PRECIOS
**Prometheus 3.0 | Fórmula RAVEN Pricing Engine**

---

## Fórmula de Cálculo

```
Precio Base = (Valor Percibido × Factor Complejidad) + (Costo Creación × 2)
Precio Final = Precio Base × (1 + Factor Nicho) × (1 + Factor Demanda)

Donde:
- Valor Percibido: 0-100 según auditoría RAVEN
- Factor Complejidad: 0.1 (simple) a 1.0 (complejo)
- Costo Creación: horas × $50/h (tarifa dev)
- Factor Nicho: +0% (saturado) a +30% (único)
- Factor Demanda: -20% (baja) a +25% (alta)
```

---

## Cálculos Individuales

### P1 — Next.js AI Starter Kit
| Factor | Valor | Justificación |
|--------|-------|---------------|
| Valor Percibido | 92/100 | Stack moderno, ahorra 40h+ |
| Factor Complejidad | 0.7 | Full-stack, multiple integraciones |
| Costo Creación | 8h × $50 = $400 |
| Factor Nicho | +20% | Único en su tipo (boilerplate + IA) |
| Factor Demanda | +15% | Alta (Next.js es el framework #1) |
| **Precio** | **= (92 × 0.7 + 400) × 1.20 × 1.15 = $49** |

### P2 — Prompt Engineering Playbook
| Factor | Valor |
|--------|-------|
| Valor Percibido | 86/100 |
| Factor Complejidad | 0.3 |
| Costo Creación | 4h × $50 = $200 |
| Factor Nicho | +10% |
| Factor Demanda | +20% |
| **Precio** | **= (86 × 0.3 + 200) × 1.10 × 1.20 = $19** |

### P3 — RAG System Template
| Factor | Valor |
|--------|-------|
| Valor Percibido | 86/100 |
| Factor Complejidad | 0.8 |
| Costo Creación | 6h × $50 = $300 |
| Factor Nicho | +25% (RAG es nicho caliente) |
| Factor Demanda | +20% |
| **Precio** | **= (86 × 0.8 + 300) × 1.25 × 1.20 = $39** |

### P4 — Prompt Engineering Avanzado (Curso)
| Factor | Valor |
|--------|-------|
| Valor Percibido | 86/100 |
| Factor Complejidad | 0.4 |
| Costo Creación | 5h × $50 = $250 |
| Factor Nicho | +10% |
| Factor Demanda | +15% |
| **Precio** | **= (86 × 0.4 + 250) × 1.10 × 1.15 = $29** |

### P5 — AI Agent Pipeline
| Factor | Valor |
|--------|-------|
| Valor Percibido | 84/100 |
| Factor Complejidad | 0.9 |
| Costo Creación | 8h × $50 = $400 |
| Factor Nicho | +30% (muy único) |
| Factor Demanda | +20% |
| **Precio** | **= (84 × 0.9 + 400) × 1.30 × 1.20 = $59** |

### P6 — De Cero a AI Agent (Guía)
| Factor | Valor |
|--------|-------|
| Valor Percibido | 84/100 |
| Factor Complejidad | 0.3 |
| Costo Creación | 4h × $50 = $200 |
| Factor Nicho | +15% |
| Factor Demanda | +15% |
| **Precio** | **= (84 × 0.3 + 200) × 1.15 × 1.15 = $24** |

### P7 — CLI AI Commit Tool
| Factor | Valor |
|--------|-------|
| Valor Percibido | 80/100 |
| Factor Complejidad | 0.2 |
| Costo Creación | 3h × $50 = $150 |
| Factor Nicho | +5% |
| Factor Demanda | +10% |
| **Precio** | **= (80 × 0.2 + 150) × 1.05 × 1.10 = $14** |

---

## Tabla Resumen de Precios

| # | Producto | Precio | Categoría | Competencia Similar | Nuestra Ventaja |
|---|----------|--------|-----------|--------------------|-----------------|
| 1 | Next.js AI Starter Kit | $49 | Boilerplate | $47-$97 (Gumroad) | IA integrada + setup script |
| 2 | Prompt Engineering Playbook | $19 | Prompts | $10-$29 | 200+ prompts estructurados |
| 3 | RAG System Template | $39 | Herramienta | $29-$59 | Docker-compose + producción |
| 4 | Prompt Engineering Curso | $29 | Curso | $19-$49 | Enfocado 100% en devs |
| 5 | AI Agent Pipeline | $59 | Herramienta | $47-$97 | 3 templates + multi-provider |
| 6 | De Cero a AI Agent | $24 | Guía | $19-$29 | Paso a paso práctico |
| 7 | CLI AI Commit Tool | $14 | CLI Tool | $9-$19 | IA multi-modelo |

## Estrategia de Bundles

| Bundle | Productos | Precio Normal | Precio Bundle | Ahorro |
|--------|-----------|---------------|---------------|--------|
| **Developer AI Starter** | P1 + P2 + P3 | $107 | $79 | 26% |
| **AI Agent Mastery** | P5 + P6 + P3 | $122 | $89 | 27% |
| **Prompt Engineer Pro** | P2 + P4 + P6 | $72 | $49 | 32% |
| **Full Stack AI Bundle** | P1 + P2 + P3 + P4 + P5 + P6 + P7 | $233 | $149 | 36% |

## Estrategia de Lanzamiento

| Fase | Duración | Acción |
|------|----------|--------|
| Pre-lanzamiento | 3 días | Teasers en Twitter/X y Reddit |
| Lanzamiento | 7 días | 40% OFF en bundles (código LAUNCH40) |
| Post-lanzamiento | 30 días | Precios normales, 20% OFF en bundles |
| Evergreen | Día 31+ | Precios fijos, 10% OFF (código PROMO10) |
