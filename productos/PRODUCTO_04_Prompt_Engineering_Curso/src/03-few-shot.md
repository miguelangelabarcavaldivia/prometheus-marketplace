# Módulo 3: Few-Shot Learning para Código

## 3.1 Selección Efectiva de Ejemplos

La calidad de los ejemplos impacta más que la cantidad. 3 ejemplos bien elegidos superan a 10 mediocres.

```python
# Ejemplo 3.1: Criterios para seleccionar ejemplos
CRITERIOS_EJEMPLOS = {
    "diversidad": "Cubrir diferentes casos de uso o variantes del problema",
    "dificultad_progresiva": "De simple a complejo",
    "formato_consistente": "Misma estructura de entrada/salida en todos",
    "relevancia": "Directamente relacionados con la tarea objetivo",
    "cobertura_bordes": "Incluir edge cases (vacíos, nulos, máximos)",
}

def construir_mensaje_few_shot(
    ejemplos: list[dict],
    tarea: str,
    entrada: str
) -> list[dict]:
    """
    Construye un mensaje few-shot estructurado.

    ejemplos: [{"input": "...", "output": "..."}, ...]
    """
    messages = [
        {"role": "system", "content": "Eres un asistente que genera código siguiendo patrones exactos."}
    ]

    # Insertar ejemplos como conversación
    for i, ej in enumerate(ejemplos):
        messages.append({"role": "user", "content": ej["input"]})
        messages.append({"role": "assistant", "content": ej["output"]})

    # Mensaje final con la tarea real
    messages.append({"role": "user", "content": f"TAREA: {tarea}\n\n{entrada}"})

    return messages
```

## 3.2 Dinamic Few-Shot Selection

No todos los ejemplos son relevantes para todas las consultas. La selección dinámica escoge los ejemplos más similares a la consulta actual.

```python
# Ejemplo 3.2: Few-shot selector basado en embeddings
from openai import OpenAI
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

client = OpenAI()

class DynamicFewShotSelector:
    def __init__(self, ejemplos: list[dict]):
        """
        ejemplos: [{"input": ..., "output": ..., "categoria": ...}, ...]
        """
        self.ejemplos = ejemplos
        self.embeddings = self._calcular_embeddings()

    def _calcular_embeddings(self) -> np.ndarray:
        textos = [e["input"] for e in self.ejemplos]
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=textos
        )
        return np.array([r.embedding for r in response.data])

    def seleccionar(self, consulta: str, k: int = 3) -> list[dict]:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=[consulta]
        )
        emb_consulta = np.array(response.data[0].embedding)

        similitudes = cosine_similarity([emb_consulta], self.embeddings)[0]
        indices_top = np.argsort(similitudes)[-k:][::-1]

        seleccionados = []
        for i in indices_top:
            seleccionados.append({
                "input": self.ejemplos[i]["input"],
                "output": self.ejemplos[i]["output"],
                "similitud": float(similitudes[i]),
            })

        return seleccionados


# Base de ejemplos de generación de APIs
API_EJEMPLOS = [
    {
        "input": "Crea un endpoint GET /users/:id que retorne un usuario por ID",
        "output": "@router.get('/users/{user_id}', response_model=UserOut)\nasync def get_user(user_id: int, db: AsyncSession = Depends(get_db)):\n    user = await db.get(User, user_id)\n    if not user:\n        raise HTTPException(404, 'User not found')\n    return user",
        "categoria": "fastapi-read",
    },
    {
        "input": "Crea un endpoint POST /users para crear un usuario con validación",
        "output": "@router.post('/users', response_model=UserOut, status_code=201)\nasync def create_user(data: UserCreate, db: AsyncSession = Depends(get_db)):\n    user = User(**data.model_dump())\n    db.add(user)\n    await db.commit()\n    await db.refresh(user)\n    return user",
        "categoria": "fastapi-create",
    },
    {
        "input": "Middleware de autenticación JWT en FastAPI",
        "output": "@router.get('/protected')\nasync def protected_route(user: User = Depends(get_current_user)):\n    return {\"message\": \"Hello\", \"user\": user.email}",
        "categoria": "fastapi-auth",
    },
    # Más ejemplos...
]

selector = DynamicFewShotSelector(API_EJEMPLOS)
mejores = selector.seleccionar("Endpoint DELETE /users/:id con soft delete", k=2)
for m in mejores:
    print(f"Similitud: {m['similitud']:.3f}")
    print(m["input"])
```

## 3.3 Multi-Turn Few-Shot

Los ejemplos multi-turno muestran interacciones completas (pregunta → respuesta → refinamiento), ideales para tareas iterativas.

```python
# Ejemplo 3.3: Patrón multi-turno para diseño de API
MULTI_TURN_EJEMPLO = [
    # Turno 1: Diseño inicial
    {"role": "user", "content": "Diseña una API REST para un sistema de reservas de hotel."},
    {"role": "assistant", "content": """
Propuesta inicial:

GET  /api/hotels?check_in=...&check_out=...&guests=N
GET  /api/hotels/:id
POST /api/bookings
GET  /api/bookings/:id
DELETE /api/bookings/:id

Modelos:
- Hotel: id, name, address, amenities, rooms[]
- Room: id, type, capacity, price_per_night
- Booking: id, hotel_id, room_id, check_in, check_out, guest_name, status
"""},
    # Turno 2: Refinamiento
    {"role": "user", "content": "Agrega autenticación y roles: guest, admin, hotel_manager."},
    {"role": "assistant", "content": """
Con autenticación y roles:

POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me

// Admin only
GET    /api/admin/hotels
POST   /api/admin/hotels
PUT    /api/admin/hotels/:id
DELETE /api/admin/hotels/:id

// Hotel manager
GET    /api/manager/bookings?hotel_id=...
PUT    /api/manager/bookings/:id/status

// Any authenticated user
GET    /api/bookings
POST   /api/bookings
GET    /api/bookings/:id
DELETE /api/bookings/:id (solo propias)

Middleware: JWT required on all routes except auth/*
Role guard: decorator @requires_roles('admin', 'manager')
"""},
    # Turno 3: Especificación técnica
    {"role": "user", "content": "Genera los modelos Pydantic y schemas OpenAPI."},
    {"role": "assistant", "content": """
```python
from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from enum import Enum

class UserRole(str, Enum):
    GUEST = "guest"
    ADMIN = "admin"
    MANAGER = "manager"

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    created_at: datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class BookingCreate(BaseModel):
    hotel_id: int
    room_id: int
    check_in: date
    check_out: date

    @field_validator('check_out')
    @classmethod
    def check_dates(cls, v, info):
        if 'check_in' in info.data and v <= info.data['check_in']:
            raise ValueError('check_out must be after check_in')
        return v

class BookingOut(BaseModel):
    id: int
    hotel_id: int
    room_id: int
    check_in: date
    check_out: date
    guest_name: str
    status: str
    total_price: float
    created_at: datetime
```
"""},
]

def construir_multi_turn(ejemplos: list[dict], consulta_final: str) -> list[dict]:
    messages = [{"role": "system", "content": "Eres un API designer senior."}]
    for turno in ejemplos:
        messages.append(turno)
    messages.append({"role": "user", "content": consulta_final})
    return messages
```

## 3.4 Format Variations para Few-Shot

Diferentes formatos de ejemplos producen diferentes calidades de respuesta.

```python
# Ejemplo 3.4: Comparación de formatos
FORMATO_TABLA = """
| Entrada | Salida |
|---------|--------|
| `[3, 1, 4, 1, 5]` | `[1, 1, 3, 4, 5]` |
| `['z', 'a', 'b']` | `['a', 'b', 'z']` |
| `[]` | `[]` |
"""

FORMATO_CODIGO = """
Ejemplo 1:
Input: [3, 1, 4, 1, 5]
Output: [1, 1, 3, 4, 5]

Ejemplo 2:
Input: ['z', 'a', 'b']
Output: ['a', 'b', 'z']

Ejemplo 3:
Input: []
Output: []
"""

FORMATO_CONVERSACION = """
Usuario: Ordena [3, 1, 4, 1, 5]
Asistente: [1, 1, 3, 4, 5]

Usuario: Ordena ['z', 'a', 'b']
Asistente: ['a', 'b', 'z']

Usuario: Ordena []
Asistente: []
"""

# El formato Código (con etiquetas Input/Output explícitas)
# suele dar mejores resultados para tareas de transformación de datos.
```

## 3.5 Ejercicios

### Ejercicio 3.1: Dynamic Few-Shot para SQL
Crea una base de 15 ejemplos de `NL → SQL` con diferentes categorías (SELECT, JOIN, GROUP BY, subqueries, window functions). Implementa un selector dinámico que elija los 3 ejemplos más relevantes para una consulta NL dada.

### Ejercicio 3.2: Formato Óptimo
Prueba los 3 formatos (tabla, código, conversación) para generar funciones de transformación de datos. Ejecuta cada formato 5 veces y mide:
- Tasa de éxito sintáctico (código compila/ejecuta)
- Precisión semántica (resultado correcto)
- Consistencia (misma respuesta en N ejecuciones)

### Ejercicio 3.3: Multi-Turn Pipeline
Crea un pipeline de 3 turnos para generar un microservicio completo:
1. Turno 1: Estructura y rutas
2. Turno 2: Modelos y schemas
3. Turno 3: Tests unitarios
Usa el patrón multi-turno para mantener coherencia entre turnos.

### Ejercicio 3.4: Few-Shot para Refactorización
Diseña un sistema few-shot que reciba código legacy (JavaScript ES5) y genere código moderno (ES2024). Los ejemplos deben cubrir: callbacks → async/await, var → const/let, function → arrow, class inheritance → composition.

### Ejercicio 3.5: Selector por Categoría
Implementa un `CategoryFewShotSelector` que mantenga ejemplos organizados por categoría y seleccione proporcionalmente: 1 ejemplo de la categoría exacta + 2 de categorías relacionadas + 1 de borde.

---

**Soluciones en:** `exercises/module-3-solutions.md`
