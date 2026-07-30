# Prompt Engineering Avanzado — Curso para Desarrolladores

**Producto P4 | $29 | 8 Módulos | 22 Horas**

## ¿Qué es este curso?

Un curso intensivo de **ingeniería de prompts** diseñado exclusivamente para **desarrolladores de software**. No hay teoría genérica — cada módulo está construido alrededor de ejemplos de código, patrones reutilizables y ejercicios prácticos en Python y TypeScript.

Aprenderás a tratar los LLMs como **ingenieros de software** en lugar de cajas mágicas: cómo estructurar prompts, cómo optimizar costos, cómo evaluar calidad, y cómo construir pipelines de producción confiables.

## Contenido

| Módulo | Archivo | Temas |
|--------|---------|-------|
| 0 | `00-intro.md` | Introducción, prerrequisitos, setup |
| 1 | `01-fundamentos.md` | Anatomía de prompts, RTCFC, temperatura, tokenización |
| 2 | `02-chain-of-thought.md` | Zero-shot/few-shot CoT, self-consistency, debugging |
| 3 | `03-few-shot.md` | Few-shot learning, selección dinámica, formatos |
| 4 | `04-system-prompts.md` | Personas, restricciones, multi-agente, 5 templates |
| 5 | `05-advanced-techniques.md` | ToT, ReAct, Constitutional AI, Skeleton-of-Thought |
| 6 | `06-production.md` | Versioning, A/B testing, costos, caching, fallbacks |
| 7 | `07-specialized.md` | Frontend, backend, DevOps, data science, mobile |
| 8 | `08-project.md` | Asistente de código multi-prompt, orquestador, evaluación |
| — | `cheatsheet.md` | Referencia rápida de técnicas y parámetros |
| — | `cost-calculator.md` | Tabla de costos y calculadora ROI |
| — | `exercises/` | Soluciones de todos los ejercicios |

## Cómo usar

```bash
# Clona o descarga el curso
# Cada archivo .md es auto-contenido
# Los ejemplos de código son independientes y ejecutables

# Requisito: Python 3.11+, pip install openai tiktoken
```

### Para instructores

Este curso está diseñado para ser impartido en **sesiones de 2-4 horas** por módulo. Cada módulo incluye:

- **Contenido teórico** con referencias a documentación oficial
- **Ejemplos de código** listos para ejecutar
- **Ejercicios** con soluciones en `exercises/`
- **Preguntas de discusión** para sesiones en vivo

### Para auto-estudio

1. Sigue los módulos en orden
2. Ejecuta cada ejemplo de código
3. Intenta los ejercicios **antes** de ver las soluciones
4. Adapta los patrones a tu stack tecnológico
5. Usa la cheatsheet como referencia diaria

## Lo que aprenderás

- **Prompting estructurado**: El patrón RTCFC y variantes
- **Razonamiento**: Chain-of-Thought, self-consistency, Tree-of-Thought
- **Producción**: Versionado, A/B testing, monitoreo, costos
- **Especialización**: Prompts para backend, frontend, DevOps, data, mobile
- **Pipeline multi-prompt**: Orquestación de agentes especializados
- **Evaluación**: Métricas de calidad, seguridad, y rendimiento

## Stack técnico

- **Lenguaje principal**: Python 3.11+
- **Librerías**: openai, tiktoken, pydantic, numpy, scikit-learn
- **APIs**: OpenAI, Anthropic, Google (ejemplos adaptables)
- **Alternativas open-source**: Ollama + modelos Llama/Mistral (compatible)

## Licencia

Uso educativo. Los ejemplos de código son de dominio público. El contenido del curso está protegido.

---

**¡Comienza con el Módulo 0:** `00-intro.md`**
