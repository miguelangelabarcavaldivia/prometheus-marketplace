# Soluciones — Módulo 7: Dominios Especializados

## Ejercicio 7.1: Generador Multi-framework

```python
from openai import OpenAI

client = OpenAI()

def detectar_framework(descripcion: str) -> str:
    prompt = f"""
Detecta el framework frontend de esta descripción.
Responde solo con el nombre: React, Vue, Svelte, o Unknown.

Descripción: {descripcion}
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=20,
    )
    return response.choices[0].message.content.strip()

COMPONENT_TEMPLATES = {
    "React": """
Eres un Senior Frontend Engineer React/TypeScript.

Genera un componente DataTable con:
- Búsqueda (filtrado local)
- Sorting por cualquier columna
- Paginación
- Estados: loading, empty, error
- Accesibilidad WCAG 2.1 AA

Props:
- columns: Column[]
- data: T[]
- pageSize?: number (default 10)
- onRowClick?: (row: T) => void

Requisitos:
- TypeScript estricto
- Custom hook useDataTable con toda la lógica
- Memoización donde tenga sentido
- Test con React Testing Library

NO uses ninguna librería de tabla externa.
""",
    "Vue": """
Eres un Senior Frontend Engineer Vue 3 Composition API + TypeScript.

Genera un componente DataTable con:
- Búsqueda (filtrado local)
- Sorting por cualquier columna
- Paginación
- Estados: loading, empty, error

Props:
- columns: Column[]
- data: T[]
- pageSize?: number (default 10)

Requisitos:
- Composition API con <script setup lang="ts">
- Computed properties para filtered/sorted/paginated data
- Eventos: @row-click
- Test con Vue Test Utils
""",
    "Svelte": """
Eres un Senior Frontend Engineer Svelte 5 + TypeScript.

Genera un componente DataTable con:
- Búsqueda (filtrado local)
- Sorting por cualquier columna
- Paginación
- Estados: loading, empty, error

Props:
- columns: Column[]
- data: T[]
- pageSize?: number (default 10)

Requisitos:
- Svelte 5 runes ($state, $derived, $effect)
- TypeScript estricto
- Transiciones animadas para cambios de página
- Test con @testing-library/svelte
""",
}

def generar_componente_multi(descripcion: str) -> str:
    framework = detectar_framework(descripcion)
    template = COMPONENT_TEMPLATES.get(framework, COMPONENT_TEMPLATES["React"])

    prompt = f"""{template}

Contexto adicional de la solicitud:
{descripcion}
"""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return response.choices[0].message.content

solicitud = "Necesito un DataTable con búsqueda y paginación en React"
codigo = generar_componente_multi(solicitud)
print(codigo[:500])
```

## Ejercicio 7.2: Pipeline CI/CD Completo

```python
def generar_pipeline_github_actions() -> str:
    prompt = """
Eres un DevOps Engineer experto en GitHub Actions y CI/CD.

Genera un pipeline CI/CD completo para un microservicio FastAPI.

REQUISITOS:
1. Lint: ruff (Python linter)
2. Type check: mypy (strict mode)
3. Tests unitarios: pytest con coverage (mín 85%)
4. Tests de integración: pytest + testcontainers (PostgreSQL)
5. Build: Docker image multi-stage
6. Push: Amazon ECR
7. Deploy: Amazon EKS con Helm
8. Smoke tests: httpx para verificar health endpoint después del deploy

CONFIG:
- Python 3.12
- FastAPI + SQLAlchemy + Alembic
- PostgreSQL 16
- Docker, ECR, EKS (AWS)
- GitHub Actions

GENERA:
1. .github/workflows/deploy.yml completo
2. Dockerfile multi-stage
3. Helm chart values.yaml
4. Script de smoke tests

CADA PASO debe:
- Tener un name descriptivo
- Cachear dependencias (pip, Docker layers)
- Reportar status a GitHub Checks API
- Paralelizar donde sea posible
- Tener timeout configurado
- Secrets vía GitHub Secrets (no hardcodeados)
"""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return response.choices[0].message.content

print(generar_pipeline_github_actions())
```

## Ejercicio 7.3: Test Generator con Cobertura

```python
import ast
import subprocess
import tempfile
import os

class CoverageTestGenerator:
    def __init__(self):
        self.uncovered_lines = []

    def analyze_coverage(self, codigo: str) -> dict:
        """Analiza cobertura estática usando AST."""
        tree = ast.parse(codigo)
        functions = [n for n in ast.walk(tree) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]

        report = {
            "total_functions": len(functions),
            "functions": [],
        }

        for func in functions:
            fn_info = {
                "name": func.name,
                "line_start": func.lineno,
                "line_end": func.end_lineno,
                "branches": [],
                "has_docstring": bool(ast.get_docstring(func)),
            }

            # Detectar branches (if/else, try/except, match/case)
            branches = [n for n in ast.walk(func) if isinstance(n, (ast.If, ast.Try, ast.Match))]
            for b in branches:
                branch_info = {
                    "type": type(b).__name__,
                    "line": b.lineno,
                    "has_test": False,  # Se marcaría con análisis dinámico
                }
                fn_info["branches"].append(branch_info)

            report["functions"].append(fn_info)

        return report

    def generate_missing_tests(self, codigo: str, report: dict) -> list[str]:
        """Genera tests para funciones sin cobertura."""
        missing_tests = []

        for fn in report["functions"]:
            if fn["branches"]:
                uncovered = [b for b in fn["branches"] if not b["has_test"]]
                if uncovered:
                    prompt = f"""
Genera tests para la función `{fn['name']}` (línea {fn['line_start']}):

Código:
```python
{codigo}
```

Cubre estos branches no testeados:
{chr(10).join(f"- {b['type']} en línea {b['line']}" for b in uncovered)}

Formato: pytest con asserts específicos.
Fixture: usar `@pytest.fixture` para setup si es necesario.
Mantén los tests independientes entre sí.
"""
                    missing_tests.append(prompt)

        return missing_tests

    def run_with_coverage(self, codigo: str, tests: str) -> dict:
        """Ejecuta tests y mide cobertura."""
        with tempfile.TemporaryDirectory() as tmpdir:
            src_file = os.path.join(tmpdir, "source.py")
            test_file = os.path.join(tmpdir, "test_source.py")

            with open(src_file, "w") as f:
                f.write(codigo)
            with open(test_file, "w") as f:
                f.write(tests)

            result = subprocess.run(
                ["python", "-m", "pytest", test_file, "--cov=source", "--cov-report=json"],
                capture_output=True, text=True, cwd=tmpdir,
            )

            coverage_file = os.path.join(tmpdir, ".coverage")
            if os.path.exists(coverage_file):
                import json
                with open(coverage_file) as f:
                    return json.load(f)
            return {"error": result.stderr}

generator = CoverageTestGenerator()
codigo_test = """
def process_data(items: list[int], threshold: int = 10) -> list[int]:
    result = []
    for item in items:
        if item > threshold:
            result.append(item * 2)
        else:
            result.append(item)
    return result
"""
report = generator.analyze_coverage(codigo_test)
print(f"Funciones: {report['total_functions']}")
print(f"Branches sin test: {sum(1 for fn in report['functions'] for b in fn['branches'] if not b['has_test'])}")
```

## Ejercicio 7.4: Documentación Auto-actualizable

```python
import ast
import hashlib

class SelfUpdatingDocs:
    def __init__(self, doc_path: str = "README.md"):
        self.doc_path = doc_path
        self.fingerprints = {}

    def extract_api(self, codigo: str) -> list[dict]:
        """Extrae la API pública de un módulo Python usando AST."""
        tree = ast.parse(codigo)
        api = []

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef) and not node.name.startswith("_"):
                fn_info = {
                    "name": node.name,
                    "line": node.lineno,
                    "args": [a.arg for a in node.args.args],
                    "returns": None,
                    "docstring": ast.get_docstring(node),
                    "signature_hash": hashlib.md5(
                        f"{node.name}:{node.args.args}".encode()
                    ).hexdigest()[:8],
                }
                api.append(fn_info)

            elif isinstance(node, ast.ClassDef):
                class_info = {
                    "name": node.name,
                    "line": node.lineno,
                    "methods": [],
                    "docstring": ast.get_docstring(node),
                }
                for item in node.body:
                    if isinstance(item, ast.FunctionDef) and not item.name.startswith("_"):
                        class_info["methods"].append(item.name)
                api.append(class_info)

        return api

    def detect_changes(self, codigo_nuevo: str) -> list[dict]:
        """Detecta cambios en la API comparando fingerprints."""
        api_actual = self.extract_api(codigo_nuevo)
        cambios = []

        for item in api_actual:
            if isinstance(item, dict) and "signature_hash" in item:
                name = item["name"]
                old_hash = self.fingerprints.get(name)
                if old_hash and old_hash != item["signature_hash"]:
                    cambios.append({
                        "type": "modified",
                        "name": name,
                        "old_hash": old_hash,
                        "new_hash": item["signature_hash"],
                    })
                elif not old_hash:
                    cambios.append({"type": "new", "name": name})
                self.fingerprints[name] = item["signature_hash"]

        return cambios

    def update_docs(self, codigo_nuevo: str) -> str:
        """Actualiza la documentación basada en código nuevo."""
        cambios = self.detect_changes(codigo_nuevo)

        if not cambios:
            return "No changes detected."

        changelog_entries = []
        for cambio in cambios:
            if cambio["type"] == "modified":
                prompt = f"""
La función `{cambio['name']}` ha cambiado su firma.
Genera un changelog entry y actualiza la documentación.
Formato: - [{fecha}] {cambio['name']}: {descripción del cambio}
"""
                changelog_entries.append(f"- `{cambio['name']}`: firma modificada")
            elif cambio["type"] == "new":
                changelog_entries.append(f"- `{cambio['name']}`: nueva función agregada")

        return "\n".join(changelog_entries)

docs = SelfUpdatingDocs()

codigo_v1 = """
def get_user(user_id: int) -> dict:
    \"\"\"Obtiene un usuario por ID.\"\"\"
    pass

def create_user(name: str, email: str) -> dict:
    \"\"\"Crea un nuevo usuario.\"\"\"
    pass
"""

codigo_v2 = """
def get_user(user_id: int) -> dict:
    \"\"\"Obtiene un usuario por ID.\"\"\"
    pass

def create_user(name: str, email: str, role: str = "user") -> dict:
    \"\"\"Crea un nuevo usuario con rol opcional.\"\"\"
    pass

def delete_user(user_id: int) -> bool:
    \"\"\"Elimina un usuario (soft delete).\"\"\"
    pass
"""

# Primera extracción
docs.extract_api(codigo_v1)
docs.fingerprints = {
    "get_user": hashlib.md5(b"get_user:[user_id]").hexdigest()[:8],
    "create_user": hashlib.md5(b"create_user:[name, email]").hexdigest()[:8],
}

# Detectar cambios
cambios = docs.detect_changes(codigo_v2)
for c in cambios:
    print(f"{c['type']}: {c['name']}")
```

## Ejercicio 7.5: API Gateway Prompter

```python
from openai import OpenAI

client = OpenAI()

def disenar_api_gateway(requerimientos_nl: str) -> str:
    prompt = f"""
Eres un API Gateway Architect.

REQUERIMIENTOS DE NEGOCIO:
{requerimientos_nl}

Genera la especificación completa de un API Gateway que incluya:

1. ROUTING
   - Mapeo de rutas a microservicios
   - Path rewriting y versionado
   - Weighted routing para canary deployments

2. SEGURIDAD
   - Autenticación (JWT, OAuth2, API Keys)
   - Rate limiting por: IP, usuario, plan
   - WAF rules (OWASP CRS)
   - IP whitelist/blacklist

3. TRANSFORMACIONES
   - Request/response transformation
   - Header injection/removal
   - Response aggregation (si aplica)
   - Protocol translation (HTTP → gRPC)

4. CACHING
   - Políticas de caché por ruta
   - Cache invalidation
   - TTL por tipo de contenido

5. OBSERVABILIDAD
   - Métricas (prometheus)
   - Logging estructurado
   - Distributed tracing (OpenTelemetry)
   - Alertas y thresholds

6. GestiÓN DE ERRORES
   - Circuit breaker por servicio
   - Retry policies
   - Timeout configuration
   - Fallback responses

Output como JSON estructurado.
"""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.3,
    )
    return response.choices[0].message.content

reqs = """
Necesito un API Gateway para 3 microservicios:
- Servicio A (Python/FastAPI): CRUD de usuarios, autenticación
- Servicio B (Go): Procesamiento de pagos
- Servicio C (Node.js): Notificaciones email/SMS

Requerimientos:
- 50K requests/minuto
- Autenticación centralizada JWT
- Rate limiting: 100 req/min para usuarios free, 1000 para premium
- Cache de respuestas GET por 5 minutos
- Canary deployments (10% tráfico a nueva versión)
- Downtime zero para deploys
"""

print(disenar_api_gateway(reqs))
```
