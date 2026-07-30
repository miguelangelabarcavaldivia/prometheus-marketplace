# Módulo 7: Dominios Especializados

## 7.1 Prompts por Especialidad

### Frontend (React/TypeScript)

```python
# Ejemplo 7.1: Generación de componentes React
FRONTEND_PROMPT = """
Eres un Senior Frontend Engineer especializado en React 18+ con TypeScript.

Contexto del proyecto:
- Next.js 14 con App Router
- Tailwind CSS para estilos
- React Query para fetching de datos
- Zustand para estado global
- Testing con React Testing Library + Vitest

TAREA: {tarea}

REQUISITOS DEL CÓDIGO:
- Componente funcional con TypeScript estricto
- Props tipadas con interface (no type)
- Estados: loading, error, empty, success
- Accesibilidad: roles ARIA, keyboard navigation, focus management
- Error Boundary apropiado
- Suspense boundaries para code splitting
- Responsive design (mobile-first)
- Test unitario del componente (comportamiento, no implementación)

NO USES:
- any (usa unknown + type guards)
- useEffect para derivar estado de props
- any en lugar de tipos específicos
"""

def generar_componente(especificacion: str) -> str:
    prompt = FRONTEND_PROMPT.format(
        tarea=f"Genera un componente que: {especificacion}"
    )
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return response.choices[0].message.content
```

### Backend (Python/FastAPI)

```python
# Ejemplo 7.2: Generación de endpoints con seguridad
BACKEND_PROMPT = """
Eres un Senior Backend Engineer Python con expertise en FastAPI, SQLAlchemy y DDD.

ARQUITECTURA DEL PROYECTO:
- Capas: routes → services → repositories → models
- Inyección de dependencias con FastAPI Depends
- Unit of Work pattern para transacciones
- CQRS básico (queries separados de commands)
- Event-driven: eventos de dominio para efectos secundarios

TAREA: {tarea}

ESTÁNDARES DE CÓDIGO:
- Type hints obligatorios en todas las funciones
- Docstrings Google style en funciones públicas
- Pydantic v2 para validación (model_validate, model_dump)
- Manejo explícito de errores con HTTPException y códigos HTTP canónicos
- Logging estructurado con structlog
- Tests: unittest.mock + pytest + factory_boy

SEGURIDAD:
- Rate limiting por endpoint
- Validación de permisos (RBAC)
- Auditoría de cambios (who, what, when)
- Sanitización de inputs
"""

def generar_endpoint(especificacion: str) -> str:
    prompt = BACKEND_PROMPT.format(
        tarea=f"Implementa el siguiente endpoint: {especificacion}"
    )
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
    )
    return response.choices[0].message.content
```

### DevOps

```python
# Ejemplo 7.3: Generación de infraestructura como código
DEVOPS_PROMPT = """
Eres un DevOps/SRE Engineer experto en Kubernetes, Terraform y CI/CD.

CONTEXTO:
- Cloud: AWS (EKS, RDS, ElastiCache, SQS)
- Infra: Terraform + Terragrunt
- Kubernetes: EKS 1.28+, Helm charts
- CI/CD: GitHub Actions

TAREA: {tarea}

PRINCIPIOS:
- Infraestructura inmutable
- Mínimo privilegio (IAM roles con políticas específicas)
- Secrets management con AWS Secrets Manager o HashiCorp Vault
- Observabilidad: CloudWatch + OpenTelemetry
- Autoescalado: HPA + Cluster Autoscaler + Karpenter
- Disaster recovery: backup automático, cross-region replicación

OUTPUT:
1. Terraform/HCL code
2. Kubernetes manifests (si aplica)
3. GitHub Actions workflow
4. Cost estimation (aproximado)
5. Runbook para operaciones comunes
"""

def generar_infra(especificacion: str) -> str:
    prompt = DEVOPS_PROMPT.format(
        tarea=f"Diseña e implementa: {especificacion}"
    )
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return response.choices[0].message.content
```

### Data Science

```python
# Ejemplo 7.4: Pipeline de datos y ML
DATASCIENCE_PROMPT = """
Eres un Senior Data Scientist / ML Engineer.

TAREA: {tarea}

STACK:
- Python 3.11+, pandas, polars, numpy
- Scikit-learn para ML clásico
- PyTorch para deep learning
- MLflow para experiment tracking
- DVC para versionado de datos

REQUISITOS DEL CÓDIGO:
- Pipeline reproducible: load → validate → transform → feature engineering → train → evaluate
- Feature store (usa Feast si aplica)
- Data validation con Great Expectations
- Versionado de modelos con MLflow
- Interpretabilidad: SHAP, LIME, o PDP

FORMATO DEL OUTPUT:
1. Exploratory Data Analysis (código + visualizaciones sugeridas)
2. Feature engineering pipeline
3. Model training con hiperparámetros
4. Evaluación (métricas + confusion matrix + feature importance)
5. Código de inferencia (model serving)
"""

def generar_pipeline(especificacion: str) -> str:
    prompt = DATASCIENCE_PROMPT.format(
        tarea=especificacion
    )
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content
```

### Mobile (React Native)

```python
# Ejemplo 7.5: Componente mobile
MOBILE_PROMPT = """
Eres un Senior Mobile Developer con React Native + TypeScript.

CONTEXTO:
- React Native 0.74+
- Expo SDK 50+
- React Navigation (stack + tab)
- State: Zustand + React Query
- Estilos: StyleSheet (no librerías externas)

TAREA: {tarea}

CONSIDERACIONES MOBILE:
- Performance: FlatList virtualizada, memoización, evitar re-renders
- Offline-first: AsyncStorage + NetInfo + queue de operaciones fallidas
-Gestos: Gesture Handler + Reanimated
- Accesibilidad: VoiceOver/TalkBack
- Deep linking y universal links
- Adaptabilidad: diferentes tamaños de pantalla, orientación
- Testing: Jest + React Native Testing Library + Detox (E2E)
"""

def generar_pantalla(especificacion: str) -> str:
    prompt = MOBILE_PROMPT.format(
        tarea=especificacion
    )
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return response.choices[0].message.content
```

## 7.2 Testing Prompts

```python
# Ejemplo 7.6: Generación de tests multinivel
TESTING_PROMPT = """
Eres un Testing Engineer. Genera tests para el siguiente código.

CÓDIGO:
```python
{codigo}
```

Genera tests en 3 niveles:

NIVEL 1 - UNITARIOS (pytest):
- Cada función/método aislado
- Mocks solo para I/O externo
- Cobertura de branches (if/else, match/case)
- Edge cases: empty, None, valores límite

NIVEL 2 - INTEGRACIÓN:
- Flujo completo de una operación
- Base de datos real (test containers o SQLite)
- API calls reales (mockeadas en HTTP)

NIVEL 3 - E2E (si aplica):
- Escenario de usuario completo
- API client (httpx, requests)
- Setup/teardown de estado

REQUISITOS:
- Fixtures con alcance adecuado (function, class, module, session)
- Nombres descriptivos: test_[func]_[scenario]_[expected]
- Arrange/Act/Assert explícito
- No usar sleep(), usar await/wait_for
"""

def generar_tests(codigo: str, nivel: str = "unitario") -> str:
    prompt = TESTING_PROMPT.format(codigo=codigo)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
    )
    return response.choices[0].message.content
```

## 7.3 Documentation Generation

```python
# Ejemplo 7.7: Documentación automática
DOC_PROMPT = """
Eres un Technical Writer con experiencia en documentación de APIs y SDKs.

CÓDIGO A DOCUMENTAR:
```python
{codigo}
```

GENERA:

1. README del módulo/clase
   - Propósito
   - Quick start (código de ejemplo mínimo)
   - Instalación/importación

2. Docstrings Google Style para cada clase y función pública

3. Ejemplos de uso (1 por caso de uso principal)

4. ADR (Architecture Decision Record) si hay decisiones de diseño notables

5. OpenAPI/Swagger annotations (si es una API)

ESTILO:
- Tono profesional pero accesible
- Ejemplos completos y ejecutables
- Secciones de troubleshooting para errores comunes
- Enlaces a documentación relacionada
"""

def generar_docs(codigo: str, tipo: str = "README") -> str:
    prompt = DOC_PROMPT.format(codigo=codigo)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content
```

## 7.4 API Design Prompts

```python
# Ejemplo 7.8: Diseño de APIs REST/GraphQL
API_DESIGN_PROMPT = """
Eres un API Designer especializado en REST, GraphQL y gRPC.

DOMINIO: {dominio}
REQUERIMIENTOS:
{requerimientos}

Genera un API design completo:

1. RECURSOS
   - Identificación de recursos principales y sub-recursos
   - Naming convention (plural, kebab-case para URLs)
   - HATEOAS links si aplica

2. OPERACIONES CRUD + específicas del dominio
   - Métodos HTTP, paths, status codes
   - Query parameters, paginación (cursor-based)
   - Sorting, filtering (RQL syntax)
   - Partial responses (sparse fields)

3. MODELOS (OpenAPI 3.1 / GraphQL SDL)
   - Schemas de request/response
   - Validaciones (formato, rangos, required)
   - Ejemplos de cada schema

4. ERRORES
   - Formato estandarizado (RFC 7807 Problem Details)
   - Códigos de error específicos del dominio
   - Mensajes en inglés + soporte i18n

5. SEGURIDAD
   - Autenticación (Bearer JWT)
   - Autorización (RBAC/ABAC)
   - Rate limiting por plan
   - Idempotency keys para mutaciones

6. VERSIONADO
   - Estrategia: URL vs header vs content negotiation
   - Política de deprecación y sunset
"""

def disenar_api(dominio: str, requerimientos: str) -> str:
    prompt = API_DESIGN_PROMPT.format(
        dominio=dominio,
        requerimientos=requerimientos,
    )
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content
```

## 7.5 Ejercicios

### Ejercicio 7.1: Generador de Componentes Multi-framework
Crea un prompt que pueda generar el mismo componente (ej: un data table con búsqueda, sorting y paginación) en 3 frameworks: React, Vue 3, Svelte. El prompt debe detectar el framework del contexto.

### Ejercicio 7.2: Pipeline CI/CD Completo
Genera un pipeline CI/CD completo para un microservicio FastAPI que incluya: lint, type check, tests unitarios, tests de integración, build de Docker image, push a ECR, deploy a EKS, smoke tests. Usa GitHub Actions.

### Ejercicio 7.3: Test Generator con Cobertura
Implementa un generador de tests que:
- Acepte un archivo Python
- Genere tests unitarios con pytest
- Mida la cobertura de código
- Identifique líneas no cubiertas y genere tests adicionales
- Itere hasta alcanzar 90% de cobertura

### Ejercicio 7.4: Documentación Auto-actualizable
Crea un sistema que mantenga la documentación sincronizada con el código:
- Detecte cambios en funciones/ clases (usando AST)
- Actualice docstrings automáticamente
- Regenerate README de módulos afectados
- Cree changelog entries

### Ejercicio 7.5: API Gateway prompter
Diseña un sistema de prompts que reciba requerimientos de negocio en lenguaje natural y genere la especificación completa de una API Gateway con: rate limiting, autenticación, routing, transformación de respuestas, caching, y documentación.

---

**Soluciones en:** `exercises/module-7-solutions.md`
