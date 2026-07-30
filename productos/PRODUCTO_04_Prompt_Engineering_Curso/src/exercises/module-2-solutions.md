# Soluciones — Módulo 2: Chain-of-Thought & Razonamiento

## Ejercicio 2.1: CoT para Dijkstra

```python
from openai import OpenAI
import heapq

client = OpenAI()

prompt_dijkstra = """
Voy a implementar Dijkstra con cola de prioridad paso a paso.

Paso 1 - Análisis del problema:
Dijkstra encuentra el camino más corto desde un nodo origen a todos los demás en un grafo con pesos no negativos.
Usamos BFS con una cola de prioridad (min-heap) en lugar de una cola FIFO.

Paso 2 - Estructura de datos:
- grafo: dict[str, list[tuple[str, int]]] — lista de adyacencia con (vecino, peso)
- distancias: dict[str, int] — distancia más corta conocida desde origen
- heap: list[tuple[int, str]] — (distancia_acumulada, nodo)
- visitados: set[str] — nodos ya procesados

Paso 3 - Algoritmo:
1. Inicializar distancias[origen] = 0, todos los demás a infinito
2. Push (0, origen) al heap
3. Mientras heap no esté vacío:
   a. Pop (dist, nodo) del heap
   b. Si nodo ya visitado: continue
   c. Marcar nodo como visitado
   d. Para cada vecino con peso:
      - Calcular nueva_dist = dist + peso
      - Si nueva_dist < distancias[vecino]:
          distancias[vecino] = nueva_dist
          Push (nueva_dist, vecino)

Paso 4 - Implementación:
```python
from heapq import heappush, heappop
from math import inf

def dijkstra(
    graph: dict[str, list[tuple[str, int]]],
    start: str
) -> dict[str, float]:
    distances: dict[str, float] = {node: inf for node in graph}
    distances[start] = 0
    pq: list[tuple[float, str]] = [(0, start)]
    visited: set[str] = set()

    while pq:
        current_dist, current = heappop(pq)
        if current in visited:
            continue
        visited.add(current)
        for neighbor, weight in graph.get(current, []):
            distance = current_dist + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heappush(pq, (distance, neighbor))

    return distances
```

Paso 5 - Verificación:
- Test: graph = {"A": [("B", 4), ("C", 2)], "B": [("C", 1), ("D", 5)], "C": [("D", 8)], "D": []}
- dijkstra(graph, "A") → {"A": 0, "B": 4, "C": 2, "D": 9}
"""

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": prompt_dijkstra}],
    temperature=0.2,
)
print(response.choices[0].message.content)
```

## Ejercicio 2.2: Debugging Multietapa

```python
# Código buggado
def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    intervals.sort(key=lambda x: x[0])
    merged = []
    for interval in intervals:
        if not merged or merged[-1][1] < interval[0]:
            merged.append(interval)
        else:
            merged[-1][1] = max(merged[-1][1], interval[1])
    return merged

# Fase 1 - Hipótesis:
# Hipótesis 1: Si la lista está vacía, el sort falla? No, sort([]) = []
# Hipótesis 2: Si hay un intervalo con [a, b] donde a > b, el sort no falla pero el merge es incorrecto
# Hipótesis 3: Si intervals es None, el sort lanza TypeError

# Fase 2 - Verificación:
# Test para H1: merge_intervals([]) → debería ser [], pero merged se devuelve vacío → OK
# Test para H3: merge_intervals(None) → AttributeError: 'NoneType' object has no attribute 'sort'

# Fase 3 - Solución:
def merge_intervals_fixed(intervals: list[list[int]] | None) -> list[list[int]]:
    if not intervals:
        return []
    intervals.sort(key=lambda x: x[0])
    merged = []
    for interval in intervals:
        if not merged or merged[-1][1] < interval[0]:
            merged.append(interval.copy())
        else:
            merged[-1][1] = max(merged[-1][1], interval[1])
    return merged

# Tests:
assert merge_intervals_fixed([]) == []
assert merge_intervals_fixed(None) == []
assert merge_intervals_fixed([[1,3],[2,6],[8,10]]) == [[1,6],[8,10]]
assert merge_intervals_fixed([[1,4],[0,2]]) == [[0,4]]
print("All tests passed!")
```

## Ejercicio 2.3: Self-Consistency Runner

```python
from openai import OpenAI
from collections import Counter
from typing import Callable

client = OpenAI()

def self_consistency_runner(
    prompt: str,
    n: int = 10,
    threshold: float = 0.6,
    fingerprint_fn: Callable = None,
) -> list[tuple[str, float]]:
    """
    Ejecuta N veces, agrupa por similitud estructural,
    retorna solo grupos con frecuencia > threshold.
    """
    if fingerprint_fn is None:
        def default_fingerprint(text: str) -> str:
            lines = text.strip().split("\n")
            # Extraer firma: primeras 3 líneas no vacías
            sig_lines = [l.strip() for l in lines if l.strip()][:3]
            return "|".join(sig_lines[:1])  # Primera línea significativa
        fingerprint_fn = default_fingerprint

    respuestas = []
    for i in range(n):
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
        )
        respuestas.append(response.choices[0].message.content)

    # Fingerprinting y agrupación
    grupos: dict[str, list[str]] = {}
    for r in respuestas:
        fp = fingerprint_fn(r)
        if fp not in grupos:
            grupos[fp] = []
        grupos[fp].append(r)

    # Filtrar por frecuencia
    total = len(respuestas)
    resultados = []
    for fp, items in grupos.items():
        freq = len(items) / total
        if freq >= threshold:
            # Elegir la respuesta más larga del grupo (más completa)
            mejor = max(items, key=len)
            resultados.append((mejor, freq))

    resultados.sort(key=lambda x: x[1], reverse=True)

    # Reporte de confianza
    print(f"=== Reporte de Confianza ===")
    print(f"Muestras: {n}, Threshold: {threshold}")
    print(f"Grupos encontrados: {len(grupos)}")
    print(f"Grupos sobre threshold: {len(resultados)}")
    for i, (_, freq) in enumerate(resultados):
        print(f"  Grupo {i+1}: {freq:.0%} confianza")

    return resultados

# Uso
def function_fingerprint(text: str) -> str:
    for line in text.split("\n"):
        if "def " in line or "class " in line:
            return line.strip()
    return text.strip()[:50]

prompt_bubblesort = """Implementa bubble sort genérico en Python con type hints."""
resultados = self_consistency_runner(prompt_bubblesort, n=5, threshold=0.4, fingerprint_fn=function_fingerprint)

mejor_codigo, confianza = resultados[0]
print(f"\nCódigo ganador (confianza: {confianza:.0%}):")
print(mejor_codigo[:500])
```

## Ejercicio 2.4: CoT para Code Review

```python
def code_review_cot(diff: str) -> str:
    prompt = f"""
Eres un Code Review Specialist. Revisa el siguiente diff:

{diff}

Realiza el review usando el siguiente razonamiento estructurado:

PASO 1 - Cambios introducidos:
- ¿Qué cambia cada línea?
- ¿Cuál es el propósito del cambio?

PASO 2 - Impacto en rendimiento:
- ¿Afecta tiempo de respuesta?
- ¿Introduce N+1 queries?
- ¿Aumenta el memory footprint?

PASO 3 - Impacto en seguridad:
- ¿Nuevos inputs sin validar?
- ¿Cambios en autenticación/autorización?
- ¿Exposición de datos sensibles?

PASO 4 - Impacto en mantenibilidad:
- ¿Aumenta la complejidad ciclomática?
- ¿Sigue los patrones del proyecto?
- ¿Tiene tests asociados?

Formato de salida:
## REPORTE DE CODE REVIEW

### Resumen
[ACCEPT | CHANGES_REQUESTED | REJECT]

### Hallazgos por severidad
🔴 CRITICAL:
- [descripción] - línea X - [remediación]

🟠 MAJOR:
- ...

🟡 MINOR:
- ...

### Veredicto final
"""
    return prompt

# Ejemplo de uso
diff_ejemplo = """
diff --git a/src/users/service.py b/src/users/service.py
+def get_all_users():
+    users = db.execute("SELECT * FROM users")
+    return [{"name": u.name, "email": u.email} for u in users]
"""

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": code_review_cot(diff_ejemplo)}],
    temperature=0.2,
)
print(response.choices[0].message.content)
```

## Ejercicio 2.5: Árbol de Razonamiento para Arquitectura

```python
prompt_arquitectura = """
Diseña la arquitectura de un sistema de procesamiento de pagos.

REQUERIMIENTOS:
- 10,000 transacciones/minuto
- Garantía de "al menos una vez" (al menos once)
- Fallos parciales de proveedores externos
- Auditoría completa

RAZONAMIENTO PASO A PASO:

Paso 1 - Análisis de requerimientos no funcionales:
- Throughput: 10K TPM ≈ 167 TPS
- Consistencia: Eventual consistency aceptable, pero el estado final debe ser correcto
- Durabilidad: Las transacciones nunca deben perderse (al menos una vez)
- Disponibilidad: Si un proveedor cae, las transacciones se encolan

Paso 2 - Patrones arquitectónicos:
- Event Sourcing + CQRS: cada transacción es un evento inmutable
- Saga Pattern: para manejar transacciones distribuidas entre proveedores
- Outbox Pattern: para garantizar la entrega de eventos
- Circuit Breaker: para manejar fallos de proveedores

Paso 3 - Componentes principales:
[Diagrama en texto]
Cliente → API Gateway → Payment Orchestrator → [Proveedor A, Proveedor B, Proveedor C]
                             ↓
                        Event Store (Kafka)
                             ↓
                    Payment State Machine
                             ↓
                        Auditoría (read model)

Paso 4 - Flujo de una transacción:
1. Cliente POST /payments → API Gateway valida y publica evento "PaymentInitiated"
2. PaymentOrchestrator consume el evento y ejecuta la saga:
   a. Reserva fondos (marca temporal)
   b. Llama al proveedor primario
   c. Si falla → intenta proveedor secundario (circuit breaker)
   d. Si todos fallan → evento "PaymentFailed", estado: failed
   e. Si uno éxito → evento "PaymentCompleted", estado: completed
3. En cualquier paso, si el servicio muere, el evento sigue en Kafka (al menos una vez)
4. PaymentStateMachine procesa eventos en orden y mantiene el estado actual

Paso 5 - Estrategia de auditoría:
- Tabla payments_audit inmutable (append-only)
- Cada cambio de estado se registra con timestamp y service_id
- Reconciliación diaria contra proveedores
- Alertas en caso de inconsistencias
"""

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": prompt_arquitectura}],
    temperature=0.3,
)
print(response.choices[0].message.content)
```
