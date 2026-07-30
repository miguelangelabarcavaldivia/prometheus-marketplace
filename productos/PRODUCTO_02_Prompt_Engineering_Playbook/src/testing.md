# Testing

> 28 prompts para escribir tests, mocks, y estrategias de cobertura.

---

## 1. Suite de Tests Unitarios

**[Testing]**

```
Escribe tests unitarios para {módulo/clase} en {lenguaje} usando {framework_tests}.

Código a testear:
```{lenguaje}
{código_de_la_unidad_a_testear}
```

Casos a cubrir:
- {camino_feliz}
- {casos_edge}
- {validaciones_y_errores}
- {límites_y_fronteras}

Requisitos:
- Naming: {testUnit_Descripción_Condición / debería_hacer_X_cuando_Y}
- Arrange-Act-Assert
- Mocks para dependencias externas
- Un assert por test (o asserts relacionados)
- Tests independientes y repetibles
- Cobertura > {X}% en la unidad testada
- Tests parametrizados para variaciones
- Fixtures/test data factory
```

**Formato de salida:** Archivo(s) de test completos, listos para ejecutar.

**Ejemplo:** `{UserService.createUser()}`, `{TypeScript}`, `{Vitest}`, `{casos: creación exitosa, email duplicado, datos inválidos}`

---

## 2. Tests de Integración con Base de Datos

**[Testing]**

```
Crea tests de integración para {operaciones_db} usando {base_datos} + {framework_tests}.

Capa a testear: {Repositorio / DAO / Service que usa DB}
Operaciones:
{lista_de_operaciones_con_entrada_y_salida_esperada}

Configuración:
- Base de datos: {nombre_db}
- Estrategia de test DB: {Testcontainers / H2 in-memory / SQLite / base real temporal}
- Migraciones: sí, ejecutar antes de cada suite
- Data setup: {fixtures / factories / seed data}

Requisitos:
- Rollback entre tests (transacción anidada / truncate tables)
- Datos de prueba aislados entre tests paralelos
- Tests de concurrencia (2 transacciones simultáneas)
- Validación de constraints (unique, foreign key, check)
- Performance baseline (query count assertion)
- Limpieza después de todos los tests
```

**Formato de salida:** Tests de integración con setup/teardown de DB.

**Ejemplo:** `{UserRepository}`, `{PostgreSQL}`, `{pytest + pytest-postgresql}`, `{findById, save, deleteByEmail, findAllByRole}`

---

## 3. Tests End-to-End (E2E)

**[Testing]**

```
Diseña y escribe tests E2E para {funcionalidad/flujo} usando {framework_e2e}.

Flujo a testear:
1. {paso_1}
2. {paso_2}
3. {paso_3}
...
N. {paso_N}

Stack:
- Frontend: {framework_frontend}
- Backend: {framework_backend}
- E2E tool: {Cypress / Playwright / Selenium / TestCafe}
- CI: {integración_con_CI}

Requisitos:
- Page Object Model o componente-based selectors
- Data-testid attributes (no clases CSS ni XPath frágiles)
- Tests en {viewport_responsive} resoluciones
- Grabación de video ante fallos
- Screenshot comparison (visual regression)
- API mocking (intercept/stub) para respuestas externas
- Flujo completo: autenticación -> operación -> verificación -> limpieza
- Retry flaky tests (max {3} intentos)
- Tiempo máximo por test: {X} segundos
```

**Formato de salida:** Tests E2E completos con POM, fixtures y configuración CI.

**Ejemplo:** `{Flujo de checkout completo}`, `{Playwright}`, `{React + Node.js}`, `{login -> agregar producto -> carrito -> checkout -> confirmación}`

---

## 4. Generación de Datos de Prueba

**[Testing]**

```
Genera datos de prueba realistas para {entidad/recurso}.

Entidad: {nombre_entidad}
Campos:
{lista_campos_con_tipos_y_restricciones}
Cantidad: {N} registros
Formato: {JSON / SQL / CSV / Factory methods}

Requisitos de realismo:
- {nombres_reales_de_personas}
- {direcciones_válidas}
- {fechas_en_rango_lógico}
- {valores_numéricos_con_distribución_realista}
- {relaciones_válidas_entre_entidades}
- {variabilidad: valores_normales, extremos, nulos, bordes}
- {datos_consistentes: si edad < 18, no campo licencia_conducir}
- {distribución: 60% normal, 20% edge, 10% inválido, 10% nulo}

Incluye factories/builders para generar datos en tests.
```

**Formato de salida:** Datos generados + factories/builders + script de seed.

**Ejemplo:** `{Usuario}`, `{id, nombre, email, edad, fecha_registro, plan, tarjeta, dirección}`, `{100}`, `{JSON + Factory en TypeScript}`

---

## 5. Mocks y Stubs de API Externa

**[Testing]**

```
Crea mocks/stubs para {API_externa} en {lenguaje} usando {biblioteca_mock}.

API a mockear: {nombre_API}
Endpoints:
{lista_endpoints_con_método_y_respuesta_típica}

Comportamientos a simular:
- {respuesta_exitosa}
- {respuesta_con_error_4xx}
- {respuesta_con_error_5xx}
- {timeout / slow_response}
- {rate_limiting}
- {respuesta_parcial_o_malformada}
- {error_de_red}

Requisitos:
- Mock server configurable (dinámico, no hardcoded)
- Stateful mocks (secuencia de llamadas, estados)
- Verificación de llamadas (fue llamado con args correctos)
- Reset entre tests
- Fácil de switchear entre mock y real (para tests de integración)
- Grabación y replay (recordear una llamada real y repetirla)
```

**Formato de salida:** Mocks + servidor mock + tests con mock.

**Ejemplo:** `{Stripe API}`, `{Python}`, `{responses + pytest}`, `{GET /v1/charges, POST /v1/charges, POST /v1/refunds}`

---

## 6. Tests de Contrato / API Contract Testing

**[Testing]**

```
Crea tests de contrato para {API} utilizando {herramienta_contract_testing}.

API: {nombre_API} {versión}
Formato: {REST / GraphQL / gRPC / OpenAPI}
Proveedor: {equipo_que_mantiene_la_API}
Consumidores: {equipos_que_consumen_la_API}

Endpoints críticos:
{lista_endpoints_con_contrato_esperado}

Herramienta: {Pact / Spring Cloud Contract / Postman Contracts}

Requisitos:
- Contracto por consumer (cada consumer define lo que necesita)
- Provider verification (el provider verifica que cumple)
- Versionado de contratos
- Compatibilidad hacia atrás (breaking changes detectados)
- Canary releases con verificación de contrato
- Pipeline CI: fallar si se rompe el contrato
- Test data intercambiable entre consumer/provider
- Estados del provider (setup datos para cada escenario)
```

**Formato de salida:** Contratos + tests de verificación + pipeline CI/CD config.

**Ejemplo:** `{User API v2}`, `{REST}`, `{Pact}`, `{consumer: frontend-web, provider: user-service}`

---

## 7. Tests de Performance / Carga

**[Testing]**

```
Diseña e implementa tests de carga para {sistema/endpoint}.

Objetivo: {medir throughput / latencia / estabilidad / escalabilidad}
Endpoint(s): {lista_de_endpoints}
Herramienta: {k6 / Artillery / Locust / JMeter / Gatling}

Perfiles de carga:
1. Carga normal: {X} RPS durante {Y} minutos
2. Pico esperado: {X} RPS durante {Y} minutos
3. Stress test: incrementar hasta {X} RPS o hasta fallo
4. Soak test: carga sostenida por {X} horas
5. Spike test: pico repentino de {X} RPS

Métricas a recolectar:
- Latencia: p50, p95, p99, p999, max
- Throughput: requests/segundo
- Tasa de error: {X}% máximo aceptable
- Recursos: CPU, memoria, conexiones DB, disco
- Tiempo hasta recover tras el pico

Criterios de aceptación:
- p95 latencia < {X}ms
- Tasa de error < {X}%
- Sin errores fatales (OOM, crash, connection pool exhausted)
- Recuperación en < {X} segundos post-pico
```

**Formato de salida:** Scripts de carga + dashboard de resultados + informe de análisis.

**Ejemplo:** `{POST /api/checkout}`, `{k6}`, `{carga normal: 100 RPS, pico: 500 RPS, soak: 1000 RPS por 2h}`

---

## 8. Tests de Mutación / Calidad de Tests

**[Testing]**

```
Ejecuta y analiza tests de mutación para {módulo} usando {herramienta_mutación}.

Código a analizar: {ruta_módulo}
Herramienta: {Stryker / PIT / MutPy / Humbug}

Configuración:
- Operadores de mutación: {todos / subset específico}
- Umbral de supervivencia aceptable: < {X}%
- Tiempo máximo de ejecución: {X} minutos
- Ignorar: {getters/setters / generated code / tests mismos}

Análisis requerido:
1. Código que sobrevive a la mutación (no testeado adecuadamente)
2. Tests que no matan mutantes (tests débilmente acoplados)
3. Mutantes equivalentes (código semánticamente idéntico)
4. Áreas con alta densidad de mutantes supervivientes
5. Sugerencias de tests específicos para matar mutantes supervivientes
6. Reporte de calidad: mutation score por módulo
```

**Formato de salida:** Reporte de mutation testing + recomendaciones de tests.

**Ejemplo:** `{src/services/user.service.ts}`, `{Stryker}`, `{umbral < 15%}`

---

## 9. Tests de Seguridad

**[Testing]**

```
Crea tests de seguridad automatizados para {aplicación}.

Tipo de tests:
- {SQL Injection}
- {XSS (Cross-Site Scripting)}
- {CSRF}
- {SSRF}
- {IDOR / Broken Access Control}
- {Authentication Bypass}
- {Rate Limiting Bypass}
- {Mass Assignment / Parameter Tampering}
- {JWT: none algorithm, token manipulation}
- {File Upload: path traversal, malformed files}

Herramientas: {OWASP ZAP / Burp Suite / custom scripts / Helm}

Endpoints críticos:
{lista_endpoints_con_riesgos_asociados}

Requisitos:
- Tests automatizables en CI
- No dañar datos de producción
- Falsos positivos mínimos
- Reporte con severidad (Critical, High, Medium, Low)
- Regresión: test que pasado indica que la vulnerabilidad está corregida
- Pruebas de penetración automatizadas básicas
```

**Formato de salida:** Tests de seguridad + script de escaneo + reporte de vulnerabilidades.

**Ejemplo:** `{API REST}`, `{Node.js}`, `{SQL Injection en GET /api/users?id=1 UNION SELECT...}`, `{XSS en POST /api/comentarios}`

---

## 10. Tests de Regresión Visual

**[Testing]**

```
Crea tests de regresión visual para {componentes/páginas} usando {herramienta_visual_testing}.

Componentes a testear:
{lista_de_componentes_o_páginas}

Herramienta: {Percy / Chromatic / Playwright Screenshot / Loki}

Resoluciones a testear:
- {Mobile: 375x667}
- {Tablet: 768x1024}
- {Desktop: 1440x900}
- {Desktop wide: 1920x1080}

Temas: {light / dark / high-contrast}

Estados por componente:
- {default}
- {hover}
- {focus}
- {active}
- {loading}
- {error}
- {empty}
- {con datos extremos}

Configuración:
- Threshold de diferencia: {X}%
- Baseline automático en CI
- Aprobación manual de cambios visuales
- Ignorar: animaciones, fuentes no cargadas, timestamps
- Storybook integration para componentes aislados
```

**Formato de salida:** Tests visuales + baseline images + script de CI.

**Ejemplo:** `{Sistema de diseño: Button, Input, Modal, Card, Navbar}`, `{Playwright + Percy}`, `{React + Tailwind}`

---

## 11. Generación de Tests Basados en Propiedades

**[Testing]**

```
Escribe tests basados en propiedades (property-based testing) para {función/sistema}.

Función a testear:
```{lenguaje}
{función}
```

Propiedades a verificar:
- {idempotencia: ejecutar dos veces da mismo resultado}
- {inversa: deshacer la operación vuelve al estado original}
- {monotonicidad: inputs mayores producen outputs mayores o iguales}
- {commutatividad: orden de operaciones no afecta resultado}
- {asociatividad: agrupación de operaciones no afecta resultado}
- {invariantes: propiedad que siempre se cumple}
- {metamorfismo: relación entre diferentes inputs}

Herramienta: {Hypothesis (Python) / fast-check (JS) / jqwik (Java) / FsCheck (.NET)}

Configuración:
- Generadores personalizados para tipos de dominio
- Estrategia de shrinking (minimizar caso de fallo)
- Número de casos: {1000} por test
- Base de datos de fallos (re-ejecutar fallos anteriores)
```

**Formato de salida:** Tests de propiedades + generadores personalizados.

**Ejemplo:** `{Función: ordenar(lista)}`, `{propiedades: longitud igual, elementos son los mismos, resultado está ordenado, idempotente}`

---

## 12. Test de Smoke / Sanity

**[Testing]**

```
Crea una suite de smoke tests para verificar que {sistema} funciona después de un deploy.

Pruebas mínimas:
1. Health check: {GET /health -> esperar 200 OK}
2. Endpoint crítico: {GET /api/{recurso} -> esperar 200 con datos}
3. Autenticación: {login -> esperar token -> acceso a ruta protegida}
4. Operación CRUD básica: {crear -> leer -> actualizar -> borrar}
5. Integración externa: {llamada a API externa mockeada o real -> resultado esperado}
6. Base de datos: {consulta simple -> resultado esperado}
7. Frontend carga: {GET / -> esperar 200 + HTML contiene texto crítico}
8. Worker / job: {disparar job -> verificar resultado en {X} segundos}
9. Funcionalidad crítica del negocio: {flujo_feliz_mínimo}

Tiempo máximo de ejecución: {X} segundos
Entorno: {staging / canary / nuevo deploy}
Acción tras fallo: {rollback automático / alertar / bloquear deploy}
```

**Formato de salida:** Script de smoke tests + pipeline CI/CD step + informe de resultados.

**Ejemplo:** `{E-commerce platform}`, `{health, login, GET /productos, crear pedido, webhook pago}`

---

## 13. Fakes / Test Doubles para Capa de Datos

**[Testing]**

```
Crea fakes o test doubles para {capa_de_datos} en {lenguaje} que permitan testear sin infraestructura real.

Componentes a fakear:
{lista_de_repositorios_o_servicios}

Requisitos:
- Implementan la misma interfaz que el real
- Almacenamiento en memoria (diccionarios, listas, etc.)
- Comportamiento configurable (éxito, error, timeout, latencia)
- Simulación de constraints (unique, foreign key, required)
- Contador de llamadas y argumentos recibidos
- Reset fácil entre tests
- Simulación de concurrencia básica
- Coincidir con comportamiento real lo más posible (misma semántica)
- Indexación y búsqueda simulada
- Transacciones emuladas (commit/rollback)

Incluye fábrica de fakes con defaults sensatos.
```

**Formato de salida:** Fakes completos + fábrica + tests que demuestran su uso.

**Ejemplo:** `{UserRepository}`, `{Kotlin}`, `{InMemoryUserRepository: implementa UserRepository interface, usa ConcurrentHashMap}`

---

## 14. Tests de API REST con Validación de Schema

**[Testing]**

```
Escribe tests para {API} que validen la estructura de las respuestas contra un schema.

API Base URL: {base_url}
Endpoints:
{lista_endpoints_con_método_y_códigos_esperados}

Validaciones:
- Status code exacto o rango
- Headers requeridos (Content-Type, Cache-Control, etc.)
- Body: validación contra JSON Schema o similar
- Tipos de datos correctos para cada campo
- Campos requeridos presentes
- No campos extra (si aplica strict mode)
- Formato de fechas, UUIDs, emails, URLs
- Array lengths dentro de límites
- Null/undefined en campos opcionales correctos

Herramienta: {Supertest / REST Assured / pytest + schemathesis}

Adicional:
- Tests de idempotencia (misma request -> misma respuesta)
- Tests de safe methods (GET, HEAD, OPTIONS no mutan estado)
- Schema evolution: nuevas versiones son compatibles
```

**Formato de salida:** Tests de API con validación de schema + schemas JSON.

**Ejemplo:** `{REST API v2}`, `{https://api.ejemplo.com/v2}`, `{GET /users, POST /users, GET /users/:id, PATCH /users/:id}`

---

## 15. Tests de Base de Datos / Data Integrity

**[Testing]**

```
Crea tests de integridad y consistencia de datos para {base_datos}.

Motor: {PostgreSQL / MySQL / SQL Server / MongoDB}

Tests a implementar:

1. Constraints:
   - NOT NULL: {campos_que_no_deben_ser_nulos}
   - UNIQUE: {campos_que_deben_ser_únicos}
   - FOREIGN KEY: {relaciones_que_deben_mantenerse}
   - CHECK: {restricciones_de_valor}

2. Triggers/Procedures:
   - {trigger_name}: probar que se ejecuta correctamente
   - {procedure_name}: probar con input válido e inválido

3. Migraciones:
   - Rollback: migrar hacia adelante y atrás, schema debe coincidir
   - Datos existentes: migrar no debe perder/corromper datos
   - Indices creados correctamente

4. Performance:
   - {query_crítica}: debe usar índice {nombre_índice} (EXPLAIN)
   - {query_crítica}: tiempo de ejecución < {X}ms con {Y} registros

5. Data quality:
   - Valores en rangos esperados
   - Sin orphan records (FK references que apuntan a nada)
   - Cardinalidad correcta en relaciones
```

**Formato de salida:** Tests SQL/Python + fixtures + configuración de CI.

**Ejemplo:** `{PostgreSQL}`, `{constraints: email único, CHECK edad >= 0, FK pedidos.cliente_id -> clientes.id}`

---

## 16. Code Coverage Analysis with Quality Gates

**[Testing]**

```
Analiza la cobertura de tests para {módulo/proyecto} y establece quality gates.

Herramienta: {Istanbul / JaCoCo / coverage.py / Coverlet}
Configuración actual: {ruta_config_coverage}

Reporte actual:
- Líneas: {X}%
- Ramas: {X}%
- Funciones: {X}%
- Statements: {X}%

Quality gates propuestas:
- Líneas: mínimo {X}%
- Ramas: mínimo {X}%
- Funciones críticas: 100%
- Archivos nuevos: mínimo {X}%
- Deltas (vs main branch): no decrementar más de {X}%

Análisis:
1. Áreas con baja cobertura (< {X}%)
2. Código no cubierto que es crítico (seguridad, pagos, auth)
3. Falsos positivos (código que no necesita tests: getters/setters, config, DB migrations)
4. Sugerencias para mejorar cobertura en áreas clave
5. Generar badge de cobertura para README
6. Integración CI: fallar si no se cumplen quality gates
```

**Formato de salida:** Reporte de cobertura + quality gates config + CI integration.

**Ejemplo:** `{Proyecto Node.js}`, `{Istanbul}`, `{umbrales: lines 80%, branches 75%, functions 85%, statements 80%}`

---

## 17. Tests de Componentes Frontend

**[Testing]**

```
Escribe tests de componentes para {biblioteca_UI} en {framework_frontend}.

Componente: {NombreComponente}
Props: {definición_de_props}
Estados:
- {default}
- {interactivo: click, hover, focus, type}
- {loading}
- {error}
- {empty/no data}
- {con datos}
- {responsive: mobile, tablet, desktop}

Herramienta: {React Testing Library / Vue Test Utils / Angular TestBed + Playwright}

Lo que debe testearse:
- Renderizado correcto con diferentes props
- Interacciones del usuario (click, input, submit, keyboard)
- Eventos emitidos hacia el padre
- Estados de error manejados visualmente
- Accesibilidad (aria labels, roles, focus management)
- Snapshot de cada estado (opcional, mantener actualizado)
- No probar implementación interna, solo comportamiento visible
- Query por rol/texto, no por clase/test-id (salvo excepciones)

Cobertura por componente:
- Líneas: > {X}%
- Ramas (condicionales de render): 100%
- Eventos manejados: 100%
```

**Formato de salida:** Tests de componente + data-testid strategy + helper functions.

**Ejemplo:** `{UserProfileCard}`, `{React}`, `{React Testing Library}`, `{props: user, onEdit, onDelete, variant}`

---

## 18. Tests de Servicios/Workers Asíncronos

**[Testing]**

```
Crea tests para servicios asíncronos/workers en {lenguaje} usando {framework_tests}.

Servicio: {nombre_servicio}
Tipo: {background job / message consumer / event handler / cron job}

Operaciones:
{lista_de_operaciones_asíncronas}

Herramientas: {test timeouts / fake schedulers / in-memory queues / virtual time}

Casos a cubrir:
- {procesamiento_exitoso}
- {mensaje_malformado}
- {error_durante_procesamiento -> retry/dead letter}
- {timeout_del_worker}
- {concurrencia: múltiples mensajes simultáneos}
- {orden_de_procesamiento (FIFO / prioridad)}
- {cancelación / graceful shutdown}
- {rate limiting: procesar X mensajes por segundo}
- {idempotencia: mismo mensaje procesado dos veces}
- {encadenamiento: mensaje A -> procesa -> encola mensaje B}

Requiere: fake de message broker, virtual time control, assertions asíncronas (waitFor, eventually).
```

**Formato de salida:** Tests de workers + fakes de broker + helpers de tiempo virtual.

**Ejemplo:** `{EmailNotificationWorker}`, `{Node.js}`, `{Vitest + in-memory SQS}`, `{procesar eventos usuario.registrado, pedido.confirmado}`

---

## 19. Tests de Migraciones de Base de Datos

**[Testing]**

```
Crea tests para verificar que las migraciones de base de datos funcionan correctamente.

Herramienta de migraciones: {Flyway / Alembic / EF Core Migrations / Prisma Migrate}
Base de datos: {motor_db}
Migración a testear: {nombre_migración / rango_de_migraciones}

Tests:
1. Rollback roundtrip:
   - Migrar hacia adelante: version {N} -> {N+1}
   - Migrar hacia atrás: version {N+1} -> {N}
   - Verificar schema coincide con versión {N}
   - Verificar datos que estaban en {N} siguen siendo accesibles

2. Datos existentes:
   - Poblar DB con datos en versión {N}
   - Migrar a {N+1}
   - Verificar datos no perdidos y en formato correcto
   - Hacer rollback y verificar datos accesibles de nuevo

3. Idempotencia:
   - Ejecutar migración dos veces
   - No debe cambiar el schema la segunda vez (checksum)
   - No debe perder datos

4. Performance:
   - Migración con {X} registros no debe exceder {Y} segundos
   - Índices creados correctamente (EXPLAIN verify)

5. Conflictos:
   - Migraciones concurrentes manejadas correctamente
   - Lock timeout configurado
```

**Formato de salida:** Tests de migración + scripts de verificación + CI pipeline.

**Ejemplo:** `{Alembic}`, `{PostgreSQL}`, `{migración: add columna 'telefono' a tabla 'usuarios' con default ''}`

---

## 20. Tests de Tolerancia a Fallos / Chaos Engineering

**[Testing]**

```
Diseña experimentos de chaos engineering para probar la resiliencia de {sistema}.

Sistema: {nombre_del_sistema}
Herramientas: {Chaos Monkey / Gremlin / LitmusChaos / Chaos Toolkit}

Experimentos a diseñar:

1. Fallo de instancia:
   - Matar {X} de {Y} instancias aleatoriamente
   - Verificar: no hay downtime total, recuperación en < {X}s

2. Latencia de red:
   - Introducir {X}ms de latencia en {servicio_destino}
   - Verificar: circuit breaker se abre, degradación graceful

3. Fallo de base de datos:
   - Desconectar DB primaria por {X} segundos
   - Verificar: failover a replica, read-only mode, cola de writes

4. Pico de tráfico:
   - Multiplicar tráfico por {X} en {Y} segundos
   - Verificar: auto-scaling, rate limiting, no crash

5. Fallo de dependencia externa:
   - Bloquear tráfico a {API_externa}
   - Verificar: degradación graceful, mensaje al usuario, retry queue

6. Region failover:
   - Desconectar región {X}
   - Verificar: tráfico redirigido, datos replicados, no pérdida

Cada experimento debe tener: hipótesis, blast radius controlado, rollback automático, verificación post-mortem.
```

**Formato de salida:** Experimentos de chaos + scripts de ejecución + reporte de resultados.

**Ejemplo:** `{API Gateway + 3 microservicios}`, `{Gremlin}`, `{experimento: matar 1 de 3 instancias de user-service y verificar circuit breaker}`

---

## 21. Generación de Reporte de Tests

**[Testing]**

```
Configura un sistema de reportes de tests para {proyecto} que sea legible y accionable.

Herramientas: {JUnit XML / Allure / TestNG Reports / xUnit / mochawesome}

Reportes requeridos:
1. Ejecución actual:
   - Total: pasados, fallidos, skipped, errores
   - Duración total y por test
   - Tests más lentos (top 10)
   - Tests más flaky (histórico)

2. Histórico:
   - Tendencia de passes/fallos por build
   - Flaky tests detectados (pasan/fallan inconsistentemente)
   - Tiempo de ejecución total por build

3. Cobertura:
   - Coverage por módulo
   - Coverage trends
   - Archivos con menor coverage

4. Dashboard:
   - Pipeline status badge
   - Última ejecución
   - Comparación con build anterior
   - Enlaces a logs de tests fallidos

5. Notificaciones:
   - Slack: resumen de ejecución, enlaces a fallos
   - Email: reporte diario de salud de tests
   - GitHub Status Checks
```

**Formato de salida:** Configuración de reporting + dashboard + notificaciones.

**Ejemplo:** `{Node.js + Vitest}`, `{Allure}`, `{integración: Slack, GitHub Actions, S3 para reports históricos}`

---

## 22. Tests de Lógica de Negocio / Reglas de Dominio

**[Testing]**

```
Escribe tests para la lógica de negocio del dominio {nombre_dominio}.

Reglas de negocio:
{lista_de_reglas_con_condiciones_y_resultados}

Código:
```{lenguaje}
{código_de_la_lógica_de_dominio}
```

Metodología: {TDD / BDD / Given-When-Then}

Casos por regla:
1. Regla: {descripción_regla}
   - Feliz: condiciones se cumplen -> resultado esperado
   - Violación: condiciones no se cumplen -> error/alternativa
   - Borde: valores límite de la regla
   - Múltiples reglas: combinación de reglas simultáneas

2. Invariantes de dominio:
   - {invariante_1}: siempre debe cumplirse después de cualquier operación
   - {invariante_2}: siempre debe cumplirse

3. Eventos de dominio:
   - {evento}: se dispara cuando ocurre {condición}
   - Handlers del evento: {efectos_esperados}

Usa builders de dominio (no DTOs genéricos) para construir entidades en tests.
```

**Formato de salida:** Tests de dominio + builders + especificación de reglas.

**Ejemplo:** `{E-commerce}`, `{regla: descuento del 10% si total > $100 y cupón es válido y no caducado}`, `{TDD}`

---

## 23. Automatización de Tests en CI/CD

**[Testing]**

```
Configura el pipeline de tests automatizados en CI/CD para {proyecto} usando {plataforma_CI}.

Repositorio: {URL / GitHub / GitLab / Bitbucket}
Plataforma: {GitHub Actions / GitLab CI / Jenkins / CircleCI}

Pipeline stages:

1. Lint + Format:
   - Comando: {eslint / prettier / ruff}
   - Fallar si hay errores de estilo

2. Type Check:
   - Comando: {tsc --noEmit / mypy / flow}
   - Fallar si hay errores de tipo

3. Unit Tests:
   - Comando: {npm test / pytest / dotnet test}
   - Coverage minimum gate: {X}%
   - Cache de node_modules/.venv

4. Integration Tests:
   - Comando: {npm run test:integration}
   - Requiere: {base de datos / Redis / servicios externos mockeados}
   - Usar: {Testcontainers / Docker Compose / service containers}

5. E2E Tests:
   - Comando: {npm run test:e2e}
   - Entorno: {preview deploy o local}
   - Parallel: {X} workers
   - Retry flaky: {2} intentos

6. Build:
   - Comando: {npm run build / docker build}
   - Verificar que compila sin errores

Optimizaciones:
- Cache de dependencias
- Paralelelización por archivo/module
- Test splitting inteligente
- Warm cache de Docker layers
- Conditional stages (solo deploy si todos pasan)
```

**Formato de salida:** Pipeline YAML completo con stages condicionales y optimizaciones.

**Ejemplo:** `{GitHub Actions}`, `{Node.js + PostgreSQL}`, `{lint -> typecheck -> unit -> integration -> e2e -> build}`

---

## 24. Tests de Validación de Input / Sanitización

**[Testing]**

```
Escribe tests para la validación y sanitización de entrada de {sistema}.

Inputs a validar:
{lista_de_campos_con_tipos_y_reglas}

Framework de validación: {Joi / Zod / Yup / Pydantic / FluentValidation / Hibernate Validator}

Categorías de tests:

1. Tipos correctos:
   - string: "texto", "", "   "
   - number: 42, 0, -1, 1.5, NaN, Infinity
   - boolean: true, false, "true", "false", 1, 0
   - date: "2024-01-01", "01/01/2024", "invalid-date"
   - email: "test@test.com", "not-an-email", "@test.com"
   - URL: "https://ejemplo.com", "not-a-url"
   - array: [], [1], [1,2,3], "not-array"

2. Límites:
   - min/max length: "", "a", "a"*1000
   - min/max number: 0, 1_000_000, -1
   - regex pattern: válido, inválido, boundary

3. Sanitización:
   - XSS: `<script>alert(1)</script>`, `javascript:alert(1)`
   - SQL Injection: `1' OR '1'='1`, `; DROP TABLE users;`
   - Unicode: caracteres especiales, RTL override, emoji
   - Whitespace: trim, normalize, nbsp

4. Combinaciones:
   - Datos válidos pero inconsistentes entre campos
   - Missing required fields
   - Extra unknown fields (strict mode)
```

**Formato de salida:** Tests de validación + schemas + mensajes de error.

**Ejemplo:** `{Registro de usuario}`, `{Zod}`, `{campos: nombre (string 2-50), email (email válido), edad (18-120), plan (enum)}`

---

## 25. Tests de GraphQL

**[Testing]**

```
Crea tests para {API_GraphQL} cubriendo queries, mutations y subscriptions.

Schema: {path_to_schema.gql}
Operaciones:
{lista_de_queries_y_mutations_con_variables}

Herramienta: {pytest-graphql / Apollo Testing Library / graphql-request / Supertest}

Tests:
1. Queries:
   - {query_name}: con variables válidas -> datos esperados
   - {query_name}: con variables faltantes -> error
   - {query_name}: con filters -> resultados filtrados
   - {query_name}: nested queries -> resolved correctamente
   - {query_name}: paginación (first, after) -> cursor correcto

2. Mutations:
   - {mutation_name}: crear -> dato creado correctamente
   - {mutation_name}: validación -> error si datos inválidos
   - {mutation_name}: autenticación -> error si no autenticado
   - {mutation_name}: autorización -> error si rol incorrecto

3. Subscriptions:
   - {subscription_name}: conectar -> recibir evento
   - {subscription_name}: disconnect -> no recibir más eventos
   - {subscription_name}: filtrar por argumentos

4. Performance:
   - N+1 detection (n+1 queries por objeto)
   - Query depth limiting
   - DataLoader batch verification

5. Schema:
   - Deprecated fields: siguen funcionando
   - Nuevos campos: son accesibles
   - Breaking changes: detectados automáticamente
```

**Formato de salida:** Tests GraphQL + fixtures + helpers para resolver y contexto.

**Ejemplo:** `{API de Blog}`, `{queries: posts, post(id), commentsByPost}`, `{mutations: createPost, updatePost, deletePost}`

---

## 26. Tests de Accesibilidad (a11y)

**[Testing]**

```
Crea tests de accesibilidad automatizados para {aplicación/web}.

Estándar: {WCAG 2.1 AA / WCAG 2.1 AAA / Section 508}
Herramientas: {axe-core / Lighthouse CI / Pa11y / WAVE}

Componentes/Páginas a testear:
{lista_de_rutas_o_componentes}

Tests automatizados:

1. Reglas automáticas (axe):
   - Contrast ratio suficiente (color)
   - Imágenes con alt text
   - Formularios con labels asociados
   - Landmarks semánticos (main, nav, aside, footer)
   - Heading hierarchy correcta
   - ARIA attributes válidos
   - Focus order lógico (tabindex)
   - Skip links presentes

2. Navegación teclado:
   - Todos los elementos interactivos alcanzables con Tab
   - Focus visible en todos los elementos
   - No focus trap (salvo modales, que deben tener escape)
   - Enter/Space activan botones y links

3. Screen reader:
   - Roles semánticos correctos
   - Announcements dinámicos (aria-live)
   - Error messages asociados a inputs

4. Responsive:
   - Zoom al 200% no rompe layout
   - Texto redimensionable sin pérdida
   - Touch targets >= 44x44px
```

**Formato de salida:** Tests de accesibilidad + reporte de violaciones + config axe.

**Ejemplo:** `{Dashboard app}`, `{React}`, `{axe-core + Playwright + Lighthouse CI}`, `{WCAG 2.1 AA}`

---

## 27. Snapshot Testing Estratégico

**[Testing]**

```
Implementa snapshot testing para {componentes/salidas} en {proyecto}.

Qué testear con snapshots:
- {Componentes de UI estables (no cambiar frecuentemente)}
- {Output serializado (JSON, YAML, config files)}
- {Errores/mensajes de validación}
- {Estructura de datos de transformaciones}

Qué NO testear con snapshots:
- {Componentes en desarrollo activo}
- {Datos dinámicos (fechas, IDs, timestamps)}
- {Contenido generado por IA}
- {Terceros / librerías externas}

Herramienta: {Vitest Snapshot / Jest Snapshot / Ava Snapshot}

Buenas prácticas:
- Snapshots pequeños y enfocados (no páginas completas)
- Usar `toMatchInlineSnapshot` para snapshots pequeños
- Ignorar valores dinámicos (Date.now, Math.random, UUID) con custom serializers
- Revisar snapshots en PRs (no aceptar sin revisión humana)
- Actualizar snapshots intencionalmente (npm test -- -u con flags)
- Versionar snapshots en git (commits separados para cambios de snapshot)
- Testear el diff no solo el pass (asegurar que cambio es deseado)
```

**Formato de salida:** Snapshot tests + custom serializers + CI strategy.

**Ejemplo:** `{Button component}`, `{Vitest}`, `{snapshots: default, primary, disabled, loading, with icon}`

---

## 28. Estrategia de Tests por Pirámide

**[Testing]**

```
Diseña la estrategia de testing completa para {proyecto} basada en la pirámide de tests.

Contexto:
- Tipo de proyecto: {API REST / Microservicios / Web App / SDK / CLI}
- Stack: {lenguaje + framework + DB + infra}
- Equipo: {X} desarrolladores
- Ciclo de release: {semanal / daily / on-demand}

Pirámide propuesta:

1. Unit Tests ({X}% - ~{Y} tests):
   - Lógica de negocio y dominio
   - Validaciones y reglas
   - Utilidades puras (sin IO)
   - Herramienta: {framework_tests}
   - Tiempo: < {X} segundos total

2. Integration Tests ({X}% - ~{Y} tests):
   - Repositorios/DAOs con DB real (Testcontainers)
   - API endpoints (in-process server)
   - Servicios con dependencias reales
   - Mensajería/colas
   - Herramienta: {framework_integration}
   - Tiempo: < {X} minutos total

3. Contract Tests ({X}% - ~{Y} tests):
   - API contracts (provider/consumer)
   - Schema validation
   - Herramienta: {Pact / OpenAPI / gRPC contracts}
   - Tiempo: < {X} minutos total

4. E2E Tests ({X}% - ~{Y} tests):
   - Flujos críticos del negocio ({Z} flujos)
   - Smoke tests post-deploy
   - Herramienta: {Cypress / Playwright}
   - Tiempo: < {X} minutos

5. Manual / Exploratory ({X}%):
   - UI/UX review
   - Casos no cubiertos
   - Prueba de concepto

Cobertura objetivo por capa (no la meta, sino guía para identificar código no testeado).
```
**Formato de salida:** Documento de estrategia de testing + timelines + tools + métricas.

**Ejemplo:** `{API REST + React SPA}`, `{Node.js + PostgreSQL + Redis}`, `{4 devs}`, `{Unit 60%/1000, Integration 25%/300, Contract 5%/50, E2E 10%/20}`
