# Bases de Datos

> 18 prompts para SQL, diseño de esquemas, optimización y migraciones.

---

## 1. Consulta SQL con Múltiples Joins

**[Bases de Datos]**

```
Escribe una consulta SQL que obtenga los siguientes datos combinando {N} tablas:

Requisito de negocio: {descripción_del_reporte_o_consulta}

Tablas disponibles:
- `{tabla1}`: {campos_clave}
- `{tabla2}`: {campos_clave}, FK: {tabla1}.id -> {tabla2}.{tabla1}_id
- `{tabla3}`: {campos_clave}, FK: {tabla2}.id -> {tabla3}.{tabla2}_id

Campos a devolver:
{lista_de_campos_con_alias}

Condiciones:
- {filtro_fecha}
- {filtro_estado}
- {excluir_registros_con}

Orden: {campo_orden} {ASC/DESC}
Límite: {N} registros

Incluye:
- Versión con INNER JOIN
- Versión con LEFT JOIN (para incluir registros sin relación)
- Versión con CTE para mejor legibilidad
- Índices sugeridos para optimizar esta consulta
- EXPLAIN ANALYZE estimado
```

**Formato de salida:** SQL completo + índices sugeridos + análisis de rendimiento.

**Ejemplo:** `{Pedidos por cliente con detalles de producto y vendedor}`, `{clientes, pedidos, pedidos_items, productos, vendedores}`

---

## 2. Diseño de Schema para Nueva Feature

**[Bases de Datos]**

```
Diseña el esquema de base de datos para la siguiente feature:

Feature: {descripción_de_la_funcionalidad}
Entidades principales:
{lista_de_entidades_con_sus_atributos}

Requerimientos:
- {relaciones_entre_entidades}
- {reglas_de_negocio}
- {volumen_estimado}: {X} registros/día
- {patrones_de_acceso}: {lectura_pesada / escritura_frecuente / mixto}
- {requisitos_de_consistencia}: {fuerte / eventual}
- {requisitos_de_auditoría}: {historial_de_cambios necesario / no necesario}

Proporciona:
1. DDL completo:
   - Tablas con tipos de datos precisos (no VARCHAR(255) genérico)
   - PKs, FKs, UNIQUE constraints, CHECK constraints
   - Índices: clustered, non-clustered, compuestos, cubrientes
   - Default values y NULL/NOT NULL
   - Particionamiento (si aplica)

2. Diagrama entidad-relación (textual/Mermaid)

3. Consideraciones:
   - Políticas de borrado: CASCADE / SET NULL / RESTRICT
   - Soft-delete vs hard-delete
   - Versionado de datos (si aplica)
   - Estrategia de indexación para queries esperadas
```

**Formato de salida:** DDL completo + diagrama + índices + justificaciones.

**Ejemplo:** `{Sistema de reviews de productos}`, `{entidades: reviews, review_votes, review_images, moderation_log}`

---

## 3. Optimización de Consulta Lenta

**[Bases de Datos]**

```
Optimiza la siguiente consulta SQL que está causando lentitud.

Consulta actual:
```sql
{consulta_lenta}
```

Tiempo de ejecución actual: {X} ms
EXPLAIN ANALYZE actual:
```
{explain_actual}
```

Contexto:
- Tamaño de tablas:
  - `{tabla1}`: {X} filas, {Y} MB
  - `{tabla2}`: {X} filas, {Y} MB
- Frecuencia: se ejecuta {X} veces/{segundo/minuto/hora}
- SLAs: debe ejecutarse en < {X} ms

Análisis:
1. **Scan type**: {Seq Scan / Index Scan / Bitmap Scan} - cual es el bottleneck
2. **Join type**: {Nested Loop / Hash Join / Merge Join} - cual es el más lento
3. **Sort/Materialize**: operaciones costosas innecesarias
4. **Filter**: dónde se aplican y si pueden ser indexados

Sugiere:
- Índices faltantes (con DDL exacto)
- Reescribir la consulta (subquery -> JOIN, OR -> UNION, funciones en WHERE)
- Denormalización (si aplica)
- Materialized views (si los datos cambian poco)
- Particionamiento (si la tabla es muy grande)

Proporciona:
- Consulta optimizada
- Nuevos índices (DDL)
- EXPLAIN ANALYZE estimado post-optimización
- Tiempo estimado post-optimización
```
**Formato de salida:** Consulta optimizada + índices + EXPLAIN comparativo.

**Ejemplo:** `{Seq Scan en tabla de 5M filas -> Index Scan con índice compuesto}`, `{3.2s -> 45ms}`

---

## 4. Generación de Migración Segura

**[Bases de Datos]**

```
Genera una migración de base de datos para el siguiente cambio:

Cambio: {descripción del cambio: add column, rename table, etc.}
Motor: {PostgreSQL / MySQL / SQL Server}
Herramienta de migraciones: {Alembic / Flyway / EF Core / Prisma Migrate}

Caso: {especificación_del_cambio}

La migración debe incluir:

1. **Forward migration** (up):
   ```sql
   -- Comandos DDL
   ```

2. **Rollback migration** (down):
   ```sql
   -- Reversión exacta
   ```

3. **Consideraciones de seguridad**:
   - La migración debe ser reversible sin pérdida de datos
   - Usar transacción (BEGIN/COMMIT) si el motor lo permite
   - Para tablas grandes: batch processing, no lock toda la tabla
   - Para rename: crear columna nueva, copiar datos, drop old
   - Para add column NOT NULL: proporcionar DEFAULT
   - Para drop column: verificar que no hay dependencias

4. **Verificación**:
   - SELECT para verificar datos antes/después
   - Verificar constraints e índices
   - Test de rollback: aplicar y revertir

5. **Data migration** (si cambia el significado de datos):
   - UPDATE statement para transformar datos existentes
   - Batch: procesar de a {X} registros con WAITFOR DELAY
   - Sin lock: hacer en ventana de mantenimiento

Proporciona:
- Script de migración up/down
- Data migration (si aplica)
- Verificaciones pre/post migración
- Rollback plan
- Tiempo estimado de ejecución
```
**Formato de salida:** Migración segura + rollback + verificación.

**Ejemplo:** `{Rename columna 'username' a 'login' en tabla 'users' (5M filas), con rollback y verificación}`

---

## 5. Query de Agregación Compleja

**[Bases de Datos]**

```
Crea una consulta SQL que realice las siguientes agregaciones:

Requerimiento: {descripción_del_informe_o_métrica}

Datos:
- Tabla(s): {tabla(s)} 
- Período: {rango_de_fechas}
- Granularidad: {hora / día / semana / mes}
- Dimensiones: {agrupar_por: región, producto, categoría}
- Métricas: {SUM, AVG, COUNT, COUNT DISTINCT, MIN, MAX, PERCENTILE}

Además:
- Totales y subtotales (ROLLUP / CUBE / GROUPING SETS)
- Comparativa con período anterior (LAG)
- Running total (ventana SUM OVER)
- Ranking (ROW_NUMBER, RANK, DENSE_RANK)
- Moving average (ventana AVG OVER)
- % del total (SUM OVER() / SUM OVER(PARTITION BY))
- YTD, MTD, QTD totals

Incluye versiones optimizadas:
- Con CTE para legibilidad
- Con subquery para debugging
- Con window functions para eficiencia

Sugiere índices y particionamiento para soportar el reporte.
```

**Formato de salida:** SQL de agregación + índices sugeridos + ejemplo de salida.

**Ejemplo:** `{Ventas por día, producto y región con comparativa vs mes anterior, running total YTD, ranking top 10 productos}`

---

## 6. Estrategia de Indexación

**[Bases de Datos]**

```
Diseña una estrategia de indexación para la tabla `{nombre_tabla}`.

Motor: {PostgreSQL / MySQL / SQL Server}

Información de la tabla:
- Filas: {X} millones
- Tamaño: {X} GB
- Columnas:
  {lista_columnas_con_tipos_y_cardinalidad}
- Tasa de escritura: {X} inserts/updates/segundo
- Tasa de lectura: {X} selects/segundo

Queries más frecuentes (top 5):
```sql
{query_1}
{query_2}
{query_3}
{query_4}
{query_5}
```

Queries lentas identificadas:
```sql
{queries_lentas}
```

Recomendaciones:

1. **Índices existentes**:
   - Útiles: {índices_que_se_usan}
   - Redundantes: {índices_duplicados_o_solapados}
   - No usados: {índices_nunca_usados -> considerar drop}
   - Fragmentados: {índices_con_fragmentación > X% -> rebuild}

2. **Nuevos índices**:
   - Índices compuestos: columnas en orden correcto (cardinalidad descendente)
   - Índices cubrientes (covering index): incluir columnas SELECT
   - Índices parciales: WHERE condicion (PostgreSQL)
   - Índices funcionales: LOWER(email), EXTRACT(YEAR FROM fecha)
   - Índices descendentes para ORDER BY DESC
   - Include columns (SQL Server) para covering index sin afectar key

3. **Impacto**:
   - En reads: mejora esperada
   - En writes: overhead de mantener índice
   - En storage: espacio adicional requerido

Proporciona:
- DDL de índices a crear
- DDL de índices redundantes a eliminar
- Script de monitoreo de uso de índices
- Estrategia de mantenimiento (reindex, vacuum, update stats)
```
**Formato de salida:** Estrategia de indexación + DDL + monitoreo.

**Ejemplo:** `{tabla pedidos (10M filas), índice compuesto (cliente_id, fecha DESC) incluyendo total y estado}`

---

## 7. Query de Paginación Eficiente

**[Bases de Datos]**

```
Genera una consulta de paginación eficiente para {tabla/recurso}.

Motor: {PostgreSQL / MySQL / SQL Server}
Orden: {campo_orden} {ASC/DESC}
Tamaño de página: {X} registros

Estrategias (incluir todas):

1. **Offset-based** (estándar pero lento en páginas profundas):
   ```sql
   SELECT * FROM {tabla}
   ORDER BY {campo_orden}
   LIMIT {tamaño} OFFSET {offset};
   ```

2. **Cursor-based / Keyset pagination** (rápido en páginas profundas):
   ```sql
   SELECT * FROM {tabla}
   WHERE {campo_orden} > {último_valor_visto}
   ORDER BY {campo_orden}
   LIMIT {tamaño};
   ```

3. **Seek method** (para orden por múltiples campos):
   ```sql
   SELECT * FROM {tabla}
   WHERE ({campo1}, {campo2}) > ({valor1}, {valor2})
   ORDER BY {campo1}, {campo2}
   LIMIT {tamaño};
   ```

Comparación:
- Ventajas/desventajas de cada método
- Cuándo usar cada uno
- Performance en página 1 vs página 100 vs página 10000
- Manejo de inserción durante paginación (consistencia)
- API: devolver cursor/token en vez de page number

Incluye:
- Índice necesario para keyset pagination
- API response format
- Ejemplo de uso en backend
```
**Formato de salida:** Queries de paginación + índices + API format + comparativa.

**Ejemplo:** `{GET /api/products?cursor=eyJsYXN0X2lkIjoxMDB9}`, `{keyset pagination, sorted by (price, id)}`

---

## 8. Consulta de Detección de Anomalías

**[Bases de Datos]**

```
Crea consultas SQL para detectar anomalías en los datos.

Tablas: {tablas_involucradas}
Período: {últimos_X_días}

Anomalías a detectar:

1. **Datos duplicados**:
   ```sql
   -- Encontrar duplicados por {campo_unique}
   ```

2. **Huérfanos** (registros sin padre):
   ```sql
   -- Encontrar {tabla_hija} sin {tabla_padre} correspondiente
   ```

3. **Valores fuera de rango**:
   ```sql
   -- {campo_numérico} fuera de {rango_esperado}
   ```

4. **Inconsistencias temporales**:
   ```sql
   -- {fecha_inicio} > {fecha_fin}
   ```

5. **Datos faltantes**:
   ```sql
   -- Registros donde {campo_requerido} IS NULL
   ```

6. **Cardinalidad inesperada**:
   ```sql
   -- Relaciones 1:N que deberían ser 1:1 pero tienen N > 1
   ```

7. **Patrones sospechosos**:
   - {múltiples registros desde misma IP en {X} minutos}
   - {cambios de contraseña frecuentes en misma cuenta}
   - {órdenes con descuentos sospechosos}

8. **Regresiones de datos**:
   ```sql
   -- Totales que disminuyen significativamente vs período anterior
   -- Tasa de error que aumenta
   ```

Incluye:
- Queries de detección
- Frecuencia de ejecución recomendada
- Acción sugerida para cada anomalía
- Alerta configurable por umbral
```
**Formato de salida:** Queries de detección + schedule + acciones sugeridas.

**Ejemplo:** `{Pedidos duplicados por mismo ID de transacción, usuarios con múltiples cuentas mismo email, productos sin categoría}`

---

## 9. Query Recursiva / CTE

**[Bases de Datos]**

```
Escribe una consulta SQL recursiva para navegar una estructura jerárquica.

Estructura: {tipo_jerarquía: árbol / grafo / lista_adyacencia}
Tabla: `{nombre_tabla}` con columnas: {id, parent_id, nombre, nivel, ...}
Motor: {PostgreSQL / MySQL 8+ / SQL Server}

Requerimiento:
{descripción_de_la_navegación_jerárquica}

Ejemplos de consultas recursivas:

1. **Árbol completo desde raíz**:
   ```sql
   WITH RECURSIVE tree AS (
     -- Anchor: raíz(es)
     SELECT id, parent_id, nombre, 1 as nivel, ARRAY[id] as path
     FROM {tabla} WHERE parent_id IS NULL
     UNION ALL
     -- Recursivo: hijos
     SELECT t.id, t.parent_id, t.nombre, tree.nivel + 1, tree.path || t.id
     FROM {tabla} t
     JOIN tree ON t.parent_id = tree.id
   )
   SELECT * FROM tree ORDER BY path;
   ```

2. **Ascendente (de hoja a raíz)**:
   ```sql
   -- Encontrar todos los ancestros de {id_específico}
   ```

3. **Path materializado**:
   ```sql
   -- Generar columna path para denormalización
   ```

4. **Conteo de subárbol**:
   ```sql
   -- Cantidad de nodos bajo cada nodo
   ```

5. **Nivel específico**:
   ```sql
   -- Todos los nodos en nivel {X}
   ```

Incluye:
- Índices para consultas jerárquicas (parent_id)
- Alternativas: Nested Sets, Materialized Path, Closure Table
- Performance: CTE recursiva vs alternativas
```
**Formato de salida:** Queries CTE recursivas + índices + alternativas.

**Ejemplo:** `{Categorías de productos (hasta 5 niveles), navegar desde categoría padre hasta todas las subcategorías}`

---

## 10. Query de Búsqueda Full-Text

**[Bases de Datos]**

```
Diseña una implementación de búsqueda full-text usando {motor_db}.

Motor: {PostgreSQL (tsvector) / MySQL (FULLTEXT) / SQL Server (FTS)}

Tabla: `{nombre_tabla}`
Campos a buscar: {título, descripción, contenido, tags, etc.}
Idioma: {español / inglés / multi-lengua}

Implementación:

1. **Índice full-text**:
   ```sql
   -- PostgreSQL
   CREATE INDEX idx_{tabla}_fts ON {tabla} USING GIN(to_tsvector('{idioma}', {campo}));
   ```

2. **Consulta de búsqueda**:
   ```sql
   SELECT {campos}, ts_rank(to_tsvector('{idioma}', {campo}), plainto_tsquery('{idioma}', '{query}')) as rank
   FROM {tabla}
   WHERE to_tsvector('{idioma}', {campo}) @@ plainto_tsquery('{idioma}', '{query}')
   ORDER BY rank DESC
   LIMIT {N};
   ```

3. **Características**:
   - Highlighting de resultados (ts_headline)
   - Sinónimos (thesaurus dictionary)
   - Búsqueda por prefijo
   - Búsqueda por frase exacta
   - Ranking: ts_rank, ts_rank_cd
   - Filtros combinados (categoría, precio, fecha)

4. **Optimizaciones**:
   - Columna vector generada (PostgreSQL 12+)
   - Combined index con otros filtros
   - Partial index para subconjuntos de datos

Incluye:
- DDL de índices
- Queries de búsqueda
- Funciones de ranking
- Trigger para actualizar vector automáticamente
```
**Formato de salida:** Implementación full-text + índices + queries + triggers.

**Ejemplo:** `{Búsqueda en catálogo de productos: nombre, descripción, especificaciones; ranking por relevancia}`

---

## 11. Query Temporal / Series de Tiempo

**[Bases de Datos]**

```
Crea consultas para análisis de series de tiempo.

Tabla: `{tabla}`, columna temporal: `{fecha_columna}`
Período: {últimos_N_días/meses}
Granularidad: {hora / día / semana / mes / año}

Consultas:

1. **Serie temporal completa (llenar gaps)**:
   ```sql
   WITH fechas AS (
     SELECT generate_series(
       '{fecha_inicio}'::timestamp,
       '{fecha_fin}'::timestamp,
       '{intervalo}'::interval
     ) as fecha
   )
   SELECT fechas.fecha, COALESCE(COUNT(datos.id), 0) as count
   FROM fechas
   LEFT JOIN {tabla} datos ON date_trunc('{granularidad}', datos.{fecha_columna}) = fechas.fecha
   GROUP BY fechas.fecha
   ORDER BY fechas.fecha;
   ```

2. **Métricas rodantes** (rolling):
   - Promedio móvil de {N} días
   - Suma acumulada YTD/MTD
   - Comparativa año contra año (YoY)

3. **Detección de tendencias**:
   - Regresión lineal básica en SQL
   - Desviación estándar rodante
   - Z-score para detectar outliers

4. **Ventanas de tiempo**:
   - Cohort analysis: usuarios por semana de registro
   - Retention: qué % regresa después de {N} días
   - Sessionization: agrupar eventos en sesiones (gap < 30 min)

Incluye:
- Índices para consultas temporales (fecha + columnas de filtro)
- Particionamiento por tiempo (si aplica)
- Materialized views para dashboards
```
**Formato de salida:** Queries de series temporales + índices + particionamiento.

**Ejemplo:** `{Ventas diarias de los últimos 12 meses, comparativa YoY, promedio móvil 7 días, tendencia}`

---

## 12. Query de Actualización por Lotes (Batch Update)

**[Bases de Datos]**

```
Genera un script de actualización por lotes para modificar {X} registros.

Tabla: `{tabla}`
Condición: {WHERE criteria}
Actualización: SET {campo} = {nuevo_valor}
Total de registros afectados: {X}
Tiempo disponible: {ventana_de_mantenimiento}

Requisitos:
- No bloquear toda la tabla (row-level locking)
- Procesar en batches de {N} registros
- Pausa entre batches ({X} ms)
- Logging de progreso
- Rollback si algo falla
- No afectar lecturas concurrentes

Script:
```sql
DO $$
DECLARE
  batch_size INT := {N};
  offset INT := 0;
  total INT;
  updated INT;
BEGIN
  SELECT COUNT(*) INTO total FROM {tabla} WHERE {condición};
  RAISE NOTICE 'Total a actualizar: %', total;
  
  LOOP
    UPDATE {tabla}
    SET {campo} = {nuevo_valor}
    WHERE id IN (
      SELECT id FROM {tabla}
      WHERE {condición}
      ORDER BY id
      LIMIT batch_size OFFSET offset
    );
    
    GET DIAGNOSTICS updated = ROW_COUNT;
    offset := offset + batch_size;
    
    RAISE NOTICE 'Actualizados: % de %', LEAST(offset, total), total;
    COMMIT;
    
    EXIT WHEN updated < batch_size;
    
    PERFORM pg_sleep({pausa_segundos});
  END LOOP;
END $$;
```

Incluye:
- Monitoreo de locks (pg_locks / sys.dm_tran_locks)
- Estrategia de retry si deadlock
- Verificación post-actualización
- Script de rollback
- Estimación de tiempo total
```
**Formato de salida:** Script batch + monitoreo + rollback.

**Ejemplo:** `{Actualizar 5M de registros de precios con incremento del 10%, batch 10000, pausa 1s entre batches}`

---

## 13. Consulta de Reporting / Dashboard

**[Bases de Datos]**

```
Crea las consultas SQL necesarias para un dashboard de {tipo_dashboard}.

Dashboard: {nombre_y_propósito}
KPI principales:
{lista_de_KPI_con_su_definición}

Consultas necesarias:

1. **KPI principal** (tarjeta resumen):
   ```sql
   SELECT {métrica} FROM {tabla} WHERE {período_actual};
   ```

2. **Serie temporal** (gráfico de línea):
   ```sql
   SELECT date_trunc('{día}', {fecha}) as periodo, {métrica}
   FROM {tabla}
   WHERE {fecha} BETWEEN {inicio} AND {fin}
   GROUP BY periodo ORDER BY periodo;
   ```

3. **Distribución** (gráfico de torta/barras):
   ```sql
   SELECT {categoría}, COUNT(*) as count
   FROM {tabla}
   WHERE {filtro}
   GROUP BY {categoría}
   ORDER BY count DESC;
   ```

4. **Top N** (tabla):
   ```sql
   SELECT {ranking_fields}, {métrica}
   FROM {tabla}
   WHERE {filtros}
   GROUP BY {campos}
   ORDER BY {métrica} DESC
   LIMIT {N};
   ```

5. **Comparativa**:
   ```sql
   -- Período actual vs período anterior
   -- Actual vs objetivo/presupuesto
   -- Actual vs mismo período año anterior
   ```

6. **Desglose** (drill-down):
   ```sql
   -- Al hacer clic en un elemento, mostrar detalle
   ```

Optimizaciones:
- Materialized views refrescadas cada {X} minutos
- Vistas materializadas incrementales (PostgreSQL)
- Particionamiento por fecha
- Índices cubrientes para queries de dashboard
- Caché de resultados a nivel aplicación
```
**Formato de salida:** Queries de dashboard + materialized views + índices.

**Ejemplo:** `{Dashboard de ventas: ingresos hoy, ingresos vs mes pasado, top 10 productos, ventas por región, tendencia semanal}`

---

## 14. Query de Limpieza de Datos

**[Bases de Datos]**

```
Crea consultas y scripts para limpiar y estandarizar datos en {tabla(s)}.

Problemas identificados:
{lista_de_problemas_de_calidad_de_datos}

Tareas de limpieza:

1. **Eliminar duplicados** (conservar el primero/último):
   ```sql
   DELETE FROM {tabla}
   WHERE id NOT IN (
     SELECT MIN(id) FROM {tabla}
     GROUP BY {campos_unique}
   );
   ```

2. **Normalizar formato**:
   - Trim whitespace: `UPDATE {tabla} SET {campo} = TRIM({campo})`
   - Unificar mayúsculas/minúsculas: `INITCAP(LOWER({campo}))`
   - Estandarizar fechas: `TO_DATE({campo}, '{formato}')::date`
   - Normalizar teléfonos: regex para formato único
   - Estandarizar direcciones: dividir en campos estructurados

3. **Corregir valores inválidos**:
   - Emails sin @: marcar como inválido
   - Números negativos donde no aplican: SET a 0
   - Fechas futuras en campos de fecha de nacimiento: SET NULL
   - Referencias FK que no existen: SET NULL o eliminar

4. **Rellenar datos faltantes**:
   - Usar valor más frecuente (mode)
   - Usar valor de registro anterior (LAG)
   - Calcular de otros campos (ej: IGV = total * 0.18)

5. **Estandarizar referencias**:
   - Unificar valores: 'USA'/'US'/'United States' -> 'United States'
   - Mapear códigos antiguos a nuevos

Incluye:
- Queries de diagnóstico (contar problemas antes de limpiar)
- Queries de limpieza
- Verificación post-limpieza
- Backup antes de modificar
```
**Formato de salida:** Queries de limpieza + diagnóstico + backup + verificación.

**Ejemplo:** `{Clientes duplicados por email, teléfonos con formatos inconsistentes, direcciones incompletas, países no normalizados}`

---

## 15. Query de Conteo y Cardinalidad

**[Bases de Datos]**

```
Genera un reporte de cardinalidad y conteos para todas las tablas principales.

Propósito: {auditoría / capacity planning / data profiling / optimización}

Reporte:

1. **Tamaño de tablas**:
   ```sql
   SELECT
     relname as table_name,
     n_live_tup as row_count,
     pg_size_pretty(pg_total_relation_size(relid)) as total_size,
     pg_size_pretty(pg_relation_size(relid)) as table_size,
     pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as index_size
   FROM pg_stat_user_tables
   ORDER BY n_live_tup DESC;
   ```

2. **Cardinalidad de columnas**:
   ```sql
   SELECT '{tabla}' as table_name, '{columna}' as column_name,
     COUNT(DISTINCT {columna}) as distinct_values,
     COUNT(*) as total_rows,
     COUNT(*) FILTER (WHERE {columna} IS NULL) as null_count,
     ROUND(COUNT(DISTINCT {columna})::numeric / COUNT(*) * 100, 2) as cardinality_pct
   FROM {tabla};
   ```

3. **Distribución de valores**:
   ```sql
   SELECT {columna}, COUNT(*) as count, 
     ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as pct
   FROM {tabla}
   GROUP BY {columna}
   ORDER BY count DESC;
   ```

4. **Crecimiento temporal**:
   ```sql
   SELECT date_trunc('{mes}', {fecha}) as mes, COUNT(*) as registros_nuevos
   FROM {tabla}
   GROUP BY mes ORDER BY mes;
   ```

5. **Densidad de índices**:
   - Cuántos registros por índice
   - Tamaño de índice vs tamaño de tabla

Incluye:
- Script de profiling completo para todas las tablas
- Interpretación de los resultados (qué es normal, qué es preocupante)
- Sugerencias basadas en cardinalidad (índices compuestos, particionamiento)
```
**Formato de salida:** Reporte de cardinalidad + interpretación + sugerencias.

**Ejemplo:** `{Tabla 'pedidos': 12M filas, 5GB, índice en cliente_id cardinalidad 500k (muy alta)}, {sugerir índice compuesto}`

---

## 16. Query de Transacciones y Consistencia

**[Bases de Datos]**

```
Escribe consultas para verificar y monitorear la consistencia transaccional.

Motor: {PostgreSQL / MySQL / SQL Server}

Consultas:

1. **Transacciones activas**:
   ```sql
   SELECT pid, state, query_start, wait_event, query
   FROM pg_stat_activity
   WHERE state = 'active' AND query NOT LIKE '%pg_stat_activity%';
   ```

2. **Locks actuales**:
   ```sql
   SELECT locked.pid as locked_pid, locker.pid as locker_pid,
     locked.relname, locked.mode, locked.granted
   FROM pg_locks locked
   JOIN pg_locks locker ON locked.locktype = locker.locktype
     AND locked.database = locker.database
     AND locked.relation = locker.relation
   WHERE NOT locked.granted;
   ```

3. **Deadlock detection**:
   ```sql
   -- PostgreSQL detecta automáticamente, revisar logs
   SHOW deadlock_timeout; -- default 1s
   ```

4. **Transacciones largas** (> {X} segundos):
   ```sql
   SELECT pid, now() - xact_start as duration, state, query
   FROM pg_stat_activity
   WHERE state IN ('active', 'idle in transaction')
     AND xact_start < now() - interval '{X} seconds';
   ```

5. **Consulta de verificación de consistencia**:
   - Verificar FK constraints
   - Verificar CHECK constraints
   - Verificar UNIQUE constraints
   - Verificar triggers funcionando

6. **Aislamiento de transacciones**:
   - Verificar nivel de aislamiento actual
   - Identificar transacciones serializables
   - Detectar anomalías de consistencia (dirty reads, non-repeatable reads, phantom reads)

Proporciona:
- Queries de monitoreo
- Script de verificación de consistencia
- Interpretación de resultados
- Acciones correctivas para cada anomalía
```
**Formato de salida:** Queries de monitoreo + verificación + acciones.

**Ejemplo:** `{Transacción larga (> 5 min) bloqueando inserts en tabla 'orders' -> kill o esperar completar}`

---

## 17. Script de Backup de Datos Selectivos

**[Bases de Datos]**

```
Genera un script para exportar/backup de datos selectivos desde {tabla(s)}.

Propósito: {extraer datos para análisis / migración parcial / backup de auditoría}
Criterios de selección:
{lista_de_filtros_y_condiciones}

Formato de salida: {CSV / JSON / SQL INSERT / Parquet}

Script de exportación:
```sql
COPY (
  SELECT {campos}
  FROM {tabla}
  WHERE {condiciones}
  ORDER BY {orden}
) TO '{ruta_archivo}'
WITH (FORMAT CSV, HEADER true, DELIMITER ',', ENCODING 'UTF8');
```

Script de importación (para restaurar):
```sql
-- Crear tabla temporal
CREATE TEMP TABLE {tabla}_import (LIKE {tabla} INCLUDING DEFAULTS);

-- Importar datos
COPY {tabla}_import ({campos})
FROM '{ruta_archivo}'
WITH (FORMAT CSV, HEADER true, DELIMITER ',');

-- Validar datos antes de insertar
-- Insertar en tabla real (manejando duplicados)
INSERT INTO {tabla} ({campos})
SELECT {campos} FROM {tabla}_import
ON CONFLICT ({unique_campos}) DO UPDATE SET ...;
```

Incluye:
- Verificación de integridad post-export (checksum, conteo)
- Comprobación de espacio en disco
- Compresión del archivo (gzip)
- Cifrado del archivo (gpg/age)
- Script de importación con validación
```
**Formato de salida:** Script de exportación + importación + verificación.

**Ejemplo:** `{Exportar pedidos del último mes (50k registros) a CSV comprimido, cifrado, con checksum}`

---

## 18. Normalización vs Denormalización

**[Bases de Datos]**

```
Analiza y propón una solución de modelado de datos para el siguiente caso.

Caso de uso: {descripción}
Perfil de acceso:
- Lecturas: {X} consultas/segundo, {tipo_consultas}
- Escrituras: {X} inserts/upserts/segundo, {tipo_escrituras}
- Reportes: {consultas_analíticas_pesadas}
- Volumen actual: {X} filas en {tabla_principal}
- Crecimiento: {X}% anual

Requerimientos:

1. **Normalizado (3NF)**:
   - Ventajas: consistencia, sin redundancia, fácil mantenimiento
   - Desventajas: joins costosos para consultas frecuentes
   - Schema propuesto:
   ```sql
   {DDL_normalizado}
   ```

2. **Denormalizado**:
   - Ventajas: lecturas rápidas, menos joins
   - Desventajas: redundancia, riesgo de inconsistencia, writes más complejos
   - Schema propuesto:
   ```sql
   {DDL_denormalizado}
   ```

3. **Híbrido**:
   - Tablas normalizadas para writes + vistas materializadas para lecturas
   - Columnas calculadas almacenadas (generated columns)
   - Caché a nivel aplicación
   - Eventualmente consistente (CDC -> cache)

4. **Recomendación**:
   - Qué enfoque usar y por qué
   - Qué tablas normalizar y cuáles denormalizar
   - Estrategia de sincronización (triggers, CDC, eventos)
   - Monitoreo de consistencia entre datos normalizados y denormalizados

Proporciona:
- Schema propuesto (DDL)
- Queries típicas optimizadas para cada enfoque
- Benchmark estimado de cada opción
- Trade-offs documentados
```
**Formato de salida:** Análisis de modelado + schema + benchmarks + trade-offs.

**Ejemplo:** `{Sistema de e-commerce: productos con múltiples imágenes, variantes, y precios por región (alta lectura, media escritura)}`
