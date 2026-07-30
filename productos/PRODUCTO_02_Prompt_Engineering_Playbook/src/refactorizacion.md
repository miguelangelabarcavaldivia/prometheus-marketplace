# Refactorización

> 22 prompts para migración, optimización, simplificación y modernización de código.

---

## 1. Refactorizar Función Monolítica

**[Refactorización]**

```
Refactoriza la siguiente función monolítica siguiendo el principio de Single Responsibility.

Código original:
```{lenguaje}
{código_función_monolítica}
```

Problemas identificados:
- {demasiadas_responsabilidades}
- {alto_acoplamiento}
- {baja_cohesión}
- {dificultad_de_testear}
- {dificultad_de_leer}

Requerimientos:
1. Divide en funciones/métodos más pequeños con una sola responsabilidad
2. Nombres descriptivos para cada nueva función
3. Mantén la misma interfaz pública (mismos parámetros de entrada/salida)
4. Preserva el comportamiento exacto
5. Extrae condiciones complejas a funciones con nombre
6. Reduce el nivel de anidamiento (early return, guard clauses)
7. Haz que cada sub-función sea testeable individualmente

Proporciona:
- Código refactorizado
- Tests para cada sub-función
- Comparación de complejidad ciclomática (antes vs después)
```

**Formato de salida:** Código refactorizado + tests + métricas de mejora.

**Ejemplo:** Función de 150 líneas que valida, busca, calcula descuento, aplica IVA, notifica y registra -> 6 funciones separadas.

---

## 2. Migración de JavaScript a TypeScript

**[Refactorización]**

```
Migra el siguiente código JavaScript a TypeScript con tipos estrictos.

Código JS:
```javascript
{código_js_a_migrar}
```

Requisitos:
- strictNullChecks: true
- noImplicitAny: true
- Tipar todos los parámetros y retornos
- Interfaces para objetos complejos
- Union types para valores con múltiples tipos posibles
- Generics donde sea apropiado
- Type guards para narrowing
- Eliminar cualquier uso de `any` (justificar si realmente necesario)
- Readonly para propiedades que no cambian
- Optional properties (?.) donde aplica
- Null/undefined handling explícito

Proporciona:
- Código TypeScript resultante
- Archivo de tipos separado (.d.ts o types.ts) si hay tipos compartidos
- tsconfig.json con configuración strict
- Errores comunes de migración y cómo se resolvieron
- Comprobación de que la API pública no cambia
```

**Formato de salida:** Código TypeScript completo + types + tsconfig.

**Ejemplo:** Función JS `function process(data, config)` -> `function process<T>(data: T, config: Config): Result`

---

## 3. Refactorizar con Patrones de Diseño

**[Refactorización]**

```
Aplica el patrón {nombre_patrón} para refactorizar el siguiente código.

Código actual:
```{lenguaje}
{código_actual}
```

Problema que resuelve el patrón:
{descripción_del_problema}

Patrón a aplicar: {Strategy / Factory / Observer / Decorator / Chain of Responsibility / Template Method}

Instrucciones:
1. Identifica dónde el patrón resuelve el problema específico
2. Implementa la estructura del patrón (interfaces, clases base, implementaciones concretas)
3. Refactoriza el código existente para usar el patrón
4. Mantén la funcionalidad exacta (no cambiar comportamiento)
5. Asegura que el código siga siendo testeable
6. Documenta por qué este patrón es apropiado aquí

Proporciona:
- Diagrama de clases/textual del patrón aplicado
- Código refactorizado
- Comparación: antes (switch/if-else) vs después (polimorfismo)
- Tests para validar que el comportamiento no cambió
- Cuándo sería apropiado NO usar este patrón (YAGNI)
```

**Formato de salida:** Código refactorizado con patrón + diagrama + tests de comportamiento.

**Ejemplo:** `{10 if-else para diferentes formatos de exportación -> Strategy Pattern con ExportStrategy interface y implementaciones concretas}`

---

## 4. Optimización de Rendimiento

**[Refactorización]**

```
Optimiza el siguiente código para mejorar su rendimiento.

Código original:
```{lenguaje}
{código_a_optimizar}
```

Métrica objetivo: {reducir latencia de X a Y ms / reducir uso de memoria de X a Y MB / aumentar throughput de X a Y rps}
Contexto de uso: {se_ejecuta_N_veces_por_segundo / datos_típicos_de_entrada}

Análisis realizado:
- Cuello de botella identificado: {CPU / memoria / I/O / red / DB}
- Baseline actual: {métrica_actual}
- Target: {métrica_objetivo}

Optimizaciones a considerar (ordenadas por impacto):
1. Algoritmos: mejorar complejidad (O(n²) -> O(n log n))
2. Estructuras de datos: array -> Set, object -> Map
3. Caché: memoization de resultados costosos
4. Lazy evaluation: no calcular hasta necesario
5. Loop optimizations: reducir work inside loops, early break
6. Evitar allocations innecesarias (object pooling, reutilizar buffers)
7. Async: operaciones I/O concurrentes vs secuenciales
8. Batch: operaciones individuales vs batch

Proporciona:
- Código optimizado
- Benchmark (antes vs después)
- Análisis de memoria (heap snapshot antes/después)
- Trade-offs de la optimización (legibilidad, mantenibilidad)
```
**Formato de salida:** Código optimizado + benchmarks + análisis de trade-offs.

**Ejemplo:** `{procesamiento de 10k items: O(n²) -> O(n) con Map, 45s -> 200ms}`

---

## 5. Simplificación de Condicionales Complejos

**[Refactorización]**

```
Simplifica las siguientes condicionales complejas en el código.

Código:
```{lenguaje}
{código_con_condicionales_complejos}
```

Técnicas a aplicar:
1. **Guard Clauses**: early return para casos edge
2. **Switch/Map**: reemplazar if-else cadena con objeto/map lookup
3. **Polimorfismo**: reemplazar type-checking con métodos polimórficos
4. **Estrategia**: extraer condicionales complejas a funciones con nombre
5. **Decomposition**: dividir condición compuesta en partes con nombre
6. **Ternary**: simplificar asignaciones condicionales simples
7. **Optional chaining**: `a?.b?.c` en vez de `a && a.b && a.b.c`
8. **Nullish coalescing**: `a ?? defaultValue` en vez de `a !== null ? a : defaultValue`
9. **Positive condition**: condiciones positivas primero (if (isValid) en vez de if (!isInvalid))
10. **Table-driven methods**: lookup tables para lógica condicional

Requisitos:
- Preservar comportamiento exacto
- Reducir nesting máximo a {X} niveles
- Mejorar legibilidad (otra persona debe entenderlo rápido)
- Añadir tipos/interfaces si facilita la legibilidad

Proporciona:
- Código antes/después
- Complejidad ciclomática antes y después
- Explicación de cada transformación aplicada
- Tests de regresión
```

**Formato de salida:** Código simplificado + métricas + tests.

**Ejemplo:** `{7 if-else anidados para validar pedido -> 5 guard clauses + 1 función principal}`

---

## 6. Refactorizar Callback Hell a Async/Await

**[Refactorización]**

```
Refactoriza el siguiente código con callbacks anidados (callback hell) a async/await.

Código original:
```{lenguaje}
{código_con_callbacks}
```

Problemas del código actual:
- {anidamiento_profundo}
- {manejo_de_errores_disperso}
- {dificultad_de_leer_el_flujo}
- {difícil_añadir_nueva_lógica}

Pasos de refactorización:
1. Identificar operaciones asíncronas secuenciales vs paralelas
2. Convertir cada callback a función que retorna Promise
3. Usar async/await para flujo secuencial
4. Usar Promise.all() para operaciones paralelas
5. Manejo de errores centralizado con try-catch
6. Extraer operaciones reutilizables a funciones async
7. Considerar: Promise.allSettled vs Promise.all, Promise.race, AbortController

Requisitos:
- Preservar orden de ejecución (si es importante)
- No introducir race conditions
- Manejar errores apropiadamente (no silenciar)
- Timeout para operaciones que puedan colgarse
- Tests que verifiquen el flujo secuencial y paralelo

Proporciona:
- Código refactorizado con async/await
- Prueba de que el comportamiento es idéntico
- Manejo de errores comparado (antes vs después)
```
**Formato de salida:** Código async/await + tests de flujo.

**Ejemplo:** `{3 callbacks anidados: getUsuario -> getPedidos -> getDetalles -> 3 awaits secuenciales}`

---

## 7. Extracción de Módulo / Servicio

**[Refactorización]**

```
Extrae {funcionalidad} del código actual a un módulo/servicio independiente.

Código original:
```{lenguaje}
{código_actual_con_funcionalidad_embebida}
```

Funcionalidad a extraer: {descripción}
Dependencias actuales: {de_qué_depende_dentro_del_código_original}
Interfaz propuesta: {API_del_nuevo_módulo}

Requisitos:
1. Crear nuevo archivo/módulo con responsabilidad única
2. Definir interfaz clara (funciones/exportaciones)
3. Inyectar dependencias (no importar directamente)
4. Mover lógica y datos relacionados
5. Mantener compatibilidad: el código original debe funcionar igual
6. Tests para el nuevo módulo de forma aislada
7. Documentación de la API del módulo

Proporciona:
- Código del nuevo módulo
- Código original modificado (usando el nuevo módulo)
- Tests del módulo aislado
- Diagrama de dependencias antes/después
- Análisis de acoplamiento (antes: alto, después: bajo)
```

**Formato de salida:** Módulo extraído + código actualizado + tests + diagrama.

**Ejemplo:** `{UserController contiene lógica de envío de emails -> extraer EmailService}`

---

## 8. Refactorización de Herencia a Composición

**[Refactorización]**

```
Refactoriza la jerarquía de herencia a composición.

Código actual:
```{lenguaje}
{código_con_jerarquía_de_herencia}
```

Problemas de la herencia actual:
- {fragile_base_class: cambios en base afectan a todas las subclases}
- {deep_hierarchy: más de 3 niveles de herencia}
- {subclases que no usan todo de la base}
- {dificultad_de_testear_la_base_aisladamente}
- {deadly_diamond: herencia múltiple problemática}

Principios a aplicar:
- Favor composition over inheritance
- Extraer interfaces/contratos
- Estrategias para cada caso:
  - Comportamiento compartido -> traits/mixins/interfaces con default
  - Estado compartido -> composición de objetos
  - Polimorfismo -> interfaces + inyección de dependencias
  - Template Method -> Strategy pattern

Proporciona:
- Código refactorizado usando composición
- Interfaces y tipos resultantes
- Tests que verifiquen mismo comportamiento
- Comparación: líneas de código, acoplamiento, testeabilidad
```

**Formato de salida:** Código con composición + interfaces + tests + métricas.

**Ejemplo:** `{Vehicle -> Car, Truck, Motorcycle} con métodos comunes en Vehicle -> {interfaz Vehicle + traits Driveable, Cargo, Passenger}`

---

## 9. Limpieza de Código Muerto

**[Refactorización]**

```
Identifica y elimina código muerto en el siguiente módulo/proyecto.

Código:
```{lenguaje}
{código_a_analizar}
```

Tipos de código muerto a buscar:
1. **Funciones/variables no usadas** - nunca llamadas/referenciadas
2. **Código comentado** - debe ser eliminado
3. **Exports no importados** - en otros archivos del proyecto
4. **Parámetros no usados** - en funciones/métodos
5. **Variables asignadas pero no leídas** - dead store
6. **Ramificación muerta** - if/else o switch cases que nunca se ejecutan
7. **Código unreachable** - después de return/break/throw
8. **Clases/componentes no instanciados/usados**
9. **Dependencias no utilizadas** - en package.json
10. **Archivos enteros no referenciados**
11. **Código de feature eliminada pero no limpiado**

Procedimiento:
1. Marcar cada pieza de código muerto con su tipo
2. Verificar si realmente no se usa (búsqueda en todo el proyecto)
3. Eliminar el código muerto (no comentar)
4. Ejecutar todos los tests para asegurar que nada se rompe
5. Ejecutar linter y typechecker post-eliminación
6. Actualizar dependencias si algún paquete ya no se necesita

Proporciona:
- Lista de código eliminado (con líneas y razón)
- Código limpio resultante
- % de código eliminado del total
- Impacto en tamaño de bundle/build
```

**Formato de salida:** Reporte de código muerto + código limpiado + métricas.

**Ejemplo:** `{3 funciones no usadas, 50 líneas comentadas, 1 dependencia no usada -> 8% del código eliminado}`

---

## 10. Refactorización de Estado Global a Local

**[Refactorización]**

```
Refactoriza el estado global a estado local donde sea apropiado.

Código:
```{lenguaje}
{código_con_estado_global}
```

Estado global actual: {store_name} ({tamaño, número_de_selectores, número_de_actualizaciones})

Análisis de cada slice/feature:
1. **Estado que debe ser global**:
   - {user_auth}: usado por toda la app
   - {theme}: persistente
   - {notifications}: múltiples componentes

2. **Estado que puede ser local**:
   - {form_state}: solo usado en una página
   - {modal_open}: solo usado en componente
   - {dropdown_open}: estado UI local
   - {temporary_data}: solo necesario durante un flujo

3. **Estado que puede ser URL**:
   - {filters}: compartible por URL
   - {current_page}: navegación
   - {selected_tab}: bookmarkable

4. **Server state que no debe ir a store global**:
   - {API_responses}: mejor con React Query/SWR
   - {cacheable_data}: con su propio caché y TTL

Para cada migración: mover estado -> actualizar componentes -> eliminar del store global.

Proporciona:
- Código refactorizado
- Store global antes/después (tamaño, renders)
- Performance: re-renders evitados
```**Formato de salida:** Estado global reducido + componentes con estado local + métricas de performance.

**Ejemplo:** `{Redux store de 50KB -> 20KB}`, `{25 slices -> 12 global + 8 local + 5 URL}`

---

## 11. Modernización de Código Legacy

**[Refactorización]**

```
Moderniza el siguiente código legacy usando características modernas del lenguaje.

Código legacy ({estilo_antiguo}):
```{lenguaje}
{código_legacy}
```

Características modernas a aplicar:

1. **ES6+/Moderno**:
   - `var` -> `const` / `let`
   - `function()` -> arrow functions (donde apropiado)
   - String concatenation -> template literals
   - `for` loop -> `for...of`, `.map()`, `.filter()`, `.reduce()`
   - `arguments` -> rest parameters (...args)
   - Callbacks -> Promises -> async/await
   - `if (obj.prop !== null && obj.prop !== undefined)` -> optional chaining
   - `||` default -> nullish coalescing `??`
   - Destructuring: array y objeto
   - Spread operator: `...obj`
   - Object literal shorthand: `{ nombre }` en vez de `{ nombre: nombre }`

2. **Estructuras**:
   - Clases (ES6) si aplica
   - Modules (import/export) en vez de IIFE/globals
   - Map/Set en vez de Object/Array para ciertos usos
   - Symbol/WeakMap para privacidad

3. **APIs modernas**:
   - `fetch` en vez de `XMLHttpRequest`
   - `Intl` para formato de fechas/números
   - `?.` y `??` para null safety
   - `Array.at()`, `Array.toSorted()`, `Array.toReversed()`

Requisitos:
- Compatibilidad con el runtime objetivo ({versión})
- Preservar comportamiento exacto
- Tests que validen equivalencia
- No cambiar la API pública

Proporciona:
- Código modernizado
- Comparación línea por línea (si es útil)
- Tests que verifican equivalencia
- Notas de migración si hay breaking changes
```

**Formato de salida:** Código modernizado + equivalencia verificada + tests.

**Ejemplo:** `{ES5 IIFE pattern con var y callbacks -> ES module con const/let y async/await}`

---

## 12. Refactorización de SQL Queries

**[Refactorización]**

```
Refactoriza las siguientes consultas SQL para mejorar rendimiento y legibilidad.

Consultas actuales:
```sql
{consultas_sql_actuales}
```

Problemas identificados:
- {rendimiento_lento / no_usa_índices / N+1 en ORM / subqueries_ineficientes}
- {legibilidad: mayúsculas/minúsculas inconsistente, sin formato}
- {mantenibilidad: lógica de negocio embebida en SQL}

Técnicas de refactorización:

1. **Rendimiento**:
   - SELECT * -> columnas específicas
   - Subqueries correlacionadas -> JOIN o CTE
   - OR -> IN o EXISTS
   - DISTINCT -> EXISTS (si es para validar existencia)
   - Funciones en WHERE (WHERE YEAR(fecha) = 2024) -> rango (WHERE fecha >= '2024-01-01')
   - Agregaciones con JOIN -> subquery en SELECT
   - UNION -> UNION ALL (si no necesitas distinct)

2. **Legibilidad**:
   - SQL formatting consistente (keywords mayúsculas)
   - CTEs (WITH) para queries complejas
   - Alias descriptivos
   - Comentarios en queries largas
   - Subqueries nombradas

3. **Mantenibilidad**:
   - Views para lógica compartida
   - Funciones/Procedures para lógica reutilizable
   - Migrar lógica de negocio desde SQL a código (si aplica)

Proporciona:
- SQL refactorizado
- EXPLAIN ANALYZE antes/después
- Sugerencias de índices adicionales
- Comparación de tiempo de ejecución
```

**Formato de salida:** SQL optimizado + EXPLAIN + índices sugeridos + benchmark.

**Ejemplo:** `{SELECT * con JOIN a 5 tablas -> columnas específicas + CTE + índices compuestos, 3.2s -> 120ms}`

---

## 13. Refactorización de Manejo de Errores

**[Refactorización]**

```
Refactoriza el manejo de errores en el siguiente código para hacerlo más robusto y mantenible.

Código actual:
```{lenguaje}
{código_con_manejo_de_errores}}
```

Problemas:
- {try-catch anidados}
- {errores silenciados: catch vacío}
- {errores genéricos: siempre 500, siempre "Error"}
- {falta de contexto en errores}
- {códigos de error inconsistentes}
- {logging insuficiente o excesivo}

Patrón a implementar: {Result type / Either monad / Custom exceptions / Error handling middleware}

Requisitos:
1. Definir tipos de error específicos del dominio
2. Error hierarchy: base -> específicos (NotFoundError, ValidationError, UnauthorizedError)
3. Mensajes de error: descriptivos, con contexto, sin datos sensibles
4. Propagación: errores checked (Result/Either) o middleware (excepciones)
5. Logging: nivel apropiado, stack trace, correlation ID
6. API responses: estructura consistente, status code correcto
7. Graceful degradation: no crash en errores no críticos
8. Testing: tests para cada tipo de error

Proporciona:
- Código refactorizado con manejo de errores mejorado
- Jerarquía de errores
- Middleware de error handling
- Tests de cada escenario de error
- Antes/después de mensajes de error
```

**Formato de salida:** Código con manejo de errores mejorado + jerarquía + tests.

**Ejemplo:** `{catch(e) { console.log(e); res.status(500).send('Error') } -> catch específico con contexto y status correcto}`

---

## 14. Refactorización de Estructura de Archivos / Módulos

**[Refactorización]**

```
Propón una reorganización de la estructura de archivos para mejorar la cohesión y reducir el acoplamiento.

Estructura actual:
```
{árbol_de_directorios_actual}
```

Problemas:
- {archivos_demasiado_grandes}
- {módulos_con_múltiples_responsabilidades}
- {dependencias_confusas}
- {nombres_de_archivo_poco_descriptivos}
- {mezcla_de_preocupaciones}

Principios:
1. **Organización por funcionalidad/feature** (no por tipo técnico)
   - `users/` (no `controllers/users.js` + `models/users.js` + `routes/users.js`)
   - Cada feature contiene: component, service, types, tests, styles

2. **Límites claros entre módulos**
   - Cada módulo tiene una responsabilidad única
   - API pública clara (index.ts/barrel export)
   - Dependencias visibles (no imports relativos profundos: ../../../)

3. **Tamaño de archivo razonable**
   - < {X} líneas por archivo (sugerencia 200-400)
   - Extraer a archivos más pequeños cuando excede

4. **Nombrado consistente**
   - kebab-case / PascalCase según framework
   - Archivo de test junto al código (co-location)

Proporciona:
- Nueva estructura de directorios
- Plan de migración (pasos ordenados, sin romper main)
- Mapa de dependencias antes/después
- Cómo mantener la estructura en el tiempo (linter rules, CODEOWNERS)
```
**Formato de salida:** Nueva estructura de archivos + plan de migración + mapa de dependencias.

**Ejemplo:** `{src/controllers/, src/models/, src/routes/ -> src/features/users/, src/features/orders/, src/shared/}`

---

## 15. Refactorización de Código Duplicado (DRY)

**[Refactorización]**

```
Elimina el código duplicado en los siguientes fragmentos aplicando DRY.

Código actual:
```{lenguaje}
{código_con_duplicación}
```

Fragmentos duplicados:
1. {ubicación_A}: {descripción_de_la_lógica_duplicada}
2. {ubicación_B}: {lógica_idéntica_o_muy_similar}
3. {ubicación_C}: {variante_con_pequeñas_diferencias}

Estrategias según el tipo de duplicación:

1. **Duplicación exacta**: extraer a función/método compartido
2. **Duplicación con variaciones**: 
   - Parámetros para las diferencias
   - Template Method pattern
   - Strategy pattern si la variación es grande
3. **Duplicación incidental** (misma expresión repetida):
   - Variable/constante con nombre
   - Helper function
4. **Duplicación en tests**:
   - Test fixtures compartidos
   - Factory functions
   - Parameterized tests
5. **Duplicación de configuración**:
   - Constantes compartidas
   - Archivo de configuración centralizado

Requisitos:
- No sobre-ingenierizar para 2 repeticiones (Rule of Three)
- Mantener legibilidad: extraer a función con nombre descriptivo
- Preservar tipos (TypeScript/flow)
- Tests para la nueva función compartida
- Buscar más duplicados similares en el proyecto

Proporciona:
- Código refactorizado sin duplicación
- Métrica: líneas eliminadas
- Tests para el nuevo código compartido
```
**Formato de salida:** Código sin duplicación + función compartida + tests.

**Ejemplo:** `{3 validaciones de email idénticas en diferentes módulos -> una función validateEmail() compartida}`

---

## 16. Migración de Framework / Librería

**[Refactorización]**

```
Planifica y ejecuta la migración de {framework_origen} a {framework_destino}.

Origen: {versión_actual}
Destino: {versión_destino}

Cambios principales:
{lista_de_breaking_changes_y_nuevas_features}

Estrategia de migración:

1. **Análisis de impacto**:
   - Archivos afectados: {X}
   - Dependencias que cambian: {lista}
   - API pública que cambia: {lista}
   - Tests que necesitan actualización: {X}

2. **Preparación**:
   - Feature flags para nuevo/deprecado
   - Deprecation warnings: periodo de coexistencia
   - Documentación de migración para el equipo
   - Branch de migración separada

3. **Cambios incrementales**:
   - {cambio_1}: afecta {archivos}, {estrategia}
   - {cambio_2}: afecta {archivos}, {estrategia}

4. **Por módulo** (no todo a la vez):
   - Feature flags para activar/desactivar cambios
   - Poder hacer rollback de cada cambio individual
   - Tests en cada paso intermedio

5. **Verificación**:
   - Tests existentes pasan
   - Smoke tests post-migración
   - Performance benchmark (no regresión)
   - Visual regression (si aplica UI)
   - Security scan (nuevas versiones, nuevas dependencias)

Proporciona:
- Plan de migración detallado
- Script de migración automática (si es posible)
- Código post-migración
- Rollback plan
- Timeline estimado
```
**Formato de salida:** Plan de migración + código migrado + scripts + rollback plan.

**Ejemplo:** `{Express 4 -> 5}`, `{breaking: error handling, app.del -> app.delete, middleware changes}`

---

## 17. Refactorización de Tipos (`any` a Tipos Específicos)

**[Refactorización]**

```
Refactoriza el uso de `any`/tipos genéricos a tipos específicos.

Código:
```{lenguaje}
{código_con_any}
```

Análisis de cada `any`:
| Línea | Uso actual | Tipo real | Estrategia |
|-------|------------|-----------|------------|
| {X} | `(data: any)` | `User | Order` | Union type |
| {Y} | `const result: any = ...` | `ApiResponse<T>` | Generic |
| {Z} | `obj: any` | `Record<string, unknown>` | Index signature |

Estrategias:
1. **any como parámetro**: definir tipo específico o genérico
2. **any como retorno**: tipar el retorno correctamente
3. **any para datos externos (JSON)**: validar con schema (Zod, yup) y derivar tipo
4. **any en colecciones**: `Array<any>` -> `Array<User>`, `Map<string, any>` -> `Map<ID, Entity>`
5. **any en callbacks/eventos**: tipar el evento específico
6. **any en tests**: evitar, tipar correctamente aunque sea parcial
7. **any de terceros sin tipos**: crear declaration files (.d.ts) o usar `@types/`

Herramientas:
- ESLint rule: `@typescript-eslint/no-explicit-any` (warn)
- strict mode en tsconfig
- type guards para narrowing

Proporciona:
- Código sin `any` (o con `any` justificado y comentado)
- Tipos creados o descubiertos
- ESLint config para prevenir regresión
```
**Formato de salida:** Código tipado + types + eslint config.

**Ejemplo:** `{function save(data: any): any -> function save<T extends Entity>(data: T): ApiResponse<T>}`

---

## 18. Refactorización de Estilo /Formato (Automated)

**[Refactorización]**

```
Define y aplica formateo y linting automatizado para el código base.

Configuración actual:
- Formatter: {ninguno / prettier / black / gofmt}
- Linter: {ninguno / eslint / ruff / pylint}

Configuración deseada:
- Formatter: {Prettier con reglas específicas}
- Linter: {ESLint con config específica}
- Orden de imports: {import-sort / isort / trivago}
- Husky / pre-commit hooks
- CI check: formato y lint

Reglas de formateo:
- Indentación: {2 espacios}
- Quotes: {simples / dobles}
- Semicolons: {siempre / cuando necesario}
- Trailing commas: {es5 / all / none}
- Print width: {100}
- Line endings: LF
- End of file: newline

Reglas de lint:
- Error: {reglas_estrictas_de_calidad}
- Warn: {reglas_de_estilo_preferidas}
- Off: {reglas_conflictivas_con_formatter}

Pasos:
1. Aplicar formatter a todo el código base
2. Aplicar autofix de linter
3. Revisar manualmente cambios que el linter no puede arreglar
4. Configurar pre-commit hook
5. Agregar paso de CI

Proporciona:
- Configuración de formatter + linter
- Pre-commit hook config
- CI step
- Script para aplicar a todo el proyecto
```
**Formato de salida:** Configuración de herramientas + hooks + CI.

**Ejemplo:** `{Prettier + ESLint + Husky + lint-staged}, {autofix en pre-commit, CI check en PR}`

---

## 19. Refactorización de Caché

**[Refactorización]**

```
Refactoriza la implementación de caché para mejorar consistencia y rendimiento.

Código actual:
```{lenguaje}
{código_de_caché_actual}
```

Problemas:
- {implementación_ad_hoc_en_cada_módulo}
- {inconsistencia_entre_módulos}
- {falta_de_invalidación_adecuada}
- {cache_stampede_no_manejado}
- {métricas_no_recolectadas}

Refactorización:

1. **Capa de abstracción unificada**:
   ```typescript
   interface CacheProvider {
     get<T>(key: string): Promise<T | null>;
     set<T>(key: string, value: T, ttl: number): Promise<void>;
     del(key: string): Promise<void>;
     delPattern(pattern: string): Promise<void>;
   }
   ```

2. **Implementaciones**: InMemoryCache, RedisCache, HybridCache (L1+L2)

3. **Estrategias por tipo de dato**:
   - Cache-Aside (lectura): get -> miss -> DB -> set -> return
   - Write-Through (escritura): write -> DB -> set
   - Write-Behind (escritura asíncrona): write -> set -> batch write to DB
   - Refresh-Ahead: refresh antes de expirar

4. **Cache Stampede prevention**:
   - Mutex lock para regeneración
   - Probabilistic early expiration
   - Stale-while-revalidate

5. **Invalidación**:
   - Tag-based: invalidar por etiqueta (user:123 -> invalida todo tagged "user:123")
   - Event-driven: publicar evento de invalidation
   - TTL como fallback

6. **Métricas**: hit ratio, latency, size, evictions

Los módulos existentes deben migrar a usar esta nueva capa.
```

**Formato de salida:** Capa de caché unificada + implementaciones + adaptadores de módulos existentes.

**Ejemplo:** `{3 implementaciones de caché ad hoc -> 1 interfaz CacheProvider + RedisCache + InMemoryCache}`

---

## 20. Refactorización de Seguridad

**[Refactorización]**

```
Refactoriza el código para mejorar la postura de seguridad.

Código:
```{lenguaje}
{código_a_mejorar_seguridad}
```

Vulnerabilidades identificadas:
{lista_de_issues_de_seguridad}

Mejoras a implementar:

1. **SQL Injection**: 
   - Strings concatenadas -> parameterized queries / ORM
   - Validar que no hay raw queries sin escapar

2. **XSS**:
   - Output encoding contextual
   - CSP headers
   - React dangerouslySetInnerHTML / v-html eliminados
   - Sanitización con DOMPurify si es necesario HTML

3. **Authentication**:
   - Passwords: bcrypt/argon2 con cost factor adecuado
   - JWT: algoritmo seguro (RS256/ES256), exp verificado, sin "none" algorithm
   - Sesiones: Secure, HttpOnly, SameSite cookies
   - Rate limiting en login, MFA, password reset

4. **Authorization**:
   - IDOR checks: verificar ownership en cada endpoint
   - Role-based access control consistente
   - Mass assignment prevention (whitelist fields)

5. **Data Protection**:
   - Secrets: mover a env/vault, hardcodeados eliminados
   - PII: no loggear datos personales
   - Encryption in transit: TLS forzado
   - Encryption at rest: datos sensibles cifrados

6. **Input Validation**:
   - Toda entrada externa validada (requests, files, headers)
   - File upload: tipo, tamaño, path traversal, content scan
   - SSRF prevention: validar URLs

Cada fix con su línea, vulnerabilidad y código corregido.
```
**Formato de salida:** Código corregido con seguridad + tests de seguridad + hardening checklist.

**Ejemplo:** `{SQL injection en GET /users?name= -> parámetro SQLAlchemy + validación input}`

---

## 21. Refactorización de Configuración a Externalizada

**[Refactorización]**

```
Refactoriza la configuración hardcodeada a configuración externalizada.

Código actual:
```{lenguaje}
{código_con_config_hardcodeada}
```

Tipos de configuración encontrados:

1. **Valores hardcodeados**:
   | Valor | Ubicación | Tipo | Propuesta |
   |-------|-----------|------|-----------|
   | `{valor}` | `{archivo:línea}` | {URL / timeout / límite / texto} | `{variable}` |

2. **Magic strings/numbers**:
   - `{valor}` en `{ubicación}` -> constante con nombre
   - `{valor}` en `{ubicación}` -> variable de entorno o config file

Estrategia de externalización:

1. **Por nivel de sensibilidad**:
   - No sensible, mismo valor en todos los entornos: constantes en código
   - Varía por entorno: variables de entorno
   - Estructural (arrays, objetos complejos): archivo de configuración (YAML/JSON)
   - Sensible (secrets): vault / secrets manager

2. **Formato**:
   - `.env` para variables de entorno
   - `config.{env}.yaml` para config estructural
   - `secrets` en vault con Referencias en config

3. **Acceso**:
   - Config object centralizado con validación al startup
   - Tipado: interfaz para la configuración
   - Defaults: valores por defecto documentados
   - Validación: crash early si falta config requerida

4. **Migración**:
   - Reemplazar cada hardcode con acceso a config centralizada
   - Tests: verificar que los valores se leen correctamente
   - Documentación: todas las opciones de configuración

Proporciona:
- Código refactorizado usando configuración externalizada
- Archivos de configuración (.env, config.yaml, secrets template)
- Validación de configuración al startup
- Documentación de todas las opciones
```
**Formato de salida:** Configuración externalizada + validador + docs.

**Ejemplo:** `{URL de API externa hardcodeada -> API_EXTERNAL_URL en .env + validación + tipado}`

---

## 22. Refactorización de Logging

**[Refactorización]**

```
Refactoriza el sistema de logging del proyecto para hacerlo estructurado, consistente y útil.

Código actual:
```{lenguaje}
{código_con_logging_actual}
```

Problemas:
- {console.log / print mezclados con logging formal}
- {mensajes inconsistentes (formato, nivel, contexto)}
- {datos sensibles en logs}
- {demasiado ruido (info excesivo)}
- {poco contexto en errores}
- {logging síncrono en hot path}

Refactorización:

1. **Librería unificada**:
   - {pino / winston / structlog / serilog}
   - Config: level por entorno, formato (JSON en prod, pretty en dev)

2. **Formato estructurado**:
   ```json
   {
     "level": "error",
     "time": "2024-01-01T00:00:00.000Z",
     "msg": "Database connection failed",
     "service": "user-service",
     "trace_id": "abc123",
     "user_id": "user_789",
     "error": { "message": "Connection refused", "stack": "..." },
     "duration_ms": 5000,
     "db_host": "postgres-prod.internal"
   }
   ```

3. **Campos obligatorios**:
   - timestamp (ISO 8601), level, message, service
   - trace_id, span_id (distributed tracing)
   - environment (development, staging, production)

4. **Helpers de logging**:
   - `log.info({ userId, action }, 'User action')` en vez de `log.info('User ' + userId + ' performed ' + action)`
   - Redact sensitive fields automáticamente (password, token, ssn, cc)
   - Métricas de logging (counts by level, service)

5. **Middleware de logging**:
   - HTTP request/response logging automático
   - Error handling middleware que loggea con contexto
   - Performance logging (request duration)

6. **Migración**:
   - Reemplazar todos los console.log/print
   - Actualizar mensajes a formato estructurado
   - Añadir contexto faltante
   - Tests de logging (verificar que se loggea lo correcto)

Proporciona:
- Sistema de logging refactorizado
- Migración de todo el código base
- Middleware HTTP
- Redact de datos sensibles
- Tests de logging
```
**Formato de salida:** Sistema de logging estructurado + migración + middleware + tests.

**Ejemplo:** `{30 console.log y 5 winston inconsistente -> pino unificado con JSON structured, redact de PII, middleware HTTP}`
