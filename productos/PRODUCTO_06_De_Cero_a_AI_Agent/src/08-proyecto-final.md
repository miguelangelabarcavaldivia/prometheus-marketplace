# Chapter 8 — Final Project: Customer Support Agent

## 8.1 Project Overview

Build a complete customer support agent that handles queries, escalates complex issues, and includes human-in-the-loop approval.

```
┌─────────────────────────────────────────────────────────┐
│              CUSTOMER SUPPORT PIPELINE                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  User ──→ Intent Classifier ──→ ┌─────────────┐        │
│                                  │ FAQ Agent    │        │
│                                  │ (automático) │        │
│                                  └──────┬──────┘        │
│                                         │               │
│                                    ┌────┴────┐          │
│                                    │ Escalate?│          │
│                               ┌────┤          ├────┐    │
│                               No   └─────────┘  Yes│    │
│                               │                    │    │
│                               ▼                    ▼    │
│                          ┌──────────┐     ┌──────────┐  │
│                          │ Response  │     │Human     │  │
│                          │          │     │Agent     │  │
│                          └──────────┘     │Review    │  │
│                                            └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 8.2 Architecture

The system uses LangGraph for orchestration with three specialized agents:

```
                         ┌──────────────────┐
                         │   Supervisor     │
                         │  (Intent +       │
                         │   Router)        │
                         └────┬─────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
      ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
      │ FAQ Agent   │ │ Order Agent │ │ Human Agent │
      │ (questions) │ │ (purchases) │ │ (escalation)│
      └─────────────┘ └─────────────┘ └─────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                     ┌──────────────────┐
                     │   Response       │
                     │   Formatter      │
                     └──────────────────┘
```

## 8.3 Implementation

### State Definition

```python
from typing import TypedDict, Annotated, Literal
from langgraph.graph.message import add_messages

class SupportState(TypedDict):
    messages: Annotated[list, add_messages]
    intent: str
    confidence: float
    customer_info: dict
    requires_escalation: bool
    order_data: dict | None
    faq_answer: str | None
    human_reviewed: bool
    final_response: str | None
```

### Tools

```python
from langchain_core.tools import tool

@tool
def search_faq(query: str) -> str:
    """Search the FAQ database for answers."""
    faq_db = {
        "return": "Our return policy allows returns within 30 days. Items must be unused.",
        "shipping": "Free shipping on orders over $50. Standard shipping takes 3-5 business days.",
        "payment": "We accept Visa, Mastercard, Amex, and PayPal.",
        "account": "You can reset your password at the login page. Contact support for account issues.",
    }
    for keyword, answer in faq_db.items():
        if keyword in query.lower():
            return answer
    return "No matching FAQ found. Escalating to human agent."

@tool
def lookup_order(order_id: str) -> dict:
    """Look up order details by ID."""
    import random
    statuses = ["processing", "shipped", "delivered", "cancelled"]
    return {
        "order_id": order_id,
        "status": random.choice(statuses),
        "items": ["Widget A", "Gadget B"],
        "total": 49.99,
        "estimated_delivery": "3-5 business days",
    }

@tool
def cancel_order(order_id: str, reason: str) -> str:
    """Cancel an order. Requires human approval."""
    raise PermissionError("Cancellation requires human supervisor approval.")

@tool
def refund_order(order_id: str, amount: float) -> str:
    """Process a refund. Requires human approval."""
    raise PermissionError("Refund requires human supervisor approval.")
```

### Supervisor Node

```python
def classify_intent(state: SupportState) -> dict:
    last_message = state["messages"][-1].content
    prompt = f"""
    Classify this customer query into one of:
    - faq: general questions, policies, how-to
    - order: order status, tracking, modifications
    - complaint: disputes, refunds, cancellations
    - human: complex issues requiring human agent

    Query: {last_message}

    Respond with JSON: {{"intent": "faq|order|complaint|human", "confidence": 0.0-1.0}}
    """
    result = llm.invoke(prompt)
    import json
    parsed = json.loads(result.content)
    return {"intent": parsed["intent"], "confidence": parsed["confidence"],
            "requires_escalation": parsed["intent"] in ("complaint", "human") or parsed["confidence"] < 0.7}
```

### Agent Nodes

```python
def faq_agent(state: SupportState) -> dict:
    last_msg = state["messages"][-1].content
    result = search_faq.invoke({"query": last_msg})
    return {"faq_answer": result}

def order_agent(state: SupportState) -> dict:
    last_msg = state["messages"][-1].content
    prompt = f"Extract order ID from: {last_msg}. Respond with JSON: {{\"order_id\": \"...\"}}"
    result = llm.invoke(prompt)
    import json, re
    match = re.search(r'\\{"order_id": "([^"]+)"\\}', result.content)
    order_id = match.group(1) if match else "unknown"
    order_data = lookup_order.invoke({"order_id": order_id})
    return {"order_data": order_data}

def human_agent(state: SupportState) -> dict:
    # In production, this would send to a ticket system
    return {
        "messages": [("assistant", "This issue has been escalated to our human support team. "
                      "You will receive a response within 2-4 hours.")],
        "human_reviewed": True,
    }
```

### Human-in-the-Loop Approval

```python
def approval_node(state: SupportState) -> dict:
    """Pause for human approval when sensitive actions are needed."""
    last_tool_call = state["messages"][-1]
    if hasattr(last_tool_call, "tool_calls") and last_tool_call.tool_calls:
        for tc in last_tool_call.tool_calls:
            if tc["name"] in ("cancel_order", "refund_order"):
                print(f"*** HUMAN APPROVAL REQUIRED ***")
                print(f"Action: {tc['name']}")
                print(f"Args: {tc['args']}")
                # In production: send to Slack/email, wait for webhook
                return {"messages": [("assistant", "This action requires supervisor approval. "
                                      "A human agent will review your request shortly.")]}
    return state
```

### Graph Construction

```python
from langgraph.graph import StateGraph, END

builder = StateGraph(SupportState)

builder.add_node("classify", classify_intent)
builder.add_node("faq", faq_agent)
builder.add_node("order", order_agent)
builder.add_node("human", human_agent)
builder.add_node("approval", approval_node)
builder.add_node("respond", lambda s: {"final_response": s["messages"][-1].content})

builder.set_entry_point("classify")

def route_after_classify(state: SupportState) -> Literal["faq", "order", "human"]:
    if state["requires_escalation"]:
        return "human"
    return {"faq": "faq", "order": "order", "complaint": "human"}.get(state["intent"], "human")

builder.add_conditional_edges("classify", route_after_classify, {
    "faq": "faq", "order": "order", "human": "human"
})

builder.add_edge("faq", "respond")
builder.add_edge("order", "approval")
builder.add_edge("approval", "respond")
builder.add_edge("human", "respond")
builder.add_edge("respond", END)

graph = builder.compile()
```

## 8.4 Running the Agent

```python
def handle_customer_query(query: str, customer_info: dict = None):
    result = graph.invoke({
        "messages": [("user", query)],
        "customer_info": customer_info or {},
        "requires_escalation": False,
    })
    return result["final_response"]

# Test cases
queries = [
    "What is your return policy?",
    "Where is my order #12345?",
    "I want a refund, this product is defective!",
    "I forgot my password, can you help?",
]

for q in queries:
    print(f"\nCustomer: {q}")
    response = handle_customer_query(q)
    print(f"Agent: {response}")
```

## 8.5 Deployment Checklist

- [ ] Intent classifier tested with real customer queries
- [ ] FAQ database populated with all common questions
- [ ] Order system integration tested
- [ ] Human escalation delivers to correct queue (Zendesk, Slack, etc.)
- [ ] Approval workflow tested for refunds/cancellations
- [ ] Rate limiting per customer: N queries/minute
- [ ] Session timeout configured (e.g., 30min idle)
- [ ] all responses logged for quality analysis
- [ ] Fallback: if agent fails, route to human immediately
- [ ] Monitoring: alert if human-escalation rate > 20%
