# Arquitectura

> 18 prompts para diseño de sistemas, patrones, y decisiones arquitectónicas.

---

## 1. Diseño de Sistema Completo

**[Arquitectura]**

```
Diseña la arquitectura de un sistema para {descripción_del_sistema}.

Requerimientos funcionales:
{lista_de_funcionalidades_principales}

Requerimientos no funcionales:
- Usuarios concurrentes: {X}
- Latencia máxima: p99 < {X}ms
- Disponibilidad: {X}% (9s)
- RPO: {X} minutos
- RTO: {X} minutos
- Volumen de datos: {X} GB/día
- Crecimiento esperado: {X}% anual
- Región(es): {lista_regiones}

Entregables:

1. **Diagrama de arquitectura** (textual/Mermaid):
   ```
   [Cliente] -> [CDN] -> [Load Balancer] -> [API Gateway]
     -> [Microservicios] -> [Bases de datos]
     -> [Cache] -> [Message Queue] -> [Workers]
   ```

2. **Componentes**:
   - Frontend: {framework, hosting, SSR/SSG}
   - API Gateway: {tecnología, funciones}
   - Microservicios: {lista_con_responsabilidad}
   - Base de datos: {tipo, motor, réplicas}
   - Caché: {tipo, TTLs, estrategia}
   - Colas: {tipo, usos}
   - Almacenamiento: {tipo, para qué}
   - CDN: {provider, qué_cachear}

3. **Flujo de datos**:
   - Flujo principal (request típico)
   - Flujo de escritura (cómo se persisten los datos)
   - Flujo de eventos (event-driven flows)

4. **Consideraciones**:
   - Estrategia de escalado (vertical/horizontal)
   - Disaster Recovery
   - Seguridad (auth, network segmentation, encryption)
   - Monitoreo y observabilidad
   - Costos estimados
   - Trade-offs y alternativas
```

**Formato de salida:** Documento de arquitectura con diagramas, componentes, flujos y decisiones.

**Ejemplo:** `{SaaS de procesamiento de pagos: 1M transacciones/día, 99.99% uptime, PCI DSS compliant, multi-región}`

---

## 2. Microservicios vs Monolito

**[Arquitectura]**

```
Analiza si {proyecto} debe usar microservicios o monolito, y diseña la arquitectura correspondiente.

Contexto del proyecto:
- Dominio: {tipo_de_negocio}
- Equipo: {X} desarrolladores, {Y} equipos
- Escala actual: {X} usuarios, {Y} requests/día
- Escala proyectada (3 años): {X} usuarios, {Y} requests/día
- Conocimiento del equipo: {experiencia_en_microservicios}
- Deadline: {X} meses para MVP

Análisis:

**Opción A: Monolito**
- Ventajas:
  - {simplicidad_operacional}
  - {menor_complejidad_inicial}
  - {despliegue_simple}
  - {transacciones_consistentes}
- Desventajas:
  - {escalado_menos_granular}
  - {acoplamiento_a_largo_plazo}

**Opción B: Microservicios**
- Ventajas:
  - {escalado_independiente}
  - {despliegue_independiente}
  - {equipos_autónomos}
  - {tecnologías_diversas}
- Desventajas:
  - {complejidad_distribuida}
  - {latencia_de_red}
  - {consistencia_eventual}
  - {debugging_complejo}

**Opción C: Modular Monolith**
- {descripción}: Monolito con módulos bien delimitados
- Ventajas: {simplicidad + preparado para microservicios futuros}

**Recomendación**: {opción_elegida} + {justificación_detallada}

Si se elige microservicios, incluir:
- Bounded contexts (Domain-Driven Design)
- API contracts entre servicios
- Estrategia de comunicación (sync/async)
- Data ownership (cada servicio dueño de sus datos)
- Service mesh o API Gateway
- Estrategia de deployment
```

**Formato de salida:** Análisis comparativo + arquitectura elegida + plan de implementación.

**Ejemplo:** `{Startup de 5 devs, MVP en 6 meses -> Modular Monolith con módulos: Users, Orders, Payments, Products}`

---

## 3. Estrategia de Caché

**[Arquitectura]**

```
Diseña la estrategia de caché para {sistema/aplicación}.

Perfil de datos:
- Datos de alta lectura / baja escritura: {entidades_y_volumen}
- Datos de alta lectura / alta escritura: {entidades_y_volumen}
- Datos de baja lectura / baja escritura: {entidades_y_volumen}
- Datos temporales/sesiones: {volumen_y_duración}

Tecnologías disponibles: {Redis / Memcached / CDN / In-Memory / Varnish}

Diseño:

1. **Arquitectura de caché**:
   - L1: In-memory cache (local a cada instancia, ~{X}ms)
   - L2: Redis cluster ({X} nodos, ~{X}ms)
   - L3: CDN ({X} PoPs, ~{X}ms para cache hit)

2. **Estrategias por tipo de dato**:

   | Dato | Estrategia | TTL | Invalidación |
   |------|-----------|-----|-------------|
   | Catálogo productos | Cache-Aside | 5 min | Al actualizar producto |
   | Sesiones de usuario | Write-Through | 30 min | Al cerrar sesión |
   | Precios | Refresh-Ahead | 1 hora | CDC desde DB |
   | Páginas estáticas | CDN | 1 día | Purge on deploy |

3. **Cache Stampede Prevention**:
   - Probabilistic early expiration (PER)
   - Mutex locks para regeneración
   - Stale-while-revalidate

4. **Invalidación**:
   - Por evento: publicar mensaje cuando dato cambia
   - Por tag: invalidar grupos de claves relacionadas
   - Por TTL: tiempo de vida máximo

5. **Monitoreo**:
   - Hit ratio por capa
   - Latencia de caché
   - Tasa de expulsión
   - Stale reads

6. **Failover**:
   - Si caché cae: servir desde origen con degradación
   - Conexión: circuit breaker para evitar cascada
```

**Formato de salida:** Estrategia de caché completa + diagrama + config + fallback.

**Ejemplo:** `{E-commerce: productos (L1 100ms, L2 Redis, cache-aside con TTL 5min)}, {sesiones (write-through Redis TTL 30min)}`

---

## 4. Diseño de Base de Datos Multi-Tenant

**[Arquitectura]**

```
Diseña la estrategia de multi-tenancy para {aplicación SaaS}.

Tipo de SaaS: {B2B / B2C / ambos}
Número de tenants actuales: {X}
Número de tenants proyectados: {X}
Datos por tenant: {pequeño / mediano / grande: X GB}
Aislamiento requerido: {estricto / moderado / mínimo}

Estrategias de multi-tenancy:

1. **Database per Tenant**:
   - Ventajas: aislamiento total, backup/restore individual
   - Desventajas: costos, conexiones, migraciones
   - Costo estimado: ${X}/tenant/mes
   - Mejor para: {B2B enterprise, datos sensibles}

2. **Schema per Tenant** (PostgreSQL):
   - Ventajas: aislamiento moderado, schema separado
   - Desventajas: migraciones por tenant, conexión compartida
   - Mejor para: {SaaS con tenants medianos}

3. **Shared Schema + Tenant ID**:
   - Ventajas: bajo costo, fácil escalar
   - Desventajas: aislamiento débil, riesgo de cross-tenant leakage
   - Mejor para: {B2C, miles de tenants pequeños}
   - Optimizaciones:
     - RLS (Row-Level Security): políticas por tenant_id
     - Particionamiento por tenant_id
     - Índices parciales por tenant

4. **Híbrido**:
   - Tenants grandes: DB propia
   - Tenants medianos: schema separado
   - Tenants pequeños: shared schema

5. **Operaciones**:
   - Creación de nuevo tenant: script automatizado
   - Backup/restore por tenant
   - Migraciones: por tenant o globales
   - Monitoreo: uso por tenant
   - Data purging: retention policy por tenant

Recomendación con justificación.
```

**Formato de salida:** Estrategia multi-tenant + implementación + operaciones + costos.

**Ejemplo:** `{SaaS de facturación, B2B con empresas de 10-1000 empleados} -> {mixto: empresas grandes DB propia, PYMES shared schema con RLS}`

---

## 5. Event-Driven Architecture

**[Arquitectura]**

```
Diseña una arquitectura basada en eventos (Event-Driven) para {sistema}.

Dominio: {descripción}
Eventos de dominio identificados:
{lista_de_eventos_con_su_significado}

Componentes del sistema:
{componentes_actuales_o_propuestos}

Diseño:

1. **Event Catalog**:
   | Evento | Producer | Consumidores | Schema | Frecuencia | Importancia |
   |--------|----------|-------------|--------|------------|-------------|
   | `User.Registered` | auth-service | email-svc, analytics-svc, billing-svc | `{userId, email, plan, timestamp}` | 100/h | Critical |
   | `Order.Placed` | order-svc | inventory-svc, payment-svc, notification-svc | `{orderId, userId, items, total}` | 1000/h | Critical |
   | `Payment.Confirmed` | payment-svc | order-svc, shipping-svc, analytics-svc | `{paymentId, orderId, amount}` | 950/h | Critical |

2. **Infraestructura de eventos**:
   - Broker: {Kafka / RabbitMQ / EventBridge / SQS + SNS}
   - Topics/Exchanges: {estructura_de_nombres, particiones}
   - Schema Registry: {Avro / Protobuf / JSON Schema}
   - Serialización: {formato_y_compatibilidad}

3. **Garantías**:
   - Entrega: {at-least-once / exactly-once}
   - Orden: {garantizado por partición / no garantizado}
   - Dead letter: {qué_pasa_si_consumidor_falla}
   - Retry: {política_y_backoff}

4. **Evolución de eventos**:
   - Schema evolution: backward/forward compatibility
   - Versionado de eventos
   - Deprecación de campos

5. **Observabilidad**:
   - Tracing de eventos (trace_id propagation)
   - Monitoreo de lag de consumidores
   - Métricas: eventos/s, errores, latencia
   - Replay de eventos

6. **Sagas / Transacciones distribuidas**:
   - Coreografía vs orquestación
   - Compensating actions para rollback
```

**Formato de salida:** Arquitectura event-driven + event catalog + infraestructura + schemas.

**Ejemplo:** `{E-commerce: Order Placed -> Inventory Reserved -> Payment Processed -> Order Confirmed (saga coreografiada)}`

---

## 6. Estrategia de Consistencia y Transacciones

**[Arquitectura]**

```
Define la estrategia de consistencia y manejo transaccional para {sistema}.

Tipo de sistema: {transaccional / analítico / híbrido / event-sourced}
Requisitos de consistencia:
- {operaciones_que_requieren_consistencia_fuerte}
- {operaciones_que_toleran_consistencia_eventual}
- {operaciones_críticas_con_rollback_necesario}

Decisiones de diseño:

1. **Transacciones locales** (ACID):
   - Usar en: {operaciones_dentro_del_mismo_servicio_DB}
   - Aislamiento: {READ COMMITTED / REPEATABLE READ / SERIALIZABLE}
   - Optimistic vs Pessimistic locking

2. **Transacciones distribuidas** (Sagas):
   - Coreografía: cada servicio publica evento y reacciona
   - Orquestación: un orchestrator coordina los pasos
   - Compensación: acción para deshacer cada paso

3. **Consistencia Eventual**:
   - Casos de uso: {notificaciones, reportes, búsqueda, caché}
   - Ventana de inconsistencia: {X} segundos máximo
   - Mecanismos: eventos, CDC, batch sync

4. **Estrategia de locks**:
   - Optimistic: version/etag, retry on conflict
   - Pessimistic: SELECT FOR UPDATE, advisory locks
   - Distributed locks: Redis Redlock, ZooKeeper

5. **Conflict resolution**:
   - Last-write-wins (con timestamp)
   - CRDT (Conflict-free Replicated Data Types)
   - Merge manual (con notificación)

6. **Idempotencia**:
   - Idempotency keys en APIs
   - Deduplication de eventos
   - Exactly-once processing

Proporciona:
- Matriz de consistencia por operación
- Implementación de Sagas para operaciones multi-servicio
- Estrategia de conflictos y resolución
```
**Formato de salida:** Estrategia de consistencia + sagas + locks + idempotencia.

**Ejemplo:** `{Pago con tarjeta: consistencia fuerte (transacción), actualización de saldo: consistencia eventual, notificación: best-effort}`

---

## 7. Diseño de API Platform

**[Arquitectura]**

```
Diseña la plataforma de APIs para {organización/producto}.

Contexto:
- Consumidores: {frontend web, mobile app, third-party developers, internal services}
- Volumen actual: {X} requests/segundo
- Pico esperado: {X} requests/segundo
- Equipos: {X} equipos consumiendo/produciendo APIs

Componentes:

1. **API Gateway**:
   - Tecnología: {Kong / Apigee / AWS API Gateway / NGINX + Lua}
   - Funciones: rate limiting, auth, routing, versioning, caching, logging, transform
   - Rate limiting: {X} req/s por API key, {Y} req/s por usuario

2. **API Design Standards**:
   - RESTful: recursos, métodos, status codes, naming
   - URLs: /v{version}/{recurso}(/:{id})(/{sub-recurso})
   - Formatos: JSON:API / HAL / GraphQL
   - Paginación: cursor-based, tamaño máximo {X}
   - Errores: formato estandarizado RFC 7807 (Problem Details)

3. **Autenticación y Autorización**:
   - AuthN: OAuth 2.0 + OpenID Connect
   - AuthZ: RBAC / ABAC con claims en JWT
   - API Keys para third-party
   - Scopes por endpoint

4. **Documentación**:
   - OpenAPI 3.x spec generada del código
   - Developer portal: {Swagger UI / Stoplight / Redoc}
   - Sandbox / Playground para testing

5. **SDKs y Clientes**:
   - SDKs generados: {openapi-generator / kiota}
   - Lenguajes: {JavaScript, Python, Java, Go, .NET}
   - Client libraries con retry, caching, auth

6. **Versionado y deprecación**:
   - Estrategia: {URL / header}
   - Deprecation: Sunset header, Deprecation header
   - Timeline: announce -> deprecate -> retire

7. **Monitoreo**: latencia, errores, uso por endpoint, customer, version
```
**Formato de salida:** API platform design + standards + gateway + developer portal.

**Ejemplo:** `{API Platform for SaaS: 50 endpoints, 3 SDKs, 100 third-party developers, 5000 req/s peak}`

---

## 8. Arquitectura Hexagonal / Clean Architecture

**[Arquitectura]**

```
Diseña la estructura del proyecto siguiendo Clean Architecture / Hexagonal Architecture.

Capa de aplicación: {tipo: API / CLI / Web / Worker}
Lenguaje: {lenguaje}
Framework: {framework}
Base de datos: {motor_db}
Mensajería: {broker}

Estructura de paquetes/directorios:

```
src/
  domain/
    entities/
      {Entity}.ts           # Entidades con lógica de negocio
    value-objects/
      {ValueObject}.ts      # Value objects inmutables
    repositories/
      {Repository}.ts       # Interfaces de repositorio
    services/
      {DomainService}.ts    # Lógica de dominio pura
    events/
      {DomainEvent}.ts      # Eventos de dominio
  application/
    use-cases/
      {CreateEntity}.ts     # Casos de uso / interactors
    dto/
      {DTO}.ts              # Data Transfer Objects
    ports/
      {input}.ts            # Puertos de entrada (interfaces para controllers)
      {output}.ts           # Puertos de salida (interfaces para infraestructura)
  infrastructure/
    persistence/
      {EntityRepositoryImpl}.ts  # Implementación de repositorio
    messaging/
      {MessagePublisher}.ts      # Publicación de eventos
    http/
      {Controller}.ts            # HTTP controllers
    config/
      {Config}.ts                # Configuración
  presentation/
    api/
      {routes, middleware, validators}
    web/
      {components, pages} (si aplica)
```

Principios:
- Dependencias inward (domain no sabe de infra)
- Interfaces en el borde, implementaciones concretas adentro
- Casos de uso orquestan el flujo
- Entities contienen lógica de negocio pura
- Frameworks en la capa de infraestructura

Proporciona:
- Estructura de directorios completa
- Ejemplo de flujo: Controller -> UseCase -> Entity -> Repository
- Dependencias inversion con ejemplos de DI
- Tests: unitarios para domain/application, integration para infra
- Cómo migrar de código legacy a clean architecture
```
**Formato de salida:** Estructura de proyecto + ejemplos + dependencias + tests.

**Ejemplo:** `{API REST en TypeScript: User registration flow con Clean Architecture y dependencias invertidas}`

---

## 9. Estrategia de Observabilidad

**[Arquitectura]**

```
Diseña la estrategia de observabilidad para {sistema}.

Stack: {Prometheus + Grafana + Loki + Tempo / Datadog / New Relic / OpenTelemetry}
Componentes a instrumentar: {lista_de_microservicios_y_recursos}

Pilares:

1. **Métricas (Prometheus/Datadog)**:
   - RED metrics: Rate (requests/s), Errors (error rate), Duration (latency)
   - USE metrics: Utilization, Saturation, Errors (para infraestructura)
   - Métricas de negocio: {transacciones, usuarios activos, conversiones}
   - Custom metrics por servicio

2. **Logging (Loki/ELK)**:
   - Structured logging: JSON con campos estándar
   - Correlation ID en cada log: `trace_id`, `span_id`, `service`, `environment`
   - Log levels: seguir estándar (error, warn, info, debug, trace)
   - Redact de datos sensibles (PII, secrets)

3. **Tracing (Jaeger/Tempo)**:
   - Distributed tracing: OpenTelemetry SDK
   - Sampling: head-based (1% default, 100% para errores)
   - Propagation: W3C Trace Context (traceparent header)
   - Spans: HTTP requests, DB queries, queue publish, external API calls

4. **Dashboards**:
   - Service Overview: throughput, error rate, latency, saturation
   - Business: métricas de negocio clave
   - Infrastructure: CPU, memory, disk, network por servicio
   - Dependencies: service graph con latencia y errores

5. **Alertas**:
   - Critical: error rate > 5%, p99 > 1s, service down
   - Warning: p99 > 500ms, error rate > 1%, high CPU
   - Info: deploy events, config changes

6. **SLO / SLI**:
   - SLI: latency p99 < 500ms, error rate < 0.1%, uptime > 99.9%
   - SLO: 99.9% de requests cumplen SLI en ventana de 30 días
   - Error budget: (100% - SLO) * total requests
```
**Formato de salida:** Estrategia de observabilidad + instrumentación + dashboards + alertas + SLOs.

**Ejemplo:** `{15 microservicios en K8s, OpenTelemetry SDK, Prometheus + Grafana + Loki + Tempo, 30 alertas, 5 SLOs}`

---

## 10. Estrategia de Seguridad en Profundidad

**[Arquitectura]**

```
Diseña una estrategia de seguridad en profundidad (defense in depth) para {sistema}.

Tipo: {SaaS / On-premise / Hybrid}
Datos sensibles: {PII, financial, health, credentials, business IP}
Compliance: {SOC2 / PCI DSS / HIPAA / GDPR / ISO 27001}
Usuarios: {internos, externos, third-party}

Capas de seguridad:

1. **Network**:
   - VPC isolation, subnets públicas/privadas
   - Security Groups (stateful) + Network ACLs (stateless)
   - WAF: SQLi, XSS, DDoS protection
   - DDoS: {AWS Shield / Cloudflare / Azure DDoS Protection}
   - VPN / Direct Connect para acceso interno

2. **Application**:
   - Input validation: toda entrada es potencialmente maliciosa
   - Output encoding: contextual (HTML, JS, CSS, URL)
   - Authentication: OAuth 2.0 / OIDC, MFA
   - Authorization: RBAC, ABAC, policy-based (OPA)
   - Session management: HttpOnly, Secure, SameSite cookies
   - CSRF: tokens o SameSite=Strict
   - Rate limiting: por endpoint, usuario, IP
   - API security: API keys, scopes, usage plans

3. **Data**:
   - Encryption in transit: TLS 1.3 mínimo
   - Encryption at rest: AES-256, KMS-managed keys
   - Database: column-level encryption, dynamic data masking
   - Secrets management: Vault / AWS Secrets Manager
   - Backups: encrypted, access-controlled

4. **Identity & Access**:
   - IAM: mínimo privilegio
   - Service accounts: roles específicos, rotación de keys
   - Audit trail: CloudTrail, audit logs

5. **Monitoring & Response**:
   - Security events: SIEM (Splunk / Sentinel)
   - Threat detection: GuardDuty / Security Hub
   - Vulnerability scanning: weekly, container scanning en CI
   - Penetration testing: anual, y después de cambios grandes
   - Incident response: runbook documentado

6. **Supply Chain**:
   - Dependency scanning (npm audit, trivy)
   - SBOM generation
   - Container image signing
   - Code signing
```
**Formato de salida:** Estrategia de seguridad por capas + configuración + compliance + incident response.

**Ejemplo:** `{SaaS financiero, PCI DSS Level 1, SOC 2 Type II, AWS, 50 microservicios, 100k usuarios}`

---

## 11. Estrategia de Despliegue / Release

**[Arquitectura]**

```
Diseña la estrategia de despliegue y releases para {sistema}.

Contexto:
- Frecuencia de releases: {varias/día / diaria / semanal}
- Equipo: {X} desarrolladores
- Entornos: {dev, staging, canary, production}
- Stack: {lenguaje, framework, infraestructura}

Estrategias:

1. **Branching Strategy**: {GitHub Flow / Git Flow / Trunk-based}
   - Ramas: {main, develop, feature/*, release/*, hotfix/*}
   - Protección: {required reviews, status checks, linear history}
   - Merge strategy: {merge commit / squash / rebase}

2. **CI/CD Pipeline**:
   - Stages: commit -> build -> test -> security scan -> deploy staging -> e2e -> deploy canary -> deploy prod
   - Gates: {tests pasan, coverage mínimo, security scan, approval manual}

3. **Deployment Strategies**:
   - Rolling update: gradual, sin downtime
   - Blue-green: dos entornos completos, switch de tráfico
   - Canary: 1% -> 5% -> 25% -> 50% -> 100%, con monitoreo
   - Feature flags: toggle en producción, deploy temprano

4. **Rollback**:
   - Automático: si métricas empeoran (error rate, latency)
   - Manual: one-click rollback a versión anterior
   - Base de datos: migraciones forward/backward, versionadas

5. **Release Management**:
   - Semantic versioning: {major.minor.patch}
   - Changelog: generado de conventional commits
   - Release notes: features, fixes, breaking changes, migration guide
   - Approvals: quién puede aprobar releases a producción

6. **Database Deployments**:
   - Migraciones: expand-migrate (add column) -> deploy code -> contract-migrate (drop column)
   - Backward-compatible: código viejo funciona con schema nuevo
   - Rollback: migración down siempre disponible

7. **Post-Deploy**:
   - Smoke tests automáticos
   - Monitoreo de métricas (15 min post-deploy)
   - Rollback automático si SLIs degradan
```
**Formato de salida:** Estrategia de despliegue + branching + CI/CD + rollback + DB migrations.

**Ejemplo:** `{API Platform, trunk-based, canary 5%-30%-100% con feature flags, rollback automático si error rate > 1%}`

---

## 12. Diseño de Sistema de Notificaciones

**[Arquitectura]**

```
Diseña un sistema de notificaciones multi-canal para {aplicación}.

Canales: {email / SMS / push / in-app / webhook}
Volumen: {X} notificaciones/día, pico {X}/hora

Eventos que generan notificaciones:
{lista_de_eventos_con_canal_prioridad}

Requerimientos no funcionales:
- Entrega: at-least-once
- Latencia: < {X} segundos para notificaciones críticas
- Tracking: open rate, click rate, delivery status
- Templates: dinámicos por canal e idioma
- Preferencias: usuario configura qué notificaciones recibe

Diseño:

1. **Arquitectura**:
   ```
   [Servicio] -> [Notification Event] -> [Message Queue]
     -> [Notification Worker] -> [Template Engine]
     -> [Channel Handlers] -> [Provider APIs]
   ```

2. **Componentes**:
   - NotificationEvent: evento normalizado con metadata
   - Template Engine: {Handlebars / Liquid / Mustache}
   - Template Store: templates por tipo de notificación y canal
   - Channel Handlers: EmailHandler, SMSHandler, PushHandler, InAppHandler
   - Provider abstraction: proveedores múltiples por canal (failover)
   - Delivery Tracker: status de cada notificación

3. **Rate Limiting & Priority**:
   - Colas por prioridad (critical, high, normal, low)
   - Rate limiting por canal (no exceder API limits de proveedores)
   - Batch: agrupar notificaciones no críticas

4. **Templates**:
   - Variables por notificación: {{user.name}}, {{action.url}}
   - Multi-idioma: template por locale
   - Testing: preview de template con datos de prueba

5. **Monitoreo**:
   - Delivery rate, open rate, click rate
   - Provider latencia y errores
   - Queue depth y processing time
   - Bounce handling: hard bounce -> marcar email como inválido

6. **Proveedores**:
   - Email: {SendGrid / SES / Mailgun / Postmark}
   - SMS: {Twilio / Vonage / AWS SNS}
   - Push: {Firebase / APNS / OneSignal}
   - Fallback: si un proveedor falla, usar el siguiente
```
**Formato de salida:** Arquitectura de notificaciones + componentes + templates + proveedores.

**Ejemplo:** `{SaaS CRM: 500k notificaciones/día, email + in-app + push, 20 tipos de notificación, multi-idioma}`

---

## 13. Estrategia de Escalabilidad

**[Arquitectura]**

```
Diseña una estrategia de escalabilidad para {sistema}.

Estado actual:
- Usuarios: {X}
- Requests/s: {X}
- DB size: {X} GB
- Instancias: {X} servidores/pods

Estado objetivo (12 meses):
- Usuarios: {X} (crecimiento {X}x)
- Requests/s: {X} (crecimiento {X}x)
- DB size: {X} TB
- SLA: 99.{X}%

Estrategias por capa:

1. **Application Layer**:
   - Horizontal scaling: stateless design, sesiones fuera de instancia
   - Auto-scaling: {CPU > 70%, RPS > 1000/instance}
   - Load balancing: {round-robin / least connections / application-based}
   - Connection pooling: {tamaño_por_instancia, max_connections}

2. **Data Layer**:
   - Read replicas: {N} réplicas de lectura
   - Read/write splitting: writes a primary, reads a replicas
   - Sharding: por {cliente / región / id_range}
   - Caché: L1 (in-memory) + L2 (Redis cluster)
   - Database connection pooling: PgBouncer / ProxySQL

3. **Caching Strategy**:
   - Write-through: datos críticos
   - Cache-aside: datos de referencia
   - CDN: assets estáticos
   - Invalidation: eventos, TTL, tags

4. **Async Processing**:
   - Dequeue writes: cola para writes no críticos
   - Event-driven: desacoplar productores de consumidores
   - Workers auto-scalados por queue depth

5. **Database Scaling**:
   - Vertical: upgrade instance (temporal)
   - Horizontal: read replicas, sharding, partitioning
   - Archiving: datos antiguos a storage más barato

6. **Cost Considerations**:
   - Spot instances para workers
   - Reserved instances para baseline
   - Auto-scaling para picos

7. **Monitoring**:
   - Scale triggers: métricas que disparan escalado
   - Capacity planning: proyecciones vs uso actual
```
**Formato de salida:** Estrategia de escalabilidad + auto-scaling + data scaling + costos.

**Ejemplo:** `{SaaS B2B, 50k -> 500k usuarios, 1000 -> 10000 RPS, 100GB -> 2TB DB, multi-región}`

---

## 14. Diseño de Sistema de Búsqueda

**[Arquitectura]**

```
Diseña un sistema de búsqueda para {aplicación/contenido}.

Contenido a indexar:
{lista_de_tipos_de_contenido_con_volumen}

Requerimientos:
- Latencia de búsqueda: p99 < {X}ms
- Throughput: {X} búsquedas/segundo
- Precisión: {alta / buena / relajada}
- Idiomas: {lista}
- Frecuencia de indexación: {tiempo_real / cada_X_minutos / diaria}

Opciones tecnológicas:

1. **Elasticsearch / Opensearch**:
   - Cluster: {X} nodos, {X} shards, {X} réplicas
   - Mapping: {campos_indexados, analyzers por idioma}
   - Query DSL: full-text, filtered, aggregations, highlighting
   - Sugerencias: completion suggester, phrase suggester
   - Index lifecycle: hot-warm-cold-frozen

2. **Meilisearch / Typesense**:
   - Configuración: {X} instancias
   - Features: typo tolerance, faceting, filtering, sorting
   - Ranking: orden por relevancia con rules personalizadas

3. **PostgreSQL Full-Text** (para volúmenes pequeños):
   - tsvector + GIN index
   - Ranking: ts_rank, ts_rank_cd
   - Language-specific configurations

4. **Híbrido**:
   - Main search: Elasticsearch
   - Autocomplete/suggest: Meilisearch
   - Cache: Redis para búsquedas frecuentes

Arquitectura:
```
[App] -> [Search Service] -> [Search Cluster]
   -> [Indexer Worker] <- [Events: content.created, content.updated]
```

Provee:
- Estrategia de indexación (sync vs async)
- Re-indexación: full + incremental
- Schema design (analyzers, filters, tokenizers)
- Query optimization (filters before full-text, rescore)
- Monitoring: search latency, index size, query performance
```
**Formato de salida:** Arquitectura de búsqueda + schema + queries + operaciones.

**Ejemplo:** `{E-commerce: 500k productos, 10 idiomas, búsqueda con filtros, facets, autocomplete, 1000 qps, p99 < 50ms}`

---

## 15. Estrategia de Migración de Datos Legacy

**[Arquitectura]**

```
Diseña una estrategia de migración de datos desde {sistema_legacy} a {nuevo_sistema}.

Datos a migrar:
{lista_de_entidades_con_volumen_y_complejidad}

Origen: {tipo_db_legacy, versión, tamaño}
Destino: {tipo_db_destino, versión, schema_diseñado}
Mapping de datos: {transformaciones_necesarias}
Tiempo disponible para migración: {ventana_de_mantenimiento}

Estrategia:

1. **Assessment**:
   - Inventario completo de datos legacy
   - Calidad de datos: limpieza necesaria
   - Dependencias entre entidades
   - Volumen de datos: {X} GB, {X} filas

2. **Estrategia de migración**:

   Opción A: **Big Bang** (todo en una ventana)
   - Ventajas: simple, consistente
   - Desventajas: downtime largo, alto riesgo
   - Tiempo estimado: {X} horas

   Opción B: **Trickle / Incremental**
   - Fase 1: Sync inicial (carga completa)
   - Fase 2: CDC (continuous data capture) de cambios
   - Fase 3: Cutover (redirigir tráfico)
   - Tiempo estimado: {X} días con sync continuo

   Opción C: **Strangler Fig**
   - Migrar funcionalidad por funcionalidad
   - Legacy y nuevo coexisten con feature flags
   - Migración transparente para usuarios

3. **Plan de ejecución**:
   - Fase 1: Extract (exportar datos)
   - Fase 2: Transform (limpiar, mapear, enriquecer)
   - Fase 3: Load (importar, validar, indexar)
   - Fase 4: Verify (comparar datos origen vs destino)
   - Fase 5: Cutover (cambiar aplicaciones a nuevo sistema)

4. **Validación**:
   - Conteo de registros: origen == destino
   - Checksums de datos críticos
   - Muestreo aleatorio de registros
   - Queries de verificación en ambos sistemas

5. **Rollback plan**:
   - Si algo falla: restaurar desde backup
   - Tiempo de rollback: estimado
   - Cómo verificar que rollback fue exitoso
```
**Formato de salida:** Plan de migración + scripts + validación + rollback.

**Ejemplo:** `{MySQL 5.7 (500GB) -> PostgreSQL 16, 200 tablas, 12h ventana, Strangler Fig con CDC}`

---

## 16. Diseño de Sistema de Archivos / Storage

**[Arquitectura]**

```
Diseña la estrategia de almacenamiento de archivos para {aplicación}.

Tipos de archivos:
{lista: imágenes, documentos, videos, backups, logs, etc.}

Volumen:
- Almacenamiento actual: {X} TB
- Crecimiento mensual: {X} GB
- Archivos nuevos/día: {X}
- Tamaño promedio: {X} MB

Requerimientos:
- Latencia de acceso: {baja / media / alta tolerancia}
- Durabilidad: {X} 9s (99.9999999%)
- Disponibilidad: {X}% (99.99%)
- Frecuencia de acceso: {frecuente / ocasional / archive}

Diseño:

1. **Arquitectura**:
   ```
   [App] -> [Storage Service] -> [Object Storage (S3)]
     -> [CDN (CloudFront)] -> [Client]
   ```

2. **Componentes**:
   - Object Storage: {S3 / GCS / Azure Blob / MinIO}
   - CDN: {CloudFront / Cloudflare / Fastly}
   - Image Processing: {ImageMagick / Sharp / Thumbor}
   - File Validation: tipo, tamaño, virus scan (ClamAV)
   - URL Signing: presigned URLs para acceso temporales

3. **Organización**:
   ```
   s3://{bucket}/
     uploads/{tenant}/{type}/{date}/{uuid}.{ext}
     processed/{tenant}/{type}/{date}/{uuid}.{ext}
     thumbnails/{tenant}/{type}/{date}/{uuid}_{size}.{ext}
     backups/{system}/{date}/...
     logs/{service}/{date}/...
   ```

4. **Lifecycle Policies**:
   - Hot (S3 Standard): 30 días
   - Warm (S3 Infrequent Access): 90 días
   - Cold (S3 Glacier): 1 año
   - Deep Archive (S3 Glacier Deep Archive): 7 años
   - Delete: después de retención legal

5. **Image Processing Pipeline**:
   - Upload -> validation -> resize variants -> CDN invalidation
   - Variants: {original, large 1200px, medium 600px, thumbnail 150px}
   - Formats: {WebP / AVIF con fallback a JPEG/PNG}
   - Progressive loading: blur placeholder / LQIP

6. **Seguridad**:
   - Server-side encryption (SSE-S3 o SSE-KMS)
   - Bucket policies: solo accesible desde app role
   - Presigned URLs: expiración en {X} minutos
   - CORS: solo orígenes permitidos
   - Malware scanning en upload
```
**Formato de salida:** Arquitectura de almacenamiento + bucket structure + lifecycle + image pipeline.

**Ejemplo:** `{SaaS de contenido: 50TB, 100k uploads/día, imágenes + videos + documentos, CDN, image optimization pipeline}`

---

## 17. Diseño de Sistema de Colas y Workers

**[Arquitectura]**

```
Diseña un sistema de procesamiento asíncrono con colas y workers para {aplicación}.

Tareas asíncronas identificadas:
{lista_de_tareas_con_frecuencia_y_prioridad}

Requisitos:
- Throughput: {X} tareas/segundo
- Pico esperado: {X} tareas/segundo ({X}x normal)
- Latencia máxima por prioridad:
  - Critical: < {X} segundos
  - High: < {X} minutos
  - Normal: < {X} minutos
  - Low: < {X} horas
- Durabilidad: no perder tareas (persistencia en disco)
- Ordering: necesario / no necesario

Diseño:

1. **Arquitectura**:
   ```
   [Producer Service] -> [Queue Broker] -> [Consumer Workers]
     -> [DLQ (Dead Letter Queue)] -> [Error Handler]
   ```

2. **Tecnología de colas**:
   | Broker | Caso de uso | Pros | Contras |
   |--------|------------|------|---------|
   | RabbitMQ | Routing complejo, RPC | Flexible, maduro | Operación manual |
   | Kafka | High throughput, event sourcing | Durabilidad, replay | Más complejo |
   | SQS | Serverless, simple | Sin operación | Limitado en features |
   | Redis | Simple, rápido | Baja latencia | Sin persistencia fuerte |

3. **Task definition**:
   ```json
   {
     "task_type": "send_email",
     "task_id": "uuid",
     "payload": { "to": "user@example.com", "template": "welcome" },
     "metadata": {
       "priority": "high",
       "retry_count": 0,
       "max_retries": 3,
       "scheduled_at": "2024-01-01T00:00:00Z",
       "created_at": "2024-01-01T00:00:00Z"
     }
   }
   ```

4. **Worker implementation**:
   - Pool de workers: {X} concurrentes por instancia
   - Auto-scaling: basado en queue depth
   - Graceful shutdown: SIGTERM -> completar tarea actual
   - Health check: heartbeat cada {X} segundos
   - Rate limiting: {X} tareas/segundo por worker

5. **Error handling**:
   - Retry policy: exponencial backoff (1s, 5s, 30s)
   - DLQ: después de {3} intentos fallidos
   - Poison messages: detectar y aislar
   - Alert: DLQ no vacía por > 5 minutos

6. **Monitoreo**:
   - Queue depth (prometheus metrics)
   - Processing time (avg, p95, p99)
   - Error rate, retry rate
   - Worker count vs queue depth
```
**Formato de salida:** Arquitectura de colas + workers + configuración + monitoreo.

**Ejemplo:** `{20 tipos de tareas, RabbitMQ, 50 workers auto-escalados, 3 colas de prioridad, DLQ + alertas}`

---

## 18. Value Proposition Canvas / Architecture Decision Records

**[Arquitectura]**

```
Crea Architecture Decision Records (ADRs) para las siguientes decisiones arquitectónicas del proyecto {nombre_proyecto}.

Decisiones a documentar:
{lista_de_decisiones_arquitectónicas}

Plantilla ADR:

# ADR-{N}: {Título descriptivo}

## Contexto
{descripción del problema, restricciones, situación actual}

## Decisión
{qué se decidió hacer y por qué}

## Consecuencias
- Positivas: {lista de beneficios}
- Negativas: {lista de trade-offs}
- Neutrales: {lista de implicaciones}

## Alternativas consideradas
- **Alternativa A**: {descripción}
  - Pros: {lista}
  - Contras: {lista}
  - Por qué no se eligió: {razón}

- **Alternativa B**: {descripción}
  - Pros: {lista}
  - Contras: {lista}
  - Por qué no se eligió: {razón}

## Estado
{Aceptada / Propuesta / Deprecada / Reemplazada por ADR-N}

## Fecha
{YYYY-MM-DD}

## Referencias
- {enlaces a docs, issues, PRs, diagramas}

---

Decisiones a documentar:
1. {Decisión 1}: e.g., Elección de base de datos
2. {Decisión 2}: e.g., Estrategia de caché
3. {Decisión 3}: e.g., Comunicación entre microservicios
4. {Decisión 4}: e.g., Framework frontend
5. {Decisión 5}: e.g., Estrategia de despliegue

Completa la plantilla para cada decisión con análisis real de alternativas y trade-offs.
```

**Formato de salida:** Conjunto de ADRs (uno por decisión) en formato estándar.

**Ejemplo:** `{ADR-001: Elección de PostgreSQL como base de datos principal}`, `{ADR-002: Estrategia de caché con Redis}`, `{ADR-003: GraphQL vs REST}`
