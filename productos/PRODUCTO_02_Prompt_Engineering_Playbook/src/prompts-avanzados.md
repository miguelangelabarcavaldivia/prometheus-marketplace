# Prompts Avanzados

> 18 prompts para técnicas avanzadas de ingeniería de prompts.

---

## 1. Chain-of-Thought (Razonamiento Encadenado)

**[Avanzado - Chain-of-Thought]**

```
Actúa como un desarrollador senior haciendo debugging. Usa razonamiento paso a paso.

Problema: La API devuelve 500 Internal Server Error al crear un pedido cuando el usuario tiene un cupón de descuento aplicado. Funciona bien sin cupón.

Código relevante:
```python
{código_del_endpoint_de_pedidos}
```

Error en logs:
```
{log_del_error}
```

Vamos paso a paso:

1. Primero, analiza qué datos llegan al endpoint y cómo se procesan.
2. Luego, identifica la diferencia entre el flujo con cupón y sin cupón.
3. Examina cada paso donde el cupón modifica el comportamiento.
4. Identifica dónde podría ocurrir el error (null pointer, división por cero, validación fallida, etc.).
5. Propón una hipótesis de la causa raíz.
6. Sugiere cómo verificarlo (log adicional, test específico).
7. Propón el fix.

Por favor, NO des la respuesta final inmediatamente. Trabaja a través de cada paso explícitamente, mostrando tu razonamiento.
```

**Formato de salida:** Razonamiento paso a paso con conclusiones parciales y final.

**Ejemplo:** `{Debugging de cupón de descuento que causa 500 Internal Server Error}`

---

## 2. Few-Shot Prompting (Ejemplos Múltiples)

**[Avanzado - Few-Shot]**

```
Vas a generar código siguiendo ejemplos específicos. Cada ejemplo muestra el patrón que debes seguir.

Tarea: Implementar {descripción_funcionalidad} en {lenguaje}.

Aquí hay ejemplos de cómo escribir este tipo de código:

**Ejemplo 1: {Descripción del ejemplo 1}**
Input: {input_ejemplo1}
Output:
```{lenguaje}
{código_ejemplo1}
```

**Ejemplo 2: {Descripción del ejemplo 2}**
Input: {input_ejemplo2}
Output:
```{lenguaje}
{código_ejemplo2}
```

**Ejemplo 3: {Descripción del ejemplo 3}**
Input: {input_ejemplo3}
Output:
```{lenguaje}
{código_ejemplo3}
```

Ahora, siguiendo EXACTAMENTE el mismo estilo, estructura y patrones de los ejemplos anteriores, implementa:

Input: {input_del_caso_real}
Output:
```

**Formato de salida:** Código siguiendo el patrón exacto de los ejemplos.

**Ejemplo:** Proveer 3 ejemplos de validación de datos con Zod, luego pedir validación para un schema diferente.

---

## 3. Persona Prompting (Rol Específico)

**[Avanzado - Persona]**

```
Actúa como un {rol_específico} con {X} años de experiencia en {área_experiencia}.

Tu personalidad y conocimientos:
- Experiencia: {detalles_de_experiencia}
- Especialidad: {especialidad_técnica}
- Enfoque: {enfoque_de_trabajo: pragmático, riguroso, innovador}
- Preferencias tecnológicas: {tecnologías_preferidas}
- Lo que evitas: {cosas_que_evitas}
- Frase célebre: {frase_característica}

Contexto actual:
{descripción_del_problema_o_situación}

Tu tarea:
{descripción_de_la_tarea}

Importante: Mantén el rol durante toda la conversación. Responde como lo haría {nombre_del_personaje}. Incluye:
- Tu opinión sincera sobre el enfoque actual
- Recomendaciones basadas en tu experiencia
- Advertencias sobre antipatrones comunes
- Ejemplos de proyectos pasados relevantes

No seas genérico. Sé específico y técnico.
```

**Formato de salida:** Respuesta en el estilo y perspectiva del personaje.

**Ejemplo:** `{Senior DevOps Engineer con 15 años, experto en AWS, enfoque en seguridad y automation, fan de Terraform y GitOps}`

---

## 4. Multi-Step Prompt (Prompt Multi-Paso)

**[Avanzado - Multi-Step]**

```
Voy a darte una tarea compleja dividida en pasos. Ejecuta cada paso secuencialmente, usando la salida del paso anterior como entrada del siguiente. Espera mi confirmación antes de pasar al siguiente paso (o continúa automáticamente si te lo indico).

**Paso 1: Análisis**
Analiza el siguiente código y produce un resumen de su estructura, responsabilidades y problemas potenciales.

```{lenguaje}
{código_a_analizar}
```

Entrégame SOLO el análisis, no código todavía.

[Una vez que tenga el análisis, procederé al Paso 2]

**Paso 2: Diseño**
Basado en el análisis del Paso 1, diseña una solución refactorizada. Describe:
- Nuevos módulos/archivos
- Interfaces y tipos
- Flujo de datos
- Patrones a aplicar

No escribas el código completo aún, solo el diseño.

**Paso 3: Implementación**
Implementa el diseño del Paso 2. Escribe el código completo para cada módulo/archivo.

**Paso 4: Tests**
Escribe tests para el código implementado en el Paso 3.

**Paso 5: Verificación**
Revisa el código del Paso 3 contra el análisis del Paso 1. ¿Todos los problemas identificados fueron resueltos? ¿Hay nuevos problemas introducidos?
```

**Formato de salida:** Serie de respuestas secuenciales, cada una construyendo sobre la anterior.

**Ejemplo:** `{Refactorización de un monolito de pagos: Paso 1 analizar, Paso 2 diseñar, Paso 3 implementar, Paso 4 testear}`

---

## 5. Constrained Generation (Generación con Restricciones)

**[Avanzado - Constrained Generation]**

```
Genera {código / documentación / diseño} que cumpla ESTRICTAMENTE con las siguientes restricciones:

Restricciones de la tarea:
- {restricción_1: solo usar bibliotecas de la stdlib}
- {restricción_2: máximo {X} líneas por función}
- {restricción_3: sin dependencias externas}
- {restricción_4: compatible con {versión_mínima_del_lenguaje}}
- {restricción_5: sin usar eval() ni exec()}
- {restricción_6: thread-safe}

Restricciones de formato:
- {formato_1: TypeScript con tipos explícitos}
- {formato_2: sin console.log, usar logger estructurado}
- {formato_3: funciones puras donde sea posible}
- {formato_4: comentarios solo para "por qué", no para "qué"}

Restricciones de estilo:
- {estilo_1: single quotes}
- {estilo_2: 2 spaces indent}
- {estilo_3: trailing commas}
- {estilo_4: máximo 80 caracteres por línea}
- {estilo_5: PascalCase para tipos, camelCase para variables}

Restricciones de testing:
- {test_1: cobertura > 90%}
- {test_2: sin mocks a tipos de valor}
- {test_3: un assert por test}

Tarea: {descripción_de_la_tarea}

Verifica cada restricción explícitamente antes de entregar el resultado.
```

**Formato de salida:** Código que cumple todas las restricciones con verificación explícita de cada una.

**Ejemplo:** `{Parser de CSV sin dependencias externas, function < 30 líneas, TypeScript strict, coverage > 95%}`

---

## 6. Reflexión / Self-Critique

**[Avanzado - Reflexión]**

```
Primero, responde la siguiente pregunta/resuelve el siguiente problema:

{problema_o_pregunta}

No te detengas aún. Una vez que hayas producido tu respuesta inicial, ahora actúa como un crítico riguroso de tu propio trabajo. Revisa tu respuesta anterior y señala:

1. **Errores**: ¿Hay errores lógicos, de sintaxis, o conceptuales?
2. **Suposiciones**: ¿Qué suposiciones hiciste que podrían ser incorrectas?
3. **Casos edge**: ¿Qué casos límite no consideraste?
4. **Cobertura**: ¿Hay escenarios que no cubriste?
5. **Calidad**: ¿Podría ser más simple, más eficiente, más legible?
6. **Seguridad**: ¿Hay problemas de seguridad?
7. **Performance**: ¿Podría tener problemas de rendimiento en ciertos escenarios?
8. **Mantenibilidad**: ¿Es fácil de entender y modificar?

Para cada crítica identificada:
- Describe el problema
- Explica por qué es un problema
- Propón una mejora concreta

Finalmente, produce una versión corregida y mejorada que incorpore tu propia crítica.

**Formato de respuesta:**
[Respuesta inicial]

---

**Autocrítica:**
1. {crítica} -> {mejora}
2. {crítica} -> {mejora}
...

---

**Versión corregida:**
{código/respuesta mejorado}
```

**Formato de salida:** Respuesta inicial + autocrítica + versión corregida.

**Ejemplo:** `{Implementar algoritmo de ordenamiento, luego autocriticarse por no considerar arrays vacíos o muy grandes}`

---

## 7. Role Playing con Validación Cruzada

**[Avanzado - Role Playing + Validación]**

```
Vamos a simular una revisión de código en equipo. Actúa como los siguientes roles:

**Rol 1: Desarrollador Autor** — Has escrito el siguiente código y debes explicarlo.
```{lenguaje}
{código_a_revisar}
```

**Rol 2: Senior Developer** — Vas a revisar el código del Rol 1 desde la perspectiva de calidad, mantenibilidad y mejores prácticas.

**Rol 3: Security Engineer** — Vas a revisar el mismo código desde la perspectiva de seguridad.

**Rol 4: DevOps Engineer** — Vas a revisar el código desde la perspectiva de operaciones, deployment y monitoreo.

**Rol 5: Tech Lead** — Vas a tomar la decisión final: aprobar, aprobar con cambios, o rechazar.

Instrucciones:
1. Comienza con el Rol 1 explicando el código y su contexto.
2. Luego, cada revisor (Roles 2-4) hace preguntas y señala problemas desde su perspectiva.
3. El Rol 1 responde a las preguntas y defiende o acepta las críticas.
4. Finalmente, el Rol 5 da el veredicto con las acciones requeridas.

Simula una conversación realista donde cada rol tiene una personalidad y perspectiva distintas.
```

**Formato de salida:** Conversación simulada entre roles con veredicto final.

**Ejemplo:** `{Revisión de nuevo endpoint de pagos: autor junior, senior, security engineer, DevOps, tech lead}`

---

## 8. Generación de Documentación Técnica desde Código

**[Avanzado - Documentación desde Código]**

```
Dado el siguiente código, genera documentación técnica completa.

Código fuente:
```{lenguaje}
{código_a_documentar}
```

La documentación debe incluir:

1. **Propósito general**: ¿Qué hace este archivo/módulo en el contexto del proyecto?

2. **API pública**: Documentación de cada export (clase, función, tipo, constante).
   - Descripción de qué hace y por qué existe
   - Firma completa con tipos
   - Descripción de cada parámetro (incluyendo valores por defecto y rangos válidos)
   - Descripción del valor de retorno
   - Excepciones/errores que puede lanzar
   - Ejemplo(s) de uso
   - Complejidad computacional (si aplica)

3. **Ejemplos de uso**: Al menos 2 ejemplos de cómo usar esta API:
   - Ejemplo 1: caso de uso típico (happy path)
   - Ejemplo 2: caso edge o manejo de error

4. **Dependencias**: ¿De qué otros módulos/servicios depende? ¿Qué contratos debe cumplir?

5. **Seguridad**: Consideraciones de seguridad al usar este código.

6. **Performance**: Consideraciones de rendimiento (complejidad, caché, límites).

NIVEL DE DETALLE: Como si fueras a entregar esta documentación a un desarrollador que nunca ha visto este código.
```

**Formato de salida:** Documentación técnica estructurada con ejemplos y referencias cruzadas.

**Ejemplo:** `{payment-service.ts -> documentación completa con API, ejemplos, dependencias, seguridad}`

---

## 9. Descomposición de Problema Complejo

**[Avanzado - Descomposición]**

```
Descompón el siguiente problema complejo en subproblemas manejables.

Problema: {descripción_del_problema_complejo}

Contexto:
- Stack tecnológico: {tecnologías}
- Restricciones: {restricciones}
- Equipo: {tamaño_y_habilidades}
- Timeline: {deadlines}

Sigue estos pasos:

**Paso 1: Descomposición funcional**
Divide el problema en funcionalidades independientes. Para cada una:
- Nombre y descripción breve
- Entradas y salidas esperadas
- Dependencias con otros módulos
- Prioridad (P0/P1/P2)
- Esfuerzo estimado (talla de camiseta: S/M/L/XL)

**Paso 2: Dependencias y orden**
- Identifica dependencias entre módulos
- Ordena por: qué se necesita implementar primero
- Identifica qué se puede hacer en paralelo
- Critical path: qué tareas están en la ruta crítica

**Paso 3: Para cada subproblema, genera un prompt específico**
Para cada submódulo funcional, produce un prompt detallado que incluya:
- Objetivo específico del submódulo
- Input/Output esperados
- Cómo integrarlo con otros módulos
- Tests esperados
- Criterios de aceptación

**Paso 4: Estrategia de integración**
- Cómo se integrarán los módulos
- Estrategia de testing (unit -> integration -> e2e)
- Feature flags para rollout gradual

El resultado debe permitir asignar cada submódulo a un desarrollador diferente.
```

**Formato de salida:** Descomposición estructurada + prompts por submódulo + plan de integración.

**Ejemplo:** `{Sistema de recomendación en tiempo real: descomponer en tracking de eventos, perfilado de usuarios, motor de recomendación, API, dashboard}`

---

## 10. One-Shot con Formato de Salida Estricto

**[Avanzado - One-Shot + Formato Estricto]**

```
Voy a darte una especificación. Debes generar la respuesta en un formato JSON ESTRICTO que luego será parseado automáticamente. NO agregues texto adicional fuera del JSON.

Especificación:
{descripción_de_lo_que_se_debe_generar}

Formato de salida REQUERIDO:
```json
{
  "prompt": "el prompt generado",
  "category": "categoría del prompt",
  "variables": [
    {
      "name": "nombre_variable_sin_{}",
      "description": "descripción de la variable",
      "type": "string|number|boolean|code",
      "required": true
    }
  ],
  "expected_output": {
    "format": "markdown|código|json|texto",
    "description": "descripción del formato esperado"
  },
  "complexity": "beginner|intermediate|advanced",
  "tags": ["tag1", "tag2"],
  "languages": ["lenguaje1", "lenguaje2"],
  "example_variables": {
    "var1": "ejemplo1",
    "var2": "ejemplo2"
  }
}
```

Reglas:
- El JSON debe ser VÁLIDO y parseable (sin trailing commas, strings con double quotes)
- Todos los campos requeridos deben estar presentes
- Los arrays pueden estar vacíos pero no null
- strings deben ser UTF-8
- No incluir ```json al inicio ni al final
- No incluir texto explicativo antes ni después

Genera el JSON ahora.
```

**Formato de salida:** JSON estrictamente formateado sin texto adicional.

**Ejemplo:** `{Generar 5 prompts para generación de código en Python con formato JSON exacto}`

---

## 11. Árbol de Decisiones Técnicas

**[Avanzado - Árbol de Decisiones]**

```
Crea un árbol de decisiones para resolver el siguiente problema técnico, explorando múltiples opciones.

Problema: {descripción_del_problema_técnico}
Contexto: {restricciones_y_requerimientos}

Genera un árbol de decisiones donde cada nodo es una pregunta y cada rama es una respuesta. Continúa hasta llegar a una solución concreta.

Formato:
## Pregunta 1: {primera_decisión_a_tomar}
- **Si {opción A}**:
  - Ventajas: {lista}
  - Desventajas: {lista}
  - Siguiente pregunta: {nueva_pregunta_o_si_es_final_proponer_solución}
- **Si {opción B}**:
  - Ventajas: {lista}
  - Desventajas: {lista}
  - Siguiente pregunta: {nueva_pregunta_o_si_es_final_proponer_solución}

Continúa hasta que todas las ramas lleguen a una solución concreta.

Para cada solución final (hoja del árbol), proporciona:
- Resumen de las decisiones tomadas
- Código o configuración de ejemplo
- Cuándo esta es la mejor opción
- Cuándo NO elegir esta opción

El árbol debe tener al menos {N} niveles de profundidad y cubrir las decisiones más importantes.
```

**Formato de salida:** Árbol de decisiones con soluciones concretas en cada hoja.

**Ejemplo:** `{Cómo almacenar archivos subidos por usuarios: local, S3, CDN, distribuido? -> árbol con 4 niveles}`

---

## 12. Prompt Generador de Prompts (Meta-Prompting)

**[Avanzado - Meta-Prompting]**

```
Eres un experto en ingeniería de prompts. Tu tarea es generar un prompt optimizado para que otro developer (o una IA) pueda resolver la siguiente tarea.

Tarea a resolver: {descripción_de_la_tarea}

Público objetivo del prompt: {desarrollador_junior / IA / equipo_técnico}
Lenguaje: {lenguaje}
Framework: {framework}
Contexto adicional: {información_contextual}

El prompt que debes generar debe incluir:

1. **Rol/Persona**: Define qué rol debe adoptar quien ejecute el prompt.
2. **Contexto**: Información necesaria para entender el problema.
3. **Objetivo**: Qué debe lograr exactamente.
4. **Instrucciones**: Pasos detallados, en orden.
5. **Formato de entrada**: Qué datos se proporcionan y cómo.
6. **Formato de salida**: Cómo debe estructurarse la respuesta.
7. **Restricciones**: Límites, reglas, cosas que NO debe hacer.
8. **Ejemplos**: Si aplica, ejemplos de entrada/salida esperada.
9. **Criterios de evaluación**: Cómo saber si la respuesta es correcta.
10. **Variables**: Placeholders entre {llaves} que deben ser reemplazados.

Además, incluye una breve explicación de por qué diseñaste el prompt de esta manera (qué técnica usas y por qué es efectiva para esta tarea).

El prompt final debe ser copiable directamente y funcionar sin modificaciones.
```

**Formato de salida:** Prompt optimizado + explicación de las técnicas utilizadas.

**Ejemplo:** `{Generar un prompt para que un desarrollador junior implemente un endpoint REST con validación y tests}`

---

## 13. Análisis Comparativo con Criterios

**[Avanzado - Análisis Comparativo]**

```
Realiza un análisis comparativo entre {opción_A} y {opción_B} para {caso_de_uso}.

Criterios de evaluación (ponderados por importancia):

| Criterio | Peso (%) | Descripción |
|----------|----------|-------------|
| {Criterio 1} | {X}% | {descripción} |
| {Criterio 2} | {X}% | {descripción} |
| {Criterio 3} | {X}% | {descripción} |
| {Criterio 4} | {X}% | {descripción} |
| {Criterio 5} | {X}% | {descripción} |

Para cada criterio:
- **{Opción A}**: {puntuación 1-10} -> {justificación detallada con evidencia}
- **{Opción B}**: {puntuación 1-10} -> {justificación detallada con evidencia}

Al final:
- **Puntaje total A**: {cálculo}
- **Puntaje total B**: {cálculo}
- **Ganador**: {opción}
- **Veredicto**: {resumen ejecutivo de 2-3 párrafos con recomendación clara y por qué}
- **Mitigaciones**: Si eliges A, qué riesgos de B mitigar. Si eliges B, qué fortalezas de A incorporar.

Sé imparcial y basado en hechos técnicos, no en preferencias personales. Considera el contexto específico del caso de uso.
```

**Formato de salida:** Análisis comparativo con puntuaciones, justificaciones y recomendación.

**Ejemplo:** `{Prisma vs TypeORM para proyecto TypeScript con PostgreSQL, 5 criterios ponderados}`

---

## 14. Simulación de Escenario (What-If)

**[Avanzado - Simulación]**

```
Simula el siguiente escenario hipotético y analiza las consecuencias.

Cambio propuesto: {descripción_del_cambio}
Sistema actual: {descripción_del_sistema_y_su_arquitectura}

Ejecuta la simulación:

**Escenario**: Imaginemos que implementamos {cambio} en {parte_del_sistema}.

**T+0: Inmediato**
- ¿Qué componentes se ven afectados directamente?
- ¿Hay breaking changes?
- ¿Migración de datos necesaria?
- ¿Rollback posible y cómo?

**T+1 hora: Corto plazo**
- ¿Cómo impacta en la experiencia de usuario?
- ¿Métricas que cambian (latencia, errores)?
- ¿Alertas que se dispararían?
- ¿Costo de infraestructura?

**T+1 día: Medio plazo**
- ¿Problemas de performance nuevos?
- ¿Errores que empiezan a aparecer?
- ¿Uso de recursos (memoria, CPU, DB)?
- ¿Backlog de jobs/mensajes?

**T+1 semana: Largo plazo**
- ¿Escalabilidad: cómo se comporta con crecimiento?
- ¿Mantenibilidad: es más fácil mantener?
- ¿Deuda técnica: aumenta o disminuye?
- ¿Satisfacción del equipo?

**Recomendación final**: ¿Implementar el cambio? ¿Con qué precauciones? ¿Feature flags? ¿Rollback plan?

Para cada punto de la simulación, proporciona señales específicas a monitorear para detectar problemas temprano.
```

**Formato de salida:** Simulación temporal con impactos y señales de monitoreo.

**Ejemplo:** `{Migrar de Express a Fastify: impacto inmediato, 1h, 1 día, 1 semana, con monitoreo}`

---

## 15. Reverse Prompt Engineering

**[Avanzado - Reverse Engineering]**

```
Analiza la siguiente respuesta de una IA y reconstruye el prompt que la generó.

Respuesta generada:
```
{respuesta_de_IA}
```

Tarea: Ingeniería inversa del prompt.

Proporciona:

1. **Prompt original probable** (el prompt que generó esta respuesta):
   - Incluyendo: rol, contexto, instrucciones, formato de salida, ejemplos, restricciones
   - Marca con {placeholders} las partes que probablemente eran variables

2. **Técnicas de prompting usadas**:
   - ¿Usa chain-of-thought? ¿few-shot? ¿persona? ¿constrained?
   - Identifica cada técnica y dónde se evidencia en la respuesta

3. **Estructura del prompt**:
   - ¿Cómo está organizado?
   - ¿Qué secciones tiene?
   - ¿Qué instrucciones son explícitas vs implícitas?

4. **Mejoras sugeridas**:
   - ¿Qué añadirías/quitarías del prompt original?
   - ¿Cómo harías la respuesta más consistente?
   - ¿Qué restricciones añadirías?

5. **Versión mejorada del prompt**:
   - Prompt completo, listo para usar, con mejoras aplicadas

La calidad del reverse engineering se mide por cuán cerca está el prompt reconstruido del prompt real que generó la respuesta.
```

**Formato de salida:** Prompt reconstruido + análisis de técnicas + versión mejorada.

**Ejemplo:** `{Tomar una respuesta de documentación generada por IA y reconstruir el prompt que la generó}`

---

## 16. Prompt con Sistema de Votación / Consenso

**[Avanzado - Consenso]**

```
Vas a actuar como un comité de {N} expertos independientes para resolver el siguiente problema. Cada experto tiene una especialidad diferente.

Problema: {descripción_del_problema}

Expertos:
1. **{Experto 1}**: Especialista en {área_1}. Enfoque: {descripción}.
2. **{Experto 2}**: Especialista en {área_2}. Enfoque: {descripción}.
3. **{Experto 3}**: Especialista en {área_3}. Enfoque: {descripción}.

**Fase 1: Análisis Individual**
Cada experto analiza el problema desde su perspectiva y propone una solución. NO consultan entre sí todavía.

**Experto 1**: {análisis y solución propuesta}
**Experto 2**: {análisis y solución propuesta}
**Experto 3**: {análisis y solución propuesta}

**Fase 2: Debate**
Los expertos ven las propuestas de los otros y debaten:
- {Experto 1} critica/refuerza el enfoque de {Experto 2}
- {Experto 2} critica/refuerza el enfoque de {Experto 3}
- {Experto 3} critica/refuerza el enfoque de {Experto 1}
- Siguiente ronda de debate...
_(continúa hasta que los expertos convergen o acuerdan diferir)_

**Fase 3: Votación**
Cada experto vota por la opción que considera mejor (puede ser su propia propuesta o una combinación).
- Voto {Experto 1}: {opción}
- Voto {Experto 2}: {opción}
- Voto {Experto 3}: {opción}

**Fase 4: Decisión Final**
- Opción ganadora (o síntesis de opciones)
- Plan de acción concreto
- Aspectos a monitorear
- Puntos de acuerdo y desacuerdo residual
```

**Formato de salida:** Debate multi-experto con votación y decisión final.

**Ejemplo:** `{¿Debemos migrar nuestra app de Express a Fastify?}`, `{Expertos: backend, performance, DevOps}`

---

## 17. Generación de Múltiples Enfoques

**[Avanzado - Múltiples Enfoques]**

```
Genera {N} enfoques diferentes para resolver el siguiente problema técnico. Cada enfoque debe ser DISTINTO en su estrategia fundamental (no variaciones menores).

Problema: {descripción_del_problema}
Contexto: {restricciones_y_requisitos}

Enfoque 1: {nombre_del_enfoque}
- **Estrategia**: {descripción_de_cómo_resuelve_el_problema}
- **Implementación**: {código_o_pasos_clave}
- **Pros**: {lista}
- **Contras**: {lista}
- **Complejidad**: {baja/media/alta}
- **Mejor para**: {cuándo_usar_este_enfoque}
- **Peor para**: {cuándo_NO_usar_este_enfoque}

Enfoque 2: {nombre_del_enfoque}
- **Estrategia**: {descripción_de_cómo_resuelve_el_problema}
- **Implementación**: {código_o_pasos_clave}
- **Pros**: {lista}
- **Contras**: {lista}
- **Complejidad**: {baja/media/alta}
- **Mejor para**: {cuándo_usar_este_enfoque}
- **Peor para**: {cuándo_NO_usar_este_enfoque}

_(repetir para {N} enfoques)_

**Comparación rápida**:
| Aspecto | {Enfoque 1} | {Enfoque 2} | ... |
|---------|------------|------------|-----|
| Velocidad | ★★★ | ★★☆ | ... |
| Mantenibilidad | ★★☆ | ★★★ | ... |
| Escalabilidad | ★☆☆ | ★★★ | ... |

**Recomendación**: En el contexto específico de {contexto_del_usuario}, el enfoque {X} es el más adecuado porque {razón}.
```

**Formato de salida:** N enfoques distintos con pros, contras y recomendación.

**Ejemplo:** `{3 enfoques para implementar búsqueda full-text: PostgreSQL FTS, Elasticsearch, Meilisearch}`, `{contexto: startup con equipo pequeño, 10k productos}`

---

## 18. Prompt con Loop de Refinamiento Iterativo

**[Avanzado - Refinamiento Iterativo]**

```
Vamos a trabajar en un proceso iterativo de refinamiento. En cada ciclo, mejorarás la solución basándote en feedback.

**Iteración 1: Solución Inicial**
Genera una solución para: {descripción_del_problema}

Criterios iniciales:
- {criterio_1}
- {criterio_2}
- {criterio_3}

**Feedback recibido** (simula que un revisor dio este feedback):
- {feedback_1: ejemplo: "la solución no maneja el caso edge de entrada vacía"}
- {feedback_2: ejemplo: "el naming de variables no es claro"}
- {feedback_3: ejemplo: "falta validación de tipos"}

**Iteración 2: Refinamiento**
Aplica el feedback recibido y genera una versión mejorada. Explica qué cambiaste y por qué.

**Feedback recibido**:
- {feedback_4: "buena mejora, pero ahora hay duplicación de código en las funciones de validación"}

**Iteración 3: Refinamiento Final**
Aplica el feedback y genera la versión final, optimizada y limpia.

**Resumen de cambios por iteración:**
| Iteración | Cambios realizados |
|-----------|-------------------|
| 1 -> 2 | {cambios} |
| 2 -> 3 | {cambios} |

**Lecciones aprendidas**: ¿Qué patrones de mejora se repiten? ¿Qué podrías haber hecho bien desde la primera iteración?

Nota: Si en lugar de feedback simulado, el usuario da feedback real, úsalo en cada iteración.
```

**Formato de salida:** 3 iteraciones con mejoras progresivas y resumen de cambios.

**Ejemplo:** `{Implementar validador de email} -> Iteración 1: regex simple -> Iteración 2: +validación DNS -> Iteración 3: +caché +tests}`
