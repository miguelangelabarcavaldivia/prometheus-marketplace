from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.retrieval.vectorstore import delete_document, list_documents

router = APIRouter()


@router.get("/documents", response_model=list[dict])
async def get_documents():
    try:
        docs = await list_documents()
        return docs
    except Exception as exc:
        raise HTTPException(500, f"Failed to list documents: {exc}")


@router.delete("/documents/{document_id}", response_model=dict)
async def remove_document(document_id: str):
    try:
        deleted = await delete_document(document_id)
        if deleted == 0:
            raise HTTPException(404, f"Document not found: {document_id}")
        return {"deleted": deleted, "document_id": document_id}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(500, f"Failed to delete document: {exc}")
