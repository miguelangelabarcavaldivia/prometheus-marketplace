# Appendix B — Cost Calculator for AI Agents

## B.1 Pricing Reference (2025-2026)

### OpenAI
| Model | Input ($/1M tokens) | Output ($/1M tokens) | Context |
|-------|-------------------|--------------------|---------|
| GPT-4o | $2.50 | $10.00 | 128K |
| GPT-4o-mini | $0.15 | $0.60 | 128K |
| GPT-4-turbo | $10.00 | $30.00 | 128K |
| o1-preview | $15.00 | $60.00 | 128K |
| o1-mini | $3.00 | $12.00 | 128K |
| text-embedding-3-small | $0.02 | - | - |
| text-embedding-3-large | $0.13 | - | - |

### Anthropic
| Model | Input ($/1M) | Output ($/1M) | Context |
|-------|-------------|--------------|---------|
| Claude 3.5 Sonnet | $3.00 | $15.00 | 200K |
| Claude 3 Opus | $15.00 | $75.00 | 200K |
| Claude 3 Haiku | $0.25 | $1.25 | 200K |

### Google
| Model | Input ($/1M) | Output ($/1M) | Context |
|-------|-------------|--------------|---------|
| Gemini 1.5 Pro | $1.25 | $5.00 | 1M |
| Gemini 1.5 Flash | $0.075 | $0.30 | 1M |

### Meta (via providers)
| Model | Input ($/1M) | Output ($/1M) |
|-------|-------------|--------------|
| Llama 3.1 70B | $0.59 | $0.79 |
| Llama 3.1 405B | $2.75 | $2.75 |

## B.2 Cost Calculator

```python
class AgentCostCalculator:
    PRICING = {
        "gpt-4o": (2.50, 10.00),
        "gpt-4o-mini": (0.15, 0.60),
        "claude-3.5-sonnet": (3.00, 15.00),
        "claude-3-haiku": (0.25, 1.25),
        "gemini-1.5-flash": (0.075, 0.30),
        "llama-3.1-70b": (0.59, 0.79),
    }

    @staticmethod
    def estimate_single_call(model: str, input_tokens: int, output_tokens: int) -> dict:
        prices = AgentCostCalculator.PRICING.get(model)
        if not prices:
            return {"error": f"Unknown model: {model}"}
        input_cost = input_tokens * prices[0] / 1_000_000
        output_cost = output_tokens * prices[1] / 1_000_000
        return {
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "input_cost": round(input_cost, 6),
            "output_cost": round(output_cost, 6),
            "total_cost": round(input_cost + output_cost, 6),
        }

    @staticmethod
    def estimate_agent_session(
        model: str,
        num_turns: int = 5,
        tokens_per_turn: int = 2000,  # avg input
        output_per_turn: int = 500,   # avg output
        tool_calls_per_turn: int = 2,
    ) -> dict:
        prices = AgentCostCalculator.PRICING.get(model)
        if not prices:
            return {"error": f"Unknown model: {model}"}

        # Adjustment for tool calling overhead
        tool_overhead = tool_calls_per_turn * 300  # ~300 tokens per tool+result
        effective_input = tokens_per_turn + tool_overhead

        total_input = num_turns * effective_input
        total_output = num_turns * output_per_turn

        input_cost = total_input * prices[0] / 1_000_000
        output_cost = total_output * prices[1] / 1_000_000

        return {
            "model": model,
            "turns": num_turns,
            "tool_calls": num_turns * tool_calls_per_turn,
            "total_input_tokens": total_input,
            "total_output_tokens": total_output,
            "total_tokens": total_input + total_output,
            "input_cost": round(input_cost, 4),
            "output_cost": round(output_cost, 4),
            "total_cost": round(input_cost + output_cost, 4),
        }

    @staticmethod
    def estimate_multi_agent(
        agents: list[dict],
        turns_per_agent: int = 3,
    ) -> dict:
        total = 0.0
        breakdown = []
        for agent in agents:
            cost = AgentCostCalculator.estimate_agent_session(
                model=agent["model"],
                num_turns=turns_per_agent,
                tokens_per_turn=agent.get("input_per_turn", 2000),
                output_per_turn=agent.get("output_per_turn", 500),
                tool_calls_per_turn=agent.get("tools_per_turn", 2),
            )
            breakdown.append({agent["name"]: agent["model"]}: cost)
            total += cost["total_cost"]
        return {"total_cost": round(total, 4), "breakdown": breakdown}

# Usage examples
calc = AgentCostCalculator()

# Single call
print(calc.estimate_single_call("gpt-4o-mini", 1000, 200))
# → ~$0.00026

# Agent session (5 turns, 2 tool calls each)
print(calc.estimate_agent_session("gpt-4o-mini", num_turns=5))
# → ~$0.008

# Multi-agent crew (3 agents, 3 turns each)
crew = [
    {"name": "Researcher", "model": "gpt-4o-mini", "input_per_turn": 3000, "tools_per_turn": 3},
    {"name": "Writer", "model": "gpt-4o", "input_per_turn": 2000, "tools_per_turn": 0},
    {"name": "Editor", "model": "gpt-4o", "input_per_turn": 4000, "tools_per_turn": 1},
]
print(calc.estimate_multi_agent(crew, turns_per_agent=3))
```

## B.3 Monthly Cost Scenarios

| Scenario | Model | Requests/day | Turns/req | Estimated monthly cost |
|----------|-------|-------------|-----------|----------------------|
| FAQ Chatbot | GPT-4o-mini | 1,000 | 2 | $9 |
| Research Agent | GPT-4o | 100 | 10 | $150 |
| Content Crew | GPT-4o + mini | 50 | 15 | $200 |
| Dev Team (AutoGen) | GPT-4o | 20 | 30 | $360 |
| Production Agent | GPT-4o-mini + 4o | 5,000 | 3 | $75 |

## B.4 Cost Optimization Tips

1. **Use cheaper models for simple tasks**: GPT-4o-mini for classification, GPT-4o for complex reasoning
2. **Cache aggressively**: semantic cache for FAQ, exact cache for deterministic queries
3. **Limit iterations**: cap agent loops at 5-10 iterations
4. **Reduce context**: trim conversation history, summarize old messages
5. **Batch when possible**: combine similar requests into one LLM call
6. **Stream responses**: no cost difference but better UX (fewer retries)
7. **Monitor daily**: set alerts if daily cost exceeds budget

## B.5 Break-Even Analysis

```python
def break_even_analysis(human_cost_per_hour: float, agent_cost_per_query: float,
                        queries_per_hour_agent: int, queries_per_hour_human: int):
    agent_hourly = agent_cost_per_query * queries_per_hour_agent
    human_hourly = human_cost_per_hour * (queries_per_hour_human / queries_per_hour_human)
    savings = human_cost_per_hour - agent_hourly
    print(f"Agent cost/hour: ${agent_hourly:.2f}")
    print(f"Human cost/hour: ${human_cost_per_hour:.2f}")
    print(f"Savings/hour: ${savings:.2f}")
    print(f"Break-even at {max(1, int(human_cost_per_hour / agent_hourly))} hours/week")

break_even_analysis(
    human_cost_per_hour=35,    # CS agent fully loaded
    agent_cost_per_query=0.01, # GPT-4o-mini per query
    queries_per_hour_agent=100,
    queries_per_hour_human=10,
)
# Agent: $1.00/hr vs Human: $35.00/hr → 35x cheaper
```

## B.6 Cost Summary Diagram

```
Monthly Budget ($)
│
├── $0-10    → GPT-4o-mini, simple Q&A
├── $10-50   → GPT-4o-mini + cache, moderate usage
├── $50-200  → Mix 4o-mini + 4o, CrewAI experiments
├── $200-500 → Full production, multiple agents, some 4o
├── $500+    → Heavy multi-agent, AutoGen, fine-tuned models
└── $2000+   → Enterprise: dedicated deployments, custom models
```
