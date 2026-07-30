# Documentación

> 22 prompts para generar documentación técnica de calidad.

---

## 1. README.md Completo

**[Documentación]**

```
Genera un README.md completo y profesional para {proyecto}.

Nombre del proyecto: {nombre_proyecto}
Descripción breve: {una_o_dos_líneas}
Tecnologías principales: {lista_tecnologías}
Tipo: {API / CLI / Librería / App Web / Microservicio}

Estructura del README:
1. Título y badge (build passing, coverage, version, license)
2. Descripción: qué hace y por qué existe (2-3 párrafos)
3. Screenshot/demo (placeholder para imagen)
4. Tabla de contenidos
5. Instalación:
   - Prerequisitos ({X} versión mínima)
   - Pasos de instalación (comandos exactos)
   - Variables de entorno necesarias
6. Uso rápido (ejemplo mínimo funcional)
7. Documentación principal:
   - API / CLI / Componentes
   - Ejemplos de uso comunes
   - Configuración avanzada
8. Arquitectura (diagrama en ASCII o enlace)
9. Contributing: cómo contribuir (enlace a CONTRIBUTING.md)
10. Tests: cómo ejecutarlos
11. Changelog: enlace a CHANGELOG.md
12. Licencia
13. Agradecimientos / créditos
```

**Formato de salida:** Markdown completo y estructurado con emojis útiles (✅, 🚀, 📦, etc.) y formato limpio.

**Ejemplo:** `{FastAPI Auth Service}`, `{Python/FastAPI/PostgreSQL/JWT}`, `{API de autenticación con OAuth2, MFA y rate limiting}`

---

## 2. JSDoc / Docstrings para Funciones

**[Documentación]**

```
Genera documentación estilo {JSDoc / Google Python Docstrings / XML Doc / Rustdoc} para las siguientes funciones/métodos:

Código:
```{lenguaje}
{código_a_documentar}
```

Requisitos de documentación:
- Descripción de la función: qué hace (no cómo)
- @param / Args: nombre, tipo, descripción, si es opcional
- @returns / Returns: tipo y descripción de lo que retorna
- @throws / Raises: qué errores lanza y bajo qué condiciones
- @example: ejemplo de uso mínimo
- @see / @seealso: funciones relacionadas
- Complejidad: O(n) si aplica
- Side effects: si modifica estado global o parámetros mutables
- Async: documentar si es asíncrona y qué promesa retorna
- Deprecation: @deprecated con alternativa sugerida

Formato: un bloque de documentación por función pública.
```

**Formato de salida:** Código original con documentación añadida encima de cada función/método público.

**Ejemplo:** `{Python}`, `{Google-style docstrings}`, `{función: calculate_discount(price: float, code: str, user_tier: int) -> float}`

---

## 3. Documentación de API REST (OpenAPI/Swagger)

**[Documentación]**

```
Genera la documentación OpenAPI 3.x completa para {API}.

API Base URL: {base_url}
Versión: {v1 / v2}
Formato: {YAML / JSON}

Endpoints:
{lista_de_endpoints_completos_con_método_ruta_descripción}

Por cada endpoint:
1. Resumen y descripción detallada
2. Parámetros: path, query, header, cookie
3. Request body: schema completo con ejemplo
4. Response: códigos HTTP y schema de cada uno (200, 201, 400, 401, 403, 404, 500)
5. Headers: Content-Type, Authorization, X-Request-ID
6. Security: qué autenticación requiere
7. Tags: para agrupar en Swagger UI
8. Ejemplo de request curl

Componentes reutilizables:
- Schemas de datos (objetos principales)
- Security schemes (Bearer JWT, API Key)
- Parameters (paginación, filtros comunes)
- Responses (ErrorResponse estándar)
- Request bodies (Create, Update, Patch)
```

**Formato de salida:** Archivo openapi.yaml/json completo con todos los endpoints y componentes.

**Ejemplo:** `{https://api.ejemplo.com/v1}`, `{REST}`, `{endpoints: GET/POST /users, GET/PUT/DELETE /users/{id}, GET /users/{id}/orders}`

---

## 4. Guía de Instalación y Configuración

**[Documentación]**

```
Crea una guía de instalación y configuración paso a paso para {producto/proyecto}.

Público objetivo: {desarrolladores / DevOps / usuarios finales}
Sistema operativo: {Windows / macOS / Linux / Docker}
Modos de instalación: {manual / Docker / cloud marketplace}

Secciones:

1. Prerrequisitos:
   - {Software necesario con versiones mínimas}
   - {Permisos necesarios}
   - {Recursos mínimos (RAM, disco, CPU)}

2. Instalación:
   - Opción A: {package manager: npm install / pip install / brew}
   - Opción B: {Docker: docker pull / docker-compose up}
   - Opción C: {from source: git clone + build}
   - Opción D: {cloud: enlace a marketplace}

3. Configuración inicial:
   - Variables de entorno: tabla con nombre, descripción, default, requerido
   - Archivo de configuración: ejemplo con valores y comentarios
   - Base de datos: migraciones, seed data

4. Verificación:
   - Comando o test para verificar que funciona
   - Health check endpoint
   - Logs esperados

5. Solución de problemas comunes:
   - {Error común 1}: {solución}
   - {Error común 2}: {solución}

6. Siguientes pasos: enlaces a guías de uso avanzado
```

**Formato de salida:** Guía markdown con pasos numerados, bloques de código y tablas.

**Ejemplo:** `{Plataforma de análisis en tiempo real}`, `{Docker + Kubernetes}`, `{requisitos: Docker 24+, 4GB RAM, 20GB disco}`

---

## 5. Changelog / Release Notes

**[Documentación]**

```
Genera un CHANGELOG.md siguiendo {Keep a Changelog / Conventional Commits} para {proyecto}.

Versiones a documentar:
- Última: {vX.Y.Z} ({fecha})
- Anterior: {vX.Y.Z} ({fecha})
- Historial: {N} versiones anteriores

Categorías por versión:
- Added: nuevas funcionalidades
- Changed: cambios en funcionalidades existentes
- Deprecated: funcionalidades que serán eliminadas
- Removed: funcionalidades eliminadas
- Fixed: correcciones de bugs
- Security: vulnerabilidades corregidas
- Performance: mejoras de rendimiento
- Internal: cambios internos (refactors, tests, CI)

Formato:
- Cada entrada enlace al PR/commit
- Nombre de contribuidor (opcional)
- Breaking changes destacados con ⚠️
- Versión con fecha ISO (YYYY-MM-DD)
- Enlace a diff entre versiones

Commits de referencia:
{lista_de_commits_relevantes}
```

**Formato de salida:** CHANGELOG.md completo con todas las secciones.

**Ejemplo:** `{SDK de pagos v2.1.0}`, `{added: nuevo método refundPayment, changed: actualizado HTTP client a fetch}`

---

## 6. Documentación de Arquitectura (ADR)

**[Documentación]**

```
Redacta un Architecture Decision Record (ADR) para {decisión_arquitectónica}.

Número: {ADR-NNNN}
Título: {título_descriptivo}
Contexto: {situación_actual, problema_a_resolver, restricciones, supuestos}
Decisión: {qué_se_decidió_hacer}
Consecuencias: {positivas_y_negativas_de_la_decisión}
Estado: {Propuesta / Aceptada / Reemplazada / Obsoleta}

Opcionales:
- Alternativas consideradas: {opción A: pros/cons, opción B: pros/cons}
- Justificación: por qué se eligió esta sobre las alternativas
- Referencias: enlaces a docs, issues, PRs relacionados
- Fecha: {YYYY-MM-DD}
- Autores: {nombre_del_responsable}

Incluye diagrama en Mermaid/ASCII si aplica.
```

**Formato de salida:** ADR en markdown siguiendo la plantilla estándar.

**Ejemplo:** `{ADR-0012: Migrar de REST a GraphQL para API de catálogo}`, `{contexto: múltiples overfetching en GET /products, 3 clientes móviles requieren diferentes estructuras}`

---

## 7. Guía de Estilo de Código

**[Documentación]**

```
Define una guía de estilo de código para {equipo/proyecto} en {lenguaje}.

Convenciones a cubrir:
1. Nombrado:
   - {camelCase / snake_case / PascalCase / kebab-case} para cada contexto
   - Abreviaturas permitidas
   - Prefijos/sufijos para types, interfaces, enums, genéricos

2. Formato:
   - Indentación: {2 espacios / 4 espacios / tabs}
   - Longitud máxima de línea: {80 / 100 / 120} caracteres
   - Punto y coma: {obligatorio / opcional}
   - Comillas: {simples / dobles}
   - Espacios alrededor de operadores y keywords

3. Comentarios:
   - Cuándo comentar (el "por qué", no el "qué")
   - Formato de documentación (JSDoc, docstrings)
   - TODO/FIXME/HACK convention
   - Comentarios de sección

4. Estructura de archivos:
   - Orden de imports (built-in, externo, interno)
   - Una exportación por archivo vs múltiples
   - Convención de nombres de archivo
   - Organización de carpetas

5. Prácticas:
   - Inmutabilidad preferida sobre mutación
   - Manejo de errores (throw vs Result type)
   - Async/await patterns
   - Null handling
   - Tests: naming de tests, estructura describe/it

6. Linting: configuración de {ESLint / Ruff / Prettier / rustfmt}
```

**Formato de salida:** Guía de estilo + lint config + ejemplos de código bueno y malo.

**Ejemplo:** `{TypeScript}`, `{equipo frontend}`, `{convenciones: PascalCase para componentes, camelCase para funciones, 2 espacios indent}`

---

## 8. Documentación de API Interna (SDK/Librería)

**[Documentación]**

```
Genera documentación de usuario para la librería/SDK {nombre_librería}.

Público: {desarrolladores que integrarán la librería}
Instalación: {npm install / pip install / cargo add / gradle}

Módulos/Clases públicas:
{lista_de_módulos_con_breve_descripción}

Por cada clase/función pública:
```{lenguaje}
{firma_completa}
```
- Descripción: qué hace
- Parámetros: tabla con nombre, tipo, descripción, default
- Retorno: tipo y significado
- Excepciones/Errores: lista de posibles errores
- Ejemplo(s):
```{lenguaje}
{ejemplo_de_uso_mínimo}
```
- Ejemplo avanzado (si aplica)

Además:
- Quick start: ejemplo end-to-end en < 10 líneas
- Guía de migración (si hay breaking changes)
- FAQ / Troubleshooting
- Enlaces a tests como ejemplos adicionales
```

**Formato de salida:** Documentación de API completa con ejemplos y referencias.

**Ejemplo:** `{payment-sdk-js}`, `{Node.js + browser}`, `{módulos: PaymentClient, WebhookHandler, RefundManager}`

---

## 9. Guía de Contribución (CONTRIBUTING.md)

**[Documentación]**

```
Crea una guía de contribución para {proyecto_open_source}.

Público: {contribuidores externos}

Secciones:

1. Código de conducta (enlace a CODE_OF_CONDUCT.md)

2. Cómo empezar:
   - Fork + clone
   - Setup del entorno de desarrollo
   - Instalación de dependencias
   - Build y tests iniciales

3. Encontrar issues:
   - Labels: good first issue, help wanted, bug, enhancement
   - Cómo comentar en un issue antes de trabajar
   - Política de asignación

4. Desarrollo:
   - Rama: feature/{issue-number}-{descripción}
   - Commits: {Conventional Commits} formato
   - Estilo de código: enlace a guía de estilo
   - Tests: todos deben pasar, nuevos código debe tener tests

5. Pull Request:
   - Template de PR (proveer)
   - Checklist pre-PR:
     - [ ] Tests pasan
     - [ ] Cobertura no disminuye
     - [ ] Linting pasa
     - [ ] Documentación actualizada
     - [ ] Changelog actualizado
   - Revisión: qué esperar, tiempo aproximado
   - CI/CD: qué pipelines se ejecutan

6. Release process:
   - Versionado semántico
   - Quién hace releases
   - Schedule de releases
```

**Formato de salida:** CONTRIBUTING.md completo + templates de PR e issue.

**Ejemplo:** `{librería de validación Zod}`, `{TypeScript}`, `{conventional commits, PRs requieren 2 approvals}`

---

## 10. Documentación de Configuración / Environment Variables

**[Documentación]**

```
Documenta todas las variables de entorno y opciones de configuración para {proyecto}.

Formato de documentación (tabla por categoría):

## {Categoría: Database}
| Variable | Tipo | Default | Requerido | Descripción |
|----------|------|---------|-----------|-------------|
| `DB_HOST` | string | `localhost` | Sí | Host de la base de datos |
| `DB_PORT` | integer | `5432` | No | Puerto de PostgreSQL |
| `DB_NAME` | string | - | Sí | Nombre de la base de datos |
| `DB_USER` | string | - | Sí | Usuario de la base de datos |
| `DB_PASSWORD` | string | - | Sí | Contraseña (usar secrets manager) |

## {Categoría: Auth}
...

Ejemplo de archivo `.env` completo:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp_production
DB_USER=myapp
DB_PASSWORD=s3cr3t

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=3600
```

Validaciones:
- Qué pasa si una variable requerida falta
- Formatos esperados (URL, coma-separada, JSON string)
- Valores válidos para enums
```

**Formato de salida:** Documentación completa de configuración + .env.example + validación.

**Ejemplo:** `{API Gateway}`, `{20+ variables de entorno organizadas en 5 categorías}`

---

## 11. Tutorial / How-to Guide

**[Documentación]**

```
Crea un tutorial paso a paso para {tarea_específica} usando {herramienta/producto}.

Título: "Cómo {objetivo}"
Público: {principiante / intermedio / avanzado}
Tiempo estimado: {X} minutos
Prerrequisitos: {lista_de_prerrequisitos}

Pasos:
1. {Paso 1: título}
   - Explicación breve del propósito
   - Código/comando a ejecutar
   - Resultado esperado
   - Posibles errores y soluciones

2. {Paso 2: título}
   ...

{Incluir en cada paso: código ejecutable, explicación del qué y por qué, captura de pantalla o salida esperada}

Al final:
- Resumen de lo aprendido
- Siguientes pasos / recursos adicionales
- Enlace a documentación relacionada

{Incluir ejemplos de "error común" y cómo solucionarlo en cada paso}
```

**Formato de salida:** Tutorial markdown con bloques de código, advertencias y tips.

**Ejemplo:** `{Cómo configurar autenticación OAuth2 con Google en FastAPI}`, `{intermedio}`, `{20 min}`, `{requisitos: FastAPI app básica, Google Cloud Console project}`

---

## 12. Documentación de Seguridad

**[Documentación]**

```
Crea la documentación de seguridad para {proyecto/aplicación}.

Secciones:

1. Modelo de amenazas:
   - Activos protegidos: {datos_usuarios, tokens, claves_API, datos_pago}
   - Amenazas identificadas: {lista_de_amenazas}
   - Suposiciones de seguridad: {qué_asumimos_seguro}

2. Autenticación y Autorización:
   - Mecanismo: {JWT / OAuth / SAML / Sesión}
   - Flujo de autenticación: descripción + diagrama
   - Política de contraseñas: {mínimo 8 chars, complejidad, MFA}
   - Manejo de sesiones: expiración, refresh, revocación

3. Protección de datos:
   - Encriptación en tránsito: TLS 1.3
   - Encriptación en reposo: {AES-256 / column-level encryption}
   - Hashing de contraseñas: {bcrypt / argon2}
   - Datos sensibles: qué se considera sensible y cómo se maneja

4. API Security:
   - Rate limiting: {X} req/s por IP, {Y} req/s por usuario
   - CORS: orígenes permitidos
   - CSRF: tokens / SameSite cookies
   - Input validation: en todas las entradas
   - SQL Injection prevention: ORM / parameterized queries

5. Infraestructura:
   - Network segmentation
   - Firewall rules
   - Container security (no-root, read-only FS, image scanning)
   - Secrets management
   - Audit logging

6. Incident Response:
   - Contacto de seguridad
   - Procedimiento de reporte
   - Timeline esperado de respuesta
```

**Formato de salida:** Documento de seguridad completo + checklist de hardening.

**Ejemplo:** `{SaaS de gestión financiera}`, `{PCI DSS compliance, OAuth2, encriptación AES-256-GCM en reposo}`

---

## 13. Documentación de Monitorización / Observabilidad

**[Documentación]**

```
Crea la guía de monitorización y observabilidad para {sistema/aplicación}.

Stack: {Prometheus + Grafana / Datadog / New Relic / Sentry / ELK}

Secciones:

1. Métricas clave (SLIs):
   - Latencia: p50, p95, p99 por endpoint crítico
   - Throughput: requests/segundo por servicio
   - Tasa de error: % de errores 4xx/5xx
   - Saturación: CPU, memoria, disco, conexiones DB
   - Disponibilidad: uptime, health check results

2. Dashboards:
   - Dashboard de alto nivel: para stakeholders
   - Dashboard operacional: para el equipo de turno
   - Dashboard de servicio: métricas detalladas por microservicio
   - Dashboard de base de datos: queries lentas, conexiones, replicación

3. Alertas:
   - Reglas de alerta con severity:
     - Critical: sistema caído, datos perdiéndose
     - Warning: umbrales acercándose, degradación
     - Info: cambios, deploys, eventos programados
   - Routing: quién recibe cada alerta (equipo, Slack, PagerDuty)
   - Runbooks enlazados a cada alerta

4. Logging:
   - Structured logging format (ej: JSON schema)
   - Campos obligatorios: timestamp, level, service, trace_id, message
   - Niveles: cuando usar cada uno
   - Sensitive data: qué no loggear (PII, passwords, tokens)
   - Retention policy: {N} días

5. Tracing:
   - Header propagation (traceparent, x-request-id, x-trace-id)
   - Sampling strategy: {head-based / tail-based} con tasa {X}%
   - Spans importantes por servicio
```

**Formato de salida:** Guía de observabilidad completa + config de dashboards + alertas.

**Ejemplo:** `{Microservicios en Kubernetes}`, `{Prometheus + Grafana + Loki + Tempo}`, `{20+ alertas, 5 dashboards}`

---

## 14. FAQ Técnico

**[Documentación]**

```
Genera un FAQ (Frequently Asked Questions) técnico para {producto/herramienta}.

Público: {desarrolladores / administradores / usuarios avanzados}

Formato por pregunta:

## {Pregunta frecuente}

**Respuesta:**
{respuesta clara y concisa}

**Código de ejemplo (si aplica):**
```{lenguaje}
{código_de_ejemplo}
```

**Enlaces relacionados:**
- {enlace_a_docs}
- {enlace_a_issue}
- {enlace_a_tutorial}

Categorías de preguntas:
1. Instalación y configuración ({N} preguntas)
2. Uso básico ({N} preguntas)
3. Errores comunes ({N} preguntas)
4. Integraciones ({N} preguntas)
5. Performance y escalabilidad ({N} preguntas)
6. Seguridad ({N} preguntas)
7. Migración y compatibilidad ({N} preguntas)

{Las preguntas deben ser reales, basadas en issues/soportes frecuentes}
```

**Formato de salida:** FAQ organizado por categorías con enlaces cruzados.

**Ejemplo:** `{Docker CLI FAQ}`, `{preguntas: "Cómo limpiar imágenes no usadas", "Diferencia entre CMD y ENTRYPOINT", "Cómo pasar variables de entorno"}`

---

## 15. Post-Mortem / Incident Report

**[Documentación]**

```
Redacta un post-mortem para el incidente ocurrido el {fecha}.

Resumen ejecutivo:
- Duración: {X} minutos de downtime
- Impacto: {usuarios_afectados, transacciones_perdidas, revenue_impact}
- Severidad: {SEV1 / SEV2 / SEV3}
- Trigger: {deploy / cambio_config / pico_tráfico / fallo_infra}

Línea de tiempo:
| Hora (UTC) | Evento |
|------------|--------|
| {HH:MM} | {descripción_evento} |

Causa raíz:
{explicación_técnica_de_la_causa}

Resolución:
{pasos_realizados_para_resolver}

Acciones preventivas:
- [ ] {acción_1} (dueño, fecha límite)
- [ ] {acción_2} (dueño, fecha límite)
- [ ] {acción_3} (dueño, fecha límite)

Lecciones aprendidas:
- {lección_1}
- {lección_2}

Apéndices:
- Enlace a dashboards en el momento del incidente
- Enlace a logs relevantes
- Enlace a PRs de fix
```

**Formato de salida:** Post-mortem completo siguiendo formato de blameless culture.

**Ejemplo:** `{Downtime DB primaria 45 min}`, `{causa: conexiones no liberadas por bug en pool config, trigger: deploy sin review}`

---

## 16. Documentación de API WebSocket

**[Documentación]**

```
Documenta la API WebSocket de {sistema}.

Server URL: {wss://ejemplo.com/ws}
Protocolo: {JSON / MessagePack / Protobuf}

Eventos (Server -> Client):
| Evento | Payload | Descripción | Frecuencia |
|--------|---------|-------------|------------|
| `{evento_1}` | `{schema_payload}` | {descripción} | {real-time / cada X seg} |
| `{evento_2}` | `{schema_payload}` | {descripción} | {bajo_demanda} |

Comandos (Client -> Server):
| Comando | Payload | Descripción | Auth requerida |
|---------|---------|-------------|----------------|
| `{comando_1}` | `{schema_payload}` | {descripción} | {sí / no} |

Conexión:
1. Handshake: {cómo_establecer_la_conexión}
2. Autenticación: {token en query / mensaje de auth / cookie}
3. Heartbeat: ping/pong cada {X} segundos
4. Reconexión: {estrategia_de_backoff}
5. Rate limiting: {max_mensajes/segundo}

Códigos de cierre:
| Código | Razón | Descripción |
|--------|-------|-------------|
| 4001 | {razón} | {descripción} |

Ejemplos:
```javascript
// Conectar
const ws = new WebSocket('wss://ejemplo.com/ws?token={token}');

// Escuchar eventos
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.event, data.payload);
};

// Enviar comando
ws.send(JSON.stringify({ command: '{comando}', payload: { ... } }));
```
```

**Formato de salida:** Documentación de WebSocket con schemas, ejemplos y códigos de error.

**Ejemplo:** `{Real-time Chat API}`, `{eventos: message.new, user.typing, user.online}`, `{comandos: send.message, join.room, leave.room}`

---

## 17. Guía de Migración / Upgrade

**[Documentación]**

```
Crea una guía de migración de {versión_origen} a {versión_destino} para {producto}.

Producto: {nombre_producto}
De versión: {vX.Y.Z}
A versión: {vX.Y.Z}
Breaking changes: {sí / no - lista}

Secciones:

1. Resumen de cambios:
   - Nuevas funcionalidades: {lista}
   - Mejoras: {lista}
   - Bug fixes: {lista}
   - Breaking changes: {lista_con_detalle}

2. Breaking changes detallados:
   Cada cambio incluye:
   - {qué_cambió}
   - {por qué_cambió}
   - {código_antiguo} -> {código_nuevo}
   - {cómo_migrar}

3. Migración automatizada:
   - Script de migración: {comando_a_ejecutar}
   - Verificación post-migración: {qué_revisar}

4. Deprecations:
   - {funcionalidad}: será eliminada en {versión}
   - Alternativa: {nueva_funcionalidad}

5. Compatibilidad:
   - Versiones de dependencias requeridas ahora
   - Versiones anteriores ya no soportadas
   - Feature flags para rollback

6. Testing post-migración:
   - Checklist de verificación
   - Tests sugeridos de humo
```

**Formato de salida:** Guía de migración + script + checklist de verificación.

**Ejemplo:** `{Next.js 13 -> 14}`, `{breaking: Turbopack, Server Actions stable, removed: _app.jsx pageProps}`, `{código antiguo: getServerSideProps -> nuevo: Server Components}`

---

## 18. Documentación de CLI Tool

**[Documentación]**

```
Genera la documentación para la herramienta CLI {nombre_comando}.

Nombre: {nombre_comando}
Descripción: {una_línea_de_descripción}
Instalación: {comando_de_instalación}

Uso general:
```
{nombre_comando} [comando] [flags] [argumentos]
```

Comandos disponibles:
| Comando | Descripción |
|---------|-------------|
| `{comando}` | {descripción} |

Flags globales:
| Flag | Shorthand | Tipo | Default | Descripción |
|------|-----------|------|---------|-------------|
| `--{flag}` | `-{s}` | string | `{default}` | {descripción} |

Ejemplos por comando:

## {comando_1}
Propósito: {descripción}
Flags específicos:
- `--{flag}`: {descripción}
Ejemplos:
```
{nombre_comando} {comando_1} {ejemplo_argumentos}
{nombre_comando} {comando_1} {ejemplo_alternativo}
```

## {comando_2}
...

Autocompletado:
- Bash: `source <({nombre_comando} completion bash)`
- Zsh: `{nombre_comando} completion zsh > /usr/local/share/zsh/site-functions/_{nombre_comando}`
- Fish: `{nombre_comando} completion fish > ~/.config/fish/completions/{nombre_comando}.fish`

Exit codes:
| Código | Significado |
|--------|-------------|
| 0 | Éxito |
| 1 | Error genérico |
| 2 | Error de parsing de flags |
```

**Formato de salida:** Documentación CLI completa + script de autocompletado.

**Ejemplo:** `{docker}`, `{comandos: run, build, ps, exec, logs, compose}`, `{flags: --name, -d, -p, -v, --rm}`

---

## 19. Documentación de Configuración de CI/CD

**[Documentación]**

```
Documenta la configuración de CI/CD para {proyecto}.

Plataforma: {GitHub Actions / GitLab CI / Jenkins / CircleCI}

Pipeline overview:
```yaml
{archivo_de_pipeline_completo}
```

Explicación de cada stage:

1. **{stage_name}**:
   - Trigger: {push / PR / schedule / manual}
   - Jobs:
     - {job_name}: {qué_hace, por_qué, comando}
     - Dependencias: {jobs anteriores requeridos}
     - Cache: {qué se cachea, key}
   - Tiempo estimado: {X} min
   - Artefactos: {qué se produce}

2. **{stage_name}**:
   ...

Variables de entorno y secrets:
| Variable | Usada en | Cómo se setea |
|----------|----------|--------------|
| `{VAR}` | {stage/job} | {repository secret / variable group} |

Estrategia de despliegue:
- Entornos: {dev -> staging -> canary -> production}
- Approval gates: {quién_aprueba_cada_entorno}
- Rollback: {cómo_se_revierte_un_deploy}
- Feature flags: {cómo_se_manejan_en_CI/CD}

Notificaciones:
- {Slack / Email}: {qué_eventos_disparan_notificaciones}
- {Channel / recipients}
```

**Formato de salida:** Documentación del pipeline + diagrama de flujo + guía de troubleshooting.

**Ejemplo:** `{GitHub Actions para app Node.js}`, `{stages: lint -> test -> build -> docker -> deploy staging -> e2e -> deploy production}`

---

## 20. Documentación de Base de Datos / Schema

**[Documentación]**

```
Genera documentación del schema de base de datos para {proyecto}.

Motor: {PostgreSQL / MySQL / MongoDB}

Diagrama entidad-relación (Mermaid):
```mermaid
erDiagram
    {entidad_1} ||--o{ {entidad_2} : "relación"
    {entidad_1} {
        tipo nombre PK
        tipo nombre "descripción"
    }
```

Tablas:
## {nombre_tabla}
Descripción: {propósito_de_la_tabla}

| Columna | Tipo | Constraints | Default | Descripción |
|---------|------|-------------|---------|-------------|
| `id` | UUID | PK, NOT NULL | gen_random_uuid() | Identificador único |
| `{columna}` | {tipo} | {NOT NULL / UNIQUE / FK} | {default} | {descripción} |

Índices:
| Nombre | Columnas | Tipo | Propósito |
|--------|----------|------|-----------|
| `idx_{tabla}_{columna}` | `{columna}` | B-tree | {por_qué_se_creó} |

Relaciones:
| Tabla origen | Columna FK | Tabla destino | Columna | Regla delete |
|-------------|------------|---------------|---------|--------------|
| `{tabla}` | `{columna}` | `{tabla_ref}` | `id` | CASCADE / SET NULL / RESTRICT |

Particiones: {descripción_si_aplica}
Políticas de retención: {cuándo_se_archivan_o_eliminan_datos}
```

**Formato de salida:** Documentación de DB con diagramas, tablas detalladas y políticas.

**Ejemplo:** `{E-commerce}`, `{PostgreSQL}`, `{tablas: users, products, orders, order_items, payments, reviews}`

---

## 21. Quick Reference / Cheat Sheet

**[Documentación]**

```
Crea una hoja de referencia rápida (cheat sheet) para {herramienta/tecnología}.

Formato: markdown para impresión o web (2 columnas)

## {Categoría 1}
| Comando/Sintaxis | Descripción |
|-----------------|-------------|
| `{comando}` | {breve_descripción} |
| `{sintaxis}` | {explicación_rápida} |

## {Categoría 2}
...

Secciones compactas:
- {X} comandos más usados
- Flags comunes
- Shortcuts
- One-liners útiles
- Configuración común
- Troubleshooting rápido

Formato: tabla o bullets, máximo 2 niveles de profundidad.
Priorizar lo esencial: 80% de casos de uso.

Incluir:
- Atajos de teclado (IDE / CLI)
- Fragmentos de configuración
- Snippets de código frecuentes
- Enlaces a documentación completa
```

**Formato de salida:** Cheat sheet imprimible en markdown (máximo 2-3 páginas).

**Ejemplo:** `{Git Cheat Sheet}`, `{categorías: configuración, branches, commits, remotes, merging, stashing, debugging}`

---

## 22. API Changelog / Deprecation Notice

**[Documentación]**

```
Redacta un aviso de deprecación y changelog de API para {API_name}.

Versión de API: {vX}
Cambio: {deprecación / eliminación / cambio_incompatible}

## Aviso de Deprecación

**Endpoint/Funcionalidad:** {nombre_endpoint_o_funcionalidad}
**Deprecado en:** {fecha}
**Eliminación planificada para:** {fecha + X meses}
**Alternativa:** {nuevo_endpoint_o_funcionalidad}

**Motivo:**
{explicación_clara_de_por_qué_se_depreca}

**Plan de migración:**
1. {paso_1}
2. {paso_2}
3. {paso_3}

**Headers de deprecación:**
- `Sunset: {fecha}`
- `Deprecated: true`

**Ejemplo de migración:**
```bash
# Antes (deprecado)
curl -X GET https://api.ejemplo.com/{viejo_endpoint}

# Después
curl -X GET https://api.ejemplo.com/{nuevo_endpoint}
```

**Timeline:**
| Fecha | Evento |
|------|--------|
| {fecha} | Anuncio de deprecación |
| {fecha + X} | Endpoint deja de aceptar nuevos clientes |
| {fecha + Y} | Endpoint devuelve 410 Gone |
```

**Formato de salida:** Aviso de deprecación formal + timeline + guía de migración.

**Ejemplo:** `{API de pagos v2}`, `{endpoint POST /v2/charges deprecado, alternativa POST /v3/payment_intents}`, `{fecha: 2024-06-01, eliminación: 2024-12-01}`
