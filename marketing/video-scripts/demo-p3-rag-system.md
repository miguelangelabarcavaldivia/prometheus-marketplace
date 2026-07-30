## RAG System Template — Demo Video (3:30)

| Time | Visual | Narration (ES) |
|------|--------|----------------|
| 0:00 | Opening: "RAG System Template" with "RAG en producción en 10 minutos" | "Hola. Hoy te voy a mostrar cómo tener un sistema RAG funcionando en producción en menos de 10 minutos con el RAG System Template de Prometheus." |
| 0:15 | Project structure in VSCode — `ingestion/`, `retrieval/`, `api/`, `frontend/` | "Este template te da el pipeline completo: ingestión de documentos, chunking inteligente, embeddings, retrieval, y una API lista para conectar." |
| 0:35 | Terminal: run `docker compose up`, show containers spinning up | "Un solo comando levanta todo: PostgreSQL con pgvector, Qdrant, y la API de embeddings. `docker compose up` y listo." |
| 0:55 | Web UI: drag & drop a PDF (e.g., "Manual de Next.js") | "Arrastras un PDF, DOCX o Markdown. El sistema lo procesa automáticamente: extrae texto, lo divide en chunks inteligentes y genera embeddings." |
| 1:20 | Side-by-side comparison of chunking strategies: fixed vs semantic vs recursive | "El template incluye 3 estrategias de chunking: fijo, semántico y recursivo. Puedes compararlas lado a lado y ver cuál da mejor resultado para tu documento." |
| 1:50 | Ask a question in the chat: "¿Cómo configuro el App Router?" — shows relevant chunks highlighted | "Haces una pregunta sobre el documento. El sistema busca los chunks más relevantes y te muestra exactamente de dónde sacó la información." |
| 2:15 | Benchmark dashboard — shows comparison table: chunk size, overlap, retrieval score, latency | "El dashboard de benchmark te permite comparar configuraciones: tamaño de chunk, solapamiento, top-k, y modelo de embeddings. Ves métricas de latency y precisión." |
| 2:45 | Open `ingestion/config.yaml` — show the config structure | "Toda la configuración está en YAML. Cambias el chunk size, el modelo de embeddings, el proveedor vectorial — todo desde un solo archivo." |
| 3:05 | API example: `curl` request to `/api/rag/query` showing response | "La API REST está documentada con Swagger. Haces una petición y obtienes la respuesta con los chunks y sus scores de relevancia." |
| 3:20 | CTA screen: "RAG System Template — $39 USD" with LAUNCH40 | "Consigue el RAG System Template por $39 USD. Usa LAUNCH40 y obtén un 40% de descuento. Enlace en la descripción." |
| 3:30 | Prometheus logo | "Prometheus — Código con intención." |
