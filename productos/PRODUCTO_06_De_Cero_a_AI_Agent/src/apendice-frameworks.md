# Appendix A — Framework Comparison

## Quick Comparison Table

| Feature | LangChain | LangGraph | CrewAI | AutoGen | Semantic Kernel |
|---------|-----------|-----------|--------|---------|----------------|
| Core concept | Chains & agents | State graphs | Roles & crews | Conversations | Skills & plugins |
| Multi-agent | Via tools | Via subgraphs | Native (roles) | Native (group chat) | Via planners |
| State management | Implicit (messages) | Explicit (TypedDict) | Shared memory | Conversation history | Context variables |
| Code execution | Via tools | Via tools | Via tools | Native (UserProxy) | Via skills |
| Human-in-loop | Callbacks | Interrupt nodes | Via tasks | Native | Via planners |
| Memory | External | Built-in (checkpointer) | Built-in (3 types) | Via conversation | External |
| Streaming | Yes | Yes | Yes | Yes | Yes |
| Learning curve | Low | Medium | Low | Medium | Medium |
| Python version | 3.8+ | 3.10+ | 3.10+ | 3.8+ | 3.8+ |
| Microsoft support | No | No | No | Yes | Yes |
| LangSmith tracing | Yes | Yes | Yes | No | No |

## When to Use Each

```
Use LangChain when:
  - You need a simple Q&A agent
  - Prototyping quickly
  - Single-agent workflows
  - You want maximum ecosystem (tools, integrations)

Use LangGraph when:
  - You need custom, non-linear agent flows
  - Complex state management
  - Reflection/critique patterns
  - Human-in-the-loop approval gates
  - Fine-grained control over execution

Use CrewAI when:
  - Building role-based agent teams
  - Content creation pipelines (write → edit → review)
  - You think in terms of roles and tasks
  - Sequential or hierarchical workflows

Use AutoGen when:
  - Agents need to converse freely
  - Code execution is core to the workflow
  - Building autonomous development teams
  - You want native group chat conversations

Use Semantic Kernel when:
  - Your stack is .NET/C#
  - You need deep Azure AI integration
  - Enterprise Microsoft ecosystem
  - Planning-based workflows
```

## Architecture Comparison

### LangChain
```
Input → Prompt → LLM → Tool? → Yes → Execute → Loop
                     → No  → Output
```

### LangGraph
```
         ┌─────────┐
         │  Start  │
         └────┬────┘
              ▼
         ┌─────────┐
         │  Node A │──→ Conditional ──→ Node B
         └─────────┘       │              │
                           └──→ Node C ───┘
                                    │
                                    ▼
                                   End
```

### CrewAI
```
┌──────────────────────────┐
│         CREW             │
│  Agent(A) ─→ Task(1)     │
│  Agent(B) ─→ Task(2)     │
│  Agent(C) ─→ Task(3)     │
│  Sequential / Hierarchical│
└──────────────────────────┘
```

### AutoGen
```
AssistantAgent ◄────► UserProxyAgent
      │
      ▼
GroupChat: [A1, A2, A3] ─→ GroupChatManager
```

## Performance Considerations

| Aspect | LangChain | LangGraph | CrewAI | AutoGen |
|--------|-----------|-----------|--------|---------|
| Tokens per task | Medium | Medium-High (state serialization) | High (role prompts) | High (conversation) |
| Cold start | Fast | Fast | Slow (agent init) | Fast |
| Parallelism | Via LCEL | Via nodes | Via async tasks | Via group chat |
| Memory usage | Low | Medium (state tracking) | Medium | Low |

## Migration Path

```
LangChain (simple)
     │
     ▼
LangGraph (complex flows)
     │
     ├──→ CrewAI (role-based teams)
     │
     └──→ AutoGen (conversational/code)
```

Start with LangChain for prototyping. Move to LangGraph when you need custom flows. Add CrewAI or AutoGen for multi-agent scenarios.
