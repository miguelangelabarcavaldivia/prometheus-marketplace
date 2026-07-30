# Soluciones — Módulo 1: Fundamentos

## Ejercicio 1.1: Constructor de Prompts

```python
from typing import Optional

def build_prompt(
    role: Optional[str] = None,
    task: str = "",
    context: Optional[str] = None,
    output_format: Optional[str] = None,
    constraints: Optional[list[str]] = None,
) -> str:
    partes = []

    if role:
        partes.append(f"<rol>{role}</rol>")
    partes.append(f"<tarea>{task}</tarea>")
    if context:
        partes.append(f"\n<contexto>{context}</contexto>")
    if output_format:
        partes.append(f"\n<formato>{output_format}</formato>")
    if constraints:
        restricciones = "\n".join(f"- {c}" for c in constraints)
        partes.append(f"\n<restricciones>\n{restricciones}\n</restricciones>")

    return "\n\n".join(partes)

# Uso
prompt = build_prompt(
    role="Senior Python Developer",
    task="Implementar merge sort genérico con type hints",
    context="El código debe ser reusable para cualquier tipo comparable",
    output_format="Código Python con doctests",
    constraints=["No usar librerías externas", "Máximo 30 líneas"],
)
print(prompt)
```

## Ejercicio 1.2: Optimización de Temperatura

```python
from openai import OpenAI

client = OpenAI()

def generar_con_temperatura(prompt: str, temp: float) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=temp,
    )
    return response.choices[0].message.content

prompt = """
Escribe una función en Python que ordene una lista de diccionarios
por múltiples claves. Por ejemplo:
data = [{"name": "John", "age": 30}, {"name": "Alice", "age": 25}]
sort_by_keys(data, ["age", "name"]) debe retornar ordenado por edad y luego por nombre.
"""

for temp in [0.0, 0.5, 1.0, 1.5]:
    print(f"\n=== Temperatura {temp} ===")
    codigo = generar_con_temperatura(prompt, temp)
    print(codigo[:300])
    print("...")

# Observación: A temp 0.0 el código es prácticamente idéntico cada vez.
# A temp 1.5, los nombres de variables y estructura varían significativamente.
```

## Ejercicio 1.3: Token Budget Analyzer

```python
import tiktoken

def analyze_prompt_budget(prompt: str, modelo: str = "gpt-4") -> dict:
    encoding = tiktoken.encoding_for_model(modelo)
    tokens = encoding.encode(prompt)
    total = len(tokens)

    # Precios GPT-4
    precio_input = 0.03 / 1000
    precio_output = 0.06 / 1000

    # Estimar costo de output (asumiendo respuesta de longitud similar)
    costo_input = total * precio_input
    costo_output_estimado = (total // 2) * precio_output

    return {
        "modelo": modelo,
        "tokens_input": total,
        "tokens_output_estimado": total // 2,
        "costo_input": round(costo_input, 6),
        "costo_output_estimado": round(costo_output_estimado, 6),
        "costo_total_estimado": round(costo_input + costo_output_estimado, 6),
        "cabe_en_contexto": total < 128000,
        "contexto_restante": 128000 - total,
    }

prompt_test = """
<rol>Senior Backend Engineer</rol>
<tarea>Implementar un sistema de caché distribuido</tarea>
""" * 50  # Simular prompt largo

analisis = analyze_prompt_budget(prompt_test)
for k, v in analisis.items():
    print(f"{k}: {v}")
```

## Ejercicio 1.4: Prompt A/B Tester

```python
from openai import OpenAI

client = OpenAI()

# Versión A: Sin estructura
version_a = "Crea una API CRUD de usuarios con FastAPI."

# Versión B: Con RTCFC
version_b = """
<rol>Senior Backend Engineer especializado en FastAPI</rol>
<tarea>Crea una API CRUD completa para gestión de usuarios</tarea>
<contexto>
- Proyecto existente con FastAPI + SQLAlchemy + PostgreSQL
- Los usuarios tienen: id, email, name, role, is_active, created_at
- Autenticación JWT ya implementada en otro módulo
</contexto>
<formato>
Código completo con: models.py, schemas.py, endpoints.py, service.py
Incluye validación Pydantic v2 y manejo de errores consistente
</formato>
<restricciones>
- No usar librerías externas além de FastAPI, SQLAlchemy, Pydantic
- Todos los endpoints requieren autenticación (dependency)
- Soft delete en lugar de DELETE físico
- Paginación cursor-based
</restricciones>
"""

def test_consistencia(prompt: str, nombre: str, ejecuciones: int = 3):
    resultados = []
    for _ in range(ejecuciones):
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        resultados.append(response.choices[0].message.content)

    # Verificar consistencia estructural
    estructuras = []
    for r in resultados:
        lineas = [l for l in r.split("\n") if l.strip().startswith(("def ", "class ", "@"))]
        estructuras.append(lineas[:5])

    print(f"\n=== {nombre} ===")
    for i, est in enumerate(estructuras):
        print(f"Ejecución {i+1}: {len(est)} definiciones")
        for e in est:
            print(f"  {e}")

test_consistencia(version_a, "Versión A (sin estructura)")
test_consistencia(version_b, "Versión B (con RTCFC)")
```

## Ejercicio 1.5: Extractor de Parámetros

```python
import re

def extract_prompt_components(prompt: str) -> dict:
    """
    Extrae los componentes de un prompt usando regex.
    Soporta formato <tags> y formato natural.
    """
    componentes = {}

    # Formato con tags XML
    tags = {
        "rol": r"<rol>(.*?)</rol>",
        "tarea": r"<tarea>(.*?)</tarea>",
        "contexto": r"<contexto>(.*?)</contexto>",
        "formato": r"<formato>(.*?)</formato>",
    }

    for nombre, patron in tags.items():
        match = re.search(patron, prompt, re.DOTALL)
        if match:
            componentes[nombre] = match.group(1).strip()

    # Restricciones (formato lista)
    restricciones = re.findall(r"<restricciones>(.*?)</restricciones>", prompt, re.DOTALL)
    if restricciones:
        items = re.findall(r"[•\-*]\s*(.*?)(?:\n|$)", restricciones[0])
        componentes["restricciones"] = items if items else [restricciones[0].strip()]

    # Fallback: detección natural (sin tags)
    if not componentes:
        if "eres" in prompt.lower():
            match = re.search(r"(?:eres|actúa como|actua como|como)\s+(.+?)[\.\n]", prompt, re.IGNORECASE)
            if match:
                componentes["rol_detectado"] = match.group(1).strip()
        if "tarea" in prompt.lower() or "necesito" in prompt.lower():
            componentes["tarea_detectada"] = prompt[:200]

    return componentes

# Test
prompt_ejemplo = """
<rol>Senior Data Engineer</rol>
<tarea>Diseñar un pipeline ETL para datos de ventas</tarea>
<contexto>Fuente: API de Shopify. Destino: Snowflake. Volumen: 1M registros/día</contexto>
<formato>Código Python con Prefect y dbt</formato>
<restricciones>
- No duplicar registros (idempotente)
- Manejar rate limiting de la API
</restricciones>
"""

componentes = extract_prompt_components(prompt_ejemplo)
for k, v in componentes.items():
    print(f"{k}: {v}")
```
