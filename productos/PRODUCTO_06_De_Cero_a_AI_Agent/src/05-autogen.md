# Capítulo 5 — AutoGen para Agentes Conversacionales

## 5.1 Introducción a AutoGen

AutoGen, desarrollado por Microsoft Research, está diseñado específicamente para **conversaciones multi-agente**. Su fortaleza es la comunicación fluida entre agentes que pueden hablar entre sí, ejecutar código, y colaborar en tiempo real.

```
┌─────────────────────────────────────────────────┐
│                 AutoGen                          │
├─────────────────────────────────────────────────┤
│  ┌───────────────┐    ┌──────────────────────┐  │
│  │ AssistantAgent │    │   UserProxyAgent     │  │
│  │ (LLM + Tools)  │◄──►│ (Input/Code Exec)    │  │
│  └───────────────┘    └──────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │           GroupChat                       │   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │   │
│  │  │ A1 │ │ A2 │ │ A3 │ │ A4 │           │   │
│  │  └────┘ └────┘ └────┘ └────┘           │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Diferencias clave con otros frameworks:**

| Aspecto | LangChain | CrewAI | AutoGen |
|---------|-----------|--------|---------|
| Enfoque | Cadenas y agentes | Equipos con roles | Conversaciones |
| Comunicación | Pipeline | Jerárquica/seq | Libre entre pares |
| Code Exec | Via tools | Via tools | Nativo |
| Group Chat | No | No | Sí |
| Human Input | Callbacks | No | Nativo |

## 5.2 Conceptos Fundamentales

### AssistantAgent

El agente con LLM que puede usar herramientas y mantener conversaciones:

```python
import autogen

config_list = [
    {
        "model": "gpt-4o",
        "api_key": os.getenv("OPENAI_API_KEY"),
    }
]

asistente = autogen.AssistantAgent(
    name="AsistentePrincipal",
    llm_config={
        "config_list": config_list,
        "temperature": 0,
        "timeout": 60,
    },
    system_message=(
        "Eres un asistente de IA experto. Puedes usar herramientas "
        "y ejecutar código Python para resolver problemas. "
        "Siempre explica tu razonamiento paso a paso."
    ),
)
```

### UserProxyAgent

Actúa como proxy del usuario: recibe input humano, ejecuta código, y devuelve resultados al asistente:

```python
proxy = autogen.UserProxyAgent(
    name="Usuario",
    human_input_mode="TERMINATE",  # "ALWAYS" | "NEVER" | "TERMINATE"
    max_consecutive_auto_reply=10,
    code_execution_config={
        "work_dir": "workspace",
        "use_docker": False,  # True para aislamiento
        "timeout": 30,
    },
    system_message="Eres el usuario. Proporcionas tareas y revisas resultados.",
)
```

**Modos de input humano:**

- `"ALWAYS"`: Siempre pide aprobación antes de ejecutar
- `"NEVER"`: Totalmente autónomo
- `"TERMINATE"`: Solo pide input cuando el agente cree que terminó

### El Chat Loop

```python
# Iniciar conversación: proxy inicia, asistente responde
proxy.initiate_chat(
    asistente,
    message="Analiza los datos de ventas del último trimestre y genera un reporte",
)
```

Flujo de la conversación:

```
UsuarioProxy: "Analiza los datos de ventas..."
AssistantAgent: "Voy a leer el archivo de ventas..."
  → [LLM decide ejecutar código]
  → UserProxyAgent ejecuta el código
  → Devuelve resultado al AssistantAgent
AssistantAgent: "Basado en los datos, estas son las tendencias..."
  → Continúa hasta que el asistente da respuesta final
```

## 5.3 Code Execution Agents

AutoGen tiene soporte nativo de ejecución de código Python. El asistente puede generar código, el proxy lo ejecuta.

```python
analista = autogen.AssistantAgent(
    name="AnalistaDeDatos",
    llm_config={
        "config_list": config_list,
        "temperature": 0.1,
    },
    system_message=(
        "Eres un analista de datos experto en Python. "
        "Usa pandas, matplotlib y seaborn para análisis. "
        "Siempre genera código Python completo y funcional. "
        "Muestra visualizaciones con plt.show()."
    ),
)

proxy = autogen.UserProxyAgent(
    name="ProxyEjecucion",
    human_input_mode="NEVER",
    code_execution_config={
        "work_dir": "analisis",
        "use_docker": False,
    },
)

# El asistente genera código y el proxy lo ejecuta
proxy.initiate_chat(
    analista,
    message="""Genera un análisis exploratorio del dataset 
    'ventas_2025.csv' que incluye:
    1. Estadísticas descriptivas
    2. Top 10 productos por ventas
    3. Tendencia mensual (gráfico de líneas)
    4. Correlaciones entre variables""",
)
```

## 5.4 GroupChat: Múltiples Agentes Conversando

GroupChat permite que múltiples agentes conversen en un chat grupal, con un manager que decide quién habla:

```python
from autogen import GroupChat, GroupChatManager

# Definir agentes
pm = autogen.AssistantAgent(
    name="ProjectManager",
    system_message="Eres un Project Manager. Coordinas el equipo y tomas decisiones.",
    llm_config=llm_config,
)

dev = autogen.AssistantAgent(
    name="Desarrollador",
    system_message="Eres un desarrollador senior. Escribes código limpio y eficiente.",
    llm_config=llm_config,
)

reviewer = autogen.AssistantAgent(
    name="Revisor",
    system_message="Eres un revisor de código. Encuentras bugs y sugieres mejoras.",
    llm_config=llm_config,
)

proxy = autogen.UserProxyAgent(
    name="Cliente",
    human_input_mode="TERMINATE",
    code_execution_config={"work_dir": "proyecto"},
)

# Crear GroupChat
groupchat = GroupChat(
    agents=[pm, dev, reviewer, proxy],
    messages=[],
    max_round=20,
    speaker_selection_method="auto",  # "auto" | "round_robin" | "random"
)

manager = GroupChatManager(
    groupchat=groupchat,
    llm_config=llm_config,
)

# Iniciar conversación grupal
proxy.initiate_chat(
    manager,
    message="Necesito una API REST en Python para gestión de tareas (TODO list)",
)
```

**Métodos de selección de speaker:**

| Método | Descripción |
|--------|-------------|
| `"auto"` | LLM decide quién debe hablar según el contexto |
| `"round_robin"` | Turnos en orden secuencial |
| `"random"` | Aleatorio (útil para brainstorming) |

### Control de Flujo en GroupChat

```python
groupchat = GroupChat(
    agents=[pm, dev, reviewer, proxy],
    messages=[],
    max_round=30,
    speaker_selection_method="auto",
    allow_repeat_speaker=False,  # Evita que un agente hable dos veces seguidas
    max_retries_for_select=3,    # Reintentos si el LLM falla en elegir speaker
)
```

## 5.5 Tools en AutoGen

AutoGen usa function registration para tools:

```python
from autogen import register_function

def buscar_web(query: str) -> str:
    """Search the web for information."""
    from duckduckgo_search import DDGS
    with DDGS() as ddgs:
        results = list(ddgs.text(query, max_results=3))
    return "\n".join(f"• {r['title']}: {r['body']}" for r in results)

def leer_base_datos(query: str) -> str:
    """Execute SQL query on the local database."""
    import sqlite3
    conn = sqlite3.connect("data.db")
    cursor = conn.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()
    return "\n".join(str(row) for row in rows)

# Registrar herramientas en los agentes
agente_con_tools = autogen.AssistantAgent(
    name="AgenteInvestigador",
    llm_config=llm_config,
    # Las tools se pasan en la configuración
    function_map={
        "buscar_web": buscar_web,
        "leer_base_datos": leer_base_datos,
    },
)

# O registrar después de crear
register_function(
    buscar_web,
    caller=agente_con_tools,
    executor=proxy,
    name="buscar_web",
    description="Busca información actualizada en internet",
)
```

## 5.6 Proyecto Completo: Code Development Team

Un equipo de desarrollo con PM + Developer + Reviewer que construye una aplicación completa.

### team_agents.py

```python
import autogen
import os

llm_config = {
    "config_list": [
        {
            "model": "gpt-4o",
            "api_key": os.getenv("OPENAI_API_KEY"),
        }
    ],
    "temperature": 0.2,
}

pm = autogen.AssistantAgent(
    name="ProjectManager",
    system_message=(
        "Eres un Project Manager experto en desarrollo de software. "
        "Tu rol es:\n"
        "1. Descomponer el requerimiento en historias de usuario\n"
        "2. Definir el orden de implementación\n"
        "3. Revisar que el producto final cumpla los requisitos\n"
        "4. Preguntar al cliente cuando haya dudas\n\n"
        "No escribes código. Coordinas al equipo."
    ),
    llm_config=llm_config,
)

dev = autogen.AssistantAgent(
    name="Desarrollador",
    system_message=(
        "Eres un desarrollador Python senior experto en:\n"
        "- FastAPI para APIs REST\n"
        "- SQLAlchemy para bases de datos\n"
        "- Pydantic para validación\n"
        "- pytest para testing\n\n"
        "Siempre escribes código:\n"
        - Con type hints\n"
        - Con docstrings\n"
        - Con manejo de errores\n"
        - Tests incluidos\n\n"
        "Cuando termines una tarea, ejecuta los tests para verificar."
    ),
    llm_config={"config_list": llm_config["config_list"], "temperature": 0.1},
)

reviewer = autogen.AssistantAgent(
    name="RevisorDeCodigo",
    system_message=(
        "Eres un revisor de código senior. Revisas:\n"
        "1. Correctitud funcional\n"
        "2. Calidad del código (clean code, patrones)\n"
        "3. Seguridad (inyección SQL, XSS, etc.)\n"
        "4. Performance (N+1 queries, bucles innecesarios)\n"
        "5. Tests (cobertura, casos borde)\n\n"
        "Apruebas (APPROVED) o solicitas cambios (CHANGES_REQUESTED) "
        "con explicaciones claras."
    ),
    llm_config=llm_config,
)

proxy = autogen.UserProxyAgent(
    name="Cliente",
    human_input_mode="TERMINATE",
    code_execution_config={
        "work_dir": "codigo_equipo",
        "use_docker": False,
    },
)
```

### team_chat.py

```python
from autogen import GroupChat, GroupChatManager
from team_agents import pm, dev, reviewer, proxy, llm_config

def ejecutar_equipo_desarrollo(requerimiento: str):
    groupchat = GroupChat(
        agents=[pm, dev, reviewer, proxy],
        messages=[],
        max_round=30,
        speaker_selection_method="auto",
    )

    manager = GroupChatManager(
        groupchat=groupchat,
        llm_config=llm_config,
    )

    resultado = proxy.initiate_chat(
        manager,
        message=f"Requerimiento del proyecto:\n\n{requerimiento}",
    )

    return resultado

# Pipeline de desarrollo guiado
def desarrollo_guiado(requerimiento: str):
    """
    Fases:
    1. PM analiza requerimiento y crea plan
    2. Dev implementa según el plan
    3. Reviewer revisa el código
    4. Si hay cambios, Dev corrige
    5. PM verifica que todo está completo
    """
    fases = [
        "FASE 1: Análisis",
        "FASE 2: Implementación",
        "FASE 3: Code Review",
        "FASE 4: Correcciones",
    ]

    groupchat = GroupChat(
        agents=[pm, dev, reviewer, proxy],
        messages=[],
        max_round=40,
        speaker_selection_method="auto",
    )

    manager = GroupChatManager(
        groupchat=groupchat,
        llm_config=llm_config,
    )

    proxy.initiate_chat(
        manager,
        message=f"""DESARROLLO DE SOFTWARE - PROYECTO COMPLETO

{requerimiento}

El equipo debe trabajar en este orden:
1. {fases[0]}: PM descompone el requerimiento y define el plan
2. {fases[1]}: Dev implementa cada componente
3. {fases[2]}: Reviewer revisa el código
4. {fases[3]}: Dev corrige según feedback del reviewer

El PM debe aprobar el resultado final.
""",
    )

if __name__ == "__main__":
    requerimiento = """
    Crear una API REST para un sistema de gestión de tareas (Task Manager) con:

    Entidades:
    - User: id, username, email, created_at
    - Task: id, title, description, status (pending/in_progress/done), 
            priority (1-5), user_id (FK), created_at, updated_at
    
    Endpoints:
    - POST /users (crear usuario)
    - GET /users/{id} (obtener usuario con sus tareas)
    - POST /tasks (crear tarea)
    - GET /tasks (listar, filtrar por status/priority)
    - PUT /tasks/{id} (actualizar tarea)
    - DELETE /tasks/{id} (eliminar tarea)
    - GET /users/{id}/stats (estadísticas: total tasks, por status, avg priority)

    Requisitos técnicos:
    - FastAPI + SQLAlchemy + SQLite
    - Validación con Pydantic
    - Tests con pytest (mínimo 10 tests)
    - Manejo de errores HTTP estándar
    """

    desarrollo_guiado(requerimiento)
```

## 5.7 Patrones Avanzados

### Human-in-the-Loop Nativo

```python
proxy_humano = autogen.UserProxyAgent(
    name="Supervisor",
    human_input_mode="ALWAYS",  # Siempre pide aprobación
    code_execution_config={"use_docker": False},
)

# AutoGen pausa y pide confirmación antes de cada paso
proxy_humano.initiate_chat(asistente, message="Ejecuta esta tarea sensible...")
```

### Agente con Memoria de Conversación

```python
from autogen import ConversableAgent

agente_memoria = autogen.AssistantAgent(
    name="AgenteConMemoria",
    llm_config={
        "config_list": config_list,
        "temperature": 0.7,
    },
    max_consecutive_auto_reply=5,
    system_message="Eres un asistente útil y recuerdas la conversación.",
)

# La memoria se mantiene mientras el objeto existe
agente_memoria.initiate_chat(proxy, message="Hola, me llamo Juan")
agente_memoria.initiate_chat(proxy, message="¿Recuerdas mi nombre?")
```

### Tool con Aprobación Humana

```python
def ejecutar_con_permiso(accion: str, args: dict) -> str:
    """Tool que requiere aprobación humana antes de ejecutar."""
    print(f"\n⚠️  Se requiere aprobación para: {accion}")
    print(f"Argumentos: {args}")
    respuesta = input("¿Aprobar? (s/N): ")
    
    if respuesta.lower() != "s":
        return "Acción rechazada por el usuario."
    
    # Ejecutar la acción
    return herramientas[accion](**args)
```

## 5.8 Cuándo Usar AutoGen

**Ideal para:**
- Equipos de desarrollo de software autónomos
- Sistemas donde agentes deben conversar libremente
- Escenarios con code execution como parte del flujo
- Prototipos rápidos de multi-agente conversacional
- Cuando necesitas human-in-the-loop nativo

**Consideraciones:**
- Mayor costo de tokens (más conversación entre agentes)
- Puede derivar en conversaciones largas sin progreso
- GroupChat manager necesita un buen LLM para dirigir bien
- Menos control granular que LangGraph para flujos complejos

## 5.9 Resumen

| Componente | Función |
|------------|---------|
| AssistantAgent | Agente con LLM que procesa y genera mensajes |
| UserProxyAgent | Proxy humano, ejecuta código, provee input |
| GroupChat | Chat multi-agente con múltiples participantes |
| GroupChatManager | Orquesta quién habla y cuándo |
| register_function | Vincula herramientas a agentes |
| human_input_mode | Controla cuándo interviene el humano |

En el próximo capítulo veremos cómo implementar memoria persistente y herramientas personalizadas.
