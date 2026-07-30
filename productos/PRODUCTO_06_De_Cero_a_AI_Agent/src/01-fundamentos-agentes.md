# Capítulo 1 — Fundamentos de Agentes de IA

## 1.1 ¿Qué hace que un sistema sea un agente?

Un agente de IA se define por tres capacidades fundamentales:

### Percepción (Observation)

El agente recibe información de su entorno. Esto puede ser:

- Mensajes de texto del usuario
- Resultados de consultas a bases de datos
- Respuestas de APIs externas
- Contenido de archivos
- Estado actual del sistema

```python
from datetime import datetime
from dataclasses import dataclass, field

@dataclass
class Percepcion:
    mensaje_usuario: str | None = None
    timestamp: datetime = field(default_factory=datetime.now)
    contexto_archivo: str | None = None
    resultados_api: dict | None = None
```

### Razonamiento (Reasoning)

El cerebro del agente. Usa un LLM para:

- Interpretar la percepción
- Descomponer el problema en pasos
- Decidir qué acción tomar
- Evaluar resultados previos

```python
import json

def razonar(llm, percepcion: Percepcion, historial: list[str]) -> str:
    prompt = f"""Eres un agente de IA. Basado en:
    Mensaje: {percepcion.mensaje_usuario}
    Historial: {historial[-5:]}
    
    ¿Cuál es el siguiente paso? Responde en JSON:
    {{"accion": "nombre_herramienta", "argumentos": {{...}} }}"""
    
    respuesta = llm.invoke(prompt)
    return json.loads(respuesta.content)
```

### Acción (Action)

Ejecutar una acción concreta en el entorno:

- Llamar una API
- Ejecutar código Python
- Escribir en un archivo
- Enviar un email
- Responder al usuario

```python
def actuar(accion: str, argumentos: dict) -> str:
    herramientas = {
        "buscar_web": buscar_web,
        "calcular": calculadora,
        "leer_archivo": leer_archivo,
        "responder": responder_usuario,
    }
    herramienta = herramientas[accion]
    return herramienta(**argumentos)
```

## 1.2 El Ciclo del Agente

El bucle fundamental de cualquier agente es:

```
   ┌──────────┐
   │ OBSERVAR │ ← Recibir input del entorno
   └────┬─────┘
        ▼
   ┌──────────┐
   │  PENSAR  │ ← LLM decide qué hacer
   └────┬─────┘
        ▼
   ┌──────────┐
   │  ACTUAR  │ ← Ejecutar herramienta
   └────┬─────┘
        ▼
   ┌──────────┐
   │ OBSERVAR │ ← Ver resultado de la acción
   └────┬─────┘
        ▼
   ┌──────────┐
   │ EVALUAR  │ ← ¿Tarea completa?
   └────┬─────┘
        │
   ┌────┴────┐
   │  SÍ   NO│──→ Volver a PENSAR
   └─────────┘
        │
        ▼
    ┌────────┐
    │  FIN   │
    └────────┘
```

Implementación mínima de este ciclo:

```python
def ciclo_agente(llm, herramientas: dict, tarea: str, max_iter: int = 10):
    mensajes = [{"role": "user", "content": tarea}]
    
    for i in range(max_iter):
        # 1. PENSAR
        respuesta = llm.invoke(mensajes)
        decision = parsear_accion(respuesta.content)
        
        # 2. EVALUAR: si responde directamente, terminamos
        if decision["tipo"] == "respuesta_final":
            return decision["contenido"]
        
        # 3. ACTUAR
        herramienta = herramientas[decision["accion"]]
        resultado = herramienta(**decision["argumentos"])
        
        # 4. OBSERVAR
        mensajes.append({
            "role": "user",
            "content": f"Resultado de {decision['accion']}: {resultado}"
        })
    
    return "Número máximo de iteraciones alcanzado."
```

## 1.3 Tipos de Agentes

### Agentes Reactivos (Reflex Agents)

Mapean directamente percepción → acción sin estado interno. Son rápidos pero limitados.

```
INPUT ──→ REGLAS ──→ OUTPUT
         SI X → Y
         SI Z → W
```

```python
class AgenteReactivo:
    def __init__(self):
        self.reglas = {
            "saludo": lambda _: "¡Hola! ¿En qué puedo ayudarte?",
            "despedida": lambda _: "¡Hasta luego!",
        }
    
    def procesar(self, mensaje: str) -> str:
        if "hola" in mensaje.lower():
            return self.reglas["saludo"](mensaje)
        elif "adiós" in mensaje.lower():
            return self.reglas["despedida"](mensaje)
        return "No entendí. ¿Puedes reformular?"
```

### Agentes Basados en Metas (Goal-Based Agents)

Además de percibir y actuar, tienen un objetivo explícito. Evalúan cómo cada acción los acerca a la meta.

```python
class AgenteGoalBased:
    def __init__(self, meta: str, llm):
        self.meta = meta
        self.llm = llm
        self.plan: list[str] = []
    
    def planificar(self) -> list[str]:
        prompt = f"""Objetivo: {self.meta}
        Genera un plan paso a paso para lograrlo.
        Formato: 1. acción, 2. acción, ..."""
        respuesta = self.llm.invoke(prompt)
        self.plan = respuesta.content.strip().split("\n")
        return self.plan
    
    def ejecutar_paso(self, paso: int) -> bool:
        accion = self.plan[paso]
        resultado = ejecutar(accion)
        return evaluar_progreso(resultado, self.meta)
```

### Agentes Basados en Utilidad (Utility-Based Agents)

Asignan una "utilidad" (score) a cada posible acción y eligen la que maximiza el resultado esperado.

```python
def utilidad(accion: str, estado: dict) -> float:
    scores = {
        "buscar_web": 0.7 if not estado.get("info") else 0.2,
        "calcular": 0.9 if estado.get("datos_numericos") else 0.1,
        "preguntar_usuario": 0.5 if estado.get("ambiguedad") else 0.3,
    }
    return scores.get(accion, 0.0)

def mejor_accion(acciones: list[str], estado: dict) -> str:
    return max(acciones, key=lambda a: utilidad(a, estado))
```

### Agentes de Aprendizaje (Learning Agents)

Mejoran su comportamiento con la experiencia. Almacenan resultados previos y ajustan su estrategia.

```python
class AgenteAprendizaje:
    def __init__(self):
        self.experiencia: list[dict] = []
        self.tasa_exito: dict[str, float] = {}
    
    def registrar(self, accion: str, exito: bool):
        self.experiencia.append({"accion": accion, "exito": exito})
        exits = [e for e in self.experiencia if e["accion"] == accion]
        self.tasa_exito[accion] = sum(
            1 for e in exits if e["exito"]
        ) / len(exits)
    
    def seleccionar_accion(self, opciones: list[str]) -> str:
        return max(opciones, key=lambda a: self.tasa_exito.get(a, 0.5))
```

## 1.4 Tool Use y Function Calling

La capacidad de usar herramientas es lo que transforma un LLM en un agente. El **function calling** es el mecanismo estándar que los LLMs modernos ofrecen para esto.

### Cómo funciona Function Calling

```
LLM recibe: prompt + descripción de herramientas disponibles
LLM decide: "necesito llamar la herramienta X con argumentos Y"
LLM devuelve: JSON estructurado con {nombre: X, args: Y}
Sistema ejecuta: resultado = herramienta_X(**Y)
Sistema envía: resultado al LLM para continuar
```

### Definición de esquema de herramienta

```python
herramientas = [
    {
        "type": "function",
        "function": {
            "name": "buscar_clima",
            "description": "Obtiene el clima actual de una ciudad",
            "parameters": {
                "type": "object",
                "properties": {
                    "ciudad": {
                        "type": "string",
                        "description": "Nombre de la ciudad"
                    }
                },
                "required": ["ciudad"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calcular",
            "description": "Ejecuta una operación matemática",
            "parameters": {
                "type": "object",
                "properties": {
                    "expresion": {
                        "type": "string",
                        "description": "Expresión matemática (ej: 2 + 2)"
                    }
                },
                "required": ["expresion"]
            }
        }
    }
]
```

### Implementación manual de function calling

```python
import json
import requests

def ejecutar_function_calling(llm, mensaje_usuario: str, herramientas: list[dict]):
    mensajes = [{"role": "user", "content": mensaje_usuario}]
    
    respuesta = llm.invoke(
        mensajes,
        tools=herramientas,
        tool_choice="auto"
    )
    
    if respuesta.tool_calls:
        for tool_call in respuesta.tool_calls:
            nombre = tool_call.function.name
            args = json.loads(tool_call.function.arguments)
            
            if nombre == "buscar_clima":
                resultado = obtener_clima(args["ciudad"])
            elif nombre == "calcular":
                resultado = eval(args["expresion"])
            
            mensajes.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(resultado)
            })
        
        respuesta_final = llm.invoke(mensajes)
        return respuesta_final.content
    
    return respuesta.content


def obtener_clima(ciudad: str) -> str:
    api_key = os.getenv("OPENWEATHER_API_KEY")
    url = f"https://api.openweathermap.org/data/2.5/weather?q={ciudad}&appid={api_key}"
    resp = requests.get(url)
    data = resp.json()
    return f"{ciudad}: {data['weather'][0]['description']}, {data['main']['temp']}K"
```

## 1.5 Arquitectura de Referencia

```
┌─────────────────────────────────────────────────────────┐
│                    AGENTE DE IA                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │  LLM     │  │ Memoria  │  │ Orquestador (cerebro)  │ │
│  │ (GPT-4, │←→│ (Buffer, │←→│ - Planificación        │ │
│  │  Claude,│  │  Vector) │  │ - Descomposición       │ │
│  │  Llama) │  │          │  │ - Evaluación           │ │
│  └─────────┘  └──────────┘  └───────┬────────────────┘ │
│                                      │                  │
│  ┌───────────────────────────────────┴──────────────┐  │
│  │              TOOL REGISTRY                        │  │
│  │  ┌────────┐ ┌───────┐ ┌────────┐ ┌───────────┐  │  │
│  │  │ Web    │ │ Código│ │ Bases  │ │ APIs      │  │  │
│  │  │ Search │ │ Exec  │ │ de     │ │ Externas  │  │  │
│  │  │        │ │       │ │ Datos  │ │           │  │  │
│  │  └────────┘ └───────┘ └────────┘ └───────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 1.6 Resumen

| Concepto | Descripción |
|----------|-------------|
| Percepción | Input del entorno (texto, APIs, archivos) |
| Razonamiento | LLM como cerebro que decide qué hacer |
| Acción | Llamada a herramientas externas |
| Ciclo | Observar → Pensar → Actuar → Evaluar |
| Function Calling | Mecanismo LLM para invocar herramientas |
| Tipos | Reactivo, Goal-based, Utility, Learning |

En el próximo capítulo implementaremos estos conceptos con LangChain.
