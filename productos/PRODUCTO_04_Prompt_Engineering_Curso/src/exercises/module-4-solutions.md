# Soluciones — Módulo 4: System Prompts & Personas

## Ejercicio 4.1: Persona DRE (Database Reliability Engineer)

```python
PERSONA_DRE = """
Eres un Database Reliability Engineer (DRE) con 12+ años de experiencia.

ESPECIALIDAD:
- PostgreSQL (arquitectura interna, vacuum, replication, partitioning)
- Redis (caching, rate limiting, session store, pub/sub)
- Cassandra (data modeling por query, compaction, hinted handoff)

PRIORIDADES EN TUS REVISIONES:
1. Consistencia: ¿Los datos son correctos y están completos?
2. Latencia p99: ¿Las queries son rápidas bajo carga?
3. Particionamiento: ¿La data distribution es uniforme?

ANTI-PATRONES QUE BUSCAS:
🚫 SELECT * en producción
🚫 N+1 queries ocultos (especialmente en APIs GraphQL)
🚫 Missing indexes en foreign keys y columnas de filtro frecuente
🚫 Queries sin EXPLAIN ANALYZE
🚫 Conexiones sin pool
🚫 Transacciones largas (> 5s)
🚫 Falta de paginación en consultas masivas

REGLAS ESTRICTAS:
- Máximo 2 JOINs por query (si necesitas más, reconsidera el schema)
- Toda query debe tener EXPLAIN ANALYZE antes de deploy
- Toda tabla > 10M filas debe tener estrategia de particionamiento
- Toda migración debe tener rollback plan
- Toda conexión debe usar connection pooling (PgBouncer / HikariCP)

FORMATO DE RESPUESTA:
## Revisión DRE
### Hallazgos
[CRITICAL|HIGH|MEDIUM|LOW] - [tabla/query] - problema - solución propuesta

### Performance Score
[0-10] basado en: index usage, query efficiency, connection management

### Recomendaciones
1. [acción inmediata]
2. [próximo sprint]
3. [backlog]
"""

print(PERSONA_DRE)
```

## Ejercicio 4.2: Multi-Agent Code Review Unificado

```python
from openai import OpenAI
import json

client = OpenAI()

AGENTES = {
    "security": "Eres un Security Auditor. Revisa OWASP Top 10. Output JSON: [{\"severidad\":\"HIGH\",\"descripcion\":\"...\",\"linea\":N}]",
    "performance": "Eres un Performance Engineer. Busca N+1, queries lentas, loops ineficientes. Output JSON.",
    "style": "Eres un Style Guardian. Verifica PEP8, type hints, naming, documentación. Output JSON.",
}

def multi_agent_review(codigo: str) -> dict:
    hallazgos_globales = []

    for nombre, system_prompt in AGENTES.items():
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Código a revisar:\n```python\n{codigo}\n```"},
            ],
            temperature=0.1,
        )
        try:
            hallazgos = json.loads(response.choices[0].message.content)
            for h in hallazgos:
                h["agente"] = nombre
            hallazgos_globales.extend(hallazgos)
        except (json.JSONDecodeError, TypeError):
            pass

    # Deduplicación: agrupar hallazgos similares
    dedup = {}
    for h in hallazgos_globales:
        key = (h.get("linea", 0), h.get("descripcion", "")[:50])
        if key in dedup:
            dedup[key]["agentes"].append(h["agente"])
            if SEVERIDAD_ORDER.index(h.get("severidad", "LOW")) > SEVERIDAD_ORDER.index(dedup[key]["severidad"]):
                dedup[key]["severidad"] = h["severidad"]
        else:
            h["agentes"] = [h["agente"]]
            dedup[key] = h

    return {
        "total_hallazgos": len(hallazgos_globales),
        "unicos": len(dedup),
        "por_agente": {n: sum(1 for h in hallazgos_globales if h["agente"] == n) for n in AGENTES},
        "hallazgos": sorted(dedup.values(), key=lambda x: SEVERIDAD_ORDER.index(x.get("severidad", "LOW"))),
    }

SEVERIDAD_ORDER = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

codigo_test = """
def process(data):
    result = []
    for item in data:
        result.append(item * 2)
    return result

@app.get('/users')
def get_users():
    query = f"SELECT * FROM users WHERE id = {request.args.get('id')}"
    return db.execute(query)
"""

review = multi_agent_review(codigo_test)
print(f"Total hallazgos: {review['total_hallazgos']}, Únicos: {review['unicos']}")
for h in review['hallazgos']:
    print(f"  [{h['severidad']}] [{', '.join(h['agentes'])}] L{h.get('linea', '?')}: {h['descripcion'][:80]}")
```

## Ejercicio 4.3: Constraint Builder Library

```python
from enum import Enum

class PresetType(Enum):
    FASTAPI_API = "fastapi-api"
    PIPELINE_DATA = "pipeline-data"
    FRONTEND_COMPONENT = "frontend-component"
    CLI_TOOL = "cli-tool"

class ConstraintBuilder:
    PRESETS = {
        PresetType.FASTAPI_API: {
            "allowed_libs": ["fastapi", "sqlalchemy", "pydantic", "alembic", "httpx"],
            "forbidden_libs": ["numpy", "pandas", "django"],
            "max_function_lines": 40,
            "require_type_hints": True,
            "require_docstrings": True,
            "require_tests": True,
            "security_level": "alto",
        },
        PresetType.PIPELINE_DATA: {
            "allowed_libs": ["pandas", "polars", "numpy", "scikit-learn", "pyspark"],
            "forbidden_libs": ["fastapi", "django"],
            "max_function_lines": 60,
            "require_type_hints": False,
            "require_docstrings": True,
            "require_tests": False,
            "security_level": "medio",
        },
    }

    def __init__(self):
        self.rules: dict = {}

    def preset(self, name: PresetType):
        config = self.PRESETS.get(name, {})
        for k, v in config.items():
            self.rules[k] = v
        return self

    def validate_no_contradictions(self) -> list[str]:
        """Verifica que las reglas no sean contradictorias."""
        warnings = []
        if self.rules.get("require_type_hints") and self.rules.get("max_function_lines", 999) < 10:
            warnings.append("Type hints en funciones < 10 líneas puede ser excesivo")
        if self.rules.get("security_level") == "alto" and "numpy" in self.rules.get("allowed_libs", []):
            warnings.append("Seguridad alta compatible con numpy (solo validación)")
        return warnings

    def to_json(self) -> str:
        return json.dumps(self.rules, indent=2)

    def to_yaml(self) -> str:
        lines = ["constraints:"]
        for k, v in self.rules.items():
            if isinstance(v, list):
                lines.append(f"  {k}:")
                for item in v:
                    lines.append(f"    - {item}")
            else:
                lines.append(f"  {k}: {v}")
        return "\n".join(lines)

    def build_text(self) -> str:
        text_parts = []
        if "allowed_libs" in self.rules:
            text_parts.append(f"✅ Librerías permitidas: {', '.join(self.rules['allowed_libs'])}")
        if "forbidden_libs" in self.rules:
            text_parts.append(f"🚫 Librerías prohibidas: {', '.join(self.rules['forbidden_libs'])}")
        if "max_function_lines" in self.rules:
            text_parts.append(f"📏 Máximo {self.rules['max_function_lines']} líneas por función")
        if self.rules.get("require_type_hints"):
            text_parts.append("📝 Type hints obligatorios")
        if self.rules.get("require_docstrings"):
            text_parts.append("📄 Docstrings obligatorios")
        if self.rules.get("security_level") == "alto":
            text_parts.append("🔒 Validar todos los inputs, sanitizar outputs, sin confiar en datos del cliente")
        return "\n".join(text_parts)

# Uso
import json
builder = ConstraintBuilder()
builder.preset(PresetType.FASTAPI_API)
warnings = builder.validate_no_contradictions()
print("Warnings:", warnings)
print("\n--- Text ---")
print(builder.build_text())
print("\n--- JSON ---")
print(builder.to_json())
print("\n--- YAML ---")
print(builder.to_yaml())
```

## Ejercicio 4.4: Prompt Template Engine

```python
import re
from typing import Optional

class PromptTemplate:
    def __init__(self, template: str):
        self.template = template

    def render(self, **kwargs) -> str:
        """Reemplaza {{variables}} con valores."""
        result = self.template
        for key, value in kwargs.items():
            result = result.replace("{{" + key + "}}", str(value))
        return result

    def render_conditional(self, **context) -> str:
        """Procesa {% if var %}...{% endif %} bloques."""
        result = self.template

        # Reemplazar variables
        for key, value in context.items():
            result = result.replace("{{" + key + "}}", str(value))

        # Procesar condicionales
        def process_if(match):
            content = match.group(0)
            # Extraer condición
            var_match = re.search(r"{% if (\w+) %}", content)
            if not var_match:
                return content
            var_name = var_match.group(1)
            inner = re.sub(r"{% if \w+ %}|{% endif %}", "", content).strip()
            if context.get(var_name, False):
                return inner
            return ""

        result = re.sub(r"{% if \w+ %}.*?{% endif %}", process_if, result, flags=re.DOTALL)
        return result

    @classmethod
    def from_file(cls, path: str) -> "PromptTemplate":
        with open(path) as f:
            return cls(f.read())


# Templates
SYSTEM_TEMPLATE = PromptTemplate("""
Eres un {{rol}} especializado en {{framework}}.

NIVEL DE SEGURIDAD: {{nivel_seguridad}}
{% if require_tests %}
- Todos los cambios deben incluir tests
{% endif %}
{% if require_docs %}
- Documentación obligatoria de APIs públicas
{% endif %}

Contexto del proyecto: {{contexto}}
""")

# Uso
prompt = SYSTEM_TEMPLATE.render_conditional(
    rol="Senior Backend Engineer",
    framework="FastAPI + SQLAlchemy",
    nivel_seguridad="ALTO",
    require_tests=True,
    require_docs=False,
    contexto="Microservicio de pagos",
)
print(prompt)
```

## Ejercicio 4.5: Métricas de Persona

```python
class PersonaEvaluator:
    def __init__(self, system_prompt: str):
        self.system_prompt = system_prompt
        self.tests = []

    def add_test(self, nombre: str, input_text: str, checker_fn) -> None:
        self.tests.append({
            "nombre": nombre,
            "input": input_text,
            "checker": checker_fn,
        })

    def evaluate(self) -> dict:
        from openai import OpenAI
        client = OpenAI()

        results = {}
        for test in self.tests:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": test["input"]},
                ],
                temperature=0.2,
            )
            output = response.choices[0].message.content
            passed = test["checker"](output)
            results[test["nombre"]] = {
                "passed": passed,
                "output_preview": output[:200] + "...",
            }

        # Métricas agregadas
        total = len(results)
        passed_count = sum(1 for r in results.values() if r["passed"])
        return {
            "adherence_rate": passed_count / total if total > 0 else 0,
            "tests_passed": passed_count,
            "tests_total": total,
            "details": results,
        }

# Test para persona "Senior Backend Engineer"
persona = """
Eres un Senior Backend Engineer. Nunca usas numpy. Siempre incluyes type hints.
Siempre manejas errores explícitamente. Sigues PEP 8.
"""

evaluator = PersonaEvaluator(persona)

def no_numpy(output: str) -> bool:
    return "import numpy" not in output and "from numpy" not in output

def has_type_hints(output: str) -> bool:
    return "->" in output and ":" in output.split("\n")[0] if output else False

def has_error_handling(output: str) -> bool:
    return "try" in output or "except" in output or "Result" in output or "Optional" in output

evaluator.add_test("No usa numpy", "Implementa una función para calcular la mediana de una lista", no_numpy)
evaluator.add_test("Type hints", "Implementa función de ordenamiento", has_type_hints)
evaluator.add_test("Manejo de errores", "Lee un archivo y procesa sus líneas", has_error_handling)

results = evaluator.evaluate()
print(f"Tasa de adherencia: {results['adherence_rate']:.0%}")
for name, detail in results['details'].items():
    print(f"  {'✅' if detail['passed'] else '❌'} {name}")
```
