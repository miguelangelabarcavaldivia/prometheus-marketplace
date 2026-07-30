# Prompt Engineering Avanzado — Curso para Desarrolladores

## Bienvenido

Este curso está diseñado para **desarrolladores experimentados** que quieren dominar el arte de la ingeniería de _prompts_ para extraer el máximo potencial de los LLMs en su trabajo diario. No es un curso teórico — cada módulo está saturado de ejemplos de código, ejercicios prácticos y patrones que puedes aplicar inmediatamente.

## ¿Para quién es este curso?

- **Desarrolladores backend/frontend** que quieren integrar LLMs en sus pipelines
- **Arquitectos de software** explorando soluciones basadas en IA generativa
- **Tech leads** evaluando cómo la ingeniería de _prompts_ puede mejorar la productividad del equipo
- **Científicos de datos** que usan LLMs para generación y análisis de código
- **Cualquier developer** que ya haya usado ChatGPT/Claude y quiera ir más allá del _prompting_ casual

## Prerrequisitos

- Experiencia sólida en al menos un lenguaje de programación (Python y/o TypeScript recomendados)
- Familiaridad básica con APIs REST y JSON
- Haber usado al menos una vez un asistente LLM (ChatGPT, Claude, Copilot, etc.)
- Comprensión de conceptos fundamentales de ML (no es necesario ser experto)
- Capacidad de leer y escribir código en Python (los ejemplos principales están en Python 3.11+)

## Lo que aprenderás

| Módulo | Tema | Horas estimadas |
|--------|------|----------------|
| 1 | Fundamentos de Prompt Engineering | 2h |
| 2 | Chain-of-Thought & Razonamiento | 3h |
| 3 | Few-Shot Learning para Código | 2.5h |
| 4 | System Prompts & Personas | 2h |
| 5 | Técnicas Avanzadas | 3.5h |
| 6 | Prompting para Producción | 2h |
| 7 | Dominios Especializados | 3h |
| 8 | Proyecto Final | 4h |
| **Total** | | **22h** |

## Cómo usar este curso

1. **Lee cada módulo en orden** — los conceptos se construyen secuencialmente
2. **Ejecuta los ejemplos de código** — no los leas solamente, córrelos y modifícalos
3. **Completa los ejercicios** — las soluciones están en `exercises/`, pero intenta resolverlos primero
4. **Usa tu LLM favorito** — los ejemplos funcionan con OpenAI, Anthropic, Google, o modelos open-source vía Ollama
5. **Consulta la cheatsheet** — `cheatsheet.md` es tu referencia rápida para todos los patrones

## Estructura del repositorio

```
src/
├── 00-intro.md
├── 01-fundamentos.md
├── 02-chain-of-thought.md
├── 03-few-shot.md
├── 04-system-prompts.md
├── 05-advanced-techniques.md
├── 06-production.md
├── 07-specialized.md
├── 08-project.md
├── cheatsheet.md
├── cost-calculator.md
├── README.md
└── exercises/
    ├── module-1-solutions.md
    ├── module-2-solutions.md
    ├── module-3-solutions.md
    ├── module-4-solutions.md
    ├── module-5-solutions.md
    ├── module-6-solutions.md
    ├── module-7-solutions.md
    └── module-8-solutions.md
```

## Convenciones en este curso

````
Los bloques de código con este estilo son ejemplos listos para ejecutar.
````

> Los bloques con esta notación son tips, advertencias o información importante.

```text
Los _placeholders_ se muestran en cursiva: `/api/v1/_resource_`
```

## Configuración del entorno

Necesitarás una API key de al menos uno de estos proveedores:

```bash
# OpenAI
export OPENAI_API_KEY="sk-..."

# Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."

# O usando Ollama (local, gratis)
ollama pull llama3
```

Instala la dependencia principal:

```bash
pip install openai  # o anthropic, o httpx para llamadas directas
```

Cada módulo incluye fragmentos independientes que puedes copiar y ejecutar.

---

**¡Comencemos!** Dirígete al Módulo 1: Fundamentos de Prompt Engineering.
