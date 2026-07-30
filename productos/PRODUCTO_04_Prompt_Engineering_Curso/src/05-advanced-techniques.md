# Módulo 5: Técnicas Avanzadas de Prompting

## 5.1 Tree-of-Thought (ToT) para Decisiones de Arquitectura

Tree-of-Thought explora múltiples líneas de razonamiento en paralelo, evalúa cada una, y selecciona la más prometedora. Ideal para decisiones arquitectónicas donde hay múltiples caminos válidos.

```python
# Ejemplo 5.1: ToT para decisión de arquitectura
from openai import OpenAI
from typing import Optional

client = OpenAI()

class TreeOfThought:
    def __init__(self, problema: str, criterios: list[str]):
        self.problema = problema
        self.criterios = criterios
        self.arbol = {"raiz": {"hijos": [], "evaluacion": None}}

    def generar_ramas(self, nodo: str, n_ramas: int = 3) -> list[str]:
        prompt = f"""
Problema arquitectónico: {self.problema}

Nodo actual: {nodo}

Genera {n_ramas} enfoques o soluciones diferentes para este problema.
Cada enfoque debe ser sustancialmente diferente (no variaciones menores).
Para cada enfoque, explica el rationale principal y los trade-offs clave.

Formato:
ENFOQUE 1:
- Nombre: [nombre significativo]
- Rationale: ...
- Trade-offs: ...

ENFOQUE 2:
...
"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        # Parsear las N respuestas
        texto = response.choices[0].message.content
        ramas = self._parsear_enfoques(texto)
        return ramas

    def evaluar_rama(self, enfoque: str) -> dict[str, float]:
        prompt = f"""
Evalúa el siguiente enfoque arquitectónico contra estos criterios:

ENFOQUE:
{enfoque}

CRITERIOS (peso 1-5):
{chr(10).join(f'- {c}' for c in self.criterios)}

Para cada criterio, asigna un score 1-10 y justifica brevemente.
Luego calcula el puntaje ponderado total.

Formato:
CRITERIO: N - justificación
...
PUNTAJE TOTAL: [0-10]
"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        return {"evaluacion": response.choices[0].message.content}

    def explorar(self, profundidad: int = 2, ramas_por_nivel: int = 3):
        """Explora el árbol hasta cierta profundidad."""
        niveles = [["raiz"]]
        for nivel in range(profundidad):
            nuevas_ramas = []
            for nodo in niveles[-1]:
                if nodo == "raiz":
                    ramas = self.generar_ramas(self.problema, ramas_por_nivel)
                    self.arbol["raiz"]["hijos"] = ramas
                    nuevas_ramas.extend(ramas)
                else:
                    sub_ramas = self.generar_ramas(nodo, 2)
                    self.arbol[nodo] = {"hijos": sub_ramas, "evaluacion": None}
                    nuevas_ramas.extend(sub_ramas)
            niveles.append(nuevas_ramas)
        return niveles


# Uso: decidir entre arquitecturas para un sistema de pagos
tot = TreeOfThought(
    problema="Diseñar la arquitectura para un sistema de procesamiento de pagos que maneje 10K transacciones/minuto con múltiples proveedores",
    criterios=[
        "Disponibilidad (99.99% uptime) [peso 5]",
        "Consistencia de datos [peso 5]",
        "Latencia p99 < 200ms [peso 4]",
        "Costos operativos [peso 3]",
        "Facilidad de mantenimiento [peso 2]",
    ]
)

niveles = tot.explorar(profundidad=2, ramas_por_nivel=3)
```

## 5.2 ReAct Pattern (Reasoning + Acting)

ReAct intercala razonamiento y acciones, ideal para LLMs que deben usar herramientas o APIs.

```python
# Ejemplo 5.2: ReAct para debugging con herramientas
REACT_PROMPT = """
Eres un asistente de debugging que puede usar herramientas para investigar problemas.

Te comportas con el ciclo ReAct:

Thought: Razonas sobre el problema actual y qué información necesitas
Action: Usas una herramienta disponible
Observation: Ves el resultado de la acción
... (repite hasta tener suficiente información)
Thought: Tienes toda la información, puedes responder
Answer: Respuesta final con el diagnóstico y solución

HERRAMIENTAS DISPONIBLES:
1. read_file(path: str) - Lee el contenido de un archivo
2. grep_search(pattern: str, path: str) - Busca un patrón en archivos
3. run_test(test_name: str) - Ejecuta un test específico
4. check_logs(service: str, lines: int) - Últimas N líneas de logs
5. query_db(sql: str) - Ejecuta una consulta SQL de solo lectura

Ejemplo:
User: La API /users/:id está devolviendo 500 en producción

Thought: Primero necesito ver los logs del servicio para entender el error específico.
Action: check_logs(service="api-users", lines=50)
Observation: [log] ERROR: psycopg2.errors.NotNullViolation: null value in column "email"...
Thought: Hay un error de PostgreSQL por null en columna email. Esto ocurre al insertar un usuario sin email. Revisemos el modelo para entender la restricción.
Action: grep_search(pattern="email", path="src/models/user.py")
Observation: email = Column(String, nullable=False)
Thought: La columna email es NOT NULL pero el código de creación no está validando que el campo exista. También revisemos el schema Pydantic.
Action: read_file(path="src/schemas/user.py")
Observation: class UserCreate(BaseModel): name: str; email: Optional[str] = None
Thought: El schema tiene email como Optional[str] = None, permitiendo valores nulos que violan la restricción de base de datos.
Answer: Causa raíz: El schema Pydantic UserCreate define email como opcional (Optional[str] = None), pero la columna en PostgreSQL es NOT NULL. Solución: Cambiar email a str en el schema. Además agregar validación de email en el endpoint.

AHORA RESUELVE:
User: {user_input}
"""

class ReActAgent:
    def __init__(self, herramientas: dict):
        self.herramientas = herramientas
        self.historial = []

    def ejecutar(self, user_input: str, max_iteraciones: int = 10) -> str:
        prompt = REACT_PROMPT.format(user_input=user_input)
        iteracion = 0

        while iteracion < max_iteraciones:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                stop=["Observation:"],
            )
            output = response.choices[0].message.content

            if "Answer:" in output:
                return output.split("Answer:")[-1].strip()

            # Extraer y ejecutar acción
            if "Action:" in output:
                accion = self._parsear_accion(output)
                herramienta = self.herramientas.get(accion["nombre"])
                if herramienta:
                    resultado = herramienta(**accion["args"])
                    prompt += f"\nObservation: {resultado}\n"
                else:
                    prompt += f"\nObservation: Herramienta '{accion['nombre']}' no encontrada\n"

            iteracion += 1

        return "Max iteraciones alcanzado."

    def _parsear_accion(self, output: str) -> dict:
        # Extrae Action: nombre_tool(args)
        import re
        match = re.search(r'Action: (\w+)\((.*?)\)', output, re.DOTALL)
        if match:
            nombre = match.group(1)
            args_str = match.group(2)
            args = {}
            for kv in re.findall(r'(\w+)\s*=\s*"([^"]*)"', args_str):
                args[kv[0]] = kv[1]
            return {"nombre": nombre, "args": args}
        return {"nombre": "", "args": {}}
```

## 5.3 Constitutional AI para Código Seguro

Define principios constitucionales que el LLM debe seguir al generar código.

```python
# Ejemplo 5.3: Constitución para generación de código
CONSTITUCION_CODIGO = """
ARTÍCULO 1: SEGURIDAD
- Nunca generes código con vulnerabilidades conocidas (OWASP Top 10)
- Todos los inputs deben ser validados y sanitizados
- No uses eval(), exec(), o similares con datos del usuario
- Las queries SQL deben ser parametrizadas (parameterized/ prepared statements)
- Los secretos nunca deben hardcodearse

ARTÍCULO 2: CORRECCIÓN
- El código debe ser sintácticamente válido en el lenguaje target
- Las firmas de funciones deben coincidir con su implementación
- Los tipos deben ser consistentes en todo el código
- El código debe manejar edge cases documentados

ARTÍCULO 3: MANTENIBILIDAD
- Sigue el principio de responsabilidad única
- Las funciones > 50 líneas deben refactorizarse
- Los nombres deben revelar intención
- Documenta el "por qué", no el "qué"

ARTÍCULO 4: RENDIMIENTO
- Complejidad algorítmica debe ser apropiada al problema
- Evita N+1 queries y loops innecesarios
- Usa estructuras de datos adecuadas
- Perfilamiento antes de optimizar

ARTÍCULO 5: PRIVACIDAD
- No incluyas datos personales en logs o mensajes de error
- Implementa el mínimo privilegio de datos
- Los datos sensibles en memoria deben limpiarse explícitamente
"""

def codigo_constitucional(tarea: str, articulos_extra: list[str] = None) -> str:
    """Genera código que debe cumplir con la constitución."""
    prompt = f"""CONSTITUCIÓN DE CÓDIGO:
{CONSTITUCION_CODIGO}
{chr(10).join(articulos_extra) if articulos_extra else ""}

TAREA:
{tarea}

Debes generar código que cumpla estrictamente con TODOS los artículos de la constitución.
Si la tarea entra en conflicto con algún artículo, recházala explicando por qué.

Al final de tu respuesta, incluye una sección "VERIFICACIÓN" donde:
- ✅ Artículos cumplidos
- ❌ Artículos violados (si alguno, explica por qué fue necesario)
"""
    return prompt
```

## 5.4 Skeleton-of-Thought para Salida Estructurada

Primero genera un esqueleto de la respuesta, luego expande cada sección. Ideal para documentos técnicos largos o código con estructura predecible.

```python
# Ejemplo 5.4: Skeleton-of-Thought para diseño de API
SKELETON_PROMPT = """
Genera el esqueleto (outline) de un archivo Python para una API REST FastAPI.

TEMA: {tema}

ESQUELETO REQUERIDO:
1. Imports (estándar, terceros, locales)
2. Config (settings, DB, Redis)
3. Modelos Pydantic (request/response, DTOs)
4. Dependencias (auth, pagination, rate-limit)
5. Endpoints (CRUD + específicos del dominio)
6. Handlers de errores
7. Eventos de ciclo de vida

Para cada sección del esqueleto, incluye:
- Una línea de descripción (1-2 palabras)
- Dependencias clave

No expandas el código aún. Solo genera el esqueleto.
"""

EXPAND_SKELETON = """
Aquí está el esqueleto completo:

{esqueleto}

Ahora expande ÚNICAMENTE la sección: {seccion}

Reglas para la expansión:
- Código completo con imports necesarios
- Type hints en todas partes
- Docstrings Google style
- Manejo de errores
- Logging estructurado

Las otras secciones deben aparecer como "..."
"""

def skeleton_of_thought(tema: str) -> str:
    # Fase 1: Generar esqueleto
    response_esqueleto = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": SKELETON_PROMPT.format(tema=tema)}],
        temperature=0.3,
    )
    esqueleto = response_esqueleto.choices[0].message.content

    # Fase 2: Expandir cada sección
    secciones = ["Imports y Config", "Modelos Pydantic", "Endpoints", "Handlers"]
    codigo_completo = []

    for seccion in secciones:
        prompt = EXPAND_SKELETON.format(esqueleto=esqueleto, seccion=seccion)
        response_exp = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        codigo_completo.append(f"# === {seccion} ===\n{response_exp.choices[0].message.content}")

    return "\n\n".join(codigo_completo)
```

## 5.5 Ejercicios

### Ejercicio 5.1: ToT para Estrategia de Migración
Usa Tree-of-Thought para evaluar 3 estrategias de migración de una base de datos MySQL de 2TB a PostgreSQL con cero downtime. Los criterios incluyen: tiempo total, riesgo de pérdida de datos, complejidad de rollback, costo de infraestructura.

### Ejercicio 5.2: ReAct Agent Personalizado
Implementa un ReAct agent que pueda usar estas herramientas para resolver un problema de debugging:
- `git_log(file, n=10)` — últimos N commits de un archivo
- `docker_logs(container, lines=50)` — logs de contenedor
- `kubectl_get_pods(namespace)` — estado de pods
- `curl_check(url, timeout=5)` — health check HTTP

### Ejercicio 5.3: Constitución de Seguridad
Extiende `CONSTITUCION_CODIGO` con 5 artículos específicos para desarrollo mobile (Android/Kotlin). Implementa un validador que verifique que el código generado cumple los artículos antes de devolverlo.

### Ejercicio 5.4: Skeleton-of-Thought para Test Suite
Usa Skeleton-of-Thought para generar una suite completa de tests. El esqueleto debe tener: fixtures, tests unitarios, tests de integración, tests de contrato. Expande cada sección con pytest.

### Ejercicio 5.5: Pipeline Multitécnica
Combina ToT + ReAct + Skeleton-of-Thought en un pipeline que:
1. ToT decide la arquitectura
2. ReAct investiga dependencias y restricciones del sistema actual
3. Skeleton-of-Thought genera el código estructurado
4. Constitutional AI verifica el resultado

---

**Soluciones en:** `exercises/module-5-solutions.md`
