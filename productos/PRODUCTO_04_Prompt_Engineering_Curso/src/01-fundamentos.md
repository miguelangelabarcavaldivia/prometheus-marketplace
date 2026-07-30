# Módulo 1: Fundamentos de Prompt Engineering para Desarrolladores

## 1.1 Anatomía de un Prompt

Un _prompt_ efectivo tiene seis componentes fundamentales. No todos son obligatorios, pero combinarlos estratégicamente produce resultados muy superiores.

| Componente | Descripción | ¿Obligatorio? |
|-----------|-------------|:---:|
| **Rol** | La identidad que debe adoptar el LLM | No |
| **Tarea** | La acción específica que debe realizar | Sí |
| **Contexto** | Información relevante de fondo | Recomendado |
| **Formato** | Estructura esperada de la respuesta | Recomendado |
| **Restricciones** | Límites, reglas o exclusiones | No |
| **Ejemplos** | Demostraciones del resultado deseado | No (ver Módulo 3) |

```python
# Ejemplo 1.1: Anatomía completa
prompt = f"""
<rol>Eres un senior backend engineer experto en Python y FastAPI.</rol>
<tarea>Genera un endpoint REST que valide y procese un webhook de Stripe.</tarea>
<contexto>
- El webhook llega con eventos: checkout.session.completed, invoice.paid, customer.subscription.updated
- Cada evento debe persistirse en PostgreSQL antes de procesarse
- El proyecto usa FastAPI 0.104+, SQLAlchemy 2.0, Pydantic v2
</contexto>
<formato>
Devuelve solo código Python con type hints. Incluye el modelo Pydantic, el handler del evento y el endpoint.
</formato>
<restricciones>
- No uses try-except genéricos, usa handlers específicos de HTTPException
- Máximo 80 líneas de código
- Los secretos deben leerse de variables de entorno
</restricciones>
"""
```

## 1.2 Temperatura y Parámetros de Inferencia

Entender estos parámetros es crucial para obtener resultados predecibles:

```python
from openai import OpenAI

client = OpenAI()

def generar_codigo(prompt: str, temperatura: float = 0.2) -> str:
    """
    Temperatura baja (0.0-0.3): código determinista, seguro para producción.
    Temperatura media (0.4-0.7): balance entre creatividad y precisión.
    Temperatura alta (0.8-1.5): útil para brainstorming, inseguro para código.
    """
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=temperatura,
        top_p=0.9,       # Nucleus sampling: considera tokens con 90% de probabilidad acumulada
        frequency_penalty=0.0,  # Evita repetición de tokens (útil en código largo)
        presence_penalty=0.0,   # Fomenta introducir nuevos topics
        max_tokens=4096,
    )
    return response.choices[0].message.content

# Para tareas críticas (producción), usa temperature=0.0
codigo_produccion = generar_codigo(
    "Escribe una función que calcule el factorial de forma recursiva con type hints.",
    temperatura=0.0
)
```

### Mapa de Temperatura por Tarea

| Tarea | Temperatura | top_p | Razón |
|-------|:-----------:|:-----:|-------|
| Generación de tests | 0.0 - 0.1 | 0.9 | Requiere precisión |
| Refactorización | 0.1 - 0.2 | 0.9 | Cambios controlados |
| Documentación | 0.3 - 0.5 | 0.95 | Balance creativo |
| Algoritmos nuevos | 0.5 - 0.7 | 0.95 | Exploración |
| Brainstorming arquitectura | 0.7 - 1.0 | 1.0 | Creatividad máxima |

## 1.3 El Patrón Role-Task-Context-Format-Constraints

Este patrón (RTCFC) es la base de todo _prompting_ estructurado. Aplícalo siempre.

```python
# Ejemplo 1.2: Refactorización con RTCFC
def refactorizar_codigo(codigo_fuente: str, objetivo: str) -> str:
    sistema = "Eres un refactoring specialist con 15 años de experiencia."
    prompt = f"""
TAREA: Refactoriza el siguiente código para mejorar {objetivo}.

CONTEXTO:
- Es parte de un microservicio en producción
- Debe mantener compatibilidad hacia atrás
- El equipo usa convenciones de Google Python Style Guide

CÓDIGO A REFACTORIZAR:
```python
{codigo_fuente}
```

FORMATO:
- Devuelve solo el código refactorizado completo
- Incluye type hints en todas las funciones
- Agrega docstrings estilo Google
- Marca los cambios con comentarios # REFACTOR:

RESTRICCIONES:
- No cambies la firma de la API pública
- Mantén el mismo nivel de abstracción
"""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": sistema},
            {"role": "user", "content": prompt}
        ],
        temperature=0.15
    )
    return response.choices[0].message.content
```

## 1.4 Entendiendo el Comportamiento del LLM

### Tokenización y Context Window

```python
# Ejemplo 1.3: Cálculo de tokens y chunks
import tiktoken

def contar_tokens(texto: str, modelo: str = "gpt-4") -> int:
    encoding = tiktoken.encoding_for_model(modelo)
    tokens = encoding.encode(texto)
    return len(tokens)

def chunk_codigo(archivo: str, max_tokens: int = 3000) -> list[str]:
    """Divide un archivo grande en chunks que caben en el contexto."""
    with open(archivo, "r") as f:
        codigo = f.read()

    encoding = tiktoken.encoding_for_model("gpt-4")
    tokens = encoding.encode(codigo)

    chunks = []
    for i in range(0, len(tokens), max_tokens):
        chunk_tokens = tokens[i:i + max_tokens]
        chunk_texto = encoding.decode(chunk_tokens)
        chunks.append(chunk_texto)

    return chunks

# Uso: dividir un archivo grande para review
chunks = chunk_codigo("src/services/payment_processor.py")
for idx, chunk in enumerate(chunks):
    print(f"Chunk {idx + 1}: {contar_tokens(chunk)} tokens")
```

### El Problema de la Atención

Los LLMs tienen **atención limitada**. La información al principio y al final del contexto se recuerda mejor que la del medio.

```python
# Ejemplo 1.4: Estructura óptima del prompt
def prompt_optimizado(contexto_largo: str, pregunta: str) -> list[dict]:
    """
    Estructura un prompt grande para maximizar la retención:
    1. Instrucción + pregunta al FINAL (recencia)
    2. Contexto crítico al PRINCIPIO (primacía)
    3. Contexto menos importante en el MEDIO
    """
    return [
        {"role": "system", "content": "Eres un asistente de codificación preciso."},
        {"role": "user", "content": f"""
CONTEXTO PRINCIPAL (información crítica):
{contexto_largo[:2000]}

CONTEXTO SECUNDARIO:
{contexto_largo[2000:4000]}

PREGUNTA:
{pregunta}

Responde basándote principalmente en el CONTEXTO PRINCIPAL.
"""}
    ]
```

## 1.5 Ejercicios

### Ejercicio 1.1: Constructor de Prompts
Crea una función `build_prompt(role, task, context, output_format, constraints)` que construya automáticamente un prompt estructurado usando el patrón RTCFC.

### Ejercicio 1.2: Optimización de Temperatura
Escribe un script que genere la misma función (ordenar una lista de diccionarios por múltiples claves) con temperaturas 0.0, 0.5, 1.0, y 1.5. Compara los resultados.

### Ejercicio 1.3: Token Budget Analyzer
Crea una herramienta que reciba un prompt y calcule:
- Número total de tokens
- Tokens por sección (rol, tarea, contexto, etc.)
- Costo estimado (usa precios de GPT-4: $0.03/1K input, $0.06/1K output)
- Recomendación de si el prompt cabe en el contexto

### Ejercicio 1.4: Prompt A/B Tester
Escribe dos versiones del mismo prompt para generar una API CRUD de usuarios:
- Versión A: sin estructura (solo la tarea)
- Versión B: con RTCFC completo
Ejecuta ambas 3 veces y compara la consistencia de los resultados.

### Ejercicio 1.5: Extractor de Parámetros
Crea un parser que extraiga automáticamente los componentes (rol, tarea, contexto, formato, restricciones) de un prompt dado usando expresiones regulares.

---

**Soluciones en:** `exercises/module-1-solutions.md`
