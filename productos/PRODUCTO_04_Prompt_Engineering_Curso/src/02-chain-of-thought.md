# Módulo 2: Chain-of-Thought & Razonamiento

## 2.1 Zero-Shot Chain-of-Thought

El _prompting_ "piensa paso a paso" activa cadenas de razonamiento implícitas sin necesidad de ejemplos.

```python
# Ejemplo 2.1: Zero-shot CoT para debugging
def debug_con_cot(codigo: str, error: str) -> str:
    prompt = f"""
Tengo este código que lanza el siguiente error:

CÓDIGO:
```python
{codigo}
```

ERROR:
{error}

Piensa paso a paso para identificar la causa raíz.
1. Primero, analiza qué debería hacer el código
2. Identifica dónde el comportamiento real se desvía del esperado
3. Examina cada línea sospechosa con una hipótesis
4. Propón la corrección

Devuelve: (a) análisis paso a paso, (b) código corregido, (c) tests que verifican la solución
"""
    return prompt

codigo_problematico = """
import asyncio
from typing import List

async def fetch_all(urls: List[str]) -> List[dict]:
    results = []
    for url in urls:
        data = await fetch_single(url)
        results.append(data)
    return results

async def fetch_single(url: str) -> dict:
    # Simula llamada HTTP
    await asyncio.sleep(0.1)
    return {"url": url, "status": 200}

async def main():
    urls = ["http://a.com", "http://b.com", "http://c.com"]
    result = asyncio.run(fetch_all(urls))
    print(result)
"""
# El error: asyncio.run() no puede llamarse dentro de un contexto async existente
```

### El Gatillo "Paso a Paso"

```python
# Ejemplo 2.2: Gatillos comprobados para activar CoT
GATILLOS_COT = [
    "Piensa paso a paso.",
    "Razona cuidadosamente antes de responder.",
    "Vamos a pensar en esto paso a paso para asegurar precisión.",
    "Desglosa el problema en subproblemas y resuelve cada uno.",
    "Primero entiende el problema, luego diseña la solución.",
]

def generar_con_razonamiento(tarea: str, lenguaje: str = "Python") -> str:
    prompt = f"""Tarea: {tarea}
Lenguaje: {lenguaje}

Piensa paso a paso:

Paso 1 - Análisis del problema:
Paso 2 - Diseño de la solución:
Paso 3 - Implementación:
Paso 4 - Verificación:

Después de tu razonamiento, proporciona el código completo.
"""
    return prompt
```

## 2.2 Few-Shot Chain-of-Thought

Proporcionar ejemplos de razonamiento mejora la calidad, especialmente en problemas complejos.

```python
# Ejemplo 2.3: Few-shot CoT para diseño de algoritmos
FEW_SHOT_COT = """
Ejemplo 1:
Pregunta: Diseña un algoritmo para detectar ciclos en un grafo dirigido.
Razonamiento:
1. Un ciclo en un grafo dirigido significa que existe un camino que empieza y termina en el mismo nodo
2. DFS es apropiado porque podemos rastrear el camino actual
3. Si durante DFS encontramos un nodo que ya está en el camino actual, hay ciclo
4. Necesitamos un conjunto para nodos visitados (global) y otro para el camino actual
5. Complejidad: O(V+E) tiempo, O(V) espacio
Código:
def has_cycle(graph: dict[int, list[int]]) -> bool:
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node: WHITE for node in graph}
    
    def dfs(node: int) -> bool:
        if color[node] == GRAY:
            return True
        if color[node] == BLACK:
            return False
        color[node] = GRAY
        for neighbor in graph[node]:
            if dfs(neighbor):
                return True
        color[node] = BLACK
        return False
    
    return any(dfs(node) for node in graph)

Ejemplo 2:
Pregunta: Implementa un LRU Cache con O(1) en get y put.
Razonamiento:
1. LRU = Least Recently Used: cuando el caché está lleno, elimina el elemento menos recientemente usado
2. O(1) sugiere hash map + lista doblemente enlazada
3. El hash map almacena {clave: nodo} para acceso O(1)
4. La lista enlazada mantiene el orden de uso: head = más reciente, tail = menos reciente
5. En get(): mover nodo a head. En put(): si existe, actualizar y mover a head; si no, crear nodo, añadir a head, si excede capacidad, eliminar tail
Código:
[omitted for brevity - ver solución completa]
"""

def algoritmo_con_razonamiento(problema: str) -> str:
    prompt = f"""{FEW_SHOT_COT}

Ahora resuelve este problema usando el mismo formato de razonamiento:

Pregunta: {problema}
Razonamiento:
"""
    return prompt
```

## 2.3 Self-Consistency

La autoconsistencia ejecuta el mismo prompt múltiples veces y selecciona la respuesta más común (votación mayoritaria).

```python
# Ejemplo 2.4: Self-consistency para generación de código
import json
from collections import Counter
from openai import OpenAI

client = OpenAI()

def self_consistency_codigo(
    prompt: str,
    n_muestras: int = 5,
    temperatura: float = 0.4
) -> tuple[str, dict]:
    """
    Genera N soluciones y selecciona la más consistente.
    Útil para algoritmos complejos donde una sola ejecución puede fallar.
    """
    respuestas = []

    for i in range(n_muestras):
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=temperatura,
            top_p=0.9,
        )
        respuestas.append(response.choices[0].message.content)

    # Extraer firmas de funciones como "fingerprint"
    firmas = []
    for r in respuestas:
        # Extraer def function_name(...) -> ...:
        lineas = r.split("\n")
        for linea in lineas:
            if linea.strip().startswith("def "):
                firmas.append(linea.strip())
                break

    # Votación: la firma más frecuente gana
    if firmas:
        ganadora = Counter(firmas).most_common(1)[0][0]
        # Encontrar la respuesta completa correspondiente
        for r in respuestas:
            for linea in r.split("\n"):
                if linea.strip() == ganadora:
                    return r, {"votos": firmas, "ganadora": ganadora}

    return respuestas[0], {"votos": firmas, "ganadora": None}


# Ejemplo: ordenamiento topológico
prompt_ejemplo = """
Implementa una función topological_sort(graph) que reciba un grafo dirigido
como dict[int, list[int]] y devuelva una lista con el orden topológico.
Usa el algoritmo de Kahn (BFS con grados de entrada).
Incluye type hints y manejo de errores para grafos con ciclos.
"""

solucion, metadatos = self_consistency_codigo(prompt_ejemplo, n_muestras=3)
print(f"Solución ganadora (firma: {metadatos['ganadora']}):")
print(solucion)
```

## 2.4 Aplicaciones Prácticas

### Debugging Sistemático

```python
# Ejemplo 2.5: Debugging con CoT estructurado
def debug_cot(traceback_str: str, codigo: str, contexto: str) -> list[dict]:
    """
    Pipeline de debugging en 3 etapas usando CoT.
    """
    etapa1_hipotesis = f"""
Contexto: {contexto}
Código: {codigo}
Error: {traceback_str}

Paso 1: Genera 3 hipótesis de causa raíz.
Para cada hipótesis explica POR QUÉ podría causar el error.
"""
    etapa2_verificacion = f"""
Hipótesis a verificar:
1. ...
2. ...
3. ...

Paso 2: Para cada hipótesis, describe qué prueba específica la confirmaría o refutaría.
Sé concreto: qué log añadir, qué test unitario escribir, qué variable inspeccionar.
"""
    etapa3_solucion = f"""
Hipótesis confirmada: [la correcta]

Paso 3: Propón la corrección e implementa el fix.
Incluye:
- Código corregido (diff)
- Test que previene la regresión
- Logging adicional si aplica
"""
    return [
        {"role": "user", "content": etapa1_hipotesis},
        {"role": "user", "content": etapa2_verificacion},
        {"role": "user", "content": etapa3_solucion},
    ]
```

### Refactorización Guiada

```python
def refactor_cot(clase_origen: str, patron_destino: str) -> str:
    return f"""
Voy a refactorizar esta clase aplicando el patrón {patron_destino}.

CLASE ORIGINAL:
```python
{clase_origen}
```

PASO 1: Analiza la clase original. Identifica:
- Responsabilidades actuales (SRP)
- Acoplamiento y cohesión
- Código duplicado
- Dependencias ocultas

PASO 2: Diseña la nueva estructura:
- Interfaces/ABCs necesarios
- División de responsabilidades
- Nuevas relaciones entre clases

PASO 3: Implementa:
- Código refactorizado completo
- Migración mínima necesaria

PASO 4: Verifica:
- Equivalencia funcional con la original
- Tests que cubren la nueva estructura
"""
```

## 2.5 Ejercicios

### Ejercicio 2.1: CoT para Algoritmo Complejo
Usa few-shot CoT para implementar un **algoritmo de Dijkstra** con cola de prioridad. Incluye el razonamiento paso a paso.

### Ejercicio 2.2: Debugging Multietapa
Toma el siguiente código buggado y usa el pipeline de 3 etapas (hipótesis → verificación → solución) para encontrar y corregir el error:

```python
def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    intervals.sort(key=lambda x: x[0])
    merged = []
    for interval in intervals:
        if not merged or merged[-1][1] < interval[0]:
            merged.append(interval)
        else:
            merged[-1][1] = max(merged[-1][1], interval[1])
    return merged
```
(Pista: hay un bug cuando intervals está vacío)

### Ejercicio 2.3: Self-Consistency Runner
Implementa una función `self_consistency_runner(prompt, n=10, threshold=0.6)` que:
- Ejecuta el prompt N veces
- Agrupa respuestas por similitud estructural (firma de función + número de líneas)
- Retorna solo respuestas con frecuencia > threshold
- Incluye un reporte de confianza

### Ejercicio 2.4: CoT para Code Review
Crea un prompt que realice code review usando CoT. El prompt debe:
- Recibir un diff de código
- Analizar cada línea cambiada
- Evaluar impacto en: rendimiento, seguridad, mantenibilidad
- Generar un reporte estructurado con severidad (critical/major/minor)

### Ejercicio 2.5: Árbol de Razonamiento para Arquitectura
Usa CoT para diseñar la arquitectura de un sistema de procesamiento de pagos que debe manejar:
- 10,000 transacciones/minuto
- Duplicación de eventos (al menos una vez)
- Fallos parciales de proveedores externos
- Auditoría completa

---

**Soluciones en:** `exercises/module-2-solutions.md`
