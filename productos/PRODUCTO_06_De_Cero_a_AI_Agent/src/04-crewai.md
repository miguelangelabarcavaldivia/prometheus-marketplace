# Capítulo 4 — Sistemas Multi-Agente con CrewAI

## 4.1 ¿Por qué Múltiples Agentes?

Un solo agente tiene limitaciones: sesgo, agotamiento de contexto, falta de especialización. Los sistemas multi-agente imitan equipos humanos donde cada miembro tiene un rol específico.

```
Sistema Multi-Agente:
┌────────────────────────────────────────────┐
│              CREW (Equipo)                 │
│                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Rol A   │  │  Rol B   │  │  Rol C   │ │
│  │  Experto │  │  Editor  │  │  Validad │ │
│  │  Conten. │  │          │  │          │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │             │        │
│       └──────┬──────┴──────┬──────┘        │
│              ▼             ▼               │
│        ┌──────────┐  ┌──────────┐         │
│        │  Tarea 1 │  │  Tarea 2 │         │
│        │ (Escribir)│  │ (Revisar)│         │
│        └──────────┘  └──────────┘         │
└────────────────────────────────────────────┘
```

**Beneficios:**
- **Especialización**: Cada agente se enfoca en lo que mejor sabe hacer
- **Debate y validación cruzada**: Múltiples perspectivas mejoran la calidad
- **Paralelismo**: Tareas independientes se ejecutan simultáneamente
- **Escalabilidad**: El equipo crece agregando roles, no complejidad

## 4.2 Conceptos CrewAI

### Agents (Agentes)

Un agente en CrewAI tiene:

- **Role**: Su función en el equipo (Ej: "Investigador Senior")
- **Goal**: Objetivo específico (Ej: "Encontrar fuentes confiables")
- **Backstory**: Personalidad y contexto (Ej: "Eres un periodista con 10 años de experiencia")
- **Tools**: Herramientas disponibles
- **LLM**: Modelo subyacente
- **Memory**: Capacidad de recordar interacciones previas
- **Allow Delegation**: Puede pasar tareas a otros agentes

```python
from crewai import Agent
from langchain_openai import ChatOpenAI

investigador = Agent(
    role="Investigador Senior",
    goal="Encontrar información precisa y actualizada sobre el tema asignado",
    backstory=(
        "Eres un investigador experimentado con más de 15 años en "
        "periodismo de investigación. Te especializas en verificar "
        "fuentes y encontrar datos confiables. Tu reputación depende "
        "de la precisión de tu trabajo."
    ),
    tools=[search_web, extract_url_content],
    llm=ChatOpenAI(model="gpt-4o", temperature=0.3),
    memory=True,
    verbose=True,
    allow_delegation=False,
)
```

### Tasks (Tareas)

Una tarea define:

- **Description**: Qué debe hacer el agente
- **Expected Output**: Formato y contenido esperado
- **Agent**: Quién la ejecuta
- **Context**: Tareas previas cuyo output es necesario
- **Tools**: Herramientas específicas (opcional)
- **Async**: Si se ejecuta en paralelo

```python
from crewai import Task

tarea_investigar = Task(
    description=(
        "Investiga a fondo sobre: {topic}. "
        "Busca al menos 5 fuentes confiables, incluyendo "
        "artículos académicos, reportes oficiales y noticias recientes. "
        "Extrae los datos clave, estadísticas y citas textuales."
    ),
    expected_output=(
        "Un informe detallado con:\n"
        "- Resumen ejecutivo (200 palabras)\n"
        "- 5+ fuentes con enlaces y descripción\n"
        "- Datos y estadísticas clave\n"
        "- Citas textuales relevantes\n"
        "Formato: Markdown"
    ),
    agent=investigador,
    tools=[search_web, extract_url_content],
)
```

### Crew (Equipo)

El crew orquesta agentes y tareas:

```python
from crewai import Crew, Process

crew = Crew(
    agents=[investigador, escritor, editor],
    tasks=[tarea_investigar, tarea_escribir, tarea_revisar],
    process=Process.sequential,  # o Process.hierarchical
    verbose=True,
    memory=True,
    output_log_file="crew_output.log",
)
```

## 4.3 Procesos: Sequential vs Hierarchical

### Sequential Process

Las tareas se ejecutan una tras otra, en orden:

```
T1 ──→ T2 ──→ T3 ──→ FIN
```

```python
crew_seq = Crew(
    agents=[agente_a, agente_b, agente_c],
    tasks=[tarea_1, tarea_2, tarea_3],
    process=Process.sequential,
)
```

**Output de tarea anterior como contexto**:

```python
tarea_2 = Task(
    description="Usando el resultado de la investigación: {tarea_1_output}...",
    agent=agente_b,
)
```

### Hierarchical Process

Un agente "manager" coordina y delega:

```
            ┌──────────────┐
            │   Manager    │
            │ (Coordina)   │
            └──────┬───────┘
                   │
         ┌─────────┼─────────┐
         ▼         ▼         ▼
     ┌──────┐ ┌──────┐ ┌──────┐
     │ A    │ │  B   │ │  C   │
     └──────┘ └──────┘ └──────┘
```

```python
manager = Agent(
    role="Project Manager",
    goal="Coordinar el equipo para entregar resultados de alta calidad",
    backstory="Eres un PM con experiencia en equipos editoriales...",
    llm=ChatOpenAI(model="gpt-4o", temperature=0.2),
    allow_delegation=True,  # Puede delegar tareas a otros
)

crew_hierarchical = Crew(
    agents=[investigador, escritor, editor],
    tasks=[tarea_compleja],
    process=Process.hierarchical,
    manager_agent=manager,
)
```

## 4.4 Delegación entre Agentes

Un agente puede delegar subtareas a otros agentes del crew:

```python
escritor = Agent(
    role="Escritor de Contenido",
    goal="Crear contenido atractivo y bien estructurado",
    backstory="Eres un escritor creativo...",
    allow_delegation=True,  # Puede pedir ayuda
    tools=[search_web],
)

editor = Agent(
    role="Editor Senior",
    goal="Revisar y mejorar el contenido para garantizar calidad",
    backstory="Eres un editor con ojo crítico...",
    allow_delegation=False,  # No delega, solo revisa
)

# El escritor puede delegar búsquedas al investigador automáticamente
```

## 4.5 Memoria Compartida

CrewAI tiene tres tipos de memoria:

```python
from crewai.memory import Memory

crew = Crew(
    agents=agentes,
    tasks=tareas,
    memory=True,  # Habilita memoria
    memory_config={
        "short_term": {
            "storage": "in_memory",  # Memoria efímera de la sesión
        },
        "long_term": {
            "storage": "sqlite",  # Persistente entre sesiones
            "path": "crew_memory.db",
        },
        "user_memory": {
            "storage": "in_memory",  # Preferencias del usuario
        },
    },
)
```

## 4.6 Proyecto Completo: Content Creation Crew

Un equipo de 3 agentes que producen artículos de blog: Writer + Editor + Fact-Checker.

### Estructura

```
content_crew/
├── main.py
├── agents.py
├── tasks.py
├── tools.py
└── requirements.txt
```

### agents.py

```python
from crewai import Agent
from langchain_openai import ChatOpenAI

modelo = ChatOpenAI(model="gpt-4o", temperature=0.3)

writer = Agent(
    role="Content Writer Senior",
    goal=(
        "Escribir artículos atractivos, bien investigados y optimizados "
        "para SEO que enganchen al lector desde el primer párrafo"
    ),
    backstory=(
        "Eres una escritora galardonada con 8 años de experiencia en "
        "redacción de contenido tecnológico. Has escrito para TechCrunch, "
        "Wired y MIT Technology Review. Te especializas en hacer temas "
        "complejos accesibles y entretenidos. Tu estilo es claro, directo "
        "y con un toque de humor inteligente."
    ),
    llm=modelo,
    memory=True,
    verbose=True,
    allow_delegation=True,
)

editor = Agent(
    role="Editor Jefe",
    goal=(
        "Garantizar que cada artículo sea preciso, bien estructurado, "
        "y cumpla con los estándares editoriales más altos"
    ),
    backstory=(
        "Eres un editor implacable con 12 años de experiencia. Has "
        "editado para The New York Times y The Guardian. Tu ojo clínico "
        "detecta errores de estilo, estructura y precisión. Exiges "
        "excelencia pero siempre con respeto y feedback constructivo."
    ),
    llm=ChatOpenAI(model="gpt-4o", temperature=0.1),
    memory=True,
    verbose=True,
    allow_delegation=False,
)

fact_checker = Agent(
    role="Verificador de Hechos",
    goal=(
        "Verificar cada afirmación, dato y estadística en el artículo, "
        "garantizando que todo sea preciso y esté correctamente citado"
    ),
    backstory=(
        "Eres una investigadora meticulosa con formación en periodismo de "
        "datos. Tu lema es 'confía, pero verifica'. Pasaste 5 años en "
        " el equipo de fact-checking de Associated Press. No dejas pasar "
        "ni un dato sin confirmar."
    ),
    llm=ChatOpenAI(model="gpt-4o", temperature=0.0),
    memory=True,
    verbose=True,
    allow_delegation=False,
    tools=[search_web],
)
```

### tasks.py

```python
from crewai import Task

def crear_tareas(topic: str, audience: str, style: str):
    tarea_investigar = Task(
        description=(
            f"Realiza una investigación profunda sobre: {topic}\n\n"
            f"Audiencia objetivo: {audience}\n"
            f"Busca:\n"
            f"1. Datos y estadísticas actualizadas (últimos 2 años)\n"
            f"2. Opiniones de expertos y fuentes autorizadas\n"
            f"3. Casos de estudio o ejemplos concretos\n"
            f"4. Tendencias y desarrollos recientes\n"
            f"5. Controversias o debates abiertos sobre el tema\n\n"
            "Proporciona un informe completo con todas las fuentes citadas."
        ),
        expected_output=(
            "Documento de investigación en markdown con:\n"
            "- Resumen ejecutivo\n"
            "- 8+ fuentes verificadas con enlaces\n"
            "- Datos numéricos con sus fuentes\n"
            "- Citas textuales de expertos\n"
            "- Contexto histórico y tendencias"
        ),
        agent=fact_checker,
    )

    tarea_escribir = Task(
        description=(
            f"Escribe un artículo atractivo sobre: {topic}\n"
            f"Audiencia: {audience}\n"
            f"Estilo: {style}\n\n"
            "Usa la investigación proporcionada para crear contenido "
            "original, atractivo y valioso.\n\n"
            "Estructura sugerida:\n"
            "1. Título llamativo y subtítulo\n"
            "2. Introducción que enganche (gancho + tesis)\n"
            "3. 3-5 secciones con subtítulos\n"
            "4. Datos y ejemplos concretos en cada sección\n"
            "5. Conclusión con llamado a la acción\n"
            "6. Meta description (150 caracteres)\n\n"
            "Extensión: 1500-2000 palabras."
        ),
        expected_output=(
            "Artículo completo en markdown listo para publicación.\n"
            "Incluye: título, meta description, introducción, desarrollo, "
            "conclusión y CTA."
        ),
        agent=writer,
        context=[tarea_investigar],  # Output de investigación como contexto
    )

    tarea_revisar = Task(
        description=(
            "Revisa el artículo y la investigación. Verifica:\n\n"
            "1. ¿Todos los datos tienen fuente citada?\n"
            "2. ¿La estructura es lógica y fluye bien?\n"
            "3. ¿El tono es apropiado para la audiencia?\n"
            "4. ¿Hay errores factuales, de estilo o gramática?\n"
            "5. ¿El título y meta description son efectivos?\n\n"
            "Proporciona feedback detallado y una versión corregida."
        ),
        expected_output=(
            "1. Reporte de revisión con issues encontrados\n"
            "2. Versión final corregida del artículo\n"
            "3. Notas adicionales para mejora futura"
        ),
        agent=editor,
        context=[tarea_investigar, tarea_escribir],
    )

    return [tarea_investigar, tarea_escribir, tarea_revisar]
```

### main.py

```python
from crewai import Crew, Process
from agents import writer, editor, fact_checker
from tasks import crear_tareas
import json

def ejecutar_crew(topic: str, audience: str = "Profesionales tech", style: str = "Divulgativo"):
    tareas = crear_tareas(topic, audience, style)

    crew = Crew(
        agents=[fact_checker, writer, editor],
        tasks=tareas,
        process=Process.sequential,
        verbose=True,
        memory=True,
        output_log_file="content_crew.log",
    )

    resultado = crew.kickoff(
        inputs={"topic": topic}
    )

    return {
        "topic": topic,
        "final_article": resultado.tasks_output[-1].output,
        "tasks_output": [
            {
                "agent": t.agent.role,
                "output": t.output[:200] + "...",
            }
            for t in resultado.tasks_output
        ],
        "usage": resultado.token_usage,
    }

if __name__ == "__main__":
    tema = "El impacto de la IA en el desarrollo de software en 2026"
    print(f"🚀 Iniciando crew para: {tema}")
    print("=" * 60)

    resultado = ejecutar_crew(
        topic=tema,
        audience="Desarrolladores de software",
        style="Técnico-divulgativo con ejemplos prácticos",
    )

    print(f"\n📄 Artículo generado:")
    print(resultado["final_article"][:1000] + "...")

    print(f"\n📊 Resumen de tareas:")
    for t in resultado["tasks_output"]:
        print(f"  [{t['agent']}]: {t['output']}")

    print(f"\n💰 Tokens usados: {json.dumps(resultado['usage'], indent=2)}")
```

### requirements.txt

```
crewai>=0.70
langchain-openai>=0.2
python-dotenv>=1.0
duckduckgo-search>=5.0
```

## 4.7 Buenas Prácticas con CrewAI

### Diseño de Roles

```python
# BUENO: Rol específico y medible
Agente(
    role="Especialista en Datos",
    goal="Extraer y validar estadísticas relevantes",
    backstory="Eres un analista de datos...",
)

# MALO: Rol vago
Agente(
    role="Ayudante",
    goal="Ayudar en lo que sea necesario",
    backstory="Eres un ayudante...",
)
```

### Delegación Inteligente

```python
# El escritor puede delegar búsquedas específicas
escritor = Agent(
    role="Escritor",
    allow_delegation=True,
    # El manager (si existe) decide si delega
)

# Los validadores no delegan, solo ejecutan
revisor = Agent(
    role="Revisor",
    allow_delegation=False,
)
```

### Task Dependencies

```python
# Tarea 1 y 2 se ejecutan en paralelo
task_a = Task(description="...", agent=agent_a, async_execution=True)
task_b = Task(description="...", agent=agent_b, async_execution=True)

# Tarea 3 requiere ambas
task_c = Task(
    description="Usando {task_a_output} y {task_b_output}...",
    agent=agent_c,
    context=[task_a, task_b],
)
```

## 4.8 Resumen

| Concepto | Descripción |
|----------|-------------|
| Agent | Rol con objetivo, personalidad y herramientas |
| Task | Trabajo específico con descripción y output esperado |
| Crew | Equipo que orquesta agentes y tareas |
| Sequential | Tareas en secuencia lineal |
| Hierarchical | Manager coordina, agentes ejecutan |
| Delegation | Agentes pasan subtareas entre sí |
| Context | Output de tareas previas como entrada |

**Ventajas de CrewAI:**
- Diseño intuitivo (roles, tareas, equipos)
- Delegación automática entre agentes
- Memoria integrada (corto y largo plazo)
- Ideal para flujos editoriales y de contenido

En el próximo capítulo veremos AutoGen para agentes conversacionales.
