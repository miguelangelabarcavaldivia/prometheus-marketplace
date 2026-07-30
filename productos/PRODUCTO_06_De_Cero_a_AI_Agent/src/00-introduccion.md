# 00 — Introducción

## ¿Qué son los Agentes de IA?

Un **agente de IA** es un sistema autónomo que percibe su entorno, razona sobre la información disponible y ejecuta acciones para lograr un objetivo específico. A diferencia de un LLM standalone que simplemente genera texto, un agente puede:

- **Observar** su entorno (bases de datos, APIs, archivos, web)
- **Razonar** usando un modelo de lenguaje como cerebro central
- **Actuar** llamando herramientas, ejecutando código o interactuando con sistemas externos
- **Iterar** en un ciclo continuo hasta completar su tarea

```
  ┌──────────────────────────────────────┐
  │           ENTORNO                    │
  │  (APIs, DB, Web, Archivos, Usuario)  │
  └────┬──────────────┬─────────────┬────┘
       │              │             │
       ▼              ▼             ▼
  ┌─────────┐  ┌──────────┐  ┌──────────┐
  │ Percibir│  │  Razonar │  │  Actuar  │
  │ (Input) │  │  (LLM)   │  │ (Tools)  │
  └─────────┘  └──────────┘  └──────────┘
       ▲                         │
       └─────────────────────────┘
           Ciclo de Retroalimentación
```

## ¿Por qué ahora?

Vivimos un momento único donde confluyen tres factores:

1. **LLMs con capacidad de razonamiento** — Modelos como GPT-4, Claude 3.5 y Llama 3 pueden descomponer problemas complejos, planificar y reflexionar sobre sus propios outputs.
2. **Frameworks maduros** — LangChain, CrewAI, AutoGen y LangGraph han evolucionado de librerías experimentales a herramientas de producción con ecosistemas robustos.
3. **Costo decreciente** — El precio por token ha caído ~10x en los últimos 18 meses, haciendo viable la ejecución de agentes multi-paso en producción.

En 2025, los agentes de IA han pasado de ser una curiosidad académica a convertirse en la arquitectura dominante para aplicaciones LLM. Empresas como Salesforce, Microsoft y Google ya integran agentes en sus productos.

## ¿Para quién es esta guía?

Esto es para **desarrolladores con experiencia en Python** que quieren:

- Entender cómo funcionan los agentes de IA por dentro
- Construir agentes simples y multi-agente con los frameworks más populares
- Llevar agentes a producción con diseño robusto y monitoreo
- Elegir el framework correcto para cada tipo de problema

No necesitas experiencia previa con LLMs o agentes. Sí necesitas saber Python (asincronía, tipos, POO básica) y tener nociones de APIs REST.

## Estructura de la guía

```
Capítulo 1 — Fundamentos de Agentes IA
  Teoría esencial: percepción, razonamiento, acción, tipos de agentes

Capítulo 2 — LangChain Básico
  El framework fundacional: LLMs, prompts, chains, tools, AgentExecutor

Capítulo 3 — LangGraph
  Orquestación avanzada con grafos: nodos, edges, routing condicional

Capítulo 4 — CrewAI
  Sistemas multi-agente: roles, tareas, colaboración entre agentes

Capítulo 5 — AutoGen
  Agentes conversacionales: diálogo multi-agente, ejecución de código

Capítulo 6 — Memoria y Herramientas
  Memoria persistente, tools personalizadas, estado de agente

Capítulo 7 — Producción
  Errores, monitoreo, rate limiting, costos, despliegue FastAPI + Docker

Capítulo 8 — Proyecto Final
  Customer Support Agent completo: multi-agente con supervisión humana

Apéndices — Comparativa de frameworks y calculadora de costos
```

## Convenciones en esta guía

- Los ejemplos usan **Python 3.11+** con tipado estático
- Las claves de API se leen de variables de entorno (`os.getenv("OPENAI_API_KEY")`)
- Los fragmentos de código están listos para copiar y ejecutar
- Los diagramas ASCII ilustran la arquitectura de cada sistema

## Requisitos técnicos

```bash
python >= 3.11
pip install langchain langchain-openai langgraph crewai pyautogen
pip install fastapi uvicorn docker python-dotenv
pip install rich httpx pandas tabulate
```

Empecemos.
