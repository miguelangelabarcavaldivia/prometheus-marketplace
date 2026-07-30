# Capítulo 6 — Memoria y Herramientas

## 6.1 La Importancia de la Memoria

Sin memoria, un agente vive en un presente perpetuo. Cada interacción empieza desde cero. La memoria permite:

- **Continuidad**: Recordar conversaciones previas
- **Contexto**: Mantener información relevante entre pasos
- **Aprendizaje**: Mejorar basado en interacciones pasadas
- **Personalización**: Adaptarse al usuario con el tiempo

```
Sin Memoria:
Input ─→ LLM ─→ Output (cada vez es la primera vez)

Con Memoria:
                     ┌──────────────┐
                     │  Memoria     │
                     │  a largo     │
                     │  plazo       │
                     └──────┬───────┘
                            │
Input ─→ ┌─────────────────┴──┐ ─→ Output
         │  Contexto Completo │
         │  (historial +      │
         │   conocimiento)    │
         └────────────────────┘
```

## 6.2 Tipos de Memoria

### Conversation Buffer Memory

Guarda el historial completo de la conversación:

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

memoria_buffer = ConversationBufferMemory(
    memory_key="history",
    return_messages=True,
    max_token_limit=2000,  # Límite de tokens
)

conversacion = ConversationChain(
    llm=llm,
    memory=memoria_buffer,
    verbose=True,
)

conversacion.predict(input="Hola, soy Ana")
conversacion.predict(input="¿Cómo me llamo?")  # Recuerda: Ana
```

**Problema**: Crece indefinidamente hasta exceder el contexto del LLM.

### Conversation Summary Memory

Resume la conversación cuando se acerca al límite de tokens:

```python
from langchain.memory import ConversationSummaryBufferMemory

memoria_resumen = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=1000,
    memory_key="history",
    return_messages=True,
)

# Cuando supera 1000 tokens, resume automáticamente
conversacion = ConversationChain(
    llm=llm,
    memory=memoria_resumen,
)

# También puedes acceder al resumen directamente
resumen = memoria_resumen.predict_new_summary(
    messages=chat_history,
    existing_summary="Resumen previo..."
)
```

**Visualización del comportamiento:**

```
Tokens ▼
2000 ──╔══════════════════════╗
       ║ Historial completo   ║  ← Bajo 2000, guarda todo
       ╚══════════════════════╝
1500 ──╔══════════════════════╗
       ║ Historial completo   ║
       ╚══════════════════════╝
1000 ──╔══════╗ ╔════════════╗
       ║Resumen║ ║ Últimos    ║  ← Al llegar al límite
       ║previo ║ ║ mensajes   ║     comprime el historial
       ╚══════╝ ╚════════════╝
750  ──╔══════╗ ╔════════════╗
       ║Resumen║ ║ Últimos    ║
       ╚══════╝ ╚════════════╝
```

### Vector Store Memory

Memoria basada en búsqueda semántica. Ideal para recuperar información relevante de interacciones pasadas:

```python
from langchain.memory import VectorStoreRetrieverMemory
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma(collection_name="memoria_agente", embedding_function=embeddings)

retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

memoria_vector = VectorStoreRetrieverMemory(
    retriever=retriever,
    memory_key="relevant_history",
    return_messages=True,
)

# Guardar experiencias
memoria_vector.save_context(
    {"input": "El cliente prefiere respuestas en español"},
    {"output": "Guardado: preferencia de idioma español"}
)

# Recuperar por relevancia semántica
recuerdos = memoria_vector.load_memory_variables(
    {"input": "¿En qué idioma prefiere el cliente?"}
)
# → Devuelve la experiencia relevante
```

### Memoria Híbrida (Recomendada)

Combina buffer para lo reciente + vector para lo histórico:

```python
class MemoriaHibrida:
    def __init__(self, llm, vectorstore):
        self.buffer = ConversationSummaryBufferMemory(
            llm=llm,
            max_token_limit=2000,
            memory_key="recent_history",
            return_messages=True,
        )
        self.vector = VectorStoreRetrieverMemory(
            retriever=vectorstore.as_retriever(),
            memory_key="semantic_memory",
            return_messages=True,
        )
    
    def save_context(self, input: str, output: str):
        self.buffer.save_context({"input": input}, {"output": output})
        self.vector.save_context({"input": input}, {"output": output})
    
    def load_context(self, input: str) -> dict:
        recent = self.buffer.load_memory_variables({"input": input})
        semantic = self.vector.load_memory_variables({"input": input})
        return {**recent, **semantic}
```

## 6.3 Memoria en LangGraph

LangGraph maneja la memoria a través del estado del grafo:

```python
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import StateGraph

class Estado(TypedDict):
    messages: Annotated[list, add_messages]
    user_preferences: dict
    conversation_summary: str

# Estado se persiste automáticamente con checkpointers
checkpointer = SqliteSaver.from_conn_string("memoria.db")

graph = builder.compile(checkpointer=checkpointer)

# Misma sesión → mismo contexto
config = {"configurable": {"thread_id": "user_123"}}
graph.invoke({"messages": [("user", "Hola")]}, config)
graph.invoke({"messages": [("user", "¿Recuerdas algo?")]}, config)
```

## 6.4 Creación de Herramientas Personalizadas

### Tool Simple (@tool decorator)

```python
from langchain_core.tools import tool

@tool
def enviar_email(
    destinatario: str,
    asunto: str,
    cuerpo: str,
    cc: str | None = None,
) -> str:
    """Envía un email usando SMTP.
    
    Args:
        destinatario: Dirección de email del destinatario
        asunto: Asunto del mensaje
        cuerpo: Cuerpo del mensaje en texto plano
        cc: Dirección en copia (opcional)
    """
    import smtplib
    from email.mime.text import MIMEText
    
    msg = MIMEText(cuerpo)
    msg["Subject"] = asunto
    msg["To"] = destinatario
    if cc:
        msg["Cc"] = cc
    
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(os.getenv("EMAIL_USER"), os.getenv("EMAIL_PASS"))
        server.send_message(msg)
    
    return f"Email enviado a {destinatario}"
```

### Tool con Validación

```python
from pydantic import BaseModel, Field
from langchain_core.tools import StructuredTool

class InputAnalisis(BaseModel):
    data_path: str = Field(description="Ruta al archivo CSV/JSON")
    columnas: list[str] = Field(description="Columnas a analizar")
    metricas: list[str] = Field(
        description="Métricas: mean, median, std, min, max"
    )

def analizar_datos(data_path: str, columnas: list[str], metricas: list[str]) -> str:
    import pandas as pd
    
    if data_path.endswith(".csv"):
        df = pd.read_csv(data_path)
    elif data_path.endswith(".json"):
        df = pd.read_json(data_path)
    else:
        return "Formato no soportado"
    
    resultados = {}
    for col in columnas:
        if col not in df.columns:
            return f"Columna {col} no encontrada"
        resultados[col] = {
            m: getattr(df[col], m)() for m in metricas
        }
    
    return str(resultados)

tool_analisis = StructuredTool(
    name="analizar_datos",
    description="Analiza datos de un archivo CSV o JSON",
    args_schema=InputAnalisis,
    func=analizar_datos,
)
```

### Tool con Estado Interno

```python
@tool
class ContadorProgreso:
    """Tool que mantiene progreso de tareas multi-paso."""
    progreso: dict = {}
    
    def __call__(self, tarea: str, accion: str, valor: int = 1) -> str:
        if accion == "iniciar":
            self.progreso[tarea] = {"total": valor, "completado": 0}
            return f"Tarea '{tarea}' iniciada con {valor} pasos"
        elif accion == "avanzar":
            if tarea not in self.progreso:
                return "Tarea no iniciada"
            self.progreso[tarea]["completado"] += valor
            p = self.progreso[tarea]
            porcentaje = (p["completado"] / p["total"]) * 100
            return f"Progreso: {p['completado']}/{p['total']} ({porcentaje:.0f}%)"
        elif accion == "estado":
            if tarea not in self.progreso:
                return "No hay tareas activas"
            return str(self.progreso.get(tarea, "No encontrada"))
        return "Acción no válida"
```

### Tool que Usa Otras Tools

```python
@tool
def pipeline_investigacion(tema: str) -> str:
    """Ejecuta un pipeline completo de investigación sobre un tema."""
    # Paso 1: Buscar en web
    resultados_web = buscar_web.invoke({"query": tema})
    
    # Paso 2: Extraer contenido de URLs relevantes
    import re
    urls = re.findall(r'https?://[^\s\)]+', resultados_web)
    contenidos = []
    for url in urls[:3]:
        contenido = extract_url.invoke({"url": url})
        contenidos.append(contenido[:1000])
    
    # Paso 3: Resumir
    resumen = resumir_texto.invoke({"texto": "\n".join(contenidos)})
    
    return f"Investigación de '{tema}':\n\n{resumen}"
```

## 6.5 Tool Retrieval y Selección Dinámica

Cuando tienes muchas herramientas, puedes usar un "tool retriever" para seleccionar las relevantes:

```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

# Crear base de conocimiento de herramientas
tool_descriptions = [
    ("buscar_vuelos", "Busca vuelos disponibles entre ciudades. Útil para viajes."),
    ("reservar_hotel", "Reserva habitaciones de hotel. Para alojamiento."),
    ("calcular_impuestos", "Calcula impuestos para declaración anual. Solo temas fiscales."),
    ("enviar_email", "Envía emails a destinatarios. Comunicación por correo."),
    ("generar_grafico", "Genera gráficos a partir de datos. Visualización."),
    ("analizar_sentimiento", "Analiza el sentimiento de un texto. NLP."),
]

embeddings = OpenAIEmbeddings()
tool_vectorstore = Chroma.from_texts(
    texts=[d[1] for d in tool_descriptions],
    embedding=embeddings,
    metadatas=[{"name": d[0]} for d in tool_descriptions],
)

tool_retriever = tool_vectorstore.as_retriever(search_kwargs={"k": 3})

def seleccionar_herramientas(query: str) -> list:
    docs = tool_retriever.invoke(query)
    return [
        herramientas[doc.metadata["name"]]
        for doc in docs
    ]

# El agente solo recibe las herramientas relevantes
class AgenteConToolRetrieval:
    def __init__(self, llm):
        self.llm = llm
        self.all_tools = {t.name: t for t in herramientas_disponibles}
    
    def invoke(self, query: str) -> str:
        tools_relevantes = seleccionar_herramientas(query)
        # Crear agente temporal con solo estas tools
        agent = create_openai_functions_agent(
            self.llm,
            tools=tools_relevantes,
            prompt=prompt_base,
        )
        executor = AgentExecutor(agent=agent, tools=tools_relevantes)
        return executor.invoke({"input": query})
```

## 6.6 Estado Persistente con Base de Datos

### SQLite para Estado de Agente

```python
import sqlite3
import json
from datetime import datetime

class PersistentAgentState:
    def __init__(self, db_path: str = "agent_state.db"):
        self.conn = sqlite3.connect(db_path)
        self._init_db()
    
    def _init_db(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS agent_sessions (
                session_id TEXT PRIMARY KEY,
                user_id TEXT,
                state JSON,
                created_at TIMESTAMP,
                updated_at TIMESTAMP,
                metadata JSON
            )
        """)
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS agent_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                key TEXT,
                value TEXT,
                embedding BLOB,
                timestamp TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES agent_sessions(session_id)
            )
        """)
        self.conn.commit()
    
    def save_session(self, session_id: str, user_id: str, state: dict):
        now = datetime.now()
        self.conn.execute(
            """INSERT OR REPLACE INTO agent_sessions 
               (session_id, user_id, state, created_at, updated_at)
               VALUES (?, ?, ?, COALESCE(
                   (SELECT created_at FROM agent_sessions WHERE session_id=?),
                   ?
               ), ?)""",
            (session_id, user_id, json.dumps(state),
             session_id, now, now)
        )
        self.conn.commit()
    
    def load_session(self, session_id: str) -> dict | None:
        cursor = self.conn.execute(
            "SELECT state FROM agent_sessions WHERE session_id=?",
            (session_id,)
        )
        row = cursor.fetchone()
        return json.loads(row[0]) if row else None
    
    def save_memory(self, session_id: str, key: str, value: str, embedding: bytes | None = None):
        self.conn.execute(
            "INSERT INTO agent_memory (session_id, key, value, embedding, timestamp) VALUES (?, ?, ?, ?, ?)",
            (session_id, key, value, embedding, datetime.now())
        )
        self.conn.commit()
    
    def recall(self, session_id: str, key: str | None = None) -> list:
        if key:
            cursor = self.conn.execute(
                "SELECT key, value, timestamp FROM agent_memory WHERE session_id=? AND key=? ORDER BY timestamp DESC",
                (session_id, key)
            )
        else:
            cursor = self.conn.execute(
                "SELECT key, value, timestamp FROM agent_memory WHERE session_id=? ORDER BY timestamp DESC",
                (session_id,)
            )
        return cursor.fetchall()
```

### Uso con LangGraph

```python
from langgraph.checkpoint.sqlite import SqliteSaver

# Checkpointer de LangGraph usa SQLite internamente
checkpointer = SqliteSaver.from_conn_string("langgraph_state.db")

# Pero podemos añadir nuestra capa de memoria personalizada
class CustomCheckpointer:
    def __init__(self):
        self.langgraph_saver = SqliteSaver.from_conn_string("lg_state.db")
        self.agent_state = PersistentAgentState("agent_memory.db")
    
    def save(self, config: dict, state: dict):
        # Guardar en LangGraph
        self.langgraph_saver.put(config, state)
        # Guardar metadata adicional
        session_id = config["configurable"]["thread_id"]
        self.agent_state.save_session(session_id, config.get("user_id"), {
            "last_state": state.get("messages", [])[-1].content if state.get("messages") else "",
            "tool_calls": len(state.get("messages", [])),
        })
```

## 6.7 Integración Completa

```python
class AgenteConMemoriaTotal:
    """
    Agente que combina:
    - Memoria buffer (últimos mensajes)
    - Memoria vectorial (búsqueda semántica)
    - Memoria persistente (base de datos)
    - Selección dinámica de herramientas
    """
    
    def __init__(self, llm, user_id: str):
        self.llm = llm
        self.user_id = user_id
        self.session_id = f"{user_id}_{datetime.now().strftime('%Y%m%d')}"
        
        # Memoria buffer
        self.buffer = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            max_token_limit=3000,
        )
        
        # Memoria vectorial
        self.vectorstore = Chroma(
            collection_name=f"user_{user_id}",
            embedding_function=OpenAIEmbeddings(),
        )
        self.vector_memory = VectorStoreRetrieverMemory(
            retriever=self.vectorstore.as_retriever(),
            memory_key="relevant_context",
        )
        
        # Memoria persistente
        self.persistent = PersistentAgentState()
        
        # Cargar estado previo
        self._load_state()
    
    def _load_state(self):
        state = self.persistent.load_session(self.session_id)
        if state:
            # Restaurar memoria buffer si existe
            pass
    
    def invoke(self, message: str) -> str:
        # 1. Obtener contexto relevante
        recent = self.buffer.load_memory_variables({})
        semantic = self.vector_memory.load_memory_variables({"input": message})
        
        # 2. Construir prompt con contexto completo
        prompt = f"""Contexto reciente: {recent.get('chat_history', '')}
        Contexto relevante: {semantic.get('relevant_context', '')}
        Usuario: {message}
        """
        
        # 3. Seleccionar herramientas relevantes
        tools = seleccionar_herramientas(message)
        
        # 4. Ejecutar agente
        agent = create_openai_functions_agent(self.llm, tools, prompt_template)
        executor = AgentExecutor(agent=agent, tools=tools)
        resultado = executor.invoke({"input": prompt})
        
        # 5. Guardar en memoria
        self.buffer.save_context({"input": message}, {"output": resultado["output"]})
        self.vector_memory.save_context({"input": message}, {"output": resultado["output"]})
        self.persistent.save_memory(self.session_id, "interaction", json.dumps({
            "input": message,
            "output": resultado["output"],
        }))
        
        return resultado["output"]
```

## 6.8 Resumen

| Tipo de Memoria | Uso | Persistencia |
|----------------|-----|-------------|
| Buffer | Últimos N mensajes | En sesión |
| Summary | Resumen cuando excede límite | En sesión |
| Vector Store | Búsqueda semántica | Base de datos |
| SQLite/DB | Estado completo del agente | Disco |
| Híbrida | Combinación de todas | Múltiples |

| Concepto de Tools | Descripción |
|------------------|-------------|
| @tool decorator | Tool simple con docstring como descripción |
| StructuredTool | Tool con esquema Pydantic de validación |
| Tool con estado | Tool que mantiene estado entre llamadas |
| Tool Retrieval | Selección dinámica de tools relevantes |
| Pipeline | Tool que compone múltiples tools |

En el próximo capítulo llevaremos todo a producción.
