# Code Review

> 22 prompts para revisiones de código profundas y efectivas.

---

## 1. Revisión de Seguridad

**[Code Review]**

```
Realiza una revisión de seguridad del siguiente código.

Código:
```{lenguaje}
{código_a_revisar}
```

Contexto: {descripción_del_propósito_y_entorno}

Busca específicamente:

1. **Injection**:
   - SQL Injection: strings concatenadas en queries
   - NoSQL Injection: inputs directos en MongoDB queries
   - Command Injection: exec(), shell_exec(), os.system()
   - LDAP / XML / XPath Injection
   - Template Injection: SSTI en motores de templates

2. **Authentication & Authorization**:
   - Broken authentication: session fixation, weak password policies
   - IDOR: falta de verificación de ownership
   - Mass assignment: campos que no deberían ser actualizables
   - JWT: none algorithm, algoritmos débiles (HS256 vs RS256), exp no verificado
   - Rate limiting ausente en login/MFA

3. **Data Protection**:
   - PASSWORDS: no hasheados con bcrypt/argon2/scrypt
   - DATOS SENSIBLES: loggeados en texto plano
   - SSL/TLS: conexiones no seguras a servicios externos
   - Secrets hardcodeados: API keys, tokens, contraseñas

4. **Input Validation**:
   - XSS: renderizado de HTML/JS sin escapar
   - Path traversal: ../ en file paths
   - SSRF: URLs proporcionadas por usuario sin validar
   - File upload: type validation, size, path traversal

5. **Business Logic**:
   - Race conditions en operaciones financieras
   - Price manipulation en e-commerce
   - Privilege escalation por bypass de checks

Para cada vulnerabilidad: severidad, línea exacta, exploit proof-of-concept (textual), fix con código.
```

**Formato de salida:** Reporte de seguridad categorizado por severidad (Critical/High/Medium/Low) con línea y fix.

**Ejemplo:** `{Python}`, `{API Flask con SQLAlchemy}`, `{SQL Injection en GET /users?name= por query cruda}`, `{Severidad: Critical, Línea 42, Fix: usar parámetros SQLAlchemy}`

---

## 2. Revisión de Performance

**[Code Review]**

```
Revisa el siguiente código desde la perspectiva de rendimiento y eficiencia.

Código:
```{lenguaje}
{código_a_revisar}
```

Contexto de uso:
- Volumen de datos esperado: {X} registros/requests por segundo
- Entorno: {limitaciones de CPU/memoria/red}
- SLAs: p99 latencia < {X}ms

Áreas de análisis:

1. **Algoritmos y Estructuras de Datos**:
   - Complejidad algorítmica: O(n²) donde podría ser O(n log n)
   - Estructura de datos inapropiada: arrays vs sets vs maps vs trees
   - Búsquedas lineales donde hay índices
   - Recursión sin memoization

2. **Base de Datos**:
   - N+1 queries (lazy loading sin eager loading)
   - Queries sin índices adecuados
   - Joins innecesarios o faltantes
   - SELECT * donde se necesitan columnas específicas
   - Transacciones demasiado largas
   - Falta de paginación

3. **I/O y Red**:
   - Llamadas síncronas bloqueantes donde async es posible
   - Pool de conexiones no configurado
   - Llamadas a API externa en loop
   - Archivos cargados completamente en memoria
   - Falta de caché para datos que cambian poco

4. **Código**:
   - Loop dentro de loop innecesario
   - Objetos/arrays creados en cada iteración
   - String concatenation en loop (usar StringBuilder/join)
   - Cálculos repetidos que podrían cachearse
   - Early exit no utilizado cuando es posible

5. **Memoria**:
   - Memory leaks por closures, listeners, cachés sin límite
   - Objetos grandes que podrían ser lazy-loaded
   - Buffer sizes inapropiados

Sugerencias ordenadas por impacto potencial.
```

**Formato de salida:** Reporte de performance con hotspots, impacto estimado, y código optimizado.

**Ejemplo:** `{Node.js}`, `{API de catálogo con 10k productos}`, `{N+1 en GET /categories: 1 query para categorías + 10k queries para productos}`

---

## 3. Revisión de Estilo y Mantenibilidad

**[Code Review]**

```
Revisa el siguiente código en busca de problemas de estilo, legibilidad y mantenibilidad.

Código:
```{lenguaje}
{código_a_revisar}
```

Guía de estilo del proyecto: {enlace_o_referencia}

Aspectos a evaluar:

1. **Nombrado**:
   - Nombres descriptivos y con intención clara
   - Consistencia: camelCase/snake_case/PascalCase según convención
   - Sin abreviaturas crípticas (a menos que sean estándar del dominio)
   - Booleanos: is/has/should prefix

2. **Complejidad**:
   - Funciones/métodos demasiado largos (> {X} líneas)
   - Demasiados parámetros (> {X})
   - Anidamiento profundo (> {X} niveles de indentación)
   - Complejidad ciclomática alta (múltiples if/else/switch)
   - Side effects no documentados

3. **Duplicación**:
   - Código duplicado (DRY principle)
   - Duplicación de lógica entre archivos
   - Hardcoded values repetidos

4. **Estructura**:
   - Separación de concerns: mezcla de lógica de negocio con infraestructura
   - Single Responsibility: funciones que hacen demasiadas cosas
   - Dependencias ocultas (singletons, globals, static methods)
   - Acoplamiento innecesario entre módulos

5. **Comentarios y Documentación**:
   - Comentarios que explican el qué (no el por qué)
   - TODO/FIXME sin issue asociado
   - Código comentado
   - Documentación pública faltante en funciones exportadas

6. **Errores comunes**:
   - Magic numbers sin constantes nombradas
   - Condiciones sin paréntesis (ambigüedad)
   - Mutación de parámetros de entrada
   - Comparaciones no estrictas (== vs ===)
   - Null/undefined checks insuficientes o excesivos

Prioridad: alta (bloqueante) / media / baja (cosmético).
```

**Formato de salida:** Reporte de estilo con líneas exactas, severidad y sugerencias de mejora.

**Ejemplo:** `{TypeScript}`, `{servicio con función de 200 líneas, 7 parámetros, 4 niveles de anidamiento, sin tests}`

---

## 4. Revisión de Arquitectura

**[Code Review]**

```
Revisa la arquitectura del siguiente código/sistema.

Código/estructura:
```{lenguaje}
{código_o_diagrama_de_arquitectura}
```

Contexto:
- Dominio: {tipo_de_aplicación}
- Equipo: {X} desarrolladores
- Escala esperada: {usuarios/transacciones}

Evaluar:

1. **Acoplamiento y Cohesión**:
   - Alta cohesión dentro de módulos?
   - Bajo acoplamiento entre módulos?
   - Dependencias circulares?
   - Layer violations (UI llamando a DB directamente)

2. **Patrones y Principios**:
   - SOLID: cada principio evaluado individualmente
   - Dependency Inversion: depende de abstracciones, no concretas
   - Interface Segregation: interfaces pequeñas y específicas
   - Law of Demeter: excesivo method chaining

3. **Estructura de Capas**:
   - Separación clara entre: presentation, application, domain, infrastructure
   - DTOs usados correctamente (no expuestos desde domain)
   - Domain model anémico (getters/setters sin lógica)

4. **Manejo de Errores**:
   - Errores checked vs unchecked
   - Propagación correcta de errores (no tragar excepciones)
   - Fallos en servicios externos manejados (circuit breaker, retry)

5. **Escalabilidad**:
   - Cuellos de botella identificados
   - Stateful vs stateless
   - Caché implementada donde es efectiva
   - Base de datos: índices, queries, consistencia

6. **Testing**:
   - Testeabilidad de los componentes
   - Inyección de dependencias
   - Side effects aislados

Sugerencias de refactorización con orden de prioridad.
```

**Formato de salida:** Reporte de arquitectura con violaciones de principios, riesgos y recomendaciones.

**Ejemplo:** `{API REST Node.js}`, `{lógica de negocio en controllers, dependencias circulares entre services, sin capa de dominio}`

---

## 5. Revisión de Pruebas (Tests)

**[Code Review]**

```
Revisa los tests existentes para {módulo/funcionalidad}.

Tests:
```{lenguaje}
{tests_a_revisar}
```

Código bajo test:
```{lenguaje}
{código_producción}
```

Evaluación:

1. **Calidad de Tests**:
   - ¿Prueban comportamiento o implementación?
   - ¿Son independientes entre sí?
   - ¿Son deterministas (mismos input -> mismo resultado)?
   - ¿Nombres descriptivos que documentan el comportamiento?

2. **Cobertura Significativa**:
   - Cobertura de branches/condiciones (no solo líneas)
   - Casos edge cubiertos: null, empty, boundaries, duplicates, concurrent
   - Errores y excepciones cubiertos
   - Happy path + unhappy path

3. **Mocks y Fakes**:
   - Demasiados mocks (tests frágiles)
   - Mocks que sobre-especifican (expect exact calls con argumentos)
   - Faltan mocks para dependencias externas lentas
   - Mockear lo que no se debería (lógica propia, tipos de valor)

4. **Estructura**:
   - Arrange-Act-Assert (o Given-When-Then)
   - Setup demasiado complejo (tests difíciles de entender)
   - Shared mutable state entre tests
   - Fixtures excesivamente grandes

5. **Cobertura**:
   - Features sin tests
   - Regresiones pasadas sin test de regresión
   - Documentación de bugs sin test asociado
   - threshold de cobertura: actual vs objetivo

6. **Performance**:
   - Tests lentos
   - Tests que dependen de red/DB cuando no deberían
   - Tests que podrían paralelizarse
```

**Formato de salida:** Reporte de calidad de tests + brechas de cobertura + sugerencias de mejora.

**Ejemplo:** `{UserService.test.ts}`, `{30 tests, 12 mocks, cobertura 95% líneas pero 60% branches, test más lento 12s}`

---

## 6. Revisión de Manejo de Errores

**[Code Review]**

```
Revisa el manejo de errores en el siguiente código.

Código:
```{lenguaje}
{código_a_revisar}
```

Evaluar:

1. **Errores silenciados**:
   - `catch { }` vacío sin logging
   - `catch(e) { return null }` sin log
   - Errores que se tragan sin registrar
   - Promise sin .catch() / await sin try-catch

2. **Errores engañosos**:
   - Mensajes de error genéricos ("Something went wrong")
   - Errores que no incluyen contexto (qué falló, con qué datos)
   - Códigos de error HTTP incorrectos (200 con error, 500 para 400)
   - Excepciones mal tipadas (throw "string" en vez de throw new Error)

3. **Propagación incorrecta**:
   - Capturar Exception genérica y no relanzar
   - Perder stack trace (throw new Error(e.message) en vez de throw e)
   - Lanzar error en callback async sin reject
   - Event emitters que no manejan 'error' event

4. **Casos específicos**:
   - Timeouts sin manejo
   - Conexiones a DB/API sin retry
   - File handles no cerrados tras error
   - Recursos no liberados en finally

5. **Graceful degradation**:
   - Funcionalidad crítica sin fallback
   - Usuario recibe error feo vs mensaje amigable
   - Circuit breaker ausente para dependencias externas

6. **Logging**:
   - Errores sin stack trace
   - Información sensible en logs de error (passwords, tokens)
   - Nivel de log incorrecto (error vs warn vs info)
   - Falta de correlation ID en errores

Por cada issue: severidad, línea, fix propuesto.
```

**Formato de salida:** Reporte de errores con líneas exactas, severidad y código corregido.

**Ejemplo:** `{catch { /* silent */ } en línea 42 -> error de DB no se registra -> usuarios ven pantalla blanca}`

---

## 7. Revisión de Concurrencia y Async

**[Code Review]**

```
Revisa el código concurrente/asíncrono en busca de problemas.

Código:
```{lenguaje}
{código_a_revisar}
```

Contexto de concurrencia:
- Tipo: {threads / async-await / actors / CSP / event loop}
- Número de workers: {X}
- Recursos compartidos: {lista_de_recursos_compartidos}

Evaluar:

1. **Race Conditions**:
   - Check-then-act sin lock: if (!key) { set(key, value) }
   - Read-modify-write sin atomicidad
   - Lazy initialization duplicado
   - Collections no thread-safe modificadas concurrentemente

2. **Deadlocks / Livelocks**:
   - Lock ordering inconsistente
   - Locks anidados
   - Async lock adquirido y no liberado
   - Dependency cycle con recursos limitados

3. **Async Anti-patterns**:
   - Fire-and-forget sin manejo de errores
   - .Result / .Wait() bloqueando thread
   - Async void (solo para event handlers)
   - Task.Run en vez de async natural
   - ConfigureAwait(false) faltante en librerías

4. **Estado Compartido**:
   - Variables estáticas mutables
   - Singletons con estado mutable
   - Caché sin sincronización
   - Counters sin Interlocked / atomic

5. **Coordinación**:
   - CancellationToken no propagado
   - Timeouts no configurados
   - Graceful shutdown no implementado
   - Backpressure no gestionada

6. **Testing de Concurrencia**:
   - Tests que dependen de timing
   - Falta de stress tests
   - Race conditions no detectadas por tests unitarios

Cada issue: riesgo, línea, fix, test para detectar.
```

**Formato de salida:** Reporte de concurrencia con análisis de interleaving, fixes y tests.

**Ejemplo:** `{async void en ASP.NET Controller -> excepción no capturada -> worker process crash}`

---

## 8. Revisión de Dependencias

**[Code Review]**

```
Revisa las dependencias del proyecto {proyecto}.

Archivos de dependencias:
{package.json / requirements.txt / Cargo.toml / pom.xml / go.mod}

Análisis:

1. **Versiones**:
   - Dependencias desactualizadas: {X} majors, {Y} minors detrás
   - Versiones fijas vs rangos (pin exactas vs ^/~)
   - Dependencias sin usar (zombies)
   - Dependencias duplicadas (misma lib diferentes versiones)

2. **Seguridad**:
   - Vulnerabilidades conocidas (CVE): {count, severity}
   - Dependencias maliciosas (typosquatting, dependency confusion)
   - Licencias incompatibles con el proyecto
   - Paquetes mantenidos? (última actualización > {X} años)

3. **Tamaño y Rendimiento**:
   - Dependencias pesadas para lo que se usa (moment.js -> date-fns)
   - Tree-shaking no configurado
   - Dependencias de desarrollo en producción
   - Bundle size: {X}MB -> desglose por paquete

4. **Transitive Dependencies**:
   - Versiones conflictivas
   - Sub-dependencias con vulnerabilidades
   - Dependencias que arrastran dependencias no deseadas

5. **Mantenibilidad**:
   - Dependencias con breaking changes frecuentes
   - Dependencias con maintainer burnout
   - Dependencias sin tests/release CI
   - Reemplazos modernos disponibles

Recomendaciones: actualizar, reemplazar o eliminar cada dependencia.
```

**Formato de salida:** Reporte de dependencias con vulnerabilidades, obsolescencia y recomendaciones de reemplazo.

**Ejemplo:** `{Node.js}`, `{150 dependencias, 2 critical CVEs, 20 majors behind, moment.js (2MB) reemplazable por date-fns (300KB)}`

---

## 9. Revisión de Configuración

**[Code Review]**

```
Revisa la configuración de {proyecto/aplicación}.

Archivos de configuración:
{lista_de_archivos_de_config}

Revisar:

1. **Environment Variables**:
   - Valores hardcodeados vs variables de entorno
   - Defaults inseguros (DB_HOST=localhost en prod)
   - Secrets en archivos de configuración (no en .env o vault)
   - Variables requeridas sin validación al startup

2. **Entornos**:
   - Diferencias entre dev/staging/prod no documentadas
   - Config específica de entorno mezclada
   - Feature flags: configurables por entorno
   - Logging level: debug en producción

3. **Seguridad**:
   - CORS: orígenes demasiado permisivos
   - SSL: no forzado, certificados incorrectos
   - Rate limiting: no configurado o muy alto
   - Session: timeout demasiado largo, cookie sin flags (Secure, HttpOnly, SameSite)
   - Upload: tamaño máximo no limitado

4. **Performance**:
   - Connection pool: tamaño incorrecto (muy pequeño o muy grande)
   - Timeouts: request/response no configurados o muy largos
   - Caché: TTL no configurado o inapropiado
   - Compression: gzip/brotli no habilitado

5. **Resiliencia**:
   - Retry: no configurado
   - Circuit breaker: no implementado
   - Health checks: no configurados
   - Graceful shutdown: no implementado

Cada issue: severidad, archivo, línea, corrección.
```

**Formato de salida:** Reporte de configuración con riesgos de seguridad, performance y operación.

**Ejemplo:** `{config.yaml}`, `{CORS: *, log-level: debug, DB pool: 5 (muy bajo para 50 pods)}, {sin rate limiting}`

---

## 10. Revisión de Migración / Upgrade

**[Code Review]**

```
Revisa la migración de {versión_origen} a {versión_destino} para {proyecto}.

Cambios propuestos:
{lista_de_cambios_o_diff}

Riesgos a evaluar:

1. **Breaking Changes**:
   - API endpoints modificados o eliminados
   - Formatos de respuesta cambiados
   - Tipos de datos modificados (int->string, field renaming)
   - Comportamiento modificado (antes permitía X, ahora no)

2. **Base de Datos**:
   - Migraciones que bloquean (ALTER TABLE con lock)
   - Columnas eliminadas que código antiguo espera
   - Datos existentes que necesitan transformación
   - Rollback: migración reversible?
   - Tamaño de datos: tiempo estimado de migración

3. **Dependencias**:
   - Librerías actualizadas con cambios de API
   - Runtime actualizado (Node 18 -> 20, Python 3.10 -> 3.12)
   - Compatibilidad de tipos/versiones

4. **Compatibilidad hacia atrás**:
   - Feature flags para nuevos comportamientos
   - Versiones de API coexistiendo
   - Periodo de deprecación
   - Headers de deprecación

5. **Rendimiento**:
   - Nuevas queries: plan de ejecución
   - Nuevos índices: impacto en writes
   - Caché: invalidación y warm-up
   - Consumo de memoria/CPU de nuevas features

6. **Rollback Plan**:
   - Pasos exactos para deshacer
   - Tiempo estimado de rollback
   - Datos: no pérdida durante rollback

Checklist de pre-deploy y post-deploy.
```

**Formato de salida:** Reporte de riesgos de migración + checklist pre/post deploy + rollback plan.

**Ejemplo:** `{Express 4 -> 5}`, `{breaking: app.del -> app.delete, middleware error handling changed, req.query changes}`

---

## 11. Revisión de Internacionalización (i18n)

**[Code Review]**

```
Revisa la preparación para internacionalización del código.

Código:
```{lenguaje}
{código_a_revisar}
```

Evaluar:

1. **Textos hardcodeados**:
   - Strings visibles al usuario sin usar i18n
   - Mensajes de error para el usuario hardcodeados
   - Textos en diferentes idiomas mezclados

2. **Formato de datos**:
   - Fechas: formateadas manualmente en vez de Intl / locale-aware
   - Números: separadores decimales/miles hardcodeados
   - Monedas: $ hardcodeado, sin considerar locale
   - Porcentajes, unidades: formateo manual
   - Pluralización: reglas asumidas (solo singular/plural inglés)

3. **Layout**:
   - Texto fijo en anchura (otros idiomas son más largos)
   - Texto en imágenes (no traducible)
   - Dirección de texto RTL no considerada (árabe, hebreo)
   - CSS: float/position basado en left

4. **Contenido cultural**:
   - Iconos/símbolos con significado cultural específico
   - Colores con connotaciones culturales (rojo = danger vs suerte)
   - Ejemplos que asumen contexto cultural
   - Formatos de dirección, teléfono, código postal

5. **Traducciones**:
   - Archivos de traducción completos?
   - Keys descriptivas (login.title vs h1_homepage_title)
   - Traducciones faltantes caen a default?
   - Traducciones con variables (interpolación)

Sugerencias de implementación por issue.
```

**Formato de salida:** Reporte de i18n con strings, líneas y soluciones.

**Ejemplo:** `{Error: "Please enter a valid email"}`, `{fecha: "01/15/2024" en vez de "15/01/2024" para locale es-ES}`

---

## 12. Revisión de Accesibilidad

**[Code Review]**

```
Revisa la accesibilidad del siguiente código frontend.

Código:
```{lenguaje}
{código_HTML_JSX}
```

Estándar: {WCAG 2.1 AA}

Evaluar:

1. **Semántica**:
   - Elementos HTML semánticos (<nav>, <main>, <aside>, <header>, <footer>, <article>)
   - Headings (h1-h6) en orden jerárquico correcto
   - Div-itis: <div> para botones, <div> onclick="..."
   - Landmarks: ARIA roles para navegación si no hay HTML5

2. **Teclado**:
   - Todos los elementos interactivos accesibles por teclado
   - Tab order lógico (no tabindex positivo)
   - Focus visible (outline no eliminado o reemplazado)
   - Skip link presente al inicio
   - Sin keyboard traps (salvo modales con escape)

3. **ARIA**:
   - ARIA attributes usados correctamente
   - No ARIA redundant con HTML semántico
   - aria-live, aria-atomic para regiones dinámicas
   - aria-expanded, aria-controls para acordeones/menús

4. **Color y Contraste**:
   - Contraste suficiente (4.5:1 para texto normal, 3:1 para grande)
   - Información no solo por color (gráficos con patrones)
   - Modo oscuro soportado

5. **Imágenes y Multimedia**:
   - Alt text descriptivo en todas las imágenes
   - Captions/subtitles en video
   - Texto alternativo para iconos (aria-label, title)

6. **Formularios**:
   - Labels asociados (htmlFor/id)
   - Error messages asociados (aria-describedby, aria-invalid)
   - Required fields indicados visual y semánticamente
   - Autocomplete attributes para campos comunes

Cada issue: WCAG criterion violado, impacto, fix.
```

**Formato de salida:** Reporte de accesibilidad con violaciones WCAG y soluciones.

**Ejemplo:** `{<div onclick="submit()" class="button">Submit</div> -> <button type="submit">Submit</button>}`

---

## 13. Revisión de Logging

**[Code Review]**

```
Revisa la estrategia de logging en el siguiente código.

Código:
```{lenguaje}
{código_a_revisar}
```

Evaluar:

1. **Qué se loggea**:
   - ¿Loggea información útil para debugging?
   - ¿Loggea demasiado (info en cada línea)?
   - ¿Loggea muy poco (solo errores)?
   - ¿Loggea datos sensibles? (passwords, tokens, PII, tarjetas de crédito)

2. **Niveles de log**:
   - Uso correcto de niveles: error, warn, info, debug, trace
   - debug para desarrollo, info para operación
   - error para excepciones no esperadas, warn para condiciones anómalas
   - Sin logging a diferentes niveles para el mismo evento

3. **Estructura**:
   - Logs estructurados (JSON) vs texto plano
   - Campos necesarios: timestamp, level, service, trace_id, user_id
   - Correlation ID para tracking de requests
   - Stack traces completos en errores

4. **Contexto**:
   - Mensajes con suficiente contexto para entender el error
   - Variables/datos relevantes incluidos
   - Sin suposiciones de contexto externo

5. **Performance**:
   - Logging en hot path (loops, requests frecuentes)
   - String concatenation en logging (usar parametrización)
   - Evaluación de lazy args: log.debug("msg {}", expensive()) no se ejecuta si debug off

6. **Manejo de logs**:
   - Log rotation configurada
   - Log levels configurables en runtime
   - Rate limiting de logs para evitar log flooding
   - Async logging configurado

Cada issue: archivo, línea, severidad, fix.
```

**Formato de salida:** Reporte de logging con issues, riesgos de seguridad y mejoras.

**Ejemplo:** `{console.log(user.password) en línea 23 -> sensitive data exposure}`, `{log.info("User updated") sin qué cambió}`

---

## 14. Revisión de Caché

**[Code Review]**

```
Revisa la implementación de caché en el siguiente código.

Código:
```{lenguaje}
{código_de_caché}
```

Evaluar:

1. **Estrategia**:
   - ¿Usa la estrategia correcta? (Cache-Aside, Read-Through, Write-Through, Write-Behind)
   - ¿La estrategia es consistente en toda la aplicación?

2. **Invalidación**:
   - ¿Cuándo se invalida la caché?
   - ¿Se invalida después de writes?
   - ¿Se invalida por clave específica o por patrón?
   - ¿Hay stale data por falta de invalidación?

3. **Claves**:
   - Keys consistentes y predecibles
   - Namespacing: service:entity:id:field
   - Keys demasiado largas (> 256 chars)
   - Evitar colisiones de keys

4. **TTL**:
   - TTL apropiado para cada tipo de dato
   - TTL demasiado largo (datos cambian, usuario ve stale)
   - TTL demasiado corto (caché inefectiva)
   - Sin TTL (memoria llena)
   - TTL no configurable

5. **Cache Stampede / Thundering Herd**:
   - Múltiples requests simultáneas que regeneran caché
   - Sin lock/mutex para regeneración
   - Sin jitter/stagger en TTL

6. **Métricas**:
   - Hit ratio: ¿se mide?
   - Cache size: ¿se monitorea?
   - Latency de caché: ¿es más rápida que origen?
   - Evictions: ¿por qué se expulsan datos?

7. **Casos edge**:
   - Cache null values (cache negative)
   - Cache warmup al iniciar
   - Fallback si Redis/DB cae
   - Serialization/deserialization overhead

Cada issue: línea, impacto, fix.
```

**Formato de salida:** Reporte de caché con issues de consistencia, performance y fixes.

**Ejemplo:** `{cache.get(key) sin verificar null -> NullReferenceException}`, `{TTL de 1 hora para datos que cambian cada minuto}`

---

## 15. Revisión de Frontend / UX

**[Code Review]**

```
Revisa el código frontend en busca de problemas de UX y rendimiento.

Código:
```{lenguaje}
{código_frontend}
```

Evaluar:

1. **Rendimiento**:
   - Re-renders innecesarios (sin memo/useMemo/useCallback)
   - Componentes grandes sin lazy loading
   - Imágenes sin lazy loading ni optimización
   - Bundle: imports grandes, tree-shaking no efectivo
   - Listas largas sin virtualización
   - Layout thrashing (lectura/escritura alternada de DOM)
   - Animaciones: CSS vs JS, GPU-accelerated?

2. **UX**:
   - Estados: loading, empty, error, success manejados visualmente?
   - Optimistic updates para operaciones comunes
   - Loading skeletons vs spinners
   - Error messages: amigables, accionables
   - Feedback en interacciones (click feedback, transiciones)
   - Formularios: validación en tiempo real, submit state

3. **Responsive**:
   - Funciona en mobile, tablet, desktop?
   - Touch targets >= 44x44px
   - Texto scalable (no px fijo en fonts)
   - Scroll horizontal evitable
   - Menú hamburguesa en mobile

4. **Accesibilidad** (gap):
   - Teclado: focus, tab order, escape
   - Screen reader: aria, roles, labels
   - Contraste suficiente

5. **Estado Global**:
   - Demasiado estado en global store
   - Server state cacheado (React Query / SWR) vs estado local
   - Estado derivado vs calculado en cada render

6. **Seguridad**:
   - XSS: dangerouslySetInnerHTML, v-html
   - CSRF tokens
   - CSP headers

Cada issue: componente, línea, impacto, fix.
```

**Formato de salida:** Reporte frontend con issues de performance, UX y seguridad.

**Ejemplo:** `{Lista de 10k items sin virtualizar -> 500ms render}`, `{Loading state no manejado en UserProfile -> layout shift abrupto}`

---

## 16. Revisión de API Design

**[Code Review]**

```
Revisa el diseño de la API {nombre_API}.

Especificación: {OpenAPI / GraphQL schema / gRPC proto}
Endpoints:
{lista_endpoints}

Evaluar:

1. **RESTful Design**:
   - Naming: recursos en plural, /users en vez de /getUsers
   - HTTP methods: GET para lectura, POST para creación, PUT/PATCH para update, DELETE para borrado
   - URLs: anidadas razonablemente (/users/:id/orders), no excesivamente
   - Status codes correctos: 201 Created, 204 No Content, 400 Bad Request, 404 Not Found, 409 Conflict, 422 Unprocessable

2. **Consistencia**:
   - Formato de respuestas consistente (misma estructura siempre)
   - Naming de campos consistente (camelCase, snake_case)
   - Paginación: mismo formato en todos los endpoints list
   - Errores: misma estructura de error response
   - Fechas: mismo formato ISO 8601

3. **Versionado**:
   - Estrategia: URL (/v1/), header (Accept: vnd.api.v1), query
   - Breaking changes detectados?
   - Deprecation headers presentes

4. **Seguridad**:
   - Autenticación requerida donde corresponde
   - Rate limiting headers
   - Input validation en todos los campos
   - Mass assignment prevenido

5. **Performance**:
   - Paginación en todos los endpoints list
   - Campos selectables (fields=id,name)
   - Sparse fieldsets y includes
   - Batch endpoints para operaciones comunes

6. **Documentación**:
   - OpenAPI spec completa y actualizada
   - Ejemplos en cada endpoint
   - Schemas reutilizables

Cada issue: endpoint, severidad, sugerencia.
```

**Formato de salida:** Reporte de API design con violaciones de consistencia, REST principles y sugerencias.

**Ejemplo:** `{POST /getUsers en vez de GET /users}`, `{respuestas mezclan {data: ...} y {results: ...}}`

---

## 17. Revisión de Tipos (TypeScript / Type System)

**[Code Review]**

```
Revisa el uso del sistema de tipos en el código.

Código:
```{lenguaje}
{código_a_revisar}
```

Evaluar:

1. **Any Abuse**:
   - `any` usado sin razón justificada
   - `as` type assertion excesivo (escapando el type checker)
   - `@ts-ignore` / `@ts-nocheck`
   - Cast innecesario cuando type narrowing funcionaría

2. **Type Safety**:
   - `null/undefined` no manejados explícitamente
   - Union types usados correctamente
   - Discriminated unions para estados mutuamente excluyentes
   - Generics: restringidos correctamente, no <T> sin constraints

3. **Interfaces vs Types**:
   - Uso correcto: interfaces para objetos (extensibles), types para unions/intersections
   - DRY: tipos repetidos, no reutilizados
   - Satisfaction: `satisfies` vs cast

4. **Utility Types**:
   - Partial, Pick, Omit, Record, Exclude usados cuando apropiado
   - Template literal types para strings con formato
   - Mapped types para transformaciones

5. **Exports**:
   - Tipos exportados donde son parte de la API pública
   - Tipos internos no exportados
   - Declarations (.d.ts) para consumo externo

6. **Strictness**:
   - strictNullChecks activado?
   - noUncheckedIndexedAccess para objetos dinámicos
   - exactOptionalPropertyTypes

Cada issue: línea, severidad, fix typed.
```

**Formato de salida:** Reporte de tipos con issues de seguridad y mantenibilidad.

**Ejemplo:** `{function process(data: any) -> tipar como User | Order}`, `{as User después de validar en vez de type guard}`

---

## 18. Revisión de Background Jobs / Workers

**[Code Review]**

```
Revisa la implementación de jobs/workers asíncronos.

Código:
```{lenguaje}
{código_del_worker}
```

Evaluar:

1. **Idempotencia**:
   - Procesar el mismo mensaje dos veces = mismo resultado?
   - Deduplication implementada?
   - Operaciones no idempotentes (email, pago) protegidas?

2. **Manejo de Errores**:
   - Errores no capturados -> job muerto?
   - Retry policy: max retries, backoff, dead letter
   - Errores transitorios vs permanentes
   - Poison messages (mensajes que siempre fallan)

3. **Concurrencia**:
   - Límite de concurrencia configurado
   - Race conditions en workers paralelos
   - Rate limiting de API externa respetado
   - Connection pool compartido y agotado

4. **Orden y Consistencia**:
   - Procesamiento FIFO garantizado? (no siempre necesario)
   - Mensajes fuera de orden causan problemas?
   - Stale messages (procesados después de mucho tiempo)

5. **Monitoreo**:
   - Queue depth monitoreada? (alerta si crece)
   - Job duration tracked?
   - Failed jobs alert?
   - Worker health check (heartbeat)

6. **Graceful Shutdown**:
   - SIGTERM manejado (completar job actual)
   - Jobs in-flight no perdidos
   - Re-encolar si shutdown durante procesamiento

7. **Payload**:
   - Tamaño manejable
   - Datos mínimos necesarios (IDs, no objetos completos)
   - Serialización correcta

Cada issue: worker, función, riesgo, fix.
```

**Formato de salida:** Reporte de workers con issues de confiabilidad, consistencia y monitoreo.

**Ejemplo:** `{Enviar email de confirmación no es idempotente -> si retry, usuario recibe 2 emails}`

---

## 19. Revisión de Manejo de Estado

**[Code Review]**

```
Revisa la gestión de estado en {aplicación/frontend}.

Código:
```{lenguaje}
{código_de_manejo_de_estado}
```

Evaluar:

1. **Estado Global vs Local**:
   - Estado que debería ser local (prop drilling evitable)
   - Estado que debería ser global pero está local (duplicado)
   - Estado que caduca (caché) vs estado persistente

2. **Server State**:
   - Caching de respuestas API
   - Revalidation: stale-while-revalidate, refetch interval
   - Optimistic updates con rollback
   - Pagination: cursor vs offset, prefetch next page
   - Mutations: invalidación de queries relacionadas

3. **Estado Derivado**:
   - Cálculos repetidos sin memoization
   - Estado derivado almacenado como estado primario (redundante)
   - useSelector / subscribe excesivo (re-renders)

4. **Inmutabilidad**:
   - Mutación directa de estado (en Redux, React state, Vuex)
   - Spread operator vs Immer vs actualización manual
   - Referencias a objetos mutados silenciosamente

5. **Form State**:
   - Manejo de forms: controlled vs uncontrolled
   - Validación: onChange vs onBlur vs onSubmit
   - Estado inicial vs reset
   - Dirty/pristine tracking

6. **URL State**:
   - Estado que debería estar en URL (filtros, paginación, tabs)
   - Deep linking soportado?
   - Browser navigation (back/forward) manejado

Cada issue: componente, impacto, fix.
```

**Formato de salida:** Reporte de estado con redundancias, mutaciones y mejoras de performance.

**Ejemplo:** `{Estado duplicado: filtros en URL + store + componente -> inconsistencia}`, `{useSelector en lista sin selectors memoizados -> 500 re-renders por acción}`

---

## 20. Revisión de Seguridad en Dependencias

**[Code Review]**

```
Revisa la seguridad del supply chain de {proyecto}.

Análisis de dependencias:

1. **Vulnerabilidades conocidas**:
   - Resultados de: {npm audit / cargo audit / snyk / trivy / dependabot}

2. **Dependencias maliciosas**:
   - TypoSquatting: paquetes con nombres similares a populares
   - Dependency Confusion: paquetes privados con mismo nombre que públicos
   - Paquetes con maintainers nuevos/desconocidos
   - Paquetes con pocas descargas pero amplio scope

3. **Licencias**: {verificar licencias incompatibles}

4. **Análisis de Supply Chain**:
   - Package-lock / yarn.lock / Cargo.lock en git?
   - Firmas de releases verificables?
   - Reproducible builds?
   - SBOM generado?

5. **Dependencias Directas vs Transitivas**:
   - Árbol de dependencias grande -> mayor superficie de ataque
   - Dependencias sin actualizar en > {X} meses
   - Dependencias que requieren build nativo (binarios, C bindings)

6. **Hardening**:
   - npm: `ignore-scripts=true` para evitar postinstall malicioso
   - npm: `audit` en CI con fail on critical
   - Dependabot / Renovate configurado para PRs automáticos
   - Package signing verification
   - Verified publisher (npm)
   - GitHub: Dependabot alerts + secret scanning

Recomendaciones: remediar, reemplazar, monitorizar.
```

**Formato de salida:** Reporte de supply chain security con CVEs, recomiendaciones y hardening.

**Ejemplo:** `{event-stream package comprometido -> afecta dependencia transitiva}`, `{npm audit: 3 critical, 5 high, 8 moderate}`

---

## 21. Revisión de Documentación en Código

**[Code Review]**

```
Revisa la documentación/documentación en el código.

Código:
```{lenguaje}
{código_a_revisar}
```

Evaluar:

1. **Docstrings / JSDoc**:
   - Funciones públicas sin documentación
   - Parámetros no documentados
   - Return type no documentado
   - Excepciones no documentadas
   - Documentación desactualizada (no refleja el código actual)
   - Documentación tipo "Getter for x" (obvio, no añade valor)

2. **Comentarios de Código**:
   - Comentarios que explican "qué" en vez de "por qué"
   - Código comentado (debe ser eliminado)
   - TODO/FIXME/HACK sin issue o fecha
   - Comentarios incorrectos (no coinciden con el código)
   - Over-commenting: cada línea tiene comentario

3. **Nombrado como documentación**:
   - Nombres de variables/funciones auto-documentados
   - Tests como documentación viva
   - Tipos como documentación (TypeScript, Flow, mypy)

4. **README / Docs externas**:
   - README desactualizado
   - Ejemplos que no funcionan (sintaxis incorrecta)
   - Enlaces rotos

5. **Documentación de arquitectura**:
   - ADRs faltantes para decisiones importantes
   - Diagramas desactualizados (C4 model)
   - API docs incompletas

Recomendaciones:
- Qué docs añadir
- Qué docs actualizar
- Qué comentarios eliminar
- Estrategia: documentation as code (docs generados de código)
```

**Formato de salida:** Reporte de documentación con carencias, desactualizaciones y mejoras.

**Ejemplo:** `{@param name El nombre del usuario -> obvio}`, `{TODO: fix this -> TODO(#1234): handle pagination edge case when cursor is null}`

---

## 22. Revisión de Código de Terceros / Fork

**[Code Review]**

```
Revisa el código de {libería/fork/parche} antes de integrarlo.

Código a revisar:
```{lenguaje}
{código_de_terceros}
```

Propósito: {para_qué_se_necesita}
Alternativas: {otras_opciones_consideradas}

Evaluar:

1. **Seguridad**:
   - Análisis rápido de código malicioso (eval, exec, base64, crypto mining)
   - Conexiones a servidores externos (URLs hardcodeadas, telemetry)
   - Acceso a sistema de archivos, red, procesos
   - Permisos elevados solicitados (sudo, cap_sys_admin)

2. **Calidad del Código**:
   - Tests existentes? Pasan?
   - Estilo de código: legible y mantenible?
   - Manejo de errores: adecuado?
   - Dependencias del fork: actualizadas?

3. **Mantenimiento**:
   - Último commit: fecha
   - Maintainer: activo?
   - Issues: respuesta y resolución
   - Versiones estables? Releases?

4. **Licencia**: {compatible con nuestro proyecto?}

5. **Impacto**:
   - Tamaño: {X} líneas, {Y}KB
   - Dependencias que introduce: {lista}
   - Cambios en bundle size, build time
   - Runtime impact: memory, startup time, CPU

6. **Integración**:
   - API surface: limpia, documentada, tipada?
   - Fácil de reemplazar en el futuro?
   - Overhead de integración: config, setup, init
   - Posibilidad de mantener parche propio si el fork se abandona

Veredicto: integrar / no integrar / integrar con modificaciones.
```

**Formato de salida:** Reporte de evaluación de código de terceros con riesgos y recomendación final.

**Ejemplo:** `{fork de librería de parsing XML}`, `{2 CVEs fijadas, tests pasan, última actualización hace 3 meses, 50KB}`
