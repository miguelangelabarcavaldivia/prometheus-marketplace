# Módulo 6: Prompting para Producción

## 6.1 Prompt Versioning y A/B Testing

Los prompts en producción requieren versionado, experimentación y despliegue gradual.

```python
# Ejemplo 6.1: Sistema de versionado de prompts
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
import json

class PromptVersion(BaseModel):
    version_id: str
    created_at: datetime
    prompt_text: str
    system_prompt: str
    model: str
    parameters: dict
    tags: list[str]
    parent_version: Optional[str] = None
    metrics: dict = {}

class PromptRegistry:
    """Registro central de versiones de prompts con capacidad de A/B testing."""

    def __init__(self, storage_path: str = "prompt_registry.json"):
        self.storage_path = storage_path
        self.versions: dict[str, PromptVersion] = {}
        self.ab_tests: dict[str, dict] = {}
        self._cargar()

    def _cargar(self):
        try:
            with open(self.storage_path) as f:
                data = json.load(f)
                for v in data.get("versions", []):
                    pv = PromptVersion(**v)
                    self.versions[pv.version_id] = pv
                self.ab_tests = data.get("ab_tests", {})
        except FileNotFoundError:
            pass

    def registrar_version(
        self,
        prompt_text: str,
        system_prompt: str,
        model: str = "gpt-4o",
        parameters: dict = None,
        tags: list[str] = None,
        parent: str = None,
    ) -> PromptVersion:
        version = PromptVersion(
            version_id=f"v{len(self.versions) + 1}_{datetime.now().strftime('%Y%m%d%H%M')}",
            created_at=datetime.now(),
            prompt_text=prompt_text,
            system_prompt=system_prompt,
            model=model,
            parameters=parameters or {"temperature": 0.2, "top_p": 0.9},
            tags=tags or [],
            parent_version=parent,
        )
        self.versions[version.version_id] = version
        self._guardar()
        return version

    def crear_ab_test(self, nombre: str, version_a: str, version_b: str, traffic_split: float = 0.5):
        """Crea un A/B test entre dos versiones de prompt."""
        self.ab_tests[nombre] = {
            "version_a": version_a,
            "version_b": version_b,
            "traffic_split": traffic_split,
            "results": {"a": {"impressions": 0, "successes": 0}, "b": {"impressions": 0, "successes": 0}},
            "active": True,
        }
        self._guardar()

    def obtener_prompt_ab(self, nombre: str, user_id: str = None) -> tuple[str, PromptVersion]:
        """Selecciona qué versión sirve basado en el split."""
        import hashlib
        test = self.ab_tests.get(nombre)
        if not test or not test["active"]:
            return None, None

        # Asignación determinística por user_id
        if user_id:
            hash_val = int(hashlib.md5(user_id.encode()).hexdigest(), 16) / 2**128
            seleccion = "a" if hash_val < test["traffic_split"] else "b"
        else:
            import random
            seleccion = "a" if random.random() < test["traffic_split"] else "b"

        version_id = test[f"version_{seleccion}"]
        test["results"][seleccion]["impressions"] += 1
        self._guardar()

        return seleccion, self.versions[version_id]

    def registrar_exito_ab(self, nombre: str, variante: str):
        """Registra un resultado exitoso para la variante."""
        if nombre in self.ab_tests:
            self.ab_tests[nombre]["results"][variante]["successes"] += 1
            self._guardar()

    def reporte_ab(self, nombre: str) -> dict:
        """Genera reporte del A/B test con métricas."""
        test = self.ab_tests[nombre]
        r = test["results"]
        return {
            "nombre": nombre,
            "version_a": test["version_a"],
            "version_b": test["version_b"],
            "traffic_split": test["traffic_split"],
            "a_rate": r["a"]["successes"] / max(r["a"]["impressions"], 1),
            "b_rate": r["b"]["successes"] / max(r["b"]["impressions"], 1),
            "a_total": r["a"]["impressions"],
            "b_total": r["b"]["impressions"],
            "winner": "a" if r["a"]["successes"] > r["b"]["successes"] else "b",
        }

    def _guardar(self):
        data = {
            "versions": [v.model_dump() for v in self.versions.values()],
            "ab_tests": self.ab_tests,
        }
        with open(self.storage_path, "w") as f:
            json.dump(data, f, indent=2, default=str)

# Uso
registry = PromptRegistry()
v1 = registry.registrar_version(
    prompt_text="Genera un endpoint para {recurso}",
    system_prompt="Eres un backend developer senior",
    tags=["crud", "fastapi"]
)
v2 = registry.registrar_version(
    prompt_text="Implementa un endpoint RESTful con validación para {recurso}",
    system_prompt="Eres un arquitecto backend con enfoque en DDD",
    tags=["crud", "fastapi", "ddd"],
    parent=v1.version_id
)
registry.crear_ab_test("endpoint_gen", v1.version_id, v2.version_id, traffic_split=0.3)
```

## 6.2 Cost Optimization y Token Management

Cada token cuesta dinero. Optimizar el uso de tokens es crítico en producción.

```python
# Ejemplo 6.2: Gestión de tokens y costos
import tiktoken

class TokenBudget:
    def __init__(self, modelo: str = "gpt-4o", presupuesto_diario: float = 10.0):
        self.modelo = modelo
        self.encoding = tiktoken.encoding_for_model(modelo)
        self.presupuesto_diario = presupuesto_diario
        self.gastado_hoy = 0.0
        self.precios = {
            "gpt-4o": {"input": 0.0025 / 1000, "output": 0.01 / 1000},
            "gpt-4o-mini": {"input": 0.00015 / 1000, "output": 0.0006 / 1000},
            "o1-mini": {"input": 0.003 / 1000, "output": 0.012 / 1000},
        }

    def costo_estimado(self, texto: str, tipo: str = "input") -> float:
        tokens = len(self.encoding.encode(texto))
        precio = self.precios[self.modelo][tipo]
        return tokens * precio

    def optimizar_prompt(self, prompt: str, max_tokens_input: int = 2000) -> str:
        """Acorta el prompt si excede el límite, priorizando el contenido más importante."""
        tokens = self.encoding.encode(prompt)
        if len(tokens) <= max_tokens_input:
            return prompt

        # Estrategia: truncar contexto secundario, mantener instrucción
        partes = prompt.split("\n\n")
        instruccion = partes[0] if partes else ""
        contexto = "\n\n".join(partes[1:])

        tokens_contexto = self.encoding.encode(contexto)
        max_contexto = max_tokens_input - len(self.encoding.encode(instruccion)) - 50

        if max_contexto <= 0:
            return instruccion[:max_tokens_input * 3]

        contexto_truncado = self.encoding.decode(tokens_contexto[:max_contexto])
        return f"{instruccion}\n\n{contexto_truncado}"

    def seleccionar_modelo(self, complejidad: str) -> str:
        """Selecciona el modelo más barato que puede manejar la tarea."""
        MAPA = {
            "simple": "gpt-4o-mini",       # Traducciones, formatos simples
            "media": "gpt-4o-mini",         # Código boilerplate, docs
            "compleja": "gpt-4o",           # Algoritmos, debugging
            "critica": "o1-mini",           # Revisión de seguridad, compliance
        }
        return MAPA.get(complejidad, "gpt-4o-mini")


# Ejemplo: routing inteligente de prompts
def route_prompt(tarea: str, contenido: str, budget: TokenBudget) -> str:
    """Rutea a modelo barato para tareas simples, caro para complejas."""
    # Detectar complejidad por longitud y palabras clave
    palabras_complejas = ["algoritmo", "optimizar", "complejidad", "concurrencia",
                          "distribuido", "async", "seguridad", "criptografía"]
    es_compleja = any(p in tarea.lower() for p in palabras_complejas) or len(contenido) > 500

    if es_compleja:
        modelo = budget.seleccionar_modelo("compleja")
    else:
        modelo = budget.seleccionar_modelo("simple")

    return modelo
```

## 6.3 Monitoreo de Calidad de Prompts

```python
# Ejemplo 6.3: Sistema de monitoreo
from dataclasses import dataclass
from datetime import datetime
import json

@dataclass
class PromptExecution:
    prompt_version: str
    input_tokens: int
    output_tokens: int
    latency_ms: float
    success: bool
    error_type: Optional[str] = None
    user_rating: Optional[int] = None  # 1-5

class PromptMonitor:
    def __init__(self, log_file: str = "prompt_executions.jsonl"):
        self.log_file = log_file

    def log_execution(self, execution: PromptExecution):
        with open(self.log_file, "a") as f:
            f.write(json.dumps({
                "timestamp": datetime.now().isoformat(),
                **execution.__dict__,
            }) + "\n")

    def metricas(self, horas: int = 24) -> dict:
        """Calcula métricas agregadas de las últimas N horas."""
        from collections import Counter
        import statistics

        ejecuciones = self._cargar_ultimas(horas)
        if not ejecuciones:
            return {}

        outputs = [e for e in ejecuciones if e.get("output_tokens")]
        return {
            "total_requests": len(ejecuciones),
            "success_rate": sum(1 for e in ejecuciones if e["success"]) / len(ejecuciones),
            "avg_input_tokens": statistics.mean(e["input_tokens"] for e in ejecuciones),
            "avg_output_tokens": statistics.mean(e["output_tokens"] for e in outputs),
            "avg_latency_ms": statistics.mean(e["latency_ms"] for e in ejecuciones),
            "p95_latency_ms": sorted(e["latency_ms"] for e in ejecuciones)[int(len(ejecuciones) * 0.95)],
            "error_types": Counter(e.get("error_type") for e in ejecuciones if not e["success"]),
            "avg_user_rating": statistics.mean(
                [e["user_rating"] for e in ejecuciones if e.get("user_rating")]
            ) if any(e.get("user_rating") for e in ejecuciones) else None,
        }

    def _cargar_ultimas(self, horas: int) -> list[dict]:
        from datetime import timedelta
        corte = datetime.now() - timedelta(hours=horas)
        ejecuciones = []
        try:
            with open(self.log_file) as f:
                for line in f:
                    e = json.loads(line)
                    if datetime.fromisoformat(e["timestamp"]) > corte:
                        ejecuciones.append(e)
        except FileNotFoundError:
            pass
        return ejecuciones
```

## 6.4 Error Handling y Fallbacks

```python
# Ejemplo 6.4: Estrategias de fallback
import time
from typing import Callable

def with_retry(max_retries: int = 3, backoff: float = 2.0, retry_on: tuple = None):
    """Decorador para reintentar con exponential backoff."""
    if retry_on is None:
        retry_on = (Exception,)

    def decorator(func: Callable):
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except retry_on as e:
                    last_error = e
                    if attempt < max_retries - 1:
                        wait = backoff ** attempt
                        print(f"Attempt {attempt + 1} failed: {e}. Retrying in {wait}s...")
                        time.sleep(wait)
            raise last_error
        return wrapper
    return decorator


class PromptPipeline:
    """Pipeline con fallbacks progresivos."""

    def __init__(self):
        self.fallbacks = []

    def add_fallback(self, prompt_fn: Callable, modelo: str, condicion: Callable = None):
        self.fallbacks.append({
            "prompt": prompt_fn,
            "modelo": modelo,
            "condicion": condicion or (lambda e: True),
        })

    def execute(self, input_data: dict) -> tuple[str, str]:
        """
        Intenta cada fallback en orden.
        Retorna (resultado, modelo_usado).
        """
        errores = []
        for fb in self.fallbacks:
            try:
                prompt = fb["prompt"](input_data)
                if self._call_model(prompt, fb["modelo"]):
                    return self._resultado, fb["modelo"]
            except Exception as e:
                if fb["condicion"](e):
                    errores.append((fb["modelo"], str(e)))
                    continue
                raise

        raise RuntimeError(f"Todos los fallbacks fallaron: {errores}")

    def _call_model(self, prompt: str, modelo: str) -> bool:
        # Simulación
        import random
        self._resultado = f"Resultado de {modelo} para: {prompt[:50]}..."
        return random.random() > 0.3
```

## 6.5 Caching Strategies

```python
# Ejemplo 6.5: Caché semántico para prompts
import hashlib

class SemanticCache:
    """
    Cache que agrupa prompts similares usando embeddings.
    No ejecuta el LLM si ya tenemos una respuesta para un prompt similar.
    """

    def __init__(self, threshold: float = 0.95, ttl: int = 3600):
        self.threshold = threshold
        self.ttl = ttl
        self.cache: dict[str, dict] = {}  # key_hash -> {response, embedding, timestamp}

    def _hash_prompt(self, prompt: str) -> str:
        return hashlib.sha256(prompt.encode()).hexdigest()

    def get(self, prompt: str) -> Optional[str]:
        prompt_hash = self._hash_prompt(prompt)
        if prompt_hash in self.cache:
            entry = self.cache[prompt_hash]
            if time.time() - entry["timestamp"] < self.ttl:
                return entry["response"]
            else:
                del self.cache[prompt_hash]
        return None

    def set(self, prompt: str, response: str):
        prompt_hash = self._hash_prompt(prompt)
        self.cache[prompt_hash] = {
            "response": response,
            "timestamp": time.time(),
        }

    def get_similar(self, prompt: str, embedding_fn: Callable) -> Optional[str]:
        """Busca prompts semánticamente similares en el caché."""
        emb_consulta = embedding_fn(prompt)
        from numpy import dot
        from numpy.linalg import norm

        mejor_sim = 0
        mejor_resp = None

        for entry in self.cache.values():
            if time.time() - entry["timestamp"] < self.ttl and "embedding" in entry:
                sim = dot(emb_consulta, entry["embedding"]) / (norm(emb_consulta) * norm(entry["embedding"]))
                if sim > mejor_sim and sim > self.threshold:
                    mejor_sim = sim
                    mejor_resp = entry["response"]

        return mejor_resp

cache = SemanticCache(threshold=0.92, ttl=1800)
```

## 6.6 Ejercicios

### Ejercicio 6.1: Cost Dashboard
Implementa un dashboard que muestre en tiempo real: costo por usuario/día/semana, tokens promedio por request, modelos más usados, y alertas cuando se excede el presupuesto.

### Ejercicio 6.2: Fallback Chain
Diseña una cadena de fallback con 4 niveles: GPT-4o → GPT-4o-mini → Claude 3 Haiku → Ollama local. Cada nivel debe tener distinto timeout y política de reintentos.

### Ejercicio 6.3: Cache con LRU + TTL
Implementa un caché de prompts que combine LRU (máximo 1000 entradas) con TTL por entrada. Agrega soporte para invalidación por tag (ej: invalidar todos los prompts con tag "v2").

### Ejercicio 6.4: Quality Monitor
Crea un sistema que monitoree la calidad de las respuestas del LLM usando:
- Detección automática de alucinaciones (contradicciones internas)
- Consistencia con respuestas anteriores
- Longitud excesiva o insuficiente
- Detección de boilerplate/repetitividad

### Ejercicio 6.5: Pipeline Observability
Implementa tracing distribuido para un pipeline de prompts. Cada paso (generación, validación, post-procesamiento) debe emitir métricas a OpenTelemetry.

---

**Soluciones en:** `exercises/module-6-solutions.md`
