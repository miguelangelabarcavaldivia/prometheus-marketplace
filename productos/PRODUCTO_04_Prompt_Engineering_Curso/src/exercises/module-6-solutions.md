# Soluciones — Módulo 6: Prompting para Producción

## Ejercicio 6.1: Cost Dashboard

```python
from datetime import datetime, timedelta
from collections import defaultdict

class CostDashboard:
    def __init__(self, log_source: str = "prompt_executions.jsonl"):
        self.log_source = log_source
        self.data = self._load_data()

    def _load_data(self) -> list[dict]:
        import json
        records = []
        try:
            with open(self.log_source) as f:
                for line in f:
                    records.append(json.loads(line))
        except FileNotFoundError:
            pass
        return records

    def by_user(self) -> dict:
        costs = defaultdict(float)
        for r in self.data:
            user = r.get("user", "unknown")
            input_cost = r.get("input_tokens", 0) * 0.0025 / 1000
            output_cost = r.get("output_tokens", 0) * 0.01 / 1000
            costs[user] += input_cost + output_cost
        return dict(costs)

    def by_day(self, days: int = 30) -> dict:
        costs = defaultdict(float)
        cutoff = datetime.now() - timedelta(days=days)
        for r in self.data:
            ts = datetime.fromisoformat(r.get("timestamp", "2024-01-01"))
            if ts < cutoff:
                continue
            day = ts.strftime("%Y-%m-%d")
            input_cost = r.get("input_tokens", 0) * 0.0025 / 1000
            output_cost = r.get("output_tokens", 0) * 0.01 / 1000
            costs[day] += input_cost + output_cost
        return dict(sorted(costs.items()))

    def by_model(self) -> dict:
        costs = defaultdict(float)
        for r in self.data:
            model = r.get("model", "unknown")
            input_cost = r.get("input_tokens", 0) * 0.0025 / 1000
            output_cost = r.get("output_tokens", 0) * 0.01 / 1000
            costs[model] += input_cost + output_cost
        return dict(costs)

    def budget_alert(self, daily_budget: float = 10.0) -> list[str]:
        today = datetime.now().strftime("%Y-%m-%d")
        today_cost = self.by_day().get(today, 0)
        alerts = []
        if today_cost > daily_budget:
            alerts.append(f"ALERTA: Costo hoy ${today_cost:.2f} excede presupuesto ${daily_budget:.2f}")
        monthly = sum(self.by_day(30).values())
        if monthly > daily_budget * 22:
            alerts.append(f"ALERTA: Costo mensual ${monthly:.2f} proyectado excede presupuesto")
        return alerts

dashboard = CostDashboard()
print("Costos por usuario:", dashboard.by_user())
print("Alertas:", dashboard.budget_alert(10.0))
```

## Ejercicio 6.2: Fallback Chain

```python
import time
from typing import Callable, Optional

class FallbackChain:
    def __init__(self):
        self.levels = []

    def add_level(self, model: str, timeout: float = 10.0, retries: int = 2, cost_per_call: float = 0.0):
        self.levels.append({
            "model": model,
            "timeout": timeout,
            "retries": retries,
            "cost_per_call": cost_per_call,
        })

    def execute(self, prompt_fn: Callable, input_data: dict) -> tuple[str, str, float]:
        """
        Retorna (resultado, modelo_usado, costo_total).
        Prueba cada nivel en orden.
        """
        total_cost = 0.0
        errors = []

        for level in self.levels:
            for attempt in range(level["retries"] + 1):
                try:
                    start = time.time()
                    response = self._call_model(level["model"], prompt_fn(input_data), level["timeout"])
                    elapsed = time.time() - start
                    cost = level["cost_per_call"]
                    total_cost += cost
                    return response, level["model"], total_cost
                except Exception as e:
                    errors.append(f"{level['model']} attempt {attempt}: {e}")
                    if attempt < level["retries"]:
                        time.sleep(2 ** attempt)  # Exponential backoff
                    continue

        raise RuntimeError(f"All fallbacks failed. Errors: {errors}")

    def _call_model(self, model: str, prompt: str, timeout: float) -> str:
        from openai import OpenAI
        client = OpenAI(timeout=timeout)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        return response.choices[0].message.content

# Configurar cadena
chain = FallbackChain()
chain.add_level("gpt-4o", timeout=15.0, retries=2, cost_per_call=0.03)
chain.add_level("gpt-4o-mini", timeout=10.0, retries=1, cost_per_call=0.001)
chain.add_level("claude-3-haiku", timeout=10.0, retries=1, cost_per_call=0.002)
chain.add_level("ollama/llama3", timeout=30.0, retries=0, cost_per_call=0.0)

def build_prompt(data: dict) -> str:
    return f"Genera código para: {data.get('task', '')}"

try:
    result, model, cost = chain.execute(build_prompt, {"task": "API CRUD de productos"})
    print(f"Modelo usado: {model}, Costo: ${cost:.4f}")
    print(result[:200])
except RuntimeError as e:
    print(f"Error: {e}")
```

## Ejercicio 6.3: Cache LRU + TTL con Tags

```python
from collections import OrderedDict
import time
from typing import Optional

class TTLTagCache:
    def __init__(self, max_entries: int = 1000, default_ttl: int = 3600):
        self.max_entries = max_entries
        self.default_ttl = default_ttl
        self.cache: OrderedDict[str, dict] = OrderedDict()
        self.tag_index: dict[str, set[str]] = {}

    def get(self, key: str) -> Optional[str]:
        if key not in self.cache:
            return None
        entry = self.cache[key]
        if time.time() > entry["expires_at"]:
            self._remove(key)
            return None
        # LRU: mover al final
        self.cache.move_to_end(key)
        return entry["value"]

    def set(self, key: str, value: str, tags: list[str] = None, ttl: int = None):
        # Si está lleno, remover LRU (primero en OrderedDict)
        if len(self.cache) >= self.max_entries:
            oldest_key, _ = self.cache.popitem(last=False)
            self._remove_from_tags(oldest_key)

        ttl = ttl or self.default_ttl
        self.cache[key] = {
            "value": value,
            "expires_at": time.time() + ttl,
        }
        self.cache.move_to_end(key)

        if tags:
            for tag in tags:
                if tag not in self.tag_index:
                    self.tag_index[tag] = set()
                self.tag_index[tag].add(key)

    def invalidate_tag(self, tag: str):
        """Invalida todas las entradas con un tag dado."""
        if tag in self.tag_index:
            keys_to_remove = list(self.tag_index[tag])
            for key in keys_to_remove:
                self._remove(key)
            del self.tag_index[tag]

    def _remove(self, key: str):
        if key in self.cache:
            del self.cache[key]
        self._remove_from_tags(key)

    def _remove_from_tags(self, key: str):
        for tag, keys in list(self.tag_index.items()):
            keys.discard(key)
            if not keys:
                del self.tag_index[tag]

    def stats(self) -> dict:
        expired = sum(1 for e in self.cache.values() if time.time() > e["expires_at"])
        return {
            "total_entries": len(self.cache),
            "expired": expired,
            "active": len(self.cache) - expired,
            "tags_count": len(self.tag_index),
            "max_entries": self.max_entries,
        }

# Uso
cache = TTLTagCache(max_entries=100, default_ttl=1800)
cache.set("v1:users:list", "response_v1", tags=["v1", "users"])
cache.set("v2:users:list", "response_v2", tags=["v2", "users"])
print(cache.get("v1:users:list"))  # response_v1
cache.invalidate_tag("v1")
print(cache.get("v1:users:list"))  # None (invalidated)
print(cache.stats())
```

## Ejercicio 6.4: Quality Monitor

```python
import re

class QualityMonitor:
    def __init__(self):
        self.historial: list[dict] = []

    def check_hallucination(self, codigo: str, contexto: str) -> list[str]:
        """Detecta posibles alucinaciones."""
        issues = []

        # APIs/librerías que no existen
        patrones_sospechosos = [
            r"from nonexistent_lib import",
            r"import (nonexistent|fakelib|mylib)",
        ]
        for p in patrones_sospechosos:
            if re.search(p, codigo):
                issues.append(f"Posible librería inexistente: {p}")

        # Funciones inventadas
        if "from " in codigo:
            imports = re.findall(r"from (\S+) import (\S+)", codigo)
            for mod, func in imports:
                if func.startswith("get") and "api" in mod:
                    # Podría ser real, marcar como sospechoso
                    issues.append(f"Función sospechosa: {mod}.{func} (verificar existencia)")

        return issues

    def check_consistency(self, codigo: str) -> list[str]:
        """Verifica consistencia interna del código."""
        issues = []

        # Variables definidas pero no usadas
        defined = set(re.findall(r"(\w+)\s*=", codigo))
        used = set(re.findall(r"(?<![.\w])(\w+)(?=\s*[\),:\+\-\*/])", codigo))
        unused = defined - used
        if unused:
            issues.append(f"Variables definidas no usadas: {unused}")

        # Imports no usados
        imported = set(re.findall(r"import (\w+)", codigo)) | set(re.findall(r"from \S+ import (\w+)", codigo))
        unused_imports = imported - used
        if unused_imports:
            issues.append(f"Imports no usados: {unused_imports}")

        return issues

    def check_length(self, codigo: str, min_lines: int = 5, max_lines: int = 200) -> list[str]:
        issues = []
        lines = codigo.strip().split("\n")
        if len(lines) < min_lines:
            issues.append(f"Respuesta muy corta ({len(lines)} líneas, mínimo {min_lines})")
        if len(lines) > max_lines:
            issues.append(f"Respuesta muy larga ({len(lines)} líneas, máximo {max_lines})")
        return issues

    def evaluate(self, codigo: str, contexto: str = "") -> dict:
        issues = []
        issues.extend(self.check_hallucination(codigo, contexto))
        issues.extend(self.check_consistency(codigo))
        issues.extend(self.check_length(codigo))

        score = 1.0 - (len(issues) * 0.2)
        score = max(0.0, min(1.0, score))

        self.historial.append({
            "score": score,
            "issues": issues,
            "timestamp": time.time(),
        })

        return {"score": score, "issues": issues}

import time
qm = QualityMonitor()
codigo_test = "from fakelib import magic\nx = 42\nprint(y)"
result = qm.evaluate(codigo_test)
print(f"Score: {result['score']:.2f}")
for issue in result['issues']:
    print(f"  ⚠ {issue}")
```

## Ejercicio 6.5: OpenTelemetry Tracing

```python
from contextlib import contextmanager
from datetime import datetime
import uuid
import json

class SimpleTracer:
    """Tracing distribuido simple para pipeline de prompts."""

    def __init__(self, service_name: str = "prompt-pipeline"):
        self.service_name = service_name
        self.traces: dict[str, list] = {}

    @contextmanager
    def span(self, trace_id: str, span_name: str, parent_span_id: str = None):
        span_id = str(uuid.uuid4())[:8]
        start = datetime.now()

        span = {
            "trace_id": trace_id,
            "span_id": span_id,
            "parent_span_id": parent_span_id,
            "span_name": span_name,
            "service": self.service_name,
            "start_time": start.isoformat(),
            "end_time": None,
            "duration_ms": None,
            "attributes": {},
            "status": "OK",
        }

        yield span  # Permitir al usuario agregar atributos

        end = datetime.now()
        span["end_time"] = end.isoformat()
        span["duration_ms"] = (end - start).total_seconds() * 1000

        if trace_id not in self.traces:
            self.traces[trace_id] = []
        self.traces[trace_id].append(span)

    def export(self, trace_id: str) -> str:
        """Exporta trace como JSON para análisis."""
        if trace_id not in self.traces:
            return "{}"
        spans = self.traces[trace_id]
        spans.sort(key=lambda s: s["start_time"])

        total_duration = 0
        if spans:
            first = datetime.fromisoformat(spans[0]["start_time"])
            last = datetime.fromisoformat(spans[-1]["end_time"])
            total_duration = (last - first).total_seconds() * 1000

        return json.dumps({
            "trace_id": trace_id,
            "total_duration_ms": total_duration,
            "spans": spans,
        }, indent=2)

    def get_metrics(self) -> dict:
        """Métricas agregadas de todos los traces."""
        all_durations = []
        for trace_spans in self.traces.values():
            for span in trace_spans:
                if span["duration_ms"]:
                    all_durations.append(span["duration_ms"])

        if not all_durations:
            return {}

        return {
            "total_traces": len(self.traces),
            "total_spans": sum(len(v) for v in self.traces.values()),
            "avg_span_duration_ms": sum(all_durations) / len(all_durations),
            "p95_span_duration_ms": sorted(all_durations)[int(len(all_durations) * 0.95)],
            "spans_by_name": self._group_by_name(),
        }

    def _group_by_name(self) -> dict:
        groups = {}
        for trace_spans in self.traces.values():
            for span in trace_spans:
                name = span["span_name"]
                if name not in groups:
                    groups[name] = {"count": 0, "total_duration": 0}
                groups[name]["count"] += 1
                groups[name]["total_duration"] += span.get("duration_ms", 0)
        return groups


# Uso en un pipeline
tracer = SimpleTracer("code-assistant")

trace_id = str(uuid.uuid4())

with tracer.span(trace_id, "classify_task") as span:
    span["attributes"]["model"] = "gpt-4o-mini"
    span["attributes"]["tokens"] = 150
    # Simular clasificación
    import time
    time.sleep(0.1)

with tracer.span(trace_id, "generate_code", parent_span_id=span["span_id"]) as span:
    span["attributes"]["model"] = "gpt-4o"
    span["attributes"]["tokens"] = 2500
    time.sleep(0.5)

with tracer.span(trace_id, "validate_code", parent_span_id=span["span_id"]) as span:
    span["attributes"]["model"] = "gpt-4o-mini"
    span["attributes"]["score"] = 0.92
    time.sleep(0.2)

print(tracer.export(trace_id))
print("\nMétricas:", json.dumps(tracer.get_metrics(), indent=2))
```
