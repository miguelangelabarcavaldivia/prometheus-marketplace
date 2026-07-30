# Capítulo 2 — LangChain Basics para Agentes

## 2.1 Introducción a LangChain

LangChain es el framework foundational para construir aplicaciones con LLMs. Proporciona abstracciones para:

- **Modelos**: Wrappers unificados para OpenAI, Anthropic, Llama, etc.
- **Prompts**: Plantillas, composición y versionado
- **Chains**: Secuencias de llamadas encadenadas
- **Tools**: Interfaces estandarizadas para herramientas
- **Agents**: Ciclo de decisión-acción autónomo

```
┌─────────────────────────────────────┐
│           LangChain                 │
├─────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌────────┐      │
│  │LLM   │ │Prompt│ │ Chain  │      │
│  │Wrapper│ │Templ.│ │       │      │
│  └──────┘ └──────┘ └────────┘      │
│  ┌────────┐ ┌──────────────────┐    │
│  │ Tool   │ │  Agent / Executor│    │
│  └────────┘ └──────────────────┘    │
└─────────────────────────────────────┘
```

## 2.2 LLM Wrappers

LangChain unifica todos los proveedores bajo una interfaz común:

```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_ollama import ChatOllama

# Abstracción unificada: todas implementan BaseChatModel
gpt4 = ChatOpenAI(model="gpt-4", temperature=0)
claude = ChatAnthropic(model="claude-3-opus-20240229")
llama = ChatOllama(model="llama3", temperature=0.7)

# Uso idéntico para cualquier modelo
respuesta = gpt4.invoke("¿Qué es un agente de IA?")
print(respuesta.content)
```

### Configuración recomendada

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="gpt-4o-mini",       # Balance costo/calidad
    temperature=0,              # Determinístico para agentes
    max_tokens=4096,
    timeout=30,
    max_retries=2,
    model_kwargs={"seed": 42}  # Reproducibilidad
)
```

## 2.3 Prompts y Prompt Templates

### Prompt templates básicos

```python
from langchain_core.prompts import ChatPromptTemplate

# Template simple
prompt = ChatPromptTemplate.from_messages([
    ("system", "Eres un experto en {tema}. Responde en {idioma}."),
    ("user", "{pregunta}")
])

cadena = prompt | llm
respuesta = cadena.invoke({
    "tema": "agentes de IA",
    "idioma": "español",
    "pregunta": "¿Qué es ReAct?"
})
```

### Prompt con historial

```python
from langchain_core.prompts import MessagesPlaceholder

prompt_agente = ChatPromptTemplate.from_messages([
    ("system", "Eres un asistente útil con acceso a herramientas."),
    MessagesPlaceholder(variable_name="historial"),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])
```

## 2.4 Chains

Las chains son secuencias de operaciones. Con LangChain Expression Language (LCEL):

```python
from langchain_core.output_parsers import StrOutputParser

# Chain simple: prompt → LLM → parser
cadena_basica = prompt | llm | StrOutputParser()

# Chain con transformación intermedia
from langchain_core.runnables import RunnableLambda

def extraer_json(texto: str) -> dict:
    import json
    inicio = texto.index("{")
    fin = texto.rindex("}") + 1
    return json.loads(texto[inicio:fin])

cadena_json = prompt | llm | StrOutputParser() | RunnableLambda(extraer_json)

# Chain paralela (ejecuta múltiples cosas simultáneas)
from langchain_core.runnables import RunnableParallel

cadena_paralela = RunnableParallel(
    resumen=prompt_resumen | llm | StrOutputParser(),
    analisis=prompt_analisis | llm | StrOutputParser(),
    traduccion=prompt_traduccion | llm | StrOutputParser(),
)
```

## 2.5 Tools y Toolkits

### Definiendo una Tool

```python
from langchain_core.tools import tool

@tool
def buscar_web(consulta: str) -> str:
    """Busca información en internet usando DuckDuckGo."""
    from duckduckgo_search import DDGS
    with DDGS() as ddgs:
        resultados = list(ddgs.text(consulta, max_results=3))
    return "\n".join(
        f"{r['title']}: {r['body']}" for r in resultados
    )

@tool
def calculadora(expresion: str) -> str:
    """Evalúa una expresión matemática. Usa números y operadores +, -, *, /"""
    try:
        resultado = eval(expresion, {"__builtins__": {}}, {})
        return str(resultado)
    except Exception as e:
        return f"Error: {e}"

@tool
def leer_archivo(ruta: str) -> str:
    """Lee el contenido de un archivo de texto."""
    with open(ruta, "r", encoding="utf-8") as f:
        return f.read()
```

### Toolkits

Los toolkits agrupan herramientas relacionadas:

```python
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_community.agent_toolkits import (
    FileManagementToolkit,
    SQLDatabaseToolkit,
    PythonREPLTool,
)

toolkit_archivos = FileManagementToolkit(
    root_dir="./workspace",
    selected_tools=["read_file", "write_file", "list_directory"]
)

toolkit_db = SQLDatabaseToolkit(
    db=sql_database,
    llm=llm
)
```

## 2.6 AgentExecutor y Tipos de Agentes

### El ciclo AgentExecutor

LangChain implementa el ciclo de agente que vimos en el capítulo 1:

```
Input → Prompt → LLM → ¿Tool Call? → Sí → Ejecutar → Observar → Loop
                      → No  → Respuesta Final → Output
```

### Agente ReAct (Reasoning + Acting)

El tipo de agente más usado. El LLM piensa en voz alta y decide acciones:

```python
from langchain.agents import create_react_agent, AgentExecutor
from langchain_core.prompts import PromptTemplate

react_prompt = PromptTemplate.from_template("""
Eres un agente con acceso a herramientas.

Responde lo mejor posible usando las herramientas disponibles.

Tienes acceso a estas herramientas:
{tools}

Usa el siguiente formato:

Pensamiento: lo que estás pensando hacer
Acción: nombre de la herramienta
Input de Acción: argumentos para la herramienta
Observación: resultado de la herramienta
... (este ciclo se repite hasta tener la respuesta)
Pensamiento: ahora tengo la respuesta
Respuesta Final: [tu respuesta aquí]

Pregunta: {input}

{agent_scratchpad}
""")

agente = create_react_agent(
    llm=llm,
    tools=[buscar_web, calculadora],
    prompt=react_prompt
)

executor = AgenteExecutor(
    agent=agente,
    tools=[buscar_web, calculadora],
    verbose=True,
    max_iterations=10,
    handle_parsing_errors=True,
)
```

### Agente con Function Calling (OpenAI)

```python
from langchain.agents import create_openai_functions_agent

agente_func = create_openai_functions_agent(
    llm=llm,
    tools=[buscar_web, calculadora, leer_archivo],
    prompt=prompt_agente
)

executor_func = AgentExecutor(
    agent=agente_func,
    tools=[buscar_web, calculadora, leer_archivo],
    max_iterations=15,
    early_stopping_method="generate",
)
```

### Parámetros clave de AgentExecutor

```python
executor = AgentExecutor(
    agent=agente,
    tools=herramientas,
    verbose=True,                 # Muestra el razonamiento paso a paso
    max_iterations=10,            # Límite de iteraciones
    max_execution_time=60,        # Timeout en segundos
    early_stopping_method="force", # "force" | "generate"
    handle_parsing_errors=True,   # Maneja errores de parseo
    return_intermediate_steps=True, # Devuelve pasos intermedios
)
```

### Monitoreo con callbacks

```python
from langchain_core.callbacks import BaseCallbackHandler

class LoggerAgente(BaseCallbackHandler):
    def on_agent_action(self, action, **kwargs):
        print(f"→ Acción: {action.tool}")
        print(f"  Args: {action.tool_input}")
    
    def on_agent_finish(self, finish, **kwargs):
        print(f"✓ Finalizado: {finish.return_values['output'][:100]}...")

executor = AgentExecutor(
    agent=agente,
    tools=herramientas,
    callbacks=[LoggerAgente()],
)
```

## 2.7 Proyecto Completo: Agente Simple Q&A

Construyamos un agente que responde preguntas usando búsqueda web y cálculo.

### Estructura

```
agente_qa/
├── main.py
├── herramientas.py
├── config.py
└── requirements.txt
```

### config.py

```python
import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODELO = os.getenv("MODELO", "gpt-4o-mini")
TEMPERATURA = float(os.getenv("TEMPERATURA", "0"))
MAX_ITERACIONES = int(os.getenv("MAX_ITERACIONES", "15"))
```

### herramientas.py

```python
from langchain_core.tools import tool
import requests
import json

@tool
def buscar_web(consulta: str) -> str:
    """Busca información actualizada en internet."""
    from duckduckgo_search import DDGS
    with DDGS() as ddgs:
        resultados = list(ddgs.text(consulta, max_results=5))
    
    if not resultados:
        return "No se encontraron resultados."
    
    return "\n\n".join(
        f"**{r['title']}**\n{r['body']}\nFuente: {r['href']}"
        for r in resultados
    )

@tool
def obtener_clima(ciudad: str) -> str:
    """Obtiene el clima actual para una ciudad."""
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        return "API key no configurada."
    
    url = f"https://api.openweathermap.org/data/2.5/weather?q={ciudad}&appid={api_key}&units=metric&lang=es"
    resp = requests.get(url)
    
    if resp.status_code != 200:
        return f"No se pudo obtener clima para {ciudad}"
    
    data = resp.json()
    return (
        f"Clima en {data['name']}, {data['sys']['country']}:\n"
        f"🌡 Temperatura: {data['main']['temp']}°C\n"
        f"☁ {data['weather'][0]['description']}\n"
        f"💧 Humedad: {data['main']['humidity']}%\n"
        f"💨 Viento: {data['wind']['speed']} m/s"
    )

@tool
def wikipedia(resumen: str) -> str:
    """Busca un resumen en Wikipedia."""
    import wikipediaapi
    user_agent = "AgenteQA/1.0"
    api = wikipediaapi.Wikipedia("es", user_agent=user_agent)
    
    page = api.page(resumen)
    if not page.exists():
        return f"No se encontró página para: {resumen}"
    
    return f"# {page.title}\n{page.summary[:2000]}"
```

### main.py

```python
import config
from herramientas import buscar_web, obtener_clima, wikipedia
from langchain_openai import ChatOpenAI
from langchain.agents import create_openai_functions_agent
from langchain.agents import AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

llm = ChatOpenAI(
    model=config.MODELO,
    temperature=config.TEMPERATURA,
)

herramientas = [buscar_web, obtener_clima, wikipedia]

prompt = ChatPromptTemplate.from_messages([
    ("system", (
        "Eres un asistente de IA útil. Usas herramientas para responder "
        "preguntas con información actualizada y precisa. "
        "Siempre cita tus fuentes cuando sea posible."
        "Responde en español."
    )),
    MessagesPlaceholder(variable_name="chat_history"),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

agente = create_openai_functions_agent(
    llm=llm,
    tools=herramientas,
    prompt=prompt,
)

executor = AgentExecutor(
    agent=agente,
    tools=herramientas,
    verbose=True,
    max_iterations=config.MAX_ITERACIONES,
    handle_parsing_errors=True,
    return_intermediate_steps=True,
)

def preguntar(query: str) -> str:
    resultado = executor.invoke({
        "input": query,
        "chat_history": [],
    })
    return resultado["output"]

if __name__ == "__main__":
    preguntas = [
        "¿Cuál es la población de México?",
        "¿Qué clima hace en Buenos Aires?",
        "¿Quién ganó el premio Nobel de Física en 2023 y por qué?",
    ]
    
    for pregunta in preguntas:
        print(f"\n❓ {pregunta}")
        print("=" * 60)
        respuesta = preguntar(pregunta)
        print(f"📝 {respuesta}\n")
```

### requirements.txt

```
langchain>=0.3
langchain-openai>=0.2
langchain-community>=0.3
python-dotenv>=1.0
duckduckgo-search>=5.0
wikipedia-api>=0.6
requests>=2.31
openai>=1.0
```

## 2.8 Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `OutputParserException` | LLM no siguió formato esperado | Usar `handle_parsing_errors=True` |
| `Agent stopped due to max iterations` | Bucle infinito | Aumentar `max_iterations` o revisar herramientas |
| `Tool not found` | Tool no registrada | Verificar lista de tools en AgentExecutor |
| `RateLimitError` | Límite de API alcanzado | Implementar retry + throttling |
| `JSONDecodeError` | Tool devolvió JSON inválido | Validar output de herramientas |

## 2.9 Resumen

- **LLM Wrappers**: Interfaz unificada para cualquier proveedor
- **Prompt Templates**: Plantillas reutilizables con variables
- **Chains (LCEL)**: Composición elegante de operaciones con `|`
- **Tools**: Funciones decoradas con `@tool` que describen su uso
- **AgentExecutor**: Ciclo completo observación → razonamiento → acción
- **ReAct**: El patrón más popular para agentes (Thinking → Acting → Observing)

En el próximo capítulo veremos LangGraph, que nos da control granular sobre el flujo del agente.
