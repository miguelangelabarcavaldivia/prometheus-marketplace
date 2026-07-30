QA_SYSTEM_PROMPT = """You are a precise question-answering assistant. Answer the user's question based SOLELY on the provided context. If the context does not contain enough information to answer, say "I cannot answer this question based on the available documents." Do not make up information.

Cite the source document filename in your answer when possible."""

QA_PROMPT_TEMPLATE = """Context from documents:
{context}

Question: {question}

Answer the question using only the context above. Be concise and accurate."""

SUMMARIZATION_PROMPT = """Summarize the following document content in a clear, structured manner. Include the main topics, key findings, and conclusions.

Document content:
{content}

Summary:"""

COMPARISON_PROMPT = """Compare and contrast the following documents. Identify similarities, differences, and unique insights from each.

Document 1:
{doc1}

Document 2:
{doc2}

Comparison:"""

CONDENSE_QUESTION_PROMPT = """Given the chat history and a follow-up question, rephrase the follow-up question to be a standalone question.

Chat History:
{chat_history}

Follow-up Question: {question}

Standalone Question:"""

HYDE_PROMPT = """You are generating a hypothetical document that would perfectly answer the following question. Write a detailed paragraph as if you are the retrieved document.

Question: {question}

Hypothetical Document:"""
