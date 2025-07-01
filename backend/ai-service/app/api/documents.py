from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional
import os
import shutil
from pathlib import Path

from ..services.rag_service import RAGService

router = APIRouter()

UPLOAD_DIR = Path("./uploaded_documents")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    topic: Optional[str] = None,
    source: Optional[str] = None
):
    """
    Upload a document to the RAG knowledge base
    """
    try:
        # Validate file type
        if not file.filename.endswith(('.pdf', '.txt')):
            raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported")
        
        # Save uploaded file
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Add to RAG
        rag_service = RAGService()
        metadata = {}
        if topic:
            metadata["topic"] = topic
        if source:
            metadata["sources"] = source
            
        success = await rag_service.add_document(str(file_path), metadata)
        
        if success:
            return {
                "message": f"Document '{file.filename}' uploaded successfully",
                "file_path": str(file_path),
                "metadata": metadata
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to process document")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/topics")
async def get_topics():
    """
    Get all available topics in the knowledge base
    """
    rag_service = RAGService()
    topics = rag_service.get_all_topics()
    return {"topics": topics}

@router.post("/clear-memory")
async def clear_memory():
    """
    Clear conversation memory
    """
    rag_service = RAGService()
    rag_service.clear_conversation_memory()
    return {"message": "Conversation memory cleared"}