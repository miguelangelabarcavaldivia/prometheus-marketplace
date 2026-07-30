# Debugging

> 28 prompts para análisis de errores, debugging y resolución de problemas.

---

## 1. Análisis de Stack Trace

**[Debugging]**

```
Analiza el siguiente stack trace y determina la causa raíz del error:

Stack trace:
```
{stack_trace_completo}
```

Contexto:
- Lenguaje: {lenguaje}
- Framework: {framework}
- Entorno: {desarrollo / staging / producción}
- Últimos cambios: {descripción_de_cambios_recientes}
- Frecuencia: {primera_vez / intermitente / siempre_ocurre}
- Input que lo dispara: {datos_de_entrada}

Proporciona:
1. Línea exacta donde ocurre el error
2. Causa raíz con explicación clara
3. Por qué ocurre en este contexto específico
4. Posible solución con código de ejemplo
5. Cómo prevenir errores similares en el futuro
6. Tests para reproducir y verificar la solución
```

**Formato de salida:** Análisis estructurado: Causa Raíz -> Impacto -> Solución propuesta -> Prevención -> Test de regresión.

**Ejemplo:** Stack trace de `NullReferenceException` en `UserService.GetProfile()` de una app .NET 8.

---

## 2. Depuración de Memory Leak

**[Debugging]**

```
Ayúdame a diagnosticar un memory leak en {aplicación}.

Tecnologías: {lenguaje} + {framework}
Síntomas:
- Uso de memoria crece linealmente con el tiempo: {datos_uso_memoria}
- GC/heap analysis: {heap_dump_snapshot}
- La memoria no se libera después de {operación_que_debería_liberar}
- Con {X} requests/segundo, la memoria crece {Y} MB/minuto

Componentes sospechosos:
{lista_de_componentes_con_posible_retención}

Código relevante:
{código_de_las_áreas_sospechosas}

Proporciona:
1. Identificación del patrón de leak (singleton mal usado, event listeners no liberados, closures, caché sin límite, conexiones no cerradas)
2. Herramientas para confirmar ({Valgrind / Chrome DevTools / YourKit / windbg})
3. Código corregido
4. Estrategia de prevención (weak references, pool pattern, disposer pattern)
5. Monitoreo post-fix para verificar resolución
```

**Formato de salida:** Diagnóstico estructurado + código corregido + plan de monitoreo.

**Ejemplo:** `{API REST Node.js}, {Express}`, memoria crece 50MB/hora, heap dump muestra `Socket` objects no liberados.

---

## 3. Debugging de Race Condition

**[Debugging]**

```
Analiza y resuelve una race condition en {aplicación}.

Contexto:
- Código concurrente/paralelo: {descripción_del_código}
- Síntoma: {comportamiento_inconsistente}
- Frecuencia: {ocurre_1_de_cada_X_ejecuciones}
- Fragmento de código:

```{lenguaje}
{código_con_race_condition}
```

Entorno: {número_de_hilos/workers, CPU, sistema_operativo}

Proporciona:
1. Explicación de cómo ocurre la race condition (interleaving específico)
2. Escenario temporal (thread A vs thread B, línea por línea)
3. Múltiples soluciones con sus trade-offs:
   a. {Lock / Mutex / Semaphore}
   b. {Estructuras atómicas / CAS}
   c. {Inmutabilidad / copia local}
   d. {Actor model / canales / STM}
4. Código corregido para cada solución
5. Tests que reproduzcan consistentemente (stress test con N iteraciones)
6. Cómo detectar race conditions automáticamente ({ThreadSanitizer / data race detector})
```

**Formato de salida:** Análisis de interleaving + soluciones comparadas + tests de stress.

**Ejemplo:** Dos workers actualizando `saldo` en `CuentaBancaria` sin sincronización, saldo inconsistente tras concurrencia.

---

## 4. Depuración de Error de Rendimiento

**[Debugging]**

```
Analiza un problema de rendimiento en {aplicación}.

Métrica afectada: {latencia / throughput / CPU / memoria / I/O}
Valor actual: {valor_actual} vs esperado: {valor_esperado}
Percentil afectado: {p50 / p95 / p99}
Endpoint/operación: {nombre_operación}

Datos recolectados:
- Profiling CPU: {flamegraph_o_datos}
- Tracing de base de datos: {slow_queries}
- Logs de latencia: {datos_logs}
- Recurso bottleneck: {identificado / no identificado}
- Carga actual: {requests_por_segundo}

Código del área problemática:
{código_relevante}

Proporciona:
1. Árbol de llamadas con tiempos (call tree)
2. Identificación del bottleneck exacto
3. Análisis de complejidad algorítmica vs real
4. Optimizaciones ordenadas por impacto esperado
5. Código optimizado para cada mejora
6. Pruebas de carga post-optimización
7. Monitoreo recomendado para detectar regresiones
```

**Formato de salida:** Análisis de performance + árbol de llamadas + optimizaciones priorizadas + benchmarks.

**Ejemplo:** `{GET /api/products}`, latencia p95: 3.2s -> esperado: <500ms, bottleneck en consulta SQL sin índice.

---

## 5. Análisis de Logs de Producción

**[Debugging]**

```
Analiza los siguientes logs de producción para identificar anomalías y causas raíz.

Período: {fecha_hora_inicio} a {fecha_hora_fin}
Volumen: {X} líneas de log
Nivel mínimo: {WARN / ERROR / FATAL}

Logs:
```
{logs_de_producción}
```

Contexto:
- Servicio/Aplicación: {nombre_servicio}
- Release/Deploy reciente: {sí / no - versión}
- Cambios en infraestructura: {sí / no - descripción}
- Patrones observados: {picos en ciertos horarios, ciertos usuarios, ciertos endpoints}

Proporciona:
1. Resumen ejecutivo del análisis
2. Línea de tiempo de eventos significativos
3. Correlación entre eventos (si el error X coincide con alta carga en Y)
4. Top 5 errores más frecuentes con conteo
5. Posible causa raíz de cada patrón anómalo
6. Acciones recomendadas ordenadas por urgencia
7. Dashboard/monitoreo sugerido para detección temprana
```

**Formato de salida:** Reporte de análisis + timeline + priorización de acciones.

**Ejemplo:** Logs de 24h de `api-gateway` con picos de 503 entre 14:00-15:00, correlacionados con deploy de `user-service` v2.1.3.

---

## 6. Debugging de Problema de Red

**[Debugging]**

```
Depura un problema de conectividad de red en {entorno}.

Síntoma: {descripción_del_problema_de_red}
Componentes involucrados:
- Cliente: {tipo_cliente, IP, puerto}
- Servidor: {tipo_servidor, IP, puerto}
- Middleboxes: {load balancer, proxy, firewall, CDN}
- Protocolo: {HTTP / TCP / WebSocket / gRPC}

Evidencia recolectada:
```
{tcpdump_output / tshark / netstat / curl -v / traceroute}
```

Configuración relevante:
{configuración_de_red_y_aplicación}

Proporciona:
1. Árbol de diagnóstico paso a paso
2. Capa del problema identificada (DNS / TCP / TLS / HTTP / aplicación)
3. Comandos exactos para verificar cada hipótesis
4. Causa raíz con explicación de los síntomas observados
5. Solución con pasos de implementación
6. Tests de verificación post-fix
7. Monitoreo para prevenir recurrencia
```

**Formato de salida:** Diagnóstico por capas + comandos de verificación + solución + verificación.

**Ejemplo:** Timeout intermitente en conexiones a API externa, `curl -v` muestra `TCP_NODELAY` no configurado y handshake TLS lento.

---

## 7. Depuración de Error de Compilación

**[Debugging]**

```
Resuelve el siguiente error de compilación:

Error:
```
{error_de_compilación_completo}
```

Código relacionado:
```{lenguaje}
{código_que_genera_el_error}
```

Contexto:
- Lenguaje/versión: {lenguaje} {versión}
- Compilador/transpilador: {compilador} {versión}
- Dependencias relevantes: {lista_dependencias}
- Cambios recientes: {descripción_de_cambios}
- ¿Compilaba antes?: {sí / no}
- Plataforma: {OS, arquitectura}

Proporciona:
1. Significado del error en términos simples
2. Línea y columna exacta del error
3. Causa raíz del problema de tipado/sintaxis/dependencia
4. Solución con código corregido
5. Explicación de por qué el compilador rechaza el código
6. Cómo evitar este error en el futuro (linter rules, type assertions, etc.)
```

**Formato de salida:** Diagnóstico del error + código corregido + reglas de prevención.

**Ejemplo:** `TS2322: Type 'string | undefined' is not assignable to type 'string'` en TypeScript 5.4.

---

## 8. Debugging de Error en Producción sin Stack Trace

**[Debugging]**

```
Depura un error en producción del cual solo tenemos síntomas observables (sin stack trace).

Síntomas:
- {descripción_del_comportamiento_observado}
- {código_de_error_HTTP / mensaje_genérico}
- Estado del sistema: {funcionalidades_afectadas}
- Impacto: {usuarios_afectados, transacciones_perdidas}

Lo que sabemos:
- Ocurre desde: {timestamp}
- Último deploy: {versión_y_hora}
- Usuarios afectados: {todos / subconjunto / rol_específico}
- Condiciones: {navegador, dispositivo, región, hora_día}
- Se puede reproducir?: {sí / no / a_veces}

Datos disponibles:
- Logs de aplicación (nivel {WARN/ERROR})
- Métricas de infraestructura ({CPU/memoria/disk/network})
- Tracing distribuido (si disponible): {trace_ids}
- Screenshots/descripción usuario: {descripción}

Proporciona:
1. Hipótesis priorizadas (más probable primero)
2. Para cada hipótesis: qué datos la confirmarían o descartarían
3. Pasos de diagnóstico inmediatos (sin downtime)
4. Acciones de mitigación (rollback, feature flag, hotfix)
5. Instrumentación adicional para identificar la causa
6. Plan de resolución definitiva
```

**Formato de salida:** Diagnóstico basado en hipótesis + plan de mitigación + instrumentación.

**Ejemplo:** Usuarios reportan pantalla blanca en `/checkout` después de deploy v3.1.0, solo en Chrome mobile, sin errores en logs.

---

## 9. Análisis de Regresión

**[Debugging]**

```
Ayuda a identificar la causa de una regresión en {funcionalidad}.

Funcionalidad afectada: {descripción_funcionalidad}
Comportamiento esperado: {cómo_debería_funcionar}
Comportamiento actual: {cómo_funciona_ahora}
Dejó de funcionar en: {versión / fecha / commit}

Cambios entre la versión funcional y la rota:
- Commits: {lista_commits_en_el_rango}
- Archivos modificados: {archivos_cambiados}
- Dependencias actualizadas: {cambios_dependencias}
- Configuración modificada: {cambios_config}

Tests existentes:
- Tests que cubren esta funcionalidad: {sí / no}
- Tests pasan: {sí / no / no_ejecutados}
- Cobertura de código en el área: {X}%

Proporciona:
1. Análisis de cada commit sospechoso
2. Hipótesis de qué cambio causó la regresión
3. Test mínimo que reproduce el problema
4. Fix con código corregido
5. Test de regresión para prevenir recurrencia
6. Mejoras sugeridas en el proceso (code review, CI checks, feature flags)
```

**Formato de salida:** Análisis de cambios + test de reproducción + fix + test de regresión.

**Ejemplo:** `GET /api/users/:id/profile` devuelve 404 desde v2.5.0, commit `abc123` cambió la ruta de `/profile` a `/profiles`.

---

## 10. Debugging de Deadlock

**[Debugging]**

```
Analiza y resuelve un deadlock en {aplicación}.

Síntomas: {aplicación_detenida / sin_respuesta / timeout / workers_bloqueados}
Tecnología: {lenguaje} + {concurrencia: threads / async / procesos}

Evidencia:
- Thread dumps / stack traces de hilos bloqueados:
```
{thread_dump}
```
- Recursos involucrados: {locks, conexiones, semáforos}
- Orden de adquisición conocido: {orden_actual_de_locks}

Código sospechoso:
```{lenguaje}
{código_con_posible_deadlock}
```

Proporciona:
1. Análisis de la dependencia circular entre recursos (grafo de espera)
2. Hilos/recursos exactos involucrados en el deadlock
3. Estrategias de resolución:
   a. Lock ordering (orden consistente)
   b. Lock hierarchy (niveles de lock)
   c. Timeout en adquisición de locks
   d. Lock-free structures
4. Código corregido para cada estrategia
5. Detección programática de deadlocks (health check + watchdogs)
6. Stress test que reproduzca el deadlock consistentemente
```

**Formato de salida:** Grafo de espera + soluciones comparadas + tests de detección.

**Ejemplo:** Hilo A lockea `tabla_usuarios` -> espera `tabla_pedidos`, Hilo B lockea `tabla_pedidos` -> espera `tabla_usuarios`.

---

## 11. Debugging de Problema de Serialización/Deserialización

**[Debugging]**

```
Resuelve un problema de serialización/deserialización en {aplicación}.

Tecnología: {JSON / XML / Protobuf / Avro / MessagePack}
Librería: {biblioteca_de_serialización}
Lenguaje: {lenguaje}

Error:
```
{error_exacto}
```

Estructura de datos:
```{lenguaje}
{definición_de_la_clase_o_schema}
```

Datos que causan el error:
```{formato}
{datos_de_entrada_o_salida}
```

Proporciona:
1. Causa del error (tipo incorrecto, campo faltante, circular reference, polymorphic type, version mismatch)
2. Solución con configuración correcta (custom serializer, type adapter, ignore unknown fields)
3. Código corregido
4. Tests que cubran casos edge (null, empty, nested, cyclic)
5. Forward/backward compatibility strategy
6. Validación de schema antes de serializar/deserializar
```

**Formato de salida:** Diagnóstico + solución + tests de compatibilidad.

**Ejemplo:** `Jackson` en Java lanza `JsonMappingException` por referencia circular `User -> List<Order> -> User`.

---

## 12. Depuración de Integración con API Externa

**[Debugging]**

```
Depura una integración fallida con {API_externa}.

API: {nombre_API} {versión}
Endpoint: {método} {url}
Nuestro stack: {lenguaje} + {framework/cliente_http}

Request que enviamos:
```{formato}
{request_completo}
```

Response que recibimos:
```
{response_completo}
```

Documentación de la API (lo que debería funcionar):
{enlace_o_fragmento_de_docs}

Código de la integración:
```{lenguaje}
{código_de_la_llamada}
```

Proporciona:
1. Diferencia entre lo que enviamos y lo que la API espera
2. Causa raíz (formato incorrecto, header faltante, auth mal formada, campo obligatorio faltante)
3. Request corregido que debería funcionar
4. Código corregido con manejo de errores
5. Tests de integración con mock del provider
6. Estrategia de graceful degradation si la API externa falla
```

**Formato de salida:** Análisis de request/response + código corregido + tests con mocks.

**Ejemplo:** Stripe API devuelve `400 - amount must be a positive integer`, enviamos `amount: "1000"` en vez de `amount: 1000`.

---

## 13. Debugging de Problema de Autenticación

**[Debugging]**

```
Depura un problema de autenticación/autorización.

Síntoma: {usuario_recibe_401/403 / sesión_expira / token_inválido}
Tipo: {JWT / OAuth / SAML / Sesión / API Key}
Stack: {lenguaje} + {framework} + {proveedor_auth}

Token/credencial (sanitized):
```
{token_o_credencial}
```

Configuración:
```{formato}
{config_auth}
```

Código de verificación:
```{lenguaje}
{código_de_validación_de_auth}
```

Logs relevantes:
```
{logs_de_autenticación}
```

Proporciona:
1. Validación manual del token (header.payload.signature) y qué parte falla
2. Causa raíz: firma inválida / expirado / issuer incorrecto / rol insuficiente
3. Configuración corregida
4. Código de validación corregido
5. Tests de autenticación (token válido, expirado, malformed, sin permisos)
6. Monitoreo recomendado (intentos fallidos, latencia de verificación, refresh rate)
```

**Formato de salida:** Decodificación y validación del token + configuración corregida + tests.

**Ejemplo:** JWT válido pero firma no coincide por secret diferente entre auth server y API gateway.

---

## 14. Análisis de Error Intermitente / Heisenbug

**[Debugging]**

```
Analiza un error intermitente (Heisenbug) que no podemos reproducir consistentemente.

Error: {descripción_del_error}
Frecuencia: {cada_cuánto_ocurre}
Condiciones: {parece_aleatorio / bajo_carga / ciertos_datos / cierto_entorno}
Entorno donde ocurre: {producción / staging / solo_dev}
Entorno donde NO ocurre: {entornos_donde_no_pasa}

Lo que hemos intentado:
{lista_de_intentos_de_reproducción_y_resultados}

Código sospechoso:
```{lenguaje}
{código}
```

Proporciona:
1. Categorización del tipo de Heisenbug (race condition, undefined behavior, timing issue, optimization bug, memory corruption, NaN, serialization)
2. Técnicas de aislamiento: logging adicional, assertion, chaos engineering, canary
3. Instrumentación sugerida para capturar el estado exacto cuando ocurre
4. Hipótesis más probables ordenadas por probabilidad
5. Estrategia de fix conservador (que no empeore otras cosas)
6. Cómo verificar que el fix funciona sin esperar a que ocurra en producción
```

**Formato de salida:** Categorización + hipótesis ordenadas + plan de instrumentación + fix conservador.

**Ejemplo:** `NullPointerException` que ocurre ~1 de cada 10000 requests, solo en producción con alta concurrencia.

---

## 15. Debugging de Problema de Cache

**[Debugging]**

```
Depura un problema de inconsistencia de caché.

Tipo de caché: {Redis / Memcached / In-Memory / CDN}
Estrategia: {Cache-Aside / Write-Through / Write-Behind / Inline}
Datos cacheados: {tipo_de_datos}

Síntoma:
- {datos_desactualizados}
- {inconsistencia entre nodos}
- {cache_miss_excesivo}
- {stale_data_después_de_update}

Configuración:
```
{config_actual_de_caché}
```

Código de lectura/escritura:
```{lenguaje}
{código_de_operaciones_de_caché}
```

Proporciona:
1. Análisis del flujo de datos (escritura -> invalidación -> lectura)
2. Identificación del punto exacto de inconsistencia
3. Estrategia de corrección (TTL adecuado, write-through, cache tags, patrón publish/invalidate)
4. Código corregido para cada operación
5. Tests de consistencia (escribir X, leer, verificar X)
6. Monitoreo de cache hit ratio y staleness
```

**Formato de salida:** Flujo de datos + estrategia de invalidación + código corregido + tests.

**Ejemplo:** Actualizar perfil de usuario -> la caché aún sirve datos viejos por 5 minutos (TTL muy alto para datos volátiles).

---

## 16. Debugging de Problema de Base de Datos

**[Debugging]**

```
Depura un problema de base de datos en {sistema}.

Motor: {PostgreSQL / MySQL / SQL Server / MongoDB / Otro}
Problema: {lentitud / deadlock / corrupción / conexiones_agotadas / replica_lag}

Síntomas:
- {consultas_lentas}
- {errores_de_conexión}
- {alertas_de_monitoreo}

Diagnóstico disponible:
```sql
-- Queries lentas / bloqueos / uso de conexiones
{información_de_diagnóstico}
```

Schema relevante:
```sql
{definición_de_tablas_e_índices}
```

Proporciona:
1. Árbol de diagnóstico (revisar en orden: conexiones -> locks -> queries -> índices -> hardware)
2. Query(s) problemática(s) identificada(s) con `EXPLAIN ANALYZE`
3. Optimizaciones: índices faltantes, query reescritura, configuración DB, hardware
4. Código SQL optimizado + DDL de índices
5. Estrategia de mantenimiento (VACUUM, stats, reindex, partitioning)
6. Monitoreo proactivo (pg_stat_statements, slow query log, connection pooling)
```

**Formato de salida:** Diagnóstico por capas + queries optimizadas + DDL + plan de monitoreo.

**Ejemplo:** Consulta `SELECT * FROM pedidos WHERE cliente_id = ? ORDER BY fecha DESC LIMIT 10` sin índice en `(cliente_id, fecha)`.

---

## 17. Análisis de Fuga de Conexiones

**[Debugging]**

```
Depura una fuga de conexiones (connection leak) en {aplicación}.

Tipo de conexión: {base de datos / HTTP pool / gRPC / WebSocket}
Pool máximo: {X} conexiones
Síntoma: {pool_agotado / timeout / errores_de_conexión / crecimiento_de_conexiones_abiertas}

Evidencia:
- Conexiones abiertas: {X} de {Y} disponibles
- Conexiones por estado: {activas, idle, muertas}
- Tasa de crecimiento: {X} conexiones/minuto bajo carga normal
- Pico vs normal: {pico: X, normal: Y}

Código de uso de conexiones:
```{lenguaje}
{código_donde_se_usan_las_conexiones}
```

Proporciona:
1. Rastreo del lifecycle de la conexión (open -> use -> close)
2. Punto(s) exactos donde no se cierra/retorna la conexión
3. Patrones: excepciones que saltan el close(), lazy initialization sin cleanup, retornos tempranos
4. Código corregido con `using` / `try-finally` / context manager
5. Tests de fuga (abrir N conexiones en loop, verificar que se cierran)
6. Monitoreo de conexiones en producción con alertas
```

**Formato de salida:** Análisis de ciclo de vida + código corregido + tests de leakage + alertas.

**Ejemplo:** En Express con `pg`, conexiones no retornadas al pool cuando una validación falla después de `client.query()`.

---

## 18. Debugging de Problema Async/Await

**[Debugging]**

```
Depura un problema con código asíncrono en {lenguaje}.

Síntoma:
- {fire-and-forget sin manejar}
- {excepción_no_capturada_en_async}
- {deadlock_por_sync_over_async}
- {task_no_awaiteda}
- {orden_incorrecto_de_ejecución}

Código:
```{lenguaje}
{código_asíncrono}
```

Contexto:
- Runtime: {Node.js / .NET / Python asyncio / Tokio}
- Concurrencia: {límite_de_concurrencia, scheduler, event loop}
- Framework: {Express / ASP.NET Core / FastAPI / Axum}

Proporciona:
1. Análisis del flujo asíncrono (qué se ejecuta en qué orden)
2. Identificación del anti-patrón (fire-and-forget, blocking call, async void, missing await, sync-over-async)
3. Código corregido con manejo de errores asíncrono
4. Estrategia de propagación de errores (Promise.catch, try-catch async, error boundaries)
5. Tests para verificar comportamiento asíncrono (timeout, concurrencia, cancelación)
6. Linting rules para prevenir anti-patrones async (ESLint, roslyn analyzers)
```

**Formato de salida:** Análisis de flujo + anti-patrones + código corregido + linters.

**Ejemplo:** En Node.js, `try { user.save() } catch` no captura el error porque falta `await`.

---

## 19. Debugging de Problema de Timezone

**[Debugging]**

```
Resuelve un problema relacionado con zonas horarias (timezone).

Síntoma:
- {fechas_desfasadas_por_X_horas}
- {cálculos_de_fechas_incorrectos}
- {errores_de_serialización_de_fechas}

Datos:
- Fecha/hora en UI: {valor_mostrado}
- Fecha/hora en DB: {valor_almacenado}
- Fecha/hora en servidor: {valor_en_servidor}
- Husos involucrados: {lista_de_timezones: servidor, DB, cliente, usuarios}
- Tecnologías: {backend, frontend, DB, ORM, librería_fechas}

Código:
```{lenguaje}
{código_de_manejo_de_fechas}
```

Proporciona:
1. Mapeo completo de cómo fluye la fecha: UI -> API -> Backend -> DB -> Backend -> API -> UI
2. Conversiones implícitas que ocurren en cada capa
3. Causa raíz: almacenamiento sin timezone, conversión doble, asunción incorrecta de UTC/local
4. Estrategia correcta (siempre almacenar en UTC, convertir en UI)
5. Código corregido en cada capa
6. Tests con timezone-aware assertions (fecha específica en diferentes husos)
```

**Formato de salida:** Flujo de datos + causa raíz + código corregido + tests cross-timezone.

**Ejemplo:** `created_at` almacenado como `TIMESTAMP` (no `TIMESTAMPTZ`) en PostgreSQL, clientes en UTC-3 ven la fecha 3h desfasada.

---

## 20. Depuración de Problema de Encoding

**[Debugging]**

```
Resuelve un problema de encoding/caracteres en {aplicación}.

Síntoma:
- {caracteres_extraños_mostrados}
- {error_de_encoding}
- {datos_corruptos_por_encoding_incorrecto}

Datos involucrados:
- Input: {formato_entrada_y_encoding}
- Procesamiento: {cómo_se_procesan_los_datos}
- Almacenamiento: {tipo_db_y_columna}
- Output: {formato_salida_y_encoding}

Caracteres problemáticos: {ejemplo_de_caracteres_afectados}
Encoding detectado vs esperado: {ej: detecté Latin-1, esperaba UTF-8}

Código:
```{lenguaje}
{código_de_procesamiento_de_texto}
```

Proporciona:
1. Ruta del dato: byte[] -> decode -> string -> manipulate -> encode -> byte[]
2. Punto exacto donde ocurre el mangling de encoding
3. Causa raíz: doble encoding, asunción de encoding, BOM mal manejado, \u vs literal
4. Código corregido con encoding explícito en cada paso
5. Tests con caracteres problemáticos (ñ, ü, 😊, CJK, RTL, emoji)
6. Validación de encoding al importar/exportar datos
```

**Formato de salida:** Mapa de encoding + código corregido + tests multi-idioma.

**Ejemplo:** Archivo CSV exportado desde Excel en ISO-8859-1, importado como UTF-8, los acentos aparecen como `Ã¡` en lugar de `á`.

---

## 21. Debugging de Error de Memoria (OOM / Stack Overflow)

**[Debugging]**

```
Diagnostica un error de memoria en {aplicación}.

Error: {OutOfMemoryError / StackOverflow / AllocationFailure}
Contexto: {entorno, lenguaje, límite_de_memoria_configurado}

Evidencia:
- Stack trace:
```
{stack_trace}
```
- Heap usage before crash: {uso_de_memoria}
- Objetos retenidos: {tipos_de_objetos_dominantes}
- Patrón de crecimiento: {lineal / exponencial / repentino}

Código sospechoso:
```{lenguaje}
{código}
```

Proporciona:
1. Análisis de la causa (recursión infinita, caché sin límite, fuga de memoria, fragmentación, archivo demasiado grande en memoria)
2. Baseline de memoria normal vs estado actual
3. Solución específica para el patrón identificado
4. Código corregido
5. Configuración de JVM/runtime memory limits
6. Monitoreo preventivo (uso de heap, alertas de threshold, profiling periódico)
```

**Formato de salida:** Causa raíz + código corregido + configuración de memoria + alerts.

**Ejemplo:** StackOverflowError por recursión sin caso base en `Factorial.calculate(n)` cuando n < 0.

---

## 22. Análisis de Problema de DNS/CDN

**[Debugging]**

```
Depura un problema de DNS o CDN.

Síntoma:
- {dominio_no_resuelve}
- {resolución_lenta}
- {CDN_sirve_contenido_antiguo}
- {certificado_TLS_inválido}

Configuración:
- Dominio: {dominio}
- CDN: {CloudFront / Cloudflare / Akamai / Fastly}
- DNS provider: {proveedor_DNS}
- TTL configurado: {TTL}
- Registros DNS: {lista_de_registros}

Diagnóstico:
```
{dig / nslookup / curl -vI resultados}
```

Proporciona:
1. Diagnóstico de la cadena DNS completa (root -> TLD -> authoritative -> resolver)
2. Propagación: estado actual + tiempo transcurrido desde el cambio
3. Problemas identificados: CNAME en apex, registro faltante, TTL excesivo, DNSSEC misconfiguration, CDN origin pull fallando
4. Comandos de verificación para cada capa
5. Configuración DNS/CDN corregida
6. Monitoreo de resolución DNS y certificados
```

**Formato de salida:** Diagnóstico de cadena DNS + configuración corregida + comandos de verificación.

**Ejemplo:** `www.ejemplo.com` resuelve a IP antigua 6 horas después de cambiar el A record (TTL era 86400).

---

## 23. Depuración de Error de Permisos

**[Debugging]**

```
Resuelve un error de permisos en {sistema_operativo} / {aplicación}.

Error:
```
{error_de_permisos_exacto}
```

Recurso: {archivo / directorio / proceso / puerto / servicio}
Usuario/proceso que intenta acceder: {usuario / service_account}
Usuario/propietario del recurso: {propietario}
Permisos actuales: {permisos}
Permisos requeridos: {lectura / escritura / ejecución / todos}

Contexto:
- Sistema: {OS, distribución, versión}
- ¿Contenedor?: {Docker / no, usuario dentro del contenedor}
- ¿Servicio ejecutándose como?: {systemd / supervisor / manual}

Proporciona:
1. Árbol de decisión de permisos (cómo el SO evalúa el acceso)
2. Comandos de diagnóstico para cada posible causa
3. Causa raíz: UID/GID incorrecto, SELinux/AppArmor, capabilities faltantes, ACL, mount options
4. Comandos de corrección (chmod, chown, setcap, semanage, usermod)
5. Configuración corregida
6. Principio de mínimo privilegio: permisos justos y seguros
```

**Formato de salida:** Árbol de diagnóstico + comandos de corrección + configuración segura.

**Ejemplo:** `EACCES: permission denied, listen 0.0.0.0:443` - Node.js ejecutándose como user normal necesita `sudo` o `setcap cap_net_bind_service`.

---

## 24. Análisis de Problema de TLS/SSL

**[Debugging]**

```
Depura un error de TLS/SSL en {conexión}.

Error:
```
{error_SSL}
```

Conexión: {cliente} -> {servidor}:{puerto}
URL: {url_completa}

Diagnóstico:
```
{openssl s_client / curl -vI resultados}
```

Configuración:
- Servidor: {servidor_web, versión, configuración_TLS}
- Cliente: {cliente, versión, versión_TLS_máxima}
- Certificados: {emisor, caducidad, SANs, wildcard}

Proporciona:
1. Análisis del handshake TLS (ClientHello -> ServerHello -> Cert -> KeyExchange -> Finished)
2. Causa raíz:
   - Certificado expirado / no válido / self-signed
   - Hostname mismatch (SAN no cubre el dominio)
   - Cipher suite no soportada por ambas partes
   - TLS version mismatch
   - Certificate chain incompleto
   - Revocación (CRL/OCSP)
3. Configuración corregida (servidor y/o cliente)
4. Tests de conexión SSL automáticos
5. Monitoreo de expiración de certificados
```

**Formato de salida:** Análisis de handshake + causa raíz + configuración corregida + monitoreo.

**Ejemplo:** `SSL_ERROR_BAD_CERT_DOMAIN` - certificado emitido para `*.ejemplo.com` pero acceso a `ejemplo.com` sin subdominio.

---

## 25. Debugging de Problema de Serialización JSON

**[Debugging]**

```
Resuelve un problema específico de serialización/deserialización JSON.

Error:
```
{error_exacto}
```

Lenguaje: {lenguaje}
Librería: {biblioteca_json}
Versión: {versión}

Clase/estructura:
```{lenguaje}
{definición_tipo}
```

JSON esperado/actual:
```json
{json_problemático}
```

Configuración del serializador:
```{lenguaje}
{config_serializador}
```

Proporciona:
1. Punto exacto de fallo en el mapeo tipo -> JSON
2. Causa: circular reference, polymorphic type, null handling, date format, enum como string/int, ignorar vs incluir nulls, case sensitivity
3. Código corregido con configuración adecuada (JsonIgnore, JsonConverter, JsonInclude, etc.)
4. Tests con casos edge: null, arrays vacíos, objetos anidados, fechas, GUIDs, enums
5. Schema validation (JSON Schema) pre-serialización
```

**Formato de salida:** Mapeo de errores + configuración corregida + tests de serialización.

**Ejemplo:** `System.Text.Json` en .NET lanza `JsonException` por `ReferenceHandler.IgnoreCycles` no configurado con referencias circulares.

---

## 26. Debugging de Problema de Hot Reload / Watch Mode

**[Debugging]**

```
Depura un problema con hot reload / watch mode en {herramienta}.

Herramienta: {webpack-dev-server / vite / nodemon / dotnet watch / hot reload nativo}
Síntoma:
- {cambios_no_se_reflejan}
- {full_reload_en_vez_de_hot_reload}
- {recarga_lenta}
- {error_en_consola_al_recargar}
- {pérdida_de_estado_del_componente}

Configuración actual:
```{formato}
{configuración_del_watch_mode}
```

Cambio que debería gatillar recarga: {descripción_del_cambio}
Lo que ocurre: {comportamiento_observado}
Logs:
```
{logs_del_watch_mode}
```

Proporciona:
1. Diagnóstico del pipeline: file change -> detect -> compile -> inject/reload
2. Causa: exclude/include patterns incorrectos, fs events no soportados (WSL, Docker mount), cache intermedio, HMR server no conectado, poll mode vs events
3. Configuración corregida
4. Optimizaciones para velocidad (chunk splitting, entrada específica, exclude node_modules)
5. Verificación de conectividad HMR (WebSocket)
```

**Formato de salida:** Pipeline de hot reload + configuración corregida + optimizaciones.

**Ejemplo:** Vite con WSL2, cambios en archivos no detectados por `fs.notify()` -> configurar `server.watch.usePolling: true`.

---

## 27. Debugging de Problema de CORS

**[Debugging]**

```
Resuelve un problema de CORS (Cross-Origin Resource Sharing).

Error en consola del navegador:
```
{cors_error_exacto}
```

Configuración:
- Frontend origin: {url_frontend}
- Backend URL: {url_backend}
- Método HTTP: {GET / POST / PUT / DELETE / OPTIONS}
- Headers personalizados: {lista_de_headers}
- Cookies/credentials: {incluidas / no incluidas}

Request (desde devtools):
```
{headers_del_request_y_response}
```

Configuración CORS del backend actual:
```{lenguaje}
{config_cors_actual}
```

Proporciona:
1. Análisis del flujo Preflight (OPTIONS) y actual request
2. Causa exacta: origin no permitido, method no permitido, header no permitido, credentials mismatch, wildcard + credentials incompatible, múltiples orígenes mal manejados
3. Configuración CORS corregida para backend
4. Para desarrollo: proxy config correcto ({vite proxy / webpack devServer / CRA proxy})
5. Tests de CORS (curl -H "Origin: https://frontend.com" -H "Access-Control-Request-Method: POST")
6. Consideraciones de seguridad (allow origin específico, no wildcard en producción)
```

**Formato de salida:** Análisis de flujo CORS + configuración corregida + proxy de desarrollo + tests de verificación.

**Ejemplo:** `Access to fetch at 'https://api.ejemplo.com' from origin 'https://app.ejemplo.com' has been blocked by CORS policy` - falta header `Access-Control-Allow-Origin`.

---

## 28. Plan de Debugging Sistemático

**[Debugging]**

```
Crea un plan de debugging sistemático para resolver el siguiente problema:

Problema: {descripción_del_problema}
Impacto: {usuarios_afectados / transacciones_afectadas}
Urgencia: {crítica / alta / media / baja}

Contexto mínimo:
- Tecnología: {stack_tecnológico}
- Entorno: {producción / staging}
- Tiempo desde que ocurre: {desde_cuándo}

El plan debe incluir:
1. Recolección de datos: qué logs, métricas, traces recolectar
2. Hipótesis ordenadas por probabilidad (top 5)
3. Para cada hipótesis: test que la confirmaría o descartaría
4. Aislamiento: reducir el problema a su mínima expresión
5. Fix tentativo (una vez identificada la causa)
6. Verificación post-fix
7. Análisis post-mortem: qué permitió que el bug llegara a producción
8. Mejoras de proceso: tests, CI, monitoreo, alertas
```

**Formato de salida:** Plan estructurado con fases: Recopilar -> Hipotetizar -> Aislar -> Corregir -> Verificar -> Prevenir.

**Ejemplo:** Error 500 en `POST /api/checkout` que ocurre desde esta mañana tras deploy v3.2.0, afecta 100% de las transacciones de pago.
