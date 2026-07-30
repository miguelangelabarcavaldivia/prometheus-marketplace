# Soluciones — Módulo 3: Few-Shot Learning

## Ejercicio 3.1: Dynamic Few-Shot para SQL

```python
from openai import OpenAI
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

client = OpenAI()

SQL_EJEMPLOS = [
    # Category: SELECT simple
    {"input": "Muéstrame todos los usuarios activos", "output": "SELECT * FROM users WHERE is_active = 1;", "categoria": "select-simple"},
    {"input": "Lista los nombres y emails de los clientes", "output": "SELECT name, email FROM customers;", "categoria": "select-simple"},
    # Category: JOIN
    {"input": "Dame los pedidos con nombre de cliente", "output": "SELECT o.*, c.name FROM orders o JOIN customers c ON o.customer_id = c.id;", "categoria": "join"},
    {"input": "Productos con nombre de categoría", "output": "SELECT p.name, c.name AS category FROM products p JOIN categories c ON p.category_id = c.id;", "categoria": "join"},
    # Category: GROUP BY
    {"input": "Cuántos usuarios se registraron por mes", "output": "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) FROM users GROUP BY month;", "categoria": "group-by"},
    {"input": "Total de ventas por vendedor", "output": "SELECT seller_id, SUM(amount) AS total FROM sales GROUP BY seller_id;", "categoria": "group-by"},
    # Category: Subquery
    {"input": "Clientes que han hecho más de 5 pedidos", "output": "SELECT * FROM customers WHERE id IN (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) > 5);", "categoria": "subquery"},
    {"input": "Productos con precio mayor al promedio", "output": "SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products);", "categoria": "subquery"},
    # Category: Window functions
    {"input": "Ranking de empleados por salario por departamento", "output": "SELECT name, department, salary, RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank FROM employees;", "categoria": "window"},
    {"input": "Diferencia de ventas entre mes actual y anterior", "output": "SELECT month, revenue, LAG(revenue) OVER (ORDER BY month) AS prev_month, revenue - LAG(revenue) OVER (ORDER BY month) AS diff FROM monthly_revenue;", "categoria": "window"},
    # Category: CTE
    {"input": "Jerarquía de empleados", "output": "WITH RECURSIVE org AS (SELECT id, name, manager_id FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.name, e.manager_id FROM employees e JOIN org ON e.manager_id = org.id) SELECT * FROM org;", "categoria": "cte"},
    {"input": "Promedio móvil de 7 días", "output": "WITH daily AS (SELECT date, SUM(amount) AS total FROM sales GROUP BY date) SELECT date, AVG(total) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg FROM daily;", "categoria": "cte"},
]

class DynamicSQLFewShot:
    def __init__(self, ejemplos: list[dict]):
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
        sims = cosine_similarity([emb_consulta], self.embeddings)[0]
        top_k = np.argsort(sims)[-k:][::-1]

        return [
            {**self.ejemplos[i], "similitud": float(sims[i])}
            for i in top_k
        ]

selector = DynamicSQLFewShot(SQL_EJEMPLOS)
consulta = "Empleados con salario mayor al promedio de su departamento"
ejemplos = selector.seleccionar(consulta, k=3)

print("Ejemplos seleccionados para:", consulta)
for e in ejemplos:
    print(f"  [{e['categoria']}] (sim: {e['similitud']:.3f})")
    print(f"    Input: {e['input']}")
    print(f"    Output: {e['output']}")
```

## Ejercicio 3.2: Formato Óptimo

```python
# Comparación de formatos para transformación de datos
from openai import OpenAI

client = OpenAI()

FORMATOS = {
    "tabla": """
| Input | Output |
|-------|--------|
| "2024-01-15 14:30:00" | "15/01/2024 14:30" |
| "2024-03-20 09:15:00" | "20/03/2024 09:15" |
| "2024-12-01 00:00:00" | "01/12/2024 00:00" |
Ahora transforma: "2025-07-04 23:59:59"
""",
    "codigo": """
Input: "2024-01-15 14:30:00"
Output: "15/01/2024 14:30"

Input: "2024-03-20 09:15:00"
Output: "20/03/2024 09:15"

Input: "2024-12-01 00:00:00"
Output: "01/12/2024 00:00"

Ahora transforma: "2025-07-04 23:59:59"
""",
    "conversacion": """
Usuario: Convierte "2024-01-15 14:30:00" a formato DD/MM/YYYY HH:MM
Asistente: "15/01/2024 14:30"

Usuario: Convierte "2024-03-20 09:15:00"
Asistente: "20/03/2024 09:15"

Usuario: Convierte "2024-12-01 00:00:00"
Asistente: "01/12/2024 00:00"

Usuario: Convierte "2025-07-04 23:59:59"
Asistente: 
""",
}

def evaluar_formato(nombre: str, prompt: str, ejecuciones: int = 5) -> dict:
    aciertos = 0
    resultados = []
    for i in range(ejecuciones):
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
        )
        respuesta = response.choices[0].message.content.strip()
        esperado = '"04/07/2025 23:59"'
        es_correcto = "04/07/2025" in respuesta or "04/07/2025" in respuesta
        aciertos += 1 if es_correcto else 0
        resultados.append(respuesta)

    return {
        "formato": nombre,
        "tasa_acierto": aciertos / ejecuciones,
        "resultados": resultados,
    }

for nombre, prompt in FORMATOS.items():
    resultado = evaluar_formato(nombre, prompt, ejecuciones=3)
    print(f"\n{nombre}: {resultado['tasa_acierto']:.0%} aciertos")
```

## Ejercicio 3.3: Multi-Turn Pipeline

```python
from openai import OpenAI

client = OpenAI()

class MicroservicePipeline:
    def __init__(self):
        self.context = {}

    def turno1_estructura(self, especificacion: str) -> str:
        prompt = f"""
Genera la estructura de archivos y rutas para un microservicio con:
{especificacion}

Formato:
- Árbol de directorios
- Lista de rutas/endpoints
- Descripción de cada componente
"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        self.context["estructura"] = response.choices[0].message.content
        return self.context["estructura"]

    def turno2_modelos(self) -> str:
        prompt = f"""
Basado en esta estructura del microservicio:
{self.context['estructura']}

Genera los modelos Pydantic y schemas SQLAlchemy necesarios.
Formato: código Python completo con type hints.
"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        self.context["modelos"] = response.choices[0].message.content
        return self.context["modelos"]

    def turno3_tests(self) -> str:
        prompt = f"""
Dada esta estructura y modelos:

ESTRUCTURA:
{self.context.get('estructura', '')[:1000]}

MODELOS:
{self.context.get('modelos', '')[:1000]}

Genera tests unitarios con pytest que cubran:
- Happy paths
- Error cases
- Edge cases
Usa fixtures para setup y mocks para dependencias externas.
"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
        )
        return response.choices[0].message.content

    def ejecutar(self, especificacion: str) -> dict:
        return {
            "turno1": self.turno1_estructura(especificacion),
            "turno2": self.turno2_modelos(),
            "turno3": self.turno3_tests(),
        }

pipeline = MicroservicePipeline()
resultado = pipeline.ejecutar(
    "API de notificaciones con soporte para email y SMS, "
    "almacenamiento en PostgreSQL, prioridad de envío (alta/media/baja)"
)
```

## Ejercicio 3.4: Few-Shot para Refactorización ES5 → ES2024

```python
REFACTOR_EJEMPLOS = [
    # Callback → async/await
    {
        "input": "function getUser(id, cb) { User.findById(id, function(err, user) { if (err) { cb(err); } else { cb(null, user); } }); }",
        "output": "async function getUser(id: number): Promise<User> { const user = await User.findById(id); return user; }",
    },
    # var → const/let
    {
        "input": "var x = 10; var y = 20; if (x > y) { var temp = x; x = y; y = temp; }",
        "output": "let x = 10; let y = 20; if (x > y) { [x, y] = [y, x]; }",
    },
    # function → arrow function
    {
        "input": "var double = function(n) { return n * 2; }; var numbers = [1,2,3].map(function(n) { return n * 2; });",
        "output": "const double = (n: number): number => n * 2; const numbers = [1, 2, 3].map(n => n * 2);",
    },
    # Constructor function → class
    {
        "input": "function Person(name, age) { this.name = name; this.age = age; } Person.prototype.sayHello = function() { return 'Hello, I am ' + this.name; };",
        "output": "class Person { constructor(public name: string, public age: number) {} sayHello(): string { return `Hello, I am ${this.name}`; } }",
    },
]

def refactor_moderno(codigo_es5: str) -> str:
    messages = [{"role": "system", "content": "Eres un experto en modernizar código JavaScript ES5 a ES2024+ con TypeScript."}]
    for ej in REFACTOR_EJEMPLOS:
        messages.append({"role": "user", "content": f"Moderniza:\n{ej['input']}"})
        messages.append({"role": "assistant", "content": ej['output']})

    messages.append({"role": "user", "content": f"Moderniza:\n{codigo_es5}"})

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.15,
    )
    return response.choices[0].message.content

codigo_legacy = """
var Timer = function(interval, callback) {
    this.interval = interval;
    this.callback = callback;
    this.timerId = null;
};
Timer.prototype.start = function() {
    var self = this;
    this.timerId = setInterval(function() {
        self.callback();
    }, this.interval);
};
Timer.prototype.stop = function() {
    if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
    }
};
"""
print(refactor_moderno(codigo_legacy))
```

## Ejercicio 3.5: CategoryFewShotSelector

```python
class CategoryFewShotSelector:
    def __init__(self, ejemplos: list[dict]):
        self.ejemplos = ejemplos
        self.categorias: dict[str, list[dict]] = {}
        for e in ejemplos:
            cat = e.get("categoria", "general")
            if cat not in self.categorias:
                self.categorias[cat] = []
            self.categorias[cat].append(e)

        # Mapa de relacion entre categorías
        self.relaciones = {
            "select-simple": ["select-simple", "where"],
            "join": ["join", "select-simple", "group-by"],
            "group-by": ["group-by", "select-simple", "join"],
            "subquery": ["subquery", "join", "group-by"],
            "window": ["window", "group-by", "subquery"],
            "cte": ["cte", "subquery", "window"],
        }

    def seleccionar(self, consulta: str, categoria: str) -> list[dict]:
        seleccionados = []
        categorias_rels = self.relaciones.get(categoria, [categoria, "select-simple"])

        # 1 de categoría exacta
        if categoria in self.categorias:
            seleccionados.append(self.categorias[categoria][0])
            if len(self.categorias[categoria]) > 1:
                seleccionados.append(self.categorias[categoria][1])

        # 2 de categorías relacionadas
        cont_rels = 0
        for rel in categorias_rels:
            if rel != categoria and rel in self.categorias:
                for e in self.categorias[rel]:
                    if e not in seleccionados and cont_rels < 2:
                        seleccionados.append(e)
                        cont_rels += 1

        # 1 de borde (categoría menos similar)
        categorias_borde = [c for c in self.categorias if c not in [categoria] + categorias_rels]
        if categorias_borde:
            borde = self.categorias[categorias_borde[0]][-1]  # Último ejemplo
            seleccionados.append(borde)

        return seleccionados[:4]

# Uso
selector = CategoryFewShotSelector(SQL_EJEMPLOS)
ejemplos = selector.seleccionar("Ventas totales por región con ranking", "window")
print("Ejemplos seleccionados por categoría:")
for e in ejemplos:
    print(f"  [{e['categoria']}]: {e['input']}")
```
