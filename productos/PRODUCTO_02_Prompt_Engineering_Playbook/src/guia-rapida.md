# Guía Rápida: Cómo Usar los Prompts

> Cómo aprovechar al máximo este playbook de 200+ prompts para desarrolladores.

---

## Estructura de Cada Prompt

Cada prompt en este playbook sigue una estructura consistente:

```
## N. Título Descriptivo

**[Categoría]**

{texto del prompt con {variables} entre llaves}

**Formato de salida:** {qué esperar como resultado}

**Ejemplo:** {valores de ejemplo para las variables}
```

### Componentes:
- **Título**: Describe claramente qué resuelve el prompt
- **Categoría**: Indica el área de aplicación (ej: `[Generación de Código]`, `[Debugging]`)
- **Texto del prompt**: El prompt listo para copiar y pegar, con variables en `{llaves}`
- **Variables**: Valores que debes reemplazar según tu contexto específico
- **Formato de salida**: Qué tipo de resultado producirá
- **Ejemplo**: Valores de ejemplo para ver el prompt en acción

---

## Cómo Usar un Prompt

### Paso 1: Selecciona el prompt adecuado

Navega por las categorías para encontrar el prompt que mejor se ajuste a tu necesidad:

| Categoría | Archivo | Cuándo usarlo |
|-----------|---------|---------------|
| Generación de Código | `generacion-codigo.md` | Necesitas escribir código desde cero |
| Debugging | `debugging.md` | Tienes un error o problema técnico |
| Testing | `testing.md` | Necesitas crear o mejorar tests |
| Documentación | `documentacion.md` | Debes documentar código o sistemas |
| DevOps | `devops.md` | Configuras infraestructura o CI/CD |
| Code Review | `code-review.md` | Revisas código de otros o el tuyo |
| Refactorización | `refactorizacion.md` | Mejoras código existente |
| Bases de Datos | `db-queries.md` | Trabajas con SQL o diseño de DB |
| Arquitectura | `arquitectura.md` | Diseñas sistemas o tomas decisiones |
| Prompts Avanzados | `prompts-avanzados.md` | Dominas técnicas de prompting |

### Paso 2: Reemplaza las variables

Cada `{variable}` entre llaves debe ser reemplazada con tu contexto específico.

```
Prompt original:
"Crea un componente React en TypeScript llamado {NombreComponente}"

Tu prompt:
"Crea un componente React en TypeScript llamado UserProfileCard"
```

**Consejo**: No dejes variables sin reemplazar. El prompt funciona mejor cuando todas las variables tienen valores concretos.

### Paso 3: Copia y pega en tu IA

Una vez reemplazadas las variables, copia TODO el texto del prompt (incluyendo el formato de salida esperado) y pégalo en la IA de tu elección.

### Paso 4: Revisa y ajusta

Los prompts producen resultados de alta calidad, pero siempre requieren revisión humana:
- Verifica que el código compile/ejecute
- Ajusta según las convenciones de tu proyecto
- Añade contexto específico de tu dominio si es necesario

---

## Mejores Prácticas

### 1. Sé específico con las variables

En lugar de: "Implementa un CRUD para {recurso}"
Usa: "Implementa un CRUD para gestión de facturas con campos: id, cliente_id, monto, fecha_emision, fecha_vencimiento, estado, items (array de conceptos)"

Mientras más específico seas, mejor será el resultado.

### 2. Proporciona contexto adicional

Los prompts están diseñados para funcionar con la información mínima, pero añadir contexto siempre mejora el resultado:

```diff
- "Debuggea este error: TypeError: Cannot read property 'id' of undefined"
+ "Debuggea este error: TypeError: Cannot read property 'id' of undefined
+  Contexto: API REST en Express, ocurre en GET /api/users/:id/profile
+  cuando el usuario no existe en la DB. Stack: Node 20, MongoDB, Mongoose 8"
```

### 3. Itera sobre los resultados

No esperes el resultado perfecto al primer intento:

1. **Primer prompt**: Obtén una solución base
2. **Refina**: "El código funciona pero necesito que también maneje el caso X"
3. **Mejora**: "Ahora refactoriza para usar async/await en vez de callbacks"
4. **Testea**: "Genera tests unitarios para el código anterior"

### 4. Combina múltiples prompts

Los prompts están diseñados para encadenarse:

```
Prompt 1: "Genera el schema de DB para usuarios" (db-queries.md)
Prompt 2: "Implementa el endpoint CRUD de usuarios" (generacion-codigo.md)
Prompt 3: "Escribe tests para el endpoint de usuarios" (testing.md)
Prompt 4: "Revisa la seguridad del código de usuarios" (code-review.md)
```

### 5. Usa las categorías para navegación rápida

¿Tienes un error en producción? Ve directo a `debugging.md`.
¿Necesitas escribir tests? Ve a `testing.md`.
¿Vas a deployar? Ve a `devops.md`.

---

## Técnicas de Prompting Avanzado

### Chain-of-Thought (Cadena de Pensamiento)

Para problemas complejos, añade al final del prompt:

> "Piensa paso a paso antes de dar la respuesta. Identifica primero el problema, luego analiza las opciones, y finalmente propón la solución."

### Few-Shot (Ejemplos Múltiples)

Si el prompt no incluye ejemplos y necesitas un formato específico, añade:

> "Aquí tienes 2 ejemplos del formato esperado: [ejemplo1] [ejemplo2]. Ahora genera el resultado siguiendo exactamente el mismo patrón."

### Persona (Rol Específico)

Para obtener respuestas con una perspectiva particular, añade al inicio:

> "Actúa como un {senior backend developer / DevOps engineer / security auditor} con 10+ años de experiencia."

### Restricciones Explícitas

Para controlar el output:

> "Restricciones: (1) máximo 100 líneas, (2) sin dependencias externas, (3) TypeScript strict mode, (4) incluir tests, (5) funciones documentadas con JSDoc."

---

## Lista de Verificación Rápida

- [ ] Reemplacé todas las `{variables}` con valores concretos?
- [ ] Proporcioné suficiente contexto (lenguaje, framework, propósito)?
- [ ] El formato de salida esperado es claro?
- [ ] Voy a revisar y ajustar el resultado?
- [ ] Necesito combinar este prompt con otros del playbook?

---

## Sobre el Formato de las Variables

| Formato | Significado | Ejemplo |
|---------|-------------|---------|
| `{nombre}` | Nombre o identificador | `{UserService}`, `{Product}` |
| `{lenguaje}` | Lenguaje de programación | `{TypeScript}`, `{Python}` |
| `{framework}` | Framework o librería | `{React}`, `{FastAPI}` |
| `{descripción}` | Texto descriptivo | `{autenticación con JWT}` |
| `{lista_de}` | Lista de items separados | `{campos: nombre, email, rol}` |
| `{código}` | Fragmento de código | `{if (user.role === 'admin')}` |

Las variables son indicativas de qué información debes proporcionar. Puedes expandirlas con tanto detalle como necesites.
