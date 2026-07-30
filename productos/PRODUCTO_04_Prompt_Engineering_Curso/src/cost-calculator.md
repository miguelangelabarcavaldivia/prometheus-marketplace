# Calculadora de Costos LLM

## Tabla de Precios por Modelo (Julio 2026)

| Modelo | Input (por 1M tokens) | Output (por 1M tokens) | Context Window |
|--------|:--------------------:|:---------------------:|:--------------:|
| GPT-4o | $2.50 | $10.00 | 128K |
| GPT-4o-mini | $0.15 | $0.60 | 128K |
| o1-mini | $3.00 | $12.00 | 128K |
| o3-mini | $1.10 | $4.40 | 200K |
| Claude 3.5 Sonnet | $3.00 | $15.00 | 200K |
| Claude 3 Haiku | $0.25 | $1.25 | 200K |
| Gemini 2.5 Pro | $1.25 | $5.00 | 1M |
| Gemini 2.5 Flash | $0.08 | $0.30 | 1M |
| DeepSeek V3 | $0.27 | $1.10 | 128K |
| Llama 3.1 70B (via API) | $0.59 | $0.79 | 128K |
| Mistral Large 2 | $3.00 | $9.00 | 128K |

## Calculadora de Costos por Prompt

### Datos de Entrada

| Parámetro | Valor | Descripción |
|-----------|:-----:|-------------|
| Tokens de entrada por prompt | 2,000 | Promedio de tokens en el prompt (sistema + usuario) |
| Tokens de salida por prompt | 1,000 | Promedio de tokens en la respuesta |
| Prompts por día | 1,000 | Volumen diario de llamadas |
| Días laborales al mes | 22 | Días hábiles |

### Costo Diario por Modelo

| Modelo | Costo Input/día | Costo Output/día | Costo Total/día |
|--------|:--------------:|:----------------:|:---------------:|
| GPT-4o | $5.00 | $10.00 | $15.00 |
| GPT-4o-mini | $0.30 | $0.60 | $0.90 |
| o1-mini | $6.00 | $12.00 | $18.00 |
| Claude 3.5 Sonnet | $6.00 | $15.00 | $21.00 |
| Gemini 2.5 Flash | $0.16 | $0.30 | $0.46 |

### Costo Mensual por Modelo

| Modelo | Costo/mes (22 días) | Costo/mes (30 días) |
|--------|:------------------:|:------------------:|
| GPT-4o | $330.00 | $450.00 |
| GPT-4o-mini | $19.80 | $27.00 |
| o1-mini | $396.00 | $540.00 |
| Claude 3.5 Sonnet | $462.00 | $630.00 |
| Gemini 2.5 Flash | $10.12 | $13.80 |

## Calculadora Personalizada

### Paso 1: Calcula tus tokens

```python
import tiktoken

def calcular_tokens(texto: str, modelo: str = "gpt-4o") -> int:
    encoding = tiktoken.encoding_for_model(modelo)
    return len(encoding.encode(texto))

# Estima el tamaño de tus prompts típicos
prompt_sistema = "Eres un senior developer..."  # ~150 tokens
prompt_usuario = "Genera un endpoint para..."     # ~500 tokens
contexto = """..."""                              # ~1,350 tokens
total_input = calcular_tokens(prompt_sistema + prompt_usuario + contexto)
print(f"Input total: ~{total_input} tokens")      # ~2,000
```

### Paso 2: Calcula costos proyectados

```python
PRECIOS = {
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "claude-3.5-sonnet": {"input": 3.00, "output": 15.00},
}

def costo_proyectado(
    modelo: str,
    tokens_input: int,
    tokens_output: int,
    llamadas_diarias: int,
    dias: int = 22
) -> dict:
    p = PRECIOS[modelo]
    input_cost = (tokens_input / 1_000_000) * p["input"] * llamadas_diarias * dias
    output_cost = (tokens_output / 1_000_000) * p["output"] * llamadas_diarias * dias
    return {
        "modelo": modelo,
        "costo_input": round(input_cost, 2),
        "costo_output": round(output_cost, 2),
        "costo_total": round(input_cost + output_cost, 2),
    }

# Ejemplo: 10K llamadas/día, 1500 input / 800 output tokens, con GPT-4o-mini
print(costo_proyectado("gpt-4o-mini", 1500, 800, 10000, 30))
# {'modelo': 'gpt-4o-mini', 'costo_input': 6.75, 'costo_output': 14.40, 'costo_total': 21.15}
```

## Estrategias de Optimización

| Estrategia | Ahorro estimado | Implementación |
|------------|:--------------:|----------------|
| Usar modelo mini para tareas simples | 60-80% | `route_prompt()` clasifica por complejidad |
| Cache semántico de respuestas | 30-50% | `SemanticCache` con embeddings |
| Prompt compression | 20-40% | `optimizar_prompt()` truncando contexto secundario |
| Batching de requests | 10-20% | Agrupar prompts similares en una llamada |
| Streaming de respuestas | ~0% (costo) | Mejora latencia percibida, no costo |
| Limitar max_tokens por tarea | 10-30% | `max_tokens` ajustado por tipo de tarea |

## ROI Calculator

| Escenario | Inversión LLM/mes | Tiempo dev manual | Tiempo con LLM | Ahorro/mes |
|-----------|:----------------:|:-----------------:|:--------------:|:----------:|
| Generación de tests | $30 (GPT-4o-mini) | 40h | 10h | $4,500 |
| Code review | $100 (GPT-4o) | 60h | 15h | $6,750 |
| Documentación | $20 (GPT-4o-mini) | 30h | 5h | $3,750 |
| Generación de APIs | $50 (GPT-4o-mixto) | 80h | 20h | $9,000 |

> **Asumiendo:** $150/h como costo fully-loaded del desarrollador senior.

## Template de Spreadsheet

| Fecha | Modelo | Prompt ID | Input Tokens | Output Tokens | Costo Input | Costo Output | Costo Total | Tarea | Usuario |
|-------|--------|:---------:|:-----------:|:------------:|:----------:|:-----------:|:----------:|-------|---------|
| 2026-07-30 | gpt-4o-mini | v1 | 1,500 | 800 | $0.00225 | $0.00048 | $0.00273 | CRUD user | dev-01 |
| 2026-07-30 | gpt-4o | v2 | 3,200 | 1,500 | $0.00800 | $0.01500 | $0.02300 | Security review | dev-02 |
| 2026-07-30 | gpt-4o-mini | v3 | 1,800 | 600 | $0.00270 | $0.00036 | $0.00306 | Test generation | dev-01 |
| 2026-07-31 | gpt-4o | v1 | 2,100 | 1,200 | $0.00525 | $0.01200 | $0.01725 | API design | dev-03 |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| **Total** | | | **8,600** | **4,100** | **$0.01820** | **$0.02784** | **$0.04604** | | |

> Para importar a Excel/Google Sheets: Guarda esta tabla como CSV.
