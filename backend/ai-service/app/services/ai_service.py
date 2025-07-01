import openai
from typing import Optional, Dict, Any
import json

from ..config import get_settings
from ..models.chat import ChatResponse
from .rag_service import RAGService

class AIService:
    def __init__(self):
        self.settings = get_settings()
        openai.api_key = self.settings.openai_api_key
        self.rag_service = RAGService()
        
    async def get_chat_response(
        self, 
        message: str, 
        user_profile: Optional[Dict[str, Any]] = None,
        conversation_id: str = ""
    ) -> ChatResponse:
        """
        Get AI response with RAG-enhanced context
        """
        try:
            # Get relevant knowledge from RAG
            rag_context = await self.rag_service.get_relevant_context(message)
            
            # Build system prompt
            system_prompt = self._build_system_prompt(user_profile, rag_context)
            
            # Build messages
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ]
            
            # Get AI response
            response = await openai.ChatCompletion.acreate(
                model=self.settings.default_model,
                messages=messages,
                max_tokens=self.settings.max_tokens,
                temperature=self.settings.temperature
            )
            
            content = response.choices[0].message.content
            sources = rag_context.get("sources", []) if rag_context else []
            
            return ChatResponse(
                content=content,
                sources=sources,
                conversation_id=conversation_id
            )
            
        except Exception as e:
            # Fallback response
            return ChatResponse(
                content=f"I apologize, but I'm having trouble processing your request right now. Could you please try again? Error: {str(e)}",
                sources=[],
                conversation_id=conversation_id
            )
    
    def _build_system_prompt(self, user_profile: Optional[Dict], rag_context: Optional[Dict]) -> str:
        """
        Build comprehensive system prompt for the AI
        """
        base_prompt = """You are a science-based AI fat loss expert. Your role is to provide evidence-based, personalized advice for sustainable fat loss and health improvement.

Core Principles:
1. Always prioritize safety and health over rapid results
2. Base recommendations on scientific research
3. Consider individual differences and limitations
4. Promote sustainable lifestyle changes over quick fixes
5. Encourage consulting healthcare professionals for medical concerns

Your expertise covers:
- Caloric deficit principles and TDEE calculation
- Macronutrient optimization for fat loss
- Exercise selection and programming
- Habit formation and behavior change
- Plateau-breaking strategies
- Metabolic adaptation management"""

        # Add user context
        if user_profile:
            user_context = f"""

User Profile:
- Age: {user_profile.get('age', 'Not specified')}
- Gender: {user_profile.get('gender', 'Not specified')}
- Weight: {user_profile.get('weight', 'Not specified')} kg
- Height: {user_profile.get('height', 'Not specified')} cm
- Activity Level: {user_profile.get('activity_level', 'Not specified')}
- Goal: {user_profile.get('goal', 'Not specified')}

Personalize your advice based on this profile."""

            base_prompt += user_context

        # Add scientific context from RAG
        if rag_context and rag_context.get("content"):
            scientific_context = f"""

Relevant Scientific Research:
{rag_context['content']}

Use this research to support your recommendations and cite sources when appropriate."""
            
            base_prompt += scientific_context

        base_prompt += """

Response Guidelines:
- Be conversational but professional
- Provide specific, actionable advice
- Explain the reasoning behind recommendations
- Mention scientific backing when available
- Ask clarifying questions when needed
- Keep responses focused and practical"""

        return base_prompt