# De Cero a AI Agent — Guia Practica Paso a Paso

## Guia Completa para Construir Agentes de IA con Python

Una guia de 8 capitulos (+ apendices) que te lleva desde los fundamentos teoricos hasta el despliegue en produccion de agentes de IA, usando los frameworks mas populares del ecosistema Python.

## Contenido

| Archivo | Descripcion |
|---------|-------------|
| `00-introduccion.md` | Introduccion: que son los agentes de IA, por que ahora, para quien es |
| `01-fundamentos-agentes.md` | Fundamentos: percepcion, razonamiento, accion, tipos de agentes, function calling |
| `02-langchain-basico.md` | LangChain: LLM wrappers, prompts, chains, tools, AgentExecutor, proyecto Q&A |
| `03-langgraph.md` | LangGraph: grafos, nodos, edges, routing condicional, proyecto research agent |
| `04-crewai.md` | CrewAI: agentes, tareas, crews, procesos sequential/hierarchical, proyecto content crew |
| `05-autogen.md` | AutoGen: AssistantAgent, UserProxyAgent, GroupChat, proyecto dev team |
| `06-memoria-herramientas.md` | Memoria y herramientas: buffer, summary, vector store, tool creation, estado persistente |
| `07-produccion.md` | Produccion: retry, circuit breaker, logging, rate limiting, costos, Docker |
| `08-proyecto-final.md` | Proyecto final: customer support agent con multi-agente y human-in-the-loop |
| `apendice-frameworks.md` | Comparativa de frameworks (LangChain, LangGraph, CrewAI, AutoGen, Semantic Kernel) |
| `apendice-costos.md` | Calculadora de costos con pricing actualizado y escenarios mensuales |
| `cheatsheet.md` | Referencia rapida: snippets, tablas, checklist, errores comunes |

## Requisitos

- Python 3.11+
- Una API key de OpenAI (u otro proveedor LLM)
- Git (opcional)

## Instalacion

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install langchain langchain-openai langchain-community langgraph
pip install crewai pyautogen
pip install fastapi uvicorn python-dotenv diskcache structlog
pip install duckduckgo-search wikipedia-api requests beautifulsoup4
```

## Como usar esta guia

1. **Principiante**: Lee los capitulos en orden del 00 al 08
2. **Con experiencia**: Salta directamente al framework que te interese (cap 2-5)
3. **Para produccion**: Enfocate en el capitulo 7 y el proyecto final (cap 8)
4. **Referencia**: Usa el cheatsheet y los apendices para consulta rapida

Cada capitulo incluye:
- Explicacion teorica con diagramas ASCII
- Ejemplos de codigo listos para copiar y ejecutar
- Un proyecto completo al final
- Errores comunes y soluciones

## Estructura de aprendizaje

```
Capitulo 1:  Fundamentos  (teoria esencial)
     │
Capitulo 2:  LangChain    (primer agente funcional)
     │
     ├── Capitulo 3:  LangGraph  (control de flujo)
     ├── Capitulo 4:  CrewAI     (equipos multi-agente)
     ├── Capitulo 5:  AutoGen    (agentes conversacionales)
     │
Capitulo 6:  Memoria y herramientas  (estado persistente)
     │
Capitulo 7:  Produccion  (despliegue robusto)
     │
Capitulo 8:  Proyecto Final  (todo integrado)
```

## Proyectos incluidos

1. **Agente Q&A** (Capitulo 2): Responde preguntas con busqueda web y APIs
2. **Research Agent** (Capitulo 3): Investiga temas y refina con autocrítica
3. **Content Crew** (Capitulo 4): Equipo writer + editor + fact-checker
4. **Dev Team** (Capitulo 5): PM + developer + reviewer construyendo software
5. **Customer Support** (Capitulo 8): Sistema completo con escalamiento humano

## Recursos adicionales

- [LangChain Documentation](https://python.langchain.com/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [CrewAI Documentation](https://docs.crewai.com/)
- [AutoGen Documentation](https://microsoft.github.io/autogen/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

## Licencia

Uso educativo y comercial permitido.
