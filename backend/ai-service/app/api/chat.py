from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

from ..services.ai_service import AIService
from ..models.chat import ChatMessage, ChatRequest, ChatResponse
from ..config import get_settings
from ..middleware.auth import auth_bearer, get_current_user_id

router = APIRouter()

class MessageRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    user_profile: Optional[dict] = None

class MessageResponse(BaseModel):
    response: str
    conversation_id: str
    sources: Optional[List[str]] = None
    timestamp: datetime

@router.post("/message", response_model=MessageResponse, dependencies=[Depends(auth_bearer)])
async def send_message(request: MessageRequest, req: Request):
    """
    Send a message to the AI and get a response
    """
    try:
        # Get AI service
        ai_service = AIService()
        
        # Get current user ID
        user_id = get_current_user_id(req)
        
        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Get AI response
        response = await ai_service.get_chat_response(
            message=request.message,
            user_profile=request.user_profile,
            conversation_id=conversation_id
        )
        
        return MessageResponse(
            response=response.content,
            conversation_id=conversation_id,
            sources=response.sources,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process message: {str(e)}")

@router.get("/health")
async def chat_health():
    """
    Health check for chat service
    """
    return {"status": "Chat service is healthy"}

@router.post("/conversation/new")
async def start_new_conversation():
    """
    Start a new conversation
    """
    conversation_id = str(uuid.uuid4())
    return {
        "conversation_id": conversation_id,
        "message": "New conversation started! I'm your AI fat loss expert. How can I help you today?"
    }