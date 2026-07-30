# Módulo 8: Proyecto Final — Asistente de Código Multi-Prompt

## Visión General

Construirás un **asistente de código prompt-driven** que orquesta múltiples prompts especializados para realizar tareas complejas de desarrollo de software. El asistente recibe una descripción de alto nivel y produce código listo para producción, documentación, y tests.

## Arquitectura del Sistema

```
User Input (NL)
    │
    ▼
┌─────────────────────────────┐
│   Orquestador Principal     │
│   - Parseo de intención     │
│   - Routing a expertos      │
│   - Coordinación de flujo   │
└──────────┬──────────────────┘
           │
    ┌──────┼──────┬────────┐
    ▼      ▼      ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Expert │ │ Expert │ │ Expert │ │ Expert │
│ Backend│ │Frontend│ │  Docs  │ │ Tests  │
└───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
    │          │          │          │
    └──────────┴──────────┴──────────┘
                      │
                      ▼
           ┌──────────────────┐
           │   Validador      │
           │  (Constitutional │
           │   AI + linters)  │
           └────────┬─────────┘
                    │
                    ▼
           ┌──────────────────┐
           │   Output Final   │
           │   (Código + Docs │
           │   + Tests)       │
           └──────────────────┘
```

## 8.1 El Orquestador

```python
from openai import OpenAI
from typing import Optional
from pydantic import BaseModel
from enum import Enum

client = OpenAI()

class TareaType(str, Enum):
    API = "api"
    COMPONENTE = "componente"
    PIPELINE_DATOS = "pipeline_datos"
    INFRA = "infraestructura"
    TEST = "tests"
    DOCS = "documentacion"
    REFACTOR = "refactorizacion"

class Solicitud(BaseModel):
    descripcion: str
    lenguaje: str = "Python"
    framework: Optional[str] = None
    tarea_type: Optional[TareaType] = None
    restricciones: list[str] = []

class RespuestaExperto(BaseModel):
    codigo: str
    explicacion: str
    riesgos: list[str]
    tokens_usados: int

class Orquestador:
    def __init__(self):
        self.expertos = {
            TareaType.API: ExpertoBackend(),
            TareaType.COMPONENTE: ExpertoFrontend(),
            TareaType.TEST: ExpertoTests(),
            TareaType.DOCS: ExpertoDocumentacion(),
            TareaType.REFACTOR: ExpertoRefactor(),
        }

    def clasificar_tarea(self, solicitud: Solicitud) -> TareaType:
        prompt = f"""
Clasifica la siguiente solicitud de desarrollo en UNA de estas categorías:
- api: endpoints, routers, middleware, authentication
- componente: UI components, hooks, templates
- pipeline_datos: ETL, data processing, ML pipelines
- infraestructura: Docker, K8s, Terraform, CI/CD
- tests: unit, integration, E2E tests
- documentacion: README, docs, docstrings
- refactorizacion: mejorar código existente

SOLICITUD: {solicitud.descripcion}
LENGUAJE: {solicitud.lenguaje}
FRAMEWORK: {solicitud.framework}

Responde SOLO con el nombre de la categoría.
"""
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=20,
        )
        return TareaType(response.choices[0].message.content.strip().lower())

    def ejecutar(self, solicitud: Solicitud) -> dict:
        tarea_type = self.clasificar_tarea(solicitud)
        experto = self.expertos.get(tarea_type)

        if not experto:
            return {"error": f"No hay experto para {tarea_type}"}

        # Extraer contexto adicional
        contexto = self._extraer_contexto(solicitud)

        # Ejecutar experto principal
        resultado = experto.generar(solicitud, contexto)

        # Validar resultado
        validador = ValidadorConstitucional()
        validacion = validador.validar(resultado.codigo, solicitud.lenguaje)

        # Generar tests si aplica
        tests = None
        if validacion["score"] > 0.7:
            test_expert = ExpertoTests()
            tests = test_expert.generar_para_codigo(resultado.codigo, solicitud)

        return {
            "tarea": tarea_type,
            "codigo": resultado.codigo,
            "explicacion": resultado.explicacion,
            "riesgos": resultado.riesgos,
            "validacion": validacion,
            "tests": tests,
            "tokens_totales": resultado.tokens_usados + (tests.tokens_usados if tests else 0),
        }

    def _extraer_contexto(self, solicitud: Solicitud) -> dict:
        prompt = f"""
De la siguiente solicitud de desarrollo, extrae:
1. Funcionalidad principal (1 frase)
2. Requerimientos no funcionales (performance, seguridad, escalabilidad)
3. Integraciones externas (APIs, servicios, DBs)
4. Restricciones técnicas explícitas
5. Suposiciones implícitas

SOLICITUD: {solicitud.descripcion}

Formato: JSON
"""
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        import json
        return json.loads(response.choices[0].message.content)
```

## 8.2 Expertos Especializados

### Experto Backend

```python
class ExpertoBackend:
    def generar(self, solicitud: Solicitud, contexto: dict) -> RespuestaExperto:
        prompt = f"""
Eres un Senior Backend Engineer. Genera código completo.

LENGUAJE: {solicitud.lenguaje}
FRAMEWORK: {solicitud.framework or 'No especificado'}
RESTRICCIONES: {', '.join(solicitud.restricciones)}

SOLICITUD:
{solicitud.descripcion}

CONTEXTO ADICIONAL:
{contexto}

REQUISITOS DE CALIDAD:
- Type hints en todas las funciones
- Manejo de errores específico (no Exception genérica)
- Logging estructurado
- Documentación de funciones públicas
- Tests unitarios embebidos (doctest o assert statements)

GENERA:
1. Estructura de archivos
2. Código completo de cada archivo
3. Instrucciones de configuración (env vars, dependencias)
"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.15,
        )
        return RespuestaExperto(
            codigo=response.choices[0].message.content,
            explicacion="Código backend generado con arquitectura limpia.",
            riesgos=["Validar dependencias externas", "Configurar variables de entorno"],
            tokens_usados=response.usage.total_tokens if response.usage else 0,
        )
```

### Experto Tests

```python
class ExpertoTests:
    def generar_para_codigo(self, codigo: str, solicitud: Solicitud) -> RespuestaExperto:
        prompt = f"""
Genera tests exhaustivos para el siguiente código.

CÓDIGO:
```{solicitud.lenguaje.lower()}
{codigo}
```

COBERTURA REQUERIDA:
✅ Happy path (caso principal de uso)
✅ Edge cases (valores límite, vacío, nulos)
✅ Error cases (inputs inválidos, excepciones)
✅ Boundary conditions

FORMATO: pytest con fixtures
CADA TEST debe: independiente, nombre descriptivo, assert específico

TESTS ADICIONALES:
- Test de integración si hay I/O externo
- Test de performance para funciones críticas
- Property-based testing (hypothesis) donde aplicable
"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
        )
        return RespuestaExperto(
            codigo=response.choices[0].message.content,
            explicacion="Test suite generada con pytest.",
            riesgos=["Verificar que los mocks reflejen el comportamiento real"],
            tokens_usados=response.usage.total_tokens if response.usage else 0,
        )
```

### Experto Frontend

```python
class ExpertoFrontend:
    def generar(self, solicitud: Solicitud, contexto: dict) -> RespuestaExperto:
        prompt = f"""
Eres un Senior Frontend Engineer React/TypeScript.

Genera un componente completo que:
{solicitud.descripcion}

CONTEXTO:
{contexto}

REQUISITOS:
- TypeScript estricto, zero `any`
- Estados visuales: loading, error, empty, success
- Responsive (mobile-first)
- Accesibilidad WCAG 2.1 AA
- Test unitario del componente
- Storybook story

ESTRUCTURA DEL OUTPUT:
1. Componente principal
2. Subcomponentes (si aplica)
3. Tipos e interfaces
4. Custom hooks (lógica separada de presentación)
5. Tests
"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        return RespuestaExperto(
            codigo=response.choices[0].message.content,
            explicacion="Componente frontend con estados y accesibilidad.",
            riesgos=["Verificar bundlesize", "Probar en múltiples navegadores"],
            tokens_usados=response.usage.total_tokens if response.usage else 0,
        )
```

### Experto Documentación

```python
class ExpertoDocumentacion:
    def generar(self, solicitud: Solicitud, contexto: dict) -> RespuestaExperto:
        prompt = f"""
Eres un Technical Writer. Genera documentación completa.

PROYECTO:
{solicitud.descripcion}

TECNOLOGÍAS: {solicitud.lenguaje}, {solicitud.framework or "N/A"}

DOCUMENTACIÓN A GENERAR:

1. README.md
   - Título y descripción
   - Instalación (prerrequisitos, pasos)
   - Configuración (variables de entorno)
   - Uso básico (ejemplos de código)
   - API Reference (si aplica)
   - Contribución
   - Licencia

2. ARCHITECTURE.md (si el proyecto es complejo)
   - Diagrama en Mermaid
   - Decisiones técnicas (ADRs)
   - Flujo de datos

3. CHANGELOG.md (formato Keep a Changelog)

4. API Docs (OpenAPI 3.1 si es API REST)
   - Endpoints con ejemplos
   - Schemas
   - Códigos de error
"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return RespuestaExperto(
            codigo=response.choices[0].message.content,
            explicacion="Documentación completa generada.",
            riesgos=["Actualizar docs cuando cambie la implementación"],
            tokens_usados=response.usage.total_tokens if response.usage else 0,
        )
```

### Experto Refactor

```python
class ExpertoRefactor:
    def generar(self, solicitud: Solicitud, contexto: dict) -> RespuestaExperto:
        prompt = f"""
Eres un Refactoring Specialist. Analiza y mejora el siguiente código.

CÓDIGO ORIGINAL:
{solicitud.descripcion}

OBJETIVOS DE REFACTOR (priorizados):
1. Legibilidad
2. Mantenibilidad
3. Performance
4. Testabilidad

ANÁLISIS REQUERIDO:
- Código duplicado (DRY)
- Funciones largas (> 20 líneas)
- Complejidad ciclomática (> 10)
- Acoplamiento alto
- Nombres que no revelan intención
- Efectos secundarios ocultos
- Mutabilidad innecesaria

OUTPUT EN FORMATO:
## Análisis
[lista de issues encontrados]

## Código Refactorizado
[código completo]

## Cambios Realizados
| Archivo | Línea | Cambio | Razón |
|---------|-------|--------|-------|

## Riesgos
- [riesgo] - [mitigación]
"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.15,
        )
        return RespuestaExperto(
            codigo=response.choices[0].message.content,
            explicacion="Análisis y refactorización completa.",
            riesgos=["Regression testing requerido después de refactor"],
            tokens_usados=response.usage.total_tokens if response.usage else 0,
        )
```

## 8.3 Validador Constitucional

```python
class ValidadorConstitucional:
    def validar(self, codigo: str, lenguaje: str) -> dict:
        prompt = f"""
Eres un validador de código constitucional. Revisa el siguiente código.

CÓDIGO A VALIDAR:
```{lenguaje.lower()}
{codigo}
```

ARTÍCULOS A VERIFICAR:

1. SEGURIDAD
   - ❌ SQL injection posible?
   - ❌ Secrets hardcodeados?
   - ❌ eval()/exec() con datos externos?
   - ❌ XSS posible en outputs?

2. CORRECCIÓN
   - ❌ Syntax errors?
   - ❌ Type mismatches?
   - ❌ Unused variables/imports?
   - ❌ Posible NullPointer/None access?

3. MANTENIBILIDAD
   - ❌ Funciones > 50 líneas?
   - ❌ Complejidad ciclomática > 15?
   - ❌ Magic numbers?
   - ❌ Código comentado?

4. PERFORMANCE
   - ❌ N+1 queries?
   - ❌ Loops innecesarios?
   - ❌ Estructuras de datos ineficientes?

Devuelve JSON:
{{"score": 0.0-1.0, "violaciones": [{{"articulo": "...", "severidad": "critical|major|minor", "linea": N, "descripcion": "..."}}], "recomendaciones": ["..."]}}
"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        import json
        return json.loads(response.choices[0].message.content)
```

## 8.4 Sistema de Evaluación

```python
class Evaluator:
    """Evalúa la calidad del código generado por el orquestador."""

    def __init__(self):
        self.metricas = {}

    def evaluar_codigo(self, codigo: str, lenguaje: str) -> dict:
        resultados = {}

        # Métrica 1: Corrección sintáctica
        resultados["sintaxis_valida"] = self._validar_sintaxis(codigo, lenguaje)

        # Métrica 2: Completitud
        resultados["tiene_imports"] = "import" in codigo or "from" in codigo
        resultados["tiene_type_hints"] = "->" in codigo and ":" in codigo.split("\n")[0] if codigo else False
        resultados["tiene_docstrings"] = '"""' in codigo or "'''" in codigo
        resultados["tiene_error_handling"] = "try" in codigo or "except" in codigo or "Result" in codigo

        # Métrica 3: Riesgos de seguridad
        riesgos = []
        if "eval(" in codigo or "exec(" in codigo:
            riesgos.append("Uso de eval/exec detectado")
        if "password" in codigo.lower() or "secret" in codigo.lower() or "api_key" in codigo.lower():
            if 'os.getenv' not in codigo and 'os.environ' not in codigo:
                riesgos.append("Posible hardcodeo de secretos")
        resultados["riesgos"] = riesgos

        # Métrica 4: Estilo
        lines = codigo.split("\n")
        long_lines = [i+1 for i, l in enumerate(lines) if len(l) > 100]
        resultados["lineas_largas"] = long_lines[:5]
        resultados["total_lineas"] = len(lines)

        return resultados

    def _validar_sintaxis(self, codigo: str, lenguaje: str) -> bool:
        import tempfile
        import subprocess
        try:
            with tempfile.NamedTemporaryFile(suffix=f".{lenguaje.lower()}", mode="w", delete=False) as f:
                f.write(codigo)
                fname = f.name
            if lenguaje.lower() == "python":
                result = subprocess.run(["python", "-m", "py_compile", fname], capture_output=True, text=True)
                return result.returncode == 0
            return True  # Para otros lenguajes, skip
        except:
            return True
        finally:
            import os
            try:
                os.unlink(fname)
            except:
                pass

    def reporte(self, resultados: dict) -> str:
        lines = ["# Reporte de Evaluación", ""]
        lines.append(f"Score general: {sum(1 for v in resultados.values() if v == True) / max(len(resultados), 1):.0%}")
        lines.append("")
        for k, v in resultados.items():
            if isinstance(v, list) and v:
                lines.append(f"⚠ {k}: {len(v)} encontrados")
                for item in v[:3]:
                    lines.append(f"  - {item}")
            elif isinstance(v, bool):
                lines.append(f"{'✅' if v else '❌'} {k}")
        return "\n".join(lines)
```

## 8.5 Pipeline Completo

```python
class CodeAssistant:
    """Asistente de código prompt-driven completo."""

    def __init__(self):
        self.orquestador = Orquestador()
        self.evaluator = Evaluator()
        self.historial = []

    def process(self, descripcion: str, lenguaje: str = "Python", framework: str = None) -> dict:
        solicitud = Solicitud(
            descripcion=descripcion,
            lenguaje=lenguaje,
            framework=framework,
        )

        # Fase 1: Orquestación
        resultado = self.orquestador.ejecutar(solicitud)

        if "error" in resultado:
            return resultado

        # Fase 2: Evaluación
        evaluacion = self.evaluator.evaluar_codigo(
            resultado.get("codigo", ""),
            lenguaje
        )
        resultado["evaluacion"] = evaluacion

        # Fase 3: Logging
        self.historial.append({
            "solicitud": solicitud.model_dump(),
            "resultado": resultado,
            "timestamp": __import__("datetime").datetime.now().isoformat(),
        })

        return resultado


# EJEMPLO DE USO FINAL
assistant = CodeAssistant()

resultado = assistant.process(
    descripcion="""
Crea una API REST para un sistema de gestión de tareas (Task Manager).
Requerimientos:
- CRUD de tareas con título, descripción, prioridad (baja/media/alta), estado (pendiente/en-progreso/completada)
- Autenticación JWT
- Filtros: por estado, prioridad, fecha límite
- Paginación cursor-based
- Documentación OpenAPI automática
- Tests unitarios
    """,
    lenguaje="Python",
    framework="FastAPI"
)

print("=== CÓDIGO GENERADO ===")
print(resultado.get("codigo", "No disponible")[:2000])
print("\n=== EVALUACIÓN ===")
print(resultado.get("evaluacion", {}))
print("\n=== RIESGOS ===")
for riesgo in resultado.get("riesgos", []):
    print(f"  ⚠ {riesgo}")
```

## Entregables del Proyecto Final

1. **Código completo del asistente** (orquestador + expertos + validador)
2. **Al menos 3 tareas de prueba** que demuestren diferentes rutas del orquestador
3. **Reporte de evaluación** para cada tarea
4. **Documentación del sistema** (README del proyecto + ADRs)
5. **Benchmark**: tiempo promedio de respuesta, tokens usados, tasa de éxito

## Criterios de Evaluación

| Criterio | Peso | Descripción |
|----------|:----:|-------------|
| Corrección del código generado | 30% | El código es sintácticamente válido y funcional |
| Calidad de la arquitectura | 20% | Separación de concerns, patrones adecuados |
| Cobertura de tests | 15% | Tests generados cubren casos principales y bordes |
| Seguridad | 10% | No introduce vulnerabilidades |
| Documentación | 10% | Completa y clara |
| Eficiencia del pipeline | 10% | Uso óptimo de tokens, latencia mínima |
| Evaluación reflexiva | 5% | Análisis honesto de limitaciones y mejoras |

---

**Soluciones en:** `exercises/module-8-solutions.md`

¡Felicidades por completar el curso! Ahora tienes todas las herramientas para integrar LLMs en tu flujo de desarrollo de manera profesional y sistemática.
