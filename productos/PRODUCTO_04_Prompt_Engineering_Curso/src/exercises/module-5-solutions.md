# Soluciones — Módulo 5: Técnicas Avanzadas

## Ejercicio 5.1: ToT para Estrategia de Migración

```python
from openai import OpenAI

client = OpenAI()

def tot_migracion():
    problema = """
    Migrar base de datos MySQL de 2TB a PostgreSQL con cero downtime.
    Requerimientos: consistencia, rollback posible, ventana de migración máxima 48hs.
    """

    # Paso 1: Generar 3 enfoques
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": f"""
{problema}

Genera 3 estrategias de migración fundamentalmente diferentes:

ENFOQUE 1: Migración por lotes (batch migration)
ENFOQUE 2: Réplica en vivo (live replication)
ENFOQUE 3: Blue-green con dual write

Para cada enfoque detalla:
- Cómo funciona
- Tiempo estimado
- Riesgo de pérdida de datos
- Complejidad de rollback
- Costo de infraestructura
"""}],
        temperature=0.7,
    )
    return response.choices[0].message.content

# Evaluación de cada enfoque
def evaluar_enfoque(enfoque: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": f"""
Evalúa este enfoque de migración contra estos criterios (peso 1-5):

CRITERIOS:
- Riesgo de pérdida de datos [peso 5]
- Tiempo total de migración [peso 4]
- Complejidad de rollback [peso 5]
- Costo de infraestructura [peso 3]
- Consistencia durante migración [peso 5]
- Complejidad técnica [peso 2]

ENFOQUE:
{enfoque}

Score 1-10 por criterio. Puntaje total ponderado.
"""},],
        temperature=0.2,
    )
    return response.choices[0].message.content

print("=== Árbol de decisión ===")
enfoques = tot_migracion()
print(enfoques)
```

## Ejercicio 5.2: ReAct Agent Personalizado

```python
from openai import OpenAI
import subprocess
import json
from typing import Optional

client = OpenAI()

class DebugReActAgent:
    def __init__(self):
        self.herramientas = {
            "git_log": self.git_log,
            "docker_logs": self.docker_logs,
            "kubectl_get_pods": self.kubectl_get_pods,
            "curl_check": self.curl_check,
        }

    def git_log(self, file: str, n: int = 10) -> str:
        try:
            result = subprocess.run(
                ["git", "log", f"-{n}", "--oneline", "--", file],
                capture_output=True, text=True, timeout=10
            )
            return result.stdout or "No commits found"
        except Exception as e:
            return f"Error: {e}"

    def docker_logs(self, container: str, lines: int = 50) -> str:
        return f"[Simulado] Últimas {lines} líneas de {container}: ..."

    def kubectl_get_pods(self, namespace: str) -> str:
        return f"[Simulado] Pods en {namespace}: pod-api-7d8f9 (Running), pod-worker-3a2b1 (CrashLoopBackOff)"

    def curl_check(self, url: str, timeout: int = 5) -> str:
        return f"[Simulado] GET {url} → 200 OK (245ms)"

    def ejecutar_ciclo(self, problema: str, max_iter: int = 5) -> str:
        historial = f"Problema: {problema}\n\n"
        prompt_base = """
Eres un asistente de debugging con herramientas.
Formato: Thought/Action/Observation/Answer.
Herramientas: git_log(file, n), docker_logs(container, lines), kubectl_get_pods(namespace), curl_check(url, timeout)
"""

        for i in range(max_iter):
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": prompt_base},
                    {"role": "user", "content": historial + "\nContinúa el razonamiento:"},
                ],
                temperature=0.3,
            )
            output = response.choices[0].message.content
            historial += output + "\n"

            if "Answer:" in output:
                return historial

            # Parsear y ejecutar acción
            if "Action:" in output:
                import re
                match = re.search(r'Action:\s*(\w+)\((.*?)\)', output, re.DOTALL)
                if match:
                    tool_name = match.group(1)
                    args_str = match.group(2)
                    try:
                        args = json.loads(f"{{{args_str}}}")
                    except:
                        args = {}
                    tool = self.herramientas.get(tool_name)
                    if tool:
                        resultado = tool(**args)
                        historial += f"Observation: {resultado}\n"

        return historial

agent = DebugReActAgent()
resultado = agent.ejecutar_ciclo("La API /users/:id está devolviendo 500 después del último deploy")
print(resultado)
```

## Ejercicio 5.3: Constitución de Seguridad Mobile

```python
CONST_ANDROID = """
ARTÍCULO 6: ALMACENAMIENTO LOCAL
- No uses SharedPreferences para datos sensibles (usa EncryptedSharedPreferences)
- Los tokens de autenticación deben ir en EncryptedSharedPreferences o en Android Keystore
- No almacenes contraseñas en texto plano

ARTÍCULO 7: COMUNICACIONES
- Todo tráfico de red debe usar HTTPS con TLS 1.2+
- Implementa certificate pinning para APIs críticas
- Validación de SSL en debug mode pero no en release

ARTÍCULO 8: PERMISOS
- Solicita permisos en tiempo de uso, no al instalar
- Nunca solicites permisos que no necesitas (principio de mínimo privilegio)
- Maneja la denegación de permisos gracefulmente

ARTÍCULO 9: LOGGING Y DEBUG
- No loggees datos sensibles (passwords, tokens, PII)
- ProGuard/R8 debe ofuscar el código en release
- Los logs de debug no deben estar visibles en producción

ARTÍCULO 10: WEBVIEW
- No habilites JavaScript a menos que sea necesario
- No expongas interfaces JavaScript a contenido no confiable
- Limpia cookies y caché al cerrar sesión
"""

class MobileConstitutionalValidator:
    def __init__(self):
        self.articulos = CONST_ANDROID.split("ARTÍCULO")

    def validate(self, codigo_kotlin: str) -> list[dict]:
        violaciones = []

        # Artículo 6 checks
        if "SharedPreferences" in codigo_kotlin and "EncryptedSharedPreferences" not in codigo_kotlin:
            violaciones.append({"articulo": 6, "severidad": "HIGH", "descripcion": "SharedPreferences sin encriptar para datos sensibles"})

        # Artículo 7 checks
        if "http://" in codigo_kotlin:
            violaciones.append({"articulo": 7, "severidad": "CRITICAL", "descripcion": "Conexión HTTP sin TLS detectada"})

        # Artículo 9 checks
        if "Log.d" in codigo_kotlin or "Log.i" in codigo_kotlin:
            violaciones.append({"articulo": 9, "severidad": "MEDIUM", "descripcion": "Logs de debug en código release"})

        # Artículo 8 checks
        if "Manifest.permission" in codigo_kotlin and "onRequestPermissionsResult" not in codigo_kotlin:
            violaciones.append({"articulo": 8, "severidad": "MEDIUM", "descripcion": "Permisos sin manejo de denegación"})

        return violaciones

validator = MobileConstitutionalValidator()
codigo = """
val prefs = getSharedPreferences("session", Context.MODE_PRIVATE)
prefs.edit().putString("token", authToken).apply()

Log.d("Auth", "Token: " + authToken)

val url = "http://api.example.com/data"
"""
violaciones = validator.validate(codigo)
for v in violaciones:
    print(f"Artículo {v['articulo']} [{v['severidad']}]: {v['descripcion']}")
```

## Ejercicio 5.4: Skeleton-of-Thought para Test Suite

```python
SKELETON_TEST = """
Genera el esqueleto de una suite de tests pytest para un módulo de procesamiento de pagos.

ESQUELETO REQUERIDO:

1. Fixtures compartidas (conftest.py)
   - db_session: sesión de BD transaccional
   - client: test client de FastAPI
   - auth_headers: token JWT para tests autenticados
   - mock_stripe: mock de API de Stripe
   - payment_data: datos de prueba para pagos

2. Tests unitarios (test_services.py)
   - test_process_payment_success
   - test_process_payment_insufficient_funds
   - test_process_payment_invalid_card
   - test_refund_full
   - test_refund_partial

3. Tests de integración (test_integration.py)
   - test_payment_flow_complete (crear cargo + webhook + confirmación)
   - test_webhook_duplicated_event (idempotencia)
   - test_subscription_renewal_automatic

4. Tests de contrato (test_contracts.py)
   - test_api_response_format (schema validation)
   - test_error_response_format (RFC 7807)

NO expandas, solo genera el esqueleto con nombres y tipos de fixtures.
"""

def expand_test_section(skeleton: str, section: str) -> str:
    EXPAND_TEMPLATE = """
Esqueleto base:
{skeleton}

Expande SOLO la sección: {section}
Código pytest completo con:
- Fixtures con scope adecuado
- Asserts específicos
- Mocks con unittest.mock
- Parametrización donde aplicable
"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": EXPAND_TEMPLATE.format(skeleton=skeleton, section=section)}],
        temperature=0.2,
    )
    return response.choices[0].message.content

# Fase 1: Esqueleto
esqueleto_response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": SKELETON_TEST}],
    temperature=0.2,
)
esqueleto = esqueleto_response.choices[0].message.content

# Fase 2: Expandir cada sección
secciones = ["Fixtures (conftest.py)", "Tests unitarios (test_services.py)", "Tests de integración (test_integration.py)"]
for s in secciones:
    print(f"\n=== {s} ===")
    codigo = expand_test_section(esqueleto, s)
    print(codigo[:500])
    print("...")
```

## Ejercicio 5.5: Pipeline Multitécnica

```python
from openai import OpenAI

client = OpenAI()

class AdvancedPipeline:
    """Combina ToT + ReAct + Skeleton + Constitutional AI."""

    def execute(self, requerimiento: str) -> dict:
        resultado = {}

        # Fase 1: ToT para decisión arquitectónica
        tot_prompt = f"""
Problema: {requerimiento}

Genera 2 enfoques arquitectónicos diferentes.
Para cada uno: nombre, componentes clave, flujo de datos, trade-offs.
"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": tot_prompt}],
            temperature=0.7,
        )
        resultado["arquitectura"] = response.choices[0].message.content

        # Fase 2: ReAct para investigar restricciones
        react_prompt = f"""
Basado en esta arquitectura:
{resultado['arquitectura'][:500]}

Identifica usando Thought/Action/Observation:
1. Dependencias externas necesarias
2. Restricciones de performance
3. Requisitos de seguridad
4. Compatibilidad con sistema existente

Herramientas disponibles: check_dependency(name), analyze_performance(reqs), security_scan(components)
"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": react_prompt}],
            temperature=0.3,
        )
        resultado["investigacion"] = response.choices[0].message.content

        # Fase 3: Skeleton-of-Thought para generación
        skeleton_prompt = f"""
Arquitectura: {resultado['arquitectura'][:300]}
Restricciones: {resultado['investigacion'][:300]}

Genera el esqueleto del código:
1. Structure (archivos y directorios)
2. Models/DTOs
3. Core logic
4. API/Interfaces
5. Configuration
"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": skeleton_prompt}],
            temperature=0.2,
        )
        resultado["esqueleto"] = response.choices[0].message.content

        # Fase 4: Constitutional AI verification
        constitucion = """
ARTÍCULO 1: No SQL injection
ARTÍCULO 2: Type hints en todo
ARTÍCULO 3: Funciones < 50 líneas
ARTÍCULO 4: Manejo explícito de errores
"""
        verify_prompt = f"""
Constitución:
{constitucion}

Código/Skeleton a verificar:
{resultado['esqueleto'][:500]}

¿Cumple todos los artículos? Si no, qué viola y cómo corregirlo.
"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": verify_prompt}],
            temperature=0.1,
        )
        resultado["validacion"] = response.choices[0].message.content

        return resultado

pipeline = AdvancedPipeline()
resultado = pipeline.execute("Sistema de caché distribuido con Redis + consistencia eventual")
for fase, contenido in resultado.items():
    print(f"\n=== {fase.upper()} ===")
    print(contenido[:300])
    print("...")
```
