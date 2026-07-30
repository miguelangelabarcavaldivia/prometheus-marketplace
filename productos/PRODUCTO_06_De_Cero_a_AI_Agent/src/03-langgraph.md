# Capítulo 3 — LangGraph para Orquestación de Agentes

## 3.1 ¿Por qué LangGraph?

LangChain's AgentExecutor es un loop genérico fijo. LangGraph te permite **definir el flujo exacto** de tu agente como un grafo computacional. Esto te da:

- Control granular sobre cada paso
- Ciclos y loops arbitrarios (no solo el loop lineal de ReAct)
- Routing condicional (diferentes caminos según el estado)
- Estado compartido entre nodos
- Flujos humano-en-el-loop (pausar para aprobación)

```
AgentExecutor:        LangGraph:
[Inicio]              [Inicio]
   │                     │
   ▼                     ▼
 Loop ─→ Tool      ┌─────────┐  ┌──────────┐
   │               │ Decidir │→│ Herramienta│
   ▼               └────┬────┘  └─────┬────┘
[Fin]                    │            │
                    ┌────┴────┐       │
                    │ Evaluar │←──────┘
                    └────┬────┘
                    ┌────┴────┐
                    │  FIN    │
                    └─────────┘
```

## 3.2 Conceptos Fundamentales

### State (Estado)

El estado es el corazón de LangGraph. Se pasa entre nodos y se actualiza en cada paso.

```python
from typing import TypedDict, Annotated, Sequence, Literal
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

# El estado es un TypedDict que define la estructura de datos
class EstadoAgente(TypedDict):
    messages: Annotated[list, add_messages]  # append automático
    next_step: str
    tools_output: list[str]
    final_answer: str | None
```

### Nodes (Nodos)

Cada nodo es una función que recibe el estado y devuelve actualizaciones.

```python
def nodo_llm(estado: EstadoAgente) -> dict:
    """Procesa mensajes con el LLM."""
    messages = estado["messages"]
    respuesta = llm.invoke(messages)
    return {"messages": [respuesta]}

def nodo_herramientas(estado: EstadoAgente) -> dict:
    """Ejecuta herramientas solicitadas por el LLM."""
    last_message = estado["messages"][-1]
    resultados = []
    
    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        resultado = herramientas[tool_name].invoke(tool_args)
        resultados.append(resultado)
    
    return {"messages": resultados, "tools_output": resultados}
```

### Edges (Aristas)

Conectan nodos, definiendo el flujo del grafo.

```python
# Arista normal: siempre va al siguiente nodo
graph.add_edge("llm", "herramientas")

# Arista condicional: elige el camino según el estado
graph.add_conditional_edges(
    "herramientas",
    router,  # función que decide el siguiente nodo
    {
        "continuar": "llm",
        "finalizar": END,
    }
)
```

### Grafo Completo Mínimo

```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

# 1. Crear el grafo
builder = StateGraph(EstadoAgente)

# 2. Agregar nodos
builder.add_node("llm", nodo_llm)
builder.add_node("herramientas", nodo_herramientas)

# 3. Definir entrada
builder.set_entry_point("llm")

# 4. Aristas fijas
builder.add_edge("llm", "herramientas")

# 5. Arista condicional
def debe_continuar(estado: EstadoAgente) -> Literal["continuar", "finalizar"]:
    last_message = estado["messages"][-1]
    if last_message.tool_calls:
        return "continuar"
    return "finalizar"

builder.add_conditional_edges(
    "herramientas",
    debe_continuar,
    {"continuar": "llm", "finalizar": END}
)

# 6. Compilar (con checkpointer para estado persistente)
checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer)
```

Visualización:

```
                    ┌──────────┐
                    │  INICIO  │
                    └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
                    │   LLM    │
                    └────┬─────┘
                         │
                         ▼
                    ┌────────────┐
                    │Herramientas│
                    └────┬───────┘
                         │
                    ┌────┴────┐
                    │ ¿Tool?  │
               ┌────┤         ├────┐
               │Sí  └─────────┘  No│
               ▼                   ▼
          ┌──────────┐      ┌──────────┐
          │ Continuar│      │   FIN    │
          └────┬─────┘      └──────────┘
               │
               └────→ LLM
```

## 3.3 Routing Condicional Avanzado

Puedes tener múltiples caminos según el tipo de herramienta:

```python
def router_complejo(estado: EstadoAgente) -> Literal["web", "calculo", "archivo", "final"]:
    last = estado["messages"][-1]
    
    if not last.tool_calls:
        return "final"
    
    tool_name = last.tool_calls[0]["name"]
    
    if tool_name in ("buscar_web", "wikipedia"):
        return "web"
    elif tool_name in ("calcular", "analizar_datos"):
        return "calculo"
    elif tool_name in ("leer_archivo", "escribir_archivo"):
        return "archivo"
    
    return "final"


builder.add_conditional_edges(
    "llm",
    router_complejo,
    {
        "web": "nodo_web",
        "calculo": "nodo_calculo",
        "archivo": "nodo_archivo",
        "final": END,
    }
)
```

## 3.4 State Persistente con Checkpointers

```python
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.checkpoint.postgres import PostgresSaver

# Memoria (desarrollo)
checkpointer = MemorySaver()

# SQLite (local)
checkpointer = SqliteSaver.from_conn_string("agentes.db")

# PostgreSQL (producción)
conn_string = os.getenv("DATABASE_URL")
checkpointer = PostgresSaver.from_conn_string(conn_string)

# Compilar con checkpointer
graph = builder.compile(checkpointer=checkpointer)

# Ejecutar con thread_id para persistencia
config = {"configurable": {"thread_id": "sesion-usuario-123"}}
resultado = graph.invoke(
    {"messages": [("user", "¿Qué es LangGraph?")]},
    config=config
)

# Reanudar la misma sesión
resultado2 = graph.invoke(
    {"messages": [("user", "Dame más detalles")]},
    config=config  # mismo thread_id → misma conversación
)
```

## 3.5 Patrón de Reflexión (Self-Critique)

Un patrón poderoso donde el agente critica su propio output y lo mejora:

```
┌─────────┐
│ GENERAR │  ─→ Output inicial
└────┬────┘
     ▼
┌─────────┐
│ REFLEJA │  ─→ Crítica y sugerencias
└────┬────┘
     ▼
┌─────────┐
│ MEJORAR │  ─→ Output refinado
└────┬────┘
     ▼
┌─────────┐
│ EVALUAR │  ─→ ¿Suficientemente bueno?
└────┬────┘
     │
  ┌──┴──┐
  │ SÍ  │ No ─→ REFLEJA de nuevo
  └─────┘
     │
     ▼
    FIN
```

```python
class EstadoReflexion(TypedDict):
    tarea: str
    borrador: str
    critica: str
    iteracion: int
    max_iteraciones: int

def generar(estado: EstadoReflexion) -> dict:
    prompt = f"Tarea: {estado['tarea']}\nGenera una solución detallada."
    respuesta = llm.invoke(prompt)
    return {
        "borrador": respuesta.content,
        "iteracion": estado.get("iteracion", 0) + 1,
    }

def reflejar(estado: EstadoReflexion) -> dict:
    prompt = f"""
    Tarea original: {estado['tarea']}
    Borrador actual: {estado['borrador']}
    
    Evalúa críticamente este borrador. Señala:
    1. Lo que está bien
    2. Lo que falta o es incorrecto
    3. Sugerencias específicas de mejora
    """
    respuesta = llm.invoke(prompt)
    return {"critica": respuesta.content}

def mejorar(estado: EstadoReflexion) -> dict:
    prompt = f"""
    Tarea original: {estado['tarea']}
    Borrador previo: {estado['borrador']}
    Crítica recibida: {estado['critica']}
    
    Genera una versión mejorada que aborde todas las críticas.
    """
    respuesta = llm.invoke(prompt)
    return {"borrador": respuesta.content}

def evaluar(estado: EstadoReflexion) -> Literal["aceptado", "revisar"]:
    prompt = f"¿Este borrador responde completamente a la tarea? Razona.\nTarea: {estado['tarea']}\nBorrador: {estado['borrador']}"
    respuesta = llm.invoke(prompt)
    
    if estado["iteracion"] >= estado.get("max_iteraciones", 3):
        return "aceptado"
    
    if "no" in respuesta.content.lower()[:100]:
        return "revisar"
    return "aceptado"

# Construir grafo de reflexión
builder = StateGraph(EstadoReflexion)
builder.add_node("generar", generar)
builder.add_node("reflejar", reflejar)
builder.add_node("mejorar", mejorar)

builder.set_entry_point("generar")
builder.add_edge("generar", "reflejar")
builder.add_edge("reflejar", "mejorar")
builder.add_conditional_edges("mejorar", evaluar, {
    "aceptado": END,
    "revisar": "reflejar",
})

graph_reflexion = builder.compile()
```

## 3.6 Proyecto Completo: Research Agent con Reflexión

Un agente que investiga un tema usando web search, genera un informe, y lo refina con autocrítica.

### Estructura

```
research_agent/
├── main.py
├── graph.py
├── tools.py
├── state.py
└── requirements.txt
```

### state.py

```python
from typing import TypedDict, Annotated, Sequence
from langgraph.graph.message import add_messages

class ResearchState(TypedDict):
    topic: str
    search_results: Annotated[list[str], add_messages]
    report_draft: str
    critique: str
    iteration: int
    max_iterations: int
    sources: list[str]
    final_report: str | None
```

### tools.py

```python
from langchain_core.tools import tool
from datetime import datetime

@tool
def search_web(query: str) -> str:
    """Search the web for current information."""
    from duckduckgo_search import DDGS
    with DDGS() as ddgs:
        results = list(ddgs.text(query, max_results=5))
    if not results:
        return "No results found."
    return "\n\n".join(
        f"**{r['title']}**\n{r['body']}\n[{r['href']}]"
        for r in results
    )

@tool
def extract_url_content(url: str) -> str:
    """Extract readable content from a URL."""
    import requests
    from bs4 import BeautifulSoup
    try:
        resp = requests.get(url, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "nav", "footer"]):
            tag.decompose()
        text = soup.get_text(separator="\n", strip=True)
        return text[:3000]
    except Exception as e:
        return f"Error extracting content: {e}"
```

### graph.py

```python
from langgraph.graph import StateGraph, END
from research_state import ResearchState
from research_tools import search_web, extract_url_content
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o", temperature=0)

tools = [search_web, extract_url_content]

def initial_research(state: ResearchState) -> dict:
    """First pass: gather information about the topic."""
    query = f"Información actualizada sobre: {state['topic']}"
    results = search_web.invoke(query)
    return {
        "search_results": [results],
        "sources": [],
        "iteration": 0,
        "max_iterations": 3,
    }

def write_report(state: ResearchState) -> dict:
    """Write initial report based on search results."""
    context = "\n".join(state.get("search_results", []))
    
    prompt = f"""
    Tema: {state['topic']}
    
    Información recopilada:
    {context}
    
    Escribe un informe completo y bien estructurado en español sobre este tema.
    Incluye:
    1. Resumen ejecutivo
    2. Puntos principales
    3. Datos y estadísticas relevantes
    4. Conclusiones
    
    Formato: Markdown.
    """
    respuesta = llm.invoke(prompt)
    return {"report_draft": respuesta.content}

def critique_report(state: ResearchState) -> dict:
    """Critique the report and identify gaps."""
    prompt = f"""
    Tema: {state['topic']}
    Informe actual:
    {state['report_draft']}
    
    Evalúa críticamente este informe. Identifica:
    1. Información faltante o imprecisa
    2. Secciones que necesitan más profundidad
    3. Datos que deberían verificarse
    4. Sugerencias específicas de mejora
    
    Sé detallado y constructivo.
    """
    respuesta = llm.invoke(prompt)
    return {"critique": respuesta.content}

def improve_report(state: ResearchState) -> dict:
    """Improve report based on critique."""
    # Buscar información adicional si la crítica lo sugiere
    if "más información" in state["critique"].lower():
        results = search_web.invoke(f"{state['topic']} {state['iteration']}")
        new_sources = [results]
    else:
        new_sources = []
    
    prompt = f"""
    Tema: {state['topic']}
    Informe anterior:
    {state['report_draft']}
    
    Crítica recibida:
    {state['critique']}
    
    Genera una versión mejorada del informe que aborde TODAS las críticas.
    """
    respuesta = llm.invoke(prompt)
    
    return {
        "report_draft": respuesta.content,
        "iteration": state["iteration"] + 1,
        "sources": state.get("sources", []) + new_sources,
    }

def should_continue(state: ResearchState) -> str:
    """Decide if we need another iteration."""
    if state["iteration"] >= state["max_iterations"]:
        return "finalizar"
    
    prompt = f"""
    El informe ha pasado por {state['iteration']} iteraciones de mejora.
    
    Informe actual:
    {state['report_draft'][:500]}...
    
    ¿Este informe está completo y listo para entregar?
    Responde solo: "SI" o "NO" con una breve razón.
    """
    respuesta = llm.invoke(prompt)
    
    if respuesta.content.strip().upper().startswith("SI"):
        return "finalizar"
    return "mejorar"

def finalize(state: ResearchState) -> dict:
    """Create the final version."""
    return {"final_report": state["report_draft"]}

# Build the graph
builder = StateGraph(ResearchState)

builder.add_node("investigar", initial_research)
builder.add_node("escribir", write_report)
builder.add_node("criticar", critique_report)
builder.add_node("mejorar", improve_report)
builder.add_node("finalizar", finalize)

builder.set_entry_point("investigar")
builder.add_edge("investigar", "escribir")
builder.add_edge("escribir", "criticar")

builder.add_conditional_edges(
    "criticar",
    should_continue,
    {
        "mejorar": "mejorar",
        "finalizar": "finalizar",
    }
)

builder.add_edge("mejorar", "criticar")
builder.add_edge("finalizar", END)

graph = builder.compile()
```

### main.py

```python
from research_graph import graph

def investigar(tema: str) -> str:
    resultado = graph.invoke({"topic": tema})
    return resultado["final_report"]

if __name__ == "__main__":
    temas = [
        "El impacto de la IA generativa en la educación superior",
        "Avances en energía de fusión nuclear 2025-2026",
    ]
    
    for tema in temas:
        print(f"\n{'='*60}")
        print(f"🔬 Investigando: {tema}")
        print(f"{'='*60}")
        informe = investigar(tema)
        print(f"\n📄 INFORME FINAL:\n{informe}")
        print(f"\n{'='*60}")
```

## 3.7 Visualización del Grafo

```python
# Generar diagrama del grafo
from IPython.display import Image, display

def visualizar_grafo(graph):
    try:
        display(Image(graph.get_graph().draw_mermaid_png()))
    except Exception:
        print("Graph visualization requires graphviz.")
        print("Install: pip install graphviz")

# O en texto:
print(graph.get_graph().draw_ascii())
```

Salida ASCII:

```
                    ┌──────────┐
                    │ INVESTIGAR│
                    └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
                    │ ESCRIBIR │
                    └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
                    │ CRITICAR │
                    └────┬─────┘
                         │
                    ┌────┴────┐
                    │ ¿OK?    │
               ┌────┤         ├────┐
               │Sí  └─────────┘  No│
               ▼                   ▼
          ┌──────────┐      ┌──────────┐
          │FINALIZAR │      │ MEJORAR  │
          └──────────┘      └────┬─────┘
                                 │
                                 └────→ CRITICAR
```

## 3.8 Resumen

| Concepto | LangChain | LangGraph |
|----------|-----------|-----------|
| Flujo | Loop fijo | Grafo personalizado |
| Estado | Implícito (messages) | Explícito (TypedDict) |
| Ciclos | Solo ReAct | Cualquier ciclo |
| Routing | No soportado | Condicional |
| Checkpoint | No nativo | Integrado |
| Human-in-loop | No | Sí (interrupt) |

**Cuándo usar LangGraph:**
- Necesitas flujos no lineales (ramas, ciclos complejos)
- Quieres estado explícito y tipado
- Requieres persistencia de sesión
- Implementas patrones de reflexión o crítica
- Necesitas humano-en-el-loop

**Cuándo usar AgentExecutor:**
- Casos simples de Q&A
- Prototipos rápidos
- Flujo ReAct estándar

En el próximo capítulo exploraremos sistemas multi-agente con CrewAI.
