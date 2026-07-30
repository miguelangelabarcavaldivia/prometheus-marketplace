# Sample Prompts — Prompt Engineering Playbook

## Generación de Código

### 1. Generar API Endpoint REST
```
Eres un backend developer senior experto en [LENGUAJE/FRAMEWORK].
Genera un endpoint REST para [DESCRIPCIÓN_FUNCIONALIDAD].
Requisitos:
- Método HTTP: [GET/POST/PUT/DELETE]
- Autenticación: [JWT/OAuth/API Key]
- Validación de inputs usando [LIBRERÍA]
- Errores con códigos HTTP estándar
- Documentación Swagger/OpenAPI

Contexto técnico:
- Framework: [NOMBRE]
- Base de datos: [DB]
- ORM: [NOMBRE]

Ejemplo de request:
[RUTA_EJEMPLO]

Genera: código completo, tests unitarios, y documentación.
```

### 2. Code Review con IA
```
Actúa como un senior code reviewer especializado en [LENGUAJE].
Analiza el siguiente código y proporciona feedback sobre:

1. **SEGURIDAD** (0-10): Vulnerabilidades, inyección SQL, XSS
2. **PERFORMANCE** (0-10): Cuellos de botella, memoria, complejidad
3. **MANTENIBILIDAD** (0-10): Código limpio, patrones, organización
4. **TESTING** (0-10): Cobertura, casos borde, mocks
5. **BEST PRACTICES** (0-10): Estándares del lenguaje, convenciones

Para cada issue detectado:
- Severidad: CRITICAL / HIGH / MEDIUM / LOW
- Línea exacta
- Explicación del problema
- Código sugerido

Código a revisar:
```[LENGUAJE]
[CÓDIGO_AQUÍ]
```
```
