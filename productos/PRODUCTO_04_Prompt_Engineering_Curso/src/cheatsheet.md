# Cheatsheet: Prompt Engineering para Desarrolladores

## Patrón RTCFC (Módulo 1)

```
<Rol>         → Identidad del LLM
<Tarea>       → Acción específica (obligatorio)
<Contexto>    → Información de fondo relevante
<Formato>     → Estructura esperada de respuesta
<Restricciones> → Límites, reglas, exclusiones
```

```python
prompt = f"<rol>{rol}</rol><tarea>{tarea}</tarea><contexto>{ctx}</contexto><formato>{fmt}</formato><restricciones>{res}</restricciones>"
```

## Parámetros de Inferencia (Módulo 1)

| Parámetro | Rango | Código | Tareas |
|-----------|-------|--------|--------|
| temperature | 0.0-2.0 | `temperature=0.2` | Tests: 0.0, Refactor: 0.1-0.2, Docs: 0.3-0.5, Brainstorm: 0.7-1.0 |
| top_p | 0.0-1.0 | `top_p=0.9` | Nucleus sampling: 0.9-0.95 para código |
| max_tokens | 1-N | `max_tokens=4096` | Limitar longitud de respuesta |
| frequency_penalty | -2.0-2.0 | `frequency_penalty=0.0` | 0.0-0.3 para evitar repetición |
| presence_penalty | -2.0-2.0 | `presence_penalty=0.0` | 0.0-0.3 para fomentar diversidad |

## Chain-of-Thought (Módulo 2)

### Zero-shot CoT
```
Piensa paso a paso.
Razona cuidadosamente antes de responder.
Desglosa el problema en subproblemas.
```

### Few-shot CoT
```
Ejemplo 1:
Pregunta: ...
Razonamiento: 1. ... 2. ... 3. ...
Código: ...

[Aquí tu pregunta real]
```

### Self-Consistency
```python
def self_consistency(prompt, n=5, temp=0.4):
    respuestas = [llm_call(prompt, temp) for _ in range(n)]
    return votacion_mayoritaria(respuestas)
```

## Few-Shot Learning (Módulo 3)

### Formatos de ejemplos
```
FORMATO CÓDIGO (recomendado):
Input: [3, 1, 2]
Output: [1, 2, 3]

FORMATO TABLA:
| Input | Output |
|-------|--------|
| [3,1] | [1,3]  |

FORMATO CONVERSACIÓN:
User: Ordena [3, 1, 2]
Assistant: [1, 2, 3]
```

### Dynamic Few-Shot Selection
```python
selector = DynamicFewShotSelector(ejemplos)
mejores = selector.seleccionar(consulta, k=3)
# Usa embeddings + cosine similarity
```

## System Prompts (Módulo 4)

### Plantillas clave

**Code Review:**
```
Eres un Code Review Specialist.
FASE 1: Escaneo rápido (syntax, secrets, style)
FASE 2: Análisis estático (complejidad, nesting)
FASE 3: Análisis semántico (edge cases, API design)
Output: ACCEPT | CHANGES_REQUESTED | REJECT
```

**Pair Programming:**
```
Eres mi pair programming partner (TDD).
1. Yo describo comportamiento
2. Tú escribes test que falla
3. Yo implemento
4. Refactorizamos juntos
```

**Arquitectura:**
```
Eres un Solutions Architect.
Output: diagrama (Mermaid) + ADRs + risk register + roadmap
```

### Restricciones programáticas
```python
CodingConstraints()
    .no_usar("numpy")
    .max_lineas(50)
    .estilo("PEP 8")
    .seguridad("alto")
```

## Técnicas Avanzadas (Módulo 5)

### Tree-of-Thought
```
1. Generar N enfoques paralelos
2. Evaluar cada uno contra criterios
3. Expandir el mejor
4. Repetir hasta profundidad deseada
```

### ReAct
```
Thought: Razonamiento
Action: herramienta(args)
Observation: resultado
... (repetir)
Thought: Conclusión
Answer: Respuesta final
```

### Constitutional AI
```
DEFINE CONSTITUTION:
Artículo 1: Seguridad (no SQLi, no XSS, no eval)
Artículo 2: Corrección (types, edge cases)
Artículo 3: Mantenibilidad (SRP, nombres)
Artículo 4: Rendimiento (complejidad, caching)
```

### Skeleton-of-Thought
```
Fase 1: Generar esqueleto (outline)
Fase 2: Expandir cada sección individualmente
Fase 3: Ensamblar resultado completo
```

## Producción (Módulo 6)

### Costos GPT-4o
| Tipo | Precio por 1K tokens |
|------|---------------------|
| Input | $0.0025 |
| Output | $0.0100 |

### Caché semántico
```python
cache = SemanticCache(threshold=0.92, ttl=1800)
cache.get(prompt)  # None o respuesta similar
cache.set(prompt, response)
```

### Fallback chain
```python
pipeline = PromptPipeline()
pipeline.add_fallback(prompt_fn, "gpt-4o")
pipeline.add_fallback(prompt_fn, "gpt-4o-mini")
pipeline.add_fallback(prompt_fn, "claude-3-haiku")
pipeline.execute(input_data)
```

## Dominios Especializados (Módulo 7)

| Dominio | Prompt Focus |
|---------|-------------|
| Frontend | Estados (loading/error/empty/success), accesibilidad, responsive |
| Backend | Capas (routes/services/repos), type hints, DDD |
| DevOps | Idempotencia, mínimo privilegio, observabilidad |
| Data Science | Reproducibilidad, feature store, experiment tracking |
| Mobile | Offline-first, gestures, deep linking, performance |

## Testing Prompts

```
NIVEL 1 - Unitarios: funciones aisladas, mocks para I/O
NIVEL 2 - Integración: flujo completo, DB real/test containers
NIVEL 3 - E2E: escenario de usuario completo
```

## Comparativa Rápida de Técnicas

| Técnica | Cuándo usarla | Temperatura |
|---------|--------------|:-----------:|
| Zero-shot directo | Tareas triviales | 0.0-0.2 |
| RTCFC | Tareas estructuradas | 0.1-0.3 |
| CoT | Razonamiento complejo | 0.2-0.4 |
| Few-shot CoT | Algoritmos nuevos | 0.3-0.5 |
| Self-consistency | Decisiones críticas | 0.3-0.5 |
| ToT | Arquitectura/ diseño | 0.5-0.7 |
| ReAct | Debugging con herramientas | 0.2-0.4 |
| Skeleton-of-Thought | Documentos/código grande | 0.2-0.3 |

## Errores Comunes

| Error | Solución |
|-------|----------|
| Prompt demasiado vago | Usar RTCFC |
| Temperatura muy alta para código | Bajar a 0.0-0.2 |
| Olvidar restricciones de seguridad | Usar Constitutional AI |
| No versionar prompts | Usar PromptRegistry |
| Ignorar costos de tokens | Usar TokenBudget + modelo mini |
| Cachear prompts literales (no semánticos) | Usar SemanticCache con embeddings |
