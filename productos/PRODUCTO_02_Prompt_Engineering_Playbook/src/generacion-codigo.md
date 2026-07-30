# Generación de Código

> 35 prompts para generar código en múltiples lenguajes y contextos.

---

## 1. Función CRUD Completa

**[Generación de Código]**

```
Escribe una función CRUD completa para {nombre_recurso} en {lenguaje} usando {framework/biblioteca}. 
Incluye: create, read, update, delete. Usa {ORM/cliente_db} para la capa de datos. 
Sigue el patrón {Repository / Service Layer}. 
Maneja errores con {try-catch / Result type} y devuelve respuestas HTTP estándar.

Requisitos adicionales:
- Validación de entrada con {biblioteca_validación}
- Paginación en el método list/read all
- Soft-delete para la operación de borrado
- Logging estructurado en cada operación
```

**Formato de salida:** Código completo con imports, firmas de función, implementación y comentarios de uso.

**Ejemplo:** `{usuario}`, `{Python}`, `{FastAPI}`, `{SQLAlchemy}`, `{pydantic}`

---

## 2. Componente React con TypeScript

**[Generación de Código]**

```
Crea un componente React en TypeScript llamado {NombreComponente} que:
- Recibe props: {lista_de_props_con_tipos}
- Maneja estado interno con {useState / useReducer}
- Efectos secundarios con {useEffect} para {descripción_del_efecto}
- Renderiza {descripción_del_JSX}
- Incluye estilos con {CSS-in-JS / Tailwind / Módulos CSS}
- Es accesible (aria attributes, roles, keyboard navigation)
- Maneja estados: loading, empty, error, success

Exporta también el tipo de las props y un default export.
```

**Formato de salida:** Archivo `.tsx` completo con imports, tipos, componente y estilos.

**Ejemplo:** `UserProfileCard`, `{ userId: string; onEdit: (id: string) => void; variant: 'compact' | 'full' }`, `{fetchUserData(userId)}`

---

## 3. API RESTful Completa

**[Generación de Código]**

```
Diseña e implementa una API RESTful para {recurso} con los siguientes endpoints:

Recurso: {nombre_recurso}
Campos: {lista_de_campos}
Operaciones: {list, get, create, update, delete, search, batch}

Tecnologías: {lenguaje} + {framework}
Base de datos: {base_datos}
Autenticación: {JWT / OAuth / API Key}

Incluye:
- Validación de schemas de request/response
- Documentación OpenAPI/Swagger
- Rate limiting
- Versionado de API (/v1/, /v2/)
- Manejo centralizado de errores
- Tests para cada endpoint

Implementa también un middleware de autenticación y otro de logging.
```

**Formato de salida:** Estructura completa de directorios, código de cada endpoint, middlewares y configuración.

**Ejemplo:** `Productos`, `{ id, name, price, category, stock, createdAt }`, `{Node.js} + {Express}`

---

## 4. Algoritmo de Búsqueda y Ordenamiento

**[Generación de Código]**

```
Implementa el algoritmo {nombre_algoritmo} en {lenguaje}.
- Parámetros de entrada: {tipo_y_estructura_datos}
- Salida esperada: {tipo_salida}
- Complejidad esperada: O({notación})

Incluye:
- Implementación limpia y comentada
- Versión iterativa y recursiva (si aplica)
- Casos edge: lista vacía, un elemento, elementos duplicados
- Pruebas unitarias con {framework_tests}
- Benchmarking básico con {time / datetime / console.time}
```

**Formato de salida:** Código de implementación + tests + script de benchmark.

**Ejemplo:** `QuickSort`, `{Python}`, `{List[int]}`, `{List[int]}`, `{n log n}`, `{pytest}`

---

## 5. Middleware de Autenticación

**[Generación de Código]**

```
Crea un middleware de autenticación para {framework} en {lenguaje} que:

1. Extrae el token de {Authorization header / Cookie / Query param}
2. Valida el token usando {JWT / OAuth / sesión}
3. Verifica: expiración, firma, issuer, audience
4. Adjunta el usuario decodificado al request (req.user)
5. Soporta roles: {admin, user, moderator}
6. Incluye rate limiting por usuario autenticado
7. Registra métricas de autenticación (intentos fallidos, tiempo de validación)
8. Devuelve errores estándar: 401 Unauthorized, 403 Forbidden

Opcional: refresh token rotation, blacklist de tokens revocados.
```

**Formato de salida:** Código del middleware completo, más un ejemplo de uso en rutas protegidas.

**Ejemplo:** `{Express}`, `{Node.js}`, `{JWT}`

---

## 6. Script de Migración de Datos

**[Generación de Código]**

```
Escribe un script en {lenguaje} para migrar datos desde {origen} a {destino}.

Origen: {tipo_db_origen / archivo / API}
Destino: {tipo_db_destino / formato_archivo}

Requisitos:
- Leer datos en batches de {tamaño_batch} registros
- Transformar: {mapeo_de_campos_y_transformaciones}
- Validar cada registro antes de insertar
- Manejo de errores: skip + log, rollback en transacción
- Reporte final: total procesados, errores, duplicados, duración
- Reanudable (resume desde el último ID procesado)
- Idempotente (no duplica registros si se re-ejecuta)
```

**Formato de salida:** Script completo listo para ejecutar, con configuración externalizada.

**Ejemplo:** `{Python}`, `{CSV}`, `{PostgreSQL}`, `{1000}`, `{mapear columnas snake_case a camelCase}`

---

## 7. Función Lambda / Serverless

**[Generación de Código]**

```
Crea una función serverless para {cloud_provider} usando {runtime} que:

Trigger: {S3 / HTTP / SQS / CloudWatch / DynamoDB Streams}
Función: {descripción_de_lo_que_hace}
Variables de entorno: {lista_de_vars}

Incluye:
- Handler principal y handlers secundarios
- Manejo de errores con Dead Letter Queue
- Structured logging (JSON)
- Tracing con {X-Ray / OpenTelemetry}
- Cold start optimization
- Tests locales con {SAM / serverless-offline / Functions Framework}
- IAM policy mínima necesaria

Además, genera el archivo de infraestructura (CloudFormation / Terraform / Serverless.yml).
```

**Formato de salida:** Código de la función + template de infraestructura + tests.

**Ejemplo:** `{AWS}`, `{Node.js 20}`, `{S3}`, `{redimensionar imágenes al subirse}`

---

## 8. Consulta SQL Compleja

**[Generación de Código]**

```
Genera una consulta SQL que resuelva el siguiente requerimiento:

{Nombre_consulta}: {descripción_del_problema_de_datos}

Tablas involucradas:
- {tabla1}: {campos_relevantes}
- {tabla2}: {campos_relevantes}
- Relación: {cómo_se_relacionan}

Requerimientos:
- {filtros_a_aplicar}
- {ordenamiento}
- {agregaciones_necesarias}
- {paginación}

Incluye también:
- Versión optimizada con índices sugeridos
- Versión con CTE para legibilidad
- Explain plan comentado
```

**Formato de salida:** SQL completo con comentarios explicativos, sugerencias de índices y análisis de rendimiento.

**Ejemplo:** `TopClientesPorMes`, `{ventas}`, `{clientes}`, `{clientes.id = ventas.cliente_id}`, `{WHERE ventas.fecha BETWEEN '2024-01-01' AND '2024-12-31'}`, `{ORDER BY total DESC}`, `{SUM(ventas.total) as total}`

---

## 9. Cliente de API con Retry y Circuit Breaker

**[Generación de Código]**

```
Implementa un cliente HTTP robusto para {API_name} en {lenguaje} que incluya:

- Patrón Circuit Breaker con estados: CLOSED, OPEN, HALF_OPEN
- Retry policy: {3} intentos con backoff exponencial (100ms, 500ms, 2s)
- Timeout configurable por operación
- Rate limiting (max {X} requests/segundo)
- Caché de respuestas GET con TTL configurable
- Logging de todas las requests/responses
- Métricas: latencia por endpoint, tasa de error, caché hits/misses
- Soporte para interceptors/hooks (antes/después de cada request)

Endpoints a implementar:
{lista_de_endpoints_con_métodos_y_firmas}

Maneja: 429 (retry), 5xx (circuit breaker), 4xx (no retry, log + error).
```

**Formato de salida:** Cliente completo con configuración, interceptors y tests de integración.

**Ejemplo:** `{Stripe API}`, `{Python}`, `{GET /v1/charges, POST /v1/charges, GET /v1/charges/:id}`

---

## 10. Generador de DTOs y Schemas

**[Generación de Código]**

```
Genera {DTOs / Schemas / Modelos} para {entidad} en {lenguaje}.

Entidad: {nombre_entidad}
Campos:
{lista_campos_con_tipo_y_validaciones}

Requisitos:
- Incluir decoradores/anotaciones de validación
- Generar métodos de serialización/deserialización ({toJSON, fromJSON})
- Documentación de cada campo
- Versión de creación vs actualización (campos opcionales en update)
- Ejemplo de uso

Usa la biblioteca estándar de {framework_serde} para el lenguaje elegido.
```

**Formato de salida:** Código de la clase/interface/schema completo con validaciones.

**Ejemplo:** `{Usuario}`, `{TypeScript}`, `{id: number, email: string (email), nombre: string (3-50 chars), rol: enum(admin, user)}`

---

## 11. Script de Web Scraping

**[Generación de Código]**

```
Crea un script de web scraping en {lenguaje} usando {biblioteca_scraping} para extraer:

URL objetivo: {url}
Datos a extraer: {lista_de_campos_con_selectores_CSS_o_XPath}
Formato de salida: {CSV / JSON / base de datos}

Incluye:
- Manejo de paginación (next page)
- Rotación de User-Agent
- Retry con backoff ante errores HTTP
- Respetar robots.txt (configurable)
- Throttling entre requests ({X} segundos de delay)
- Extracción de datos dinámicos (Selenium/Playwright si es necesario)
- Almacenamiento incremental (no re-descargar lo ya procesado)
- Logging detallado del progreso
```

**Formato de salida:** Script completo + archivo de configuración YAML/JSON con parámetros.

**Ejemplo:** `{Python}`, `{BeautifulSoup + Requests}`, `{https://ejemplo.com/productos}`, `{nombre: h2.product-title, precio: span.price, imagen: img.product-img @src}`

---

## 12. Microservicio con DDD

**[Generación de Código]**

```
Implementa un microservicio siguiendo Domain-Driven Design para el dominio {nombre_dominio}.

Tecnologías: {lenguaje} + {framework} + {base_datos}

Estructura DDD:
- Domain: Entities, Value Objects, Aggregates, Domain Events, Repository interfaces
- Application: Use Cases / Services, DTOs, Commands/Queries (CQRS)
- Infrastructure: Repository implementations, DB context, external services, message bus
- Presentation: Controllers, Middleware, Request/Response schemas

Entidad principal: {nombre_entidad}
Comportamiento: {acciones_que_realiza_la_entidad}
Eventos de dominio: {eventos_que_dispara}

Incluye test unitarios para Domain y Application, tests de integración para Infrastructure.
```

**Formato de salida:** Estructura completa del proyecto con código en cada capa.

**Ejemplo:** `{Gestión de Pedidos}`, `{C#}`, `{.NET 8}`, `{PostgreSQL}`, `{Pedido}`, `{crear, confirmar, enviar, cancelar}`, `{PedidoCreado, PedidoConfirmado, PedidoEnviado}`

---

## 13. Implementación de Patrón Observer / Event Emitter

**[Generación de Código]**

```
Implementa el patrón {Observer / Pub-Sub / Event Emitter} en {lenguaje} para:

Caso de uso: {descripción_del_sistema_de_eventos}

Requisitos:
- Tipado seguro de eventos (cada evento con su tipo de datos)
- Suscripción con filtros (solo recibir ciertos tipos/categorías)
- Suscripción única (once) y persistente (on)
- Cancelación de suscripción
- Eventos asíncronos con backpressure
- Manejo de errores en handlers (no debe romper el emitter)
- Middleware de eventos (logging, validación, transformación)
- Prioridad de handlers
- Wildcard/glob patterns para tipos de eventos

Incluye ejemplo de uso con {3} tipos de eventos diferentes.
```

**Formato de salida:** Implementación completa + ejemplo de uso.

**Ejemplo:** `{EventEmitter}`, `{TypeScript}`, `{sistema de notificaciones: usuario.registrado, pedido.pagado, email.enviado}`

---

## 14. Generador de Informes / Reportes

**[Generación de Código]**

```
Crea un generador de reportes en {lenguaje} que produzca {formato_salida} desde {fuente_datos}.

Tipo de reporte: {nombre_reporte}
Datos: {consulta_o_fuente_de_datos}
Columnas: {lista_de_columnas}
Agrupaciones: {cómo_agrupar_los_datos}
Filtros: {filtros_disponibles}

Incluye:
- Template de reporte personalizable
- Exportación a {PDF / Excel / CSV / HTML}
- Gráficos: {tipos_de_gráficos}
- Resumen ejecutivo (totales, promedios, tendencias)
- Programable (generación automática por cron)
- Distribución por email ({SMTP / SendGrid / SES})
- Caché de reportes generados previamente
```

**Formato de salida:** Código del generador + templates + ejemplo de salida.

**Ejemplo:** `{Python}`, `{PDF}`, `{SQL + Pandas}`, `{Reporte Ventas Mensuales}`, `{ventas por producto, por región, por vendedor}`

---

## 15. Script de Backup y Restauración

**[Generación de Código]**

```
Crea un script de backup para {tipo_recurso} en {lenguaje}.

Recurso: {base_datos / archivos / configuración}
Destino: {S3 / Azure Blob / Google Cloud Storage / local cifrado}
Frecuencia: {diario / semanal / horario}

Incluye:
- Backup completo + incremental
- Compresión (gzip / zstd)
- Cifrado (AES-256-GCM) con clave gestionada externamente
- Verificación de integridad (checksum SHA-256)
- Política de retención: {N} días, {M} semanales, {K} mensuales
- Notificaciones ({Slack / Email / Webhook}) al completar o fallar
- Lock file para evitar ejecución concurrente
- Log detallado de cada operación
- Script de restauración con confirmación manual
```

**Formato de salida:** Script de backup + script de restauración + documentación de uso.

**Ejemplo:** `{PostgreSQL}`, `{Bash}`, `{S3}`, `{diario}`

---

## 16. Implementación de Rate Limiter

**[Generación de Código]**

```
Implementa un rate limiter en {lenguaje} para {framework} usando {almacenamiento}.

Algoritmo: {Token Bucket / Sliding Window / Fixed Window / Leaky Bucket}
Límite: {max_requests} por {ventana_tiempo}
Almacenamiento: {Redis / Memoria / Base de datos}

Características:
- Estrategia configurable por endpoint, usuario, IP
- Headers de rate limiting estándar: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- Respuesta 429 con Retry-After header
- Backoff progresivo para infractores reincidentes
- Whitelist/blacklist de IPs o usuarios
- Métricas exportables (Prometheus)
- Atomic checks con Lua scripting (Redis) o transacciones

Incluye middleware listo para integrar en {Express / Django / FastAPI / Spring}.
```

**Formato de salida:** Implementación del algoritmo + middleware + tests.

**Ejemplo:** `{TypeScript}`, `{Express}`, `{Redis}`, `{Sliding Window}`, `{100}`, `{60 segundos}`

---

## 17. Función de Procesamiento de Archivos

**[Generación de Código]**

```
Escribe una función en {lenguaje} que procese archivos {tipo_archivo}.

Operación: {descripción_del_procesamiento}
Entrada: {ruta_o_stream_de_archivo}
Salida: {formato_salida}

Requisitos:
- Procesamiento en streaming (no cargar todo en memoria)
- Soporte para archivos grandes (>1GB)
- Validación de formato y cabeceras mágicas
- Detección de encoding (UTF-8, Latin-1, etc.)
- Manejo de errores: archivos corruptos, formato incorrecto, permisos
- Conversión de tipos y encoding
- Generación de archivo de errores con líneas problemáticas
- Barra de progreso para archivos grandes
```

**Formato de salida:** Función completa + script de línea de comandos.

**Ejemplo:** `{Python}`, `{CSV}`, `{limpiar y normalizar datos}`, `{archivo_normalizado.csv}`

---

## 18. WebSocket Server / Cliente

**[Generación de Código]**

```
Implementa un servidor WebSocket en {lenguaje} usando {biblioteca_websocket}.

Funcionalidad:
- Conexión persistente con heartbeat (ping/pong cada {X} segundos)
- Canales / rooms para broadcasting selectivo
- Autenticación durante el handshake (token en query param o header)
- Reconnection automática del cliente con backoff
- Serialización de mensajes (JSON / MessagePack / Protocol Buffers)
- Manejo de {X} conexiones concurrentes
- Rate limiting por conexión
- Logging de conexiones, desconexiones y errores
- Escalabilidad horizontal con {Redis Pub/Sub / RabbitMQ}

Eventos a implementar: {lista_de_eventos_del_dominio}
```

**Formato de salida:** Servidor + cliente de ejemplo + tests de conexión.

**Ejemplo:** `{Node.js}`, `{ws / Socket.IO}`, `{notificaciones en tiempo real, chat, dashboard actualizado}`

---

## 19. Script de Migración de Framework

**[Generación de Código]**

```
Genera un script de migración automática de {framework_origen} a {framework_destino}.

Contexto: {descripción_del_proyecto}
Cambios principales:
{lista_de_cambios_estructurales}

El script debe:
- Analizar el código fuente actual
- Generar código equivalente en el nuevo framework
- Preservar la lógica de negocio
- Identificar patrones que no tienen equivalente directo
- Reportar cambios manuales necesarios
- Mantener la estructura de archivos
- Convertir imports y dependencias
- Adaptar la configuración (webpack -> vite, etc.)
- Verificar que el código resultante compila/sin errores sintácticos
```

**Formato de salida:** Script de migración + reporte de cambios + guía de migración manual.

**Ejemplo:** `{React Class Components}`, `{React Hooks + TypeScript}`, `{proyecto dashboard con 50 componentes}`

---

## 20. API Gateway / Proxy Inverso

**[Generación de Código]**

```
Implementa un API Gateway en {lenguaje} con las siguientes funcionalidades:

Rutas a gestionar:
{tabla_de_rutas_con_origen_y_destino}

Características:
- Enrutamiento basado en path, method, headers
- Agregación de respuestas (parallel fetch y combinación)
- Rate limiting global y por servicio
- Autenticación y autorización centralizada
- Caché de respuestas GET en {Redis / Memcached}
- Timeouts y circuit breakers por servicio upstream
- Transformación de request/response (headers, body)
- Logging centralizado y tracing distribuido
- Dashboard de métricas en tiempo real
```

**Formato de salida:** Gateway completo + configuración YAML de rutas + tests.

**Ejemplo:** `{Node.js}`, `{Fastify}`, `{/users -> user-service:3001, /orders -> order-service:3002, /products -> product-service:3003}`

---

## 21. Implementación de Cache Layer

**[Generación de Código]**

```
Implementa una capa de caché para {aplicación} en {lenguaje}.

Almacenamiento: {Redis / Memcached / In-Memory / Hybrid}
Estrategia: {Cache-Aside / Read-Through / Write-Through / Write-Behind}

Requisitos:
- TTL configurable por entidad/tipo de dato
- Invalidación por patrón de clave (ej: user:*)
- Cache warming al iniciar la aplicación
- Fallback automático a origen de datos si caché falla
- Prevención de cache stampede (Mutex / probabilística)
- Serialización eficiente ({JSON / MessagePack / Protobuf})
- Métricas: hit ratio, latencia, tamaño, expiraciones
- Soporte para caché anidada (L1 en memoria + L2 en Redis)
- Key sanitization y namespacing
```

**Formato de salida:** Implementación completa + tests de integración + benchmarks.

**Ejemplo:** `{Python}`, `{Django}`, `{Redis}`, `{Cache-Aside}`, `{caché de perfiles de usuario y catálogo de productos}`

---

## 22. Comando CLI Interactivo

**[Generación de Código]**

```
Crea una herramienta CLI en {lenguaje} que realice {descripción_funcionalidad}.

Nombre del comando: {nombre_comando}
Subcomandos:
{lista_de_subcomandos_con_descripción}

Características:
- CLI interactiva con autocompletado y sugerencias
- Argumentos y flags con validación
- Colores y formato en terminal (tablas, progreso, spinners)
- Salida en {JSON / YAML / tabla / texto plano} configurable
- Config file en {~/.config/app/config.yaml}
- Manejo de CTRL+C graceful
- Logging verboso con --verbose, --quiet, --json-logs
- Completado de shell (bash, zsh, fish)
- Tests de integración con {pytest con Click / Clap tests}
```

**Formato de salida:** CLI completa + documentación de comandos + script de instalación.

**Ejemplo:** `{Rust}`, `{gestión de proyectos: init, build, deploy, logs, status}`, `{clap}`

---

## 23. ETL Pipeline

**[Generación de Código]**

```
Diseña e implementa un pipeline ETL para {fuente_datos}.

Etapa Extract:
- Fuente: {tipo_fuente}
- Conexión: {detalles_conexión}
- Extracción incremental: {timestamp / CDC / log-based}
- Batch size: {cantidad} registros

Etapa Transform:
- Limpieza: {reglas_limpieza}
- Normalización: {reglas_normalización}
- Enriquecimiento: {fuentes_externas_para_enriquecer}
- Validación: {reglas_validación}

Etapa Load:
- Destino: {tipo_destino}
- Estrategia: {append / upsert / full-refresh}
- Particionamiento: {criterio_partición}
- Indexación post-carga

Incluye orquestación con {Airflow / Prefect / Dagster / cron}.
```

**Formato de salida:** Pipeline completo + DAG de orquestación + tests de cada etapa.

**Ejemplo:** `{API de Stripe}`, `{Python}`, `{BigQuery}`, `{Airflow}`, `{facturas, clientes, suscripciones}`

---

## 24. Batch Processor con Paralelismo

**[Generación de Código]**

```
Implementa un procesador batch en {lenguaje} que procese {tipo_items}.

Entrada: {lista_de_items_desde_archivo_o_db}
Operación: {descripción_del_procesamiento_por_item}
Concurrencia: {X} workers en paralelo

Requisitos:
- Pool de workers con límite de concurrencia configurable
- Cola de trabajos con prioridad
- Dead letter queue para items fallidos tras {N} intentos
- Rate limiting (global y por tipo de operación)
- Progreso persistente (resume tras interrupción)
- Reporte de resultados (éxitos, fallos, tiempo por item)
- Throttling inteligente basado en tasas de error
- Graceful shutdown (completar items en curso)
- Monitoreo en tiempo real con dashboard web opcional
```

**Formato de salida:** Procesador completo + configuración + tests de carga.

**Ejemplo:** `{Python}`, `{imágenes para redimensionar}`, `{aplicar watermark y convertir a WebP}`, `{4}`

---

## 25. Implementación de Feature Flags

**[Generación de Código]**

```
Implementa un sistema de feature flags en {lenguaje} para {aplicación}.

Requisitos:
- Tipos de flags: boolean, porcentual, segmento de usuarios, A/B test
- Almacenamiento: {base_datos / archivo_config / SaaS tipo LaunchDarkly}
- Evaluación server-side con caché de baja latencia
- SDK cliente para JavaScript (si aplica)
- Dashboard de administración:
  - Crear/editar/eliminar flags
  - Targeting por: usuario, plan, región, dispositivo
  - Programación temporal de activación
  - Gradual rollout con incremento automático
- Contexto de evaluación: usuario, request, entorno
- Logging de todas las evaluaciones para análisis
- Integración con sistema de monitoreo
- Fallback: si el servicio de flags no responde, usar valores por defecto
```

**Formato de salida:** Sistema completo + dashboard web + SDK cliente + documentación.

**Ejemplo:** `{Go}`, `{API REST con dashboard React}`, `{PostgreSQL}`, `{nuevo checkout, dark mode, recomendaciones IA}`

---

## 26. Task Queue / Job Scheduler

**[Generación de Código]**

```
Implementa un sistema de cola de tareas en {lenguaje} usando {broker}.

Backend: {Redis / RabbitMQ / SQS / Kafka}
Tareas:
{lista_de_tareas_con_firma_y_descripción}

Características:
- Tareas asíncronas con prioridad
- Programación futura (cron / delay)
- Reintentos automáticos con backoff ({3} intentos)
- Encadenamiento de tareas (task A -> task B -> task C)
- Dead letter queue para tareas fallidas
- Rate limiting de ejecución
- Workers dinámicos (auto-scalado según carga)
- Dashboard de monitoreo (colas, workers, tareas fallidas)
- Health checks y heartbeat de workers
- Graceful shutdown (SIGTERM -> completar tarea actual)
```

**Formato de salida:** Worker + cliente de encolamiento + dashboard + tests.

**Ejemplo:** `{Python}`, `{Celery + Redis}`, `{enviar_email, procesar_pago, generar_reporte, redimensionar_imagen}`

---

## 27. Script de Sincronización Bidireccional

**[Generación de Código]**

```
Crea un script de sincronización bidireccional entre {sistema_origen} y {sistema_destino}.

Estrategia: {timestamp-based / hash-based / version-vector / CRDT}
Dirección: {bidireccional / origen->destino}

Elementos a sincronizar: {lista_de_entidades}

Requisitos:
- Detección de conflictos (ambos lados modificados)
- Resolución de conflictos: configurable (last-writer-wins, manual, merge)
- Sincronización incremental (solo cambios desde última sync)
- Lock distribuido para evitar syncs concurrentes
- Batched processing ({N} items por lote)
- Reporte detallado: items creados, actualizados, conflictos, errores
- Dry-run mode para simular antes de aplicar
- Monitoreo de divergencia entre sistemas
- Webhook de notificación al completar
```

**Formato de salida:** Script de sincronización + configuración + guía de operación.

**Ejemplo:** `{PostgreSQL}`, `{MongoDB}`, `{usuarios, productos, pedidos, inventario}`

---

## 28. Función de Validación y Sanitización

**[Generación de Código]**

```
Crea un validador/sanitizador de datos en {lenguaje} para {tipo_entrada}.

Fuente de datos: {formulario web / API request / archivo importado}
Campos a validar:
{tabla_campos_tipos_reglas}

Reglas de validación:
{lista_de_reglas: email válido, rango numérico, longitud string, formato fecha, etc.}

Reglas de sanitización:
{lista_de_sanitización: trim, escape HTML, normalizar Unicode, eliminar nulos, etc.}

Incluye:
- Validación síncrona y asíncrona (DB lookups)
- Mensajes de error en {idioma}
- Internacionalización de errores
- Composición de validadores (AND, OR, NOT)
- Validación cross-field (ej: fecha_inicio < fecha_fin)
- Cache de resultados de validación costosa
- Tests para cada regla
```

**Formato de salida:** Módulo de validación completo + tests + documentación de reglas.

**Ejemplo:** `{PHP}`, `{Laravel}`, `{formulario de registro: nombre, email, password, fecha_nacimiento, país}`

---

## 29. Code Generator (Scaffolding)

**[Generación de Código]**

```
Crea un generador de código que produzca la estructura base para {tipo_proyecto}.

Tipo: {API REST / CLI / Paquete / Microservicio / Aplicación Web}
Tecnologías: {lista_de_tecnologías}
Convenciones: {estándares_del_equipo}

El generador debe crear:
- Estructura de directorios
- Archivos de configuración ({package.json, tsconfig, Dockerfile, etc.})
- Código base con ejemplos funcionales
- Tests esqueleto
- Documentación inicial
- Scripts de utilidad (dev, build, test, lint)
- CI/CD pipeline (.github/workflows / .gitlab-ci.yml)
- gitignore, editorconfig, .env.example

Usa templates con variables para personalización.
```

**Formato de salida:** CLI generador + templates + proyecto de ejemplo generado.

**Ejemplo:** `{Microservicio}`, `{FastAPI + SQLAlchemy + Redis + Docker}`, `{PEP8, Conventional Commits}`

---

## 30. Implementación de Algoritmo de Compresión

**[Generación de Código]**

```
Implementa el algoritmo de compresión {nombre_algoritmo} en {lenguaje}.

Entrada: {tipo_datos_entrada}
Salida: {tipo_datos_comprimidos}
Relación compresión esperada: {ratio_aproximado}

Incluye:
- Implementación limpia con explicación paso a paso
- Versión comprimir (encode) y descomprimir (decode)
- Verificación round-trip (comprimir + descomprimir = original)
- Comparación de rendimiento vs otros algoritmos
- Versión optimizada para velocidad (vs) versión para ratio
- Pruebas con datos: texto, binario, repetitivo, aleatorio
- Análisis de complejidad espacial y temporal
- Visualización del proceso (opcional)
```

**Formato de salida:** Implementación + tests + benchmark comparativo.

**Ejemplo:** `{Huffman Coding}`, `{Python}`, `{string}`, `{binary string}`, `{40-60% para texto}`

---

## 31. Script de Búsqueda Full-Text

**[Generación de Código]**

```
Implementa un sistema de búsqueda full-text para {tipo_contenido} en {lenguaje}.

Motor: {Elasticsearch / Meilisearch / Typesense / PostgreSQL FTS / SQLite FTS5}
Documentos: {descripción_de_los_documentos_a_indexar}

Funcionalidades:
- Indexación de documentos con mapping automático
- Búsqueda: relevancia, filtros, facets, highlighting
- Corrección ortográfica (did you mean: ...)
- Búsqueda por sinónimos configurados en diccionario
- Búsqueda en múltiples campos con boosting (título^3, contenido^1)
- Paginación y ordenamiento por relevancia o campo
- Autocomplete / search-as-you-type (mínimo 3 caracteres)
- Stemming y stop words para {idioma}
- Weighted ranking personalizado
- Re-indexación incremental

Incluye script de inicialización, indexación y consulta.
```

**Formato de salida:** Scripts de indexación y búsqueda + configuración del motor + ejemplos de consultas.

**Ejemplo:** `{artículos de blog}`, `{Node.js}`, `{Meilisearch}`

---

## 32. Conversor de Formatos

**[Generación de Código]**

```
Crea un conversor de {formato_origen} a {formato_destino} en {lenguaje}.

Entrada: formato {origen} con {características_del_formato}
Salida: formato {destino} con {características_del_destino}

Requisitos:
- Preservar toda la información posible
- Manejar casos edge: datos anidados, arrays, null, tipos mixtos
- Opciones de configuración: pretty-print, encoding, schema mapping
- Validación de la entrada antes de convertir
- Transformaciones: rename keys, filter fields, default values, type casting
- Batch conversion de múltiples archivos
- Detección automática del formato de entrada (magic bytes / extensión)
- Verificación de integridad post-conversión
```

**Formato de salida:** Conversor completo + tests + ejemplos de uso.

**Ejemplo:** `{XML}`, `{JSON}`, `{Python}`, `{facturas XML a estructura JSON optimizada para almacenamiento}`

---

## 33. Función de Análisis de Logs

**[Generación de Código]**

```
Escribe un analizador de logs en {lenguaje} para {tipo_app}.

Formato de log: {JSON / plain text / structured logging}
Fuente: {archivo local / stdin / S3 / syslog}
Patrones a detectar:
{lista_de_patrones_con_su_categoría}

Funcionalidades:
- Parseo de timestamps y niveles (INFO, WARN, ERROR, FATAL)
- Filtrado por: nivel, rango de fechas, usuario, request ID, módulo
- Agregaciones: conteo por nivel, top errores, tendencias temporales
- Detección de anomalías: picos de errores, patrones lentos
- Correlación de eventos (trace/span ID)
- Salida: {tabla en terminal, JSON, HTML report}
- Watch mode (tail -f) con filtros en vivo
- Exportación a formato de análisis
- Alertas configurables: umbral de errores, palabras clave
```

**Formato de salida:** CLI tool completa + ejemplos de uso + tests.

**Ejemplo:** `{Python}`, `{aplicación web}`, `{NGINX access + application/json logs combinados}`, `{errores 5xx, lentitud >5s, login fallidos}`

---

## 34. Implementación de Filtro de Contenido

**[Generación de Código]**

```
Implementa un sistema de filtrado y moderación de contenido en {lenguaje} para {tipo_contenido}.

Técnicas:
- Palabras clave y regex (blacklist/whitelist)
- Análisis de sentimiento básico
- Detección de spam con {algoritmo_bayesiano / ML}
- Normalización de texto (leetspeak -> texto plano)
- Hashing de contenido duplicado
- Límites de frecuencia por usuario

Reglas de moderación:
{lista_de_reglas_con_acción: reject, flag_for_review, approve}

Incluye:
- Pipeline de procesamiento (múltiples filtros en cadena)
- Cache de resultados (content hash -> decisión)
- Modo estricto / relajado configurable
- Dashboard de revisión de contenido flagged
- Reportes periódicos de actividad de moderación
- API de feedback (corrección de falsos positivos/negativos)
- Thresholds configurables por tipo de regla
- Performance: procesar {X} items/segundo en tiempo real
```

**Formato de salida:** Módulo de filtrado + API + dashboard + tests.

**Ejemplo:** `{Node.js}`, `{comentarios de usuarios}`, `{Node.js} | {TypeScript}`, `{lenguaje ofensivo: reject, enlaces externos: flag, contenido duplicado: reject}`

---

## 35. Script de Automatización de Infraestructura

**[Generación de Código]**

```
Crea un script de automatización en {lenguaje} usando {herramienta_iaC} para provisionar:

Recursos:
{lista_de_recursos_infra}

Entorno: {desarrollo / staging / producción}
Cloud: {AWS / Azure / GCP / On-premise}

El script debe:
- Crear/actualizar recursos de forma idempotente
- Tags de recursos: {project, environment, managed_by, owner}
- Outputs útiles (URLs, IPs, connection strings)
- Manejo de secrets con {AWS Secrets Manager / Vault / env vars}
- Network security: VPC, subnets, security groups, ACLs
- Backup automático de recursos críticos
- Health checks post-provisionamiento
- Rollback automático en caso de error
- Cost estimation antes de aplicar
- State management remoto
- Tests de infraestructura (kitchen-terraform / terratest)
```

**Formato de salida:** Script de IaC + variables de configuración + documentación de despliegue.

**Ejemplo:** `{Python}`, `{Terraform}`, `{ECS cluster, RDS PostgreSQL, ElastiCache Redis, ALB, Route53}`, `{AWS}`
