from typing import Optional, Dict, Any
import json
import logging
import os

from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage

from ..config import get_settings
from ..models.chat import ChatResponse
from .rag_service import RAGService

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.settings = get_settings()
        self.rag_service = RAGService()
        
        # Initialize LLM with SiliconFlow API
        self.llm = ChatOpenAI(
            openai_api_key=self.settings.openai_api_key,
            openai_api_base=os.getenv("OPENAI_API_BASE", "https://api.siliconflow.cn/v1"),
            model_name=self.settings.default_model,
            temperature=self.settings.temperature,
            max_tokens=self.settings.max_tokens
        )
        
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
            rag_context = await self.rag_service.get_relevant_context(message, conversation_id)
            
            # If RAG provided an answer, use it directly
            if rag_context and rag_context.get("content"):
                # Build a refined prompt to enhance the RAG answer
                system_prompt = self._build_system_prompt(user_profile)
                
                messages = [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=f"""Based on the following scientific research, please provide a comprehensive and personalized answer to the user's question.

Research Context:
{rag_context['content']}

User Question: {message}

Please provide a detailed, actionable response that incorporates the research findings and is tailored to the user's profile.""")
                ]
                
                # Get enhanced response
                response = await self.llm.agenerate([messages])
                content = response.generations[0][0].text
                sources = rag_context.get("sources", [])
            else:
                # Fallback to general knowledge without RAG
                system_prompt = self._build_system_prompt(user_profile)
                
                messages = [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=message)
                ]
                
                response = await self.llm.agenerate([messages])
                content = response.generations[0][0].text
                sources = []
            
            return ChatResponse(
                content=content,
                sources=sources,
                conversation_id=conversation_id
            )
            
        except Exception as e:
            logger.error(f"Error in get_chat_response: {str(e)}")
            # Fallback response
            return ChatResponse(
                content=f"I apologize, but I'm having trouble processing your request right now. Could you please try again? Error: {str(e)}",
                sources=[],
                conversation_id=conversation_id
            )
    
    def _build_system_prompt(self, user_profile: Optional[Dict]) -> str:
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


        base_prompt += """

Response Guidelines:
- Be conversational but professional
- Provide specific, actionable advice
- Explain the reasoning behind recommendations
- Mention scientific backing when available
- Ask clarifying questions when needed
- Keep responses focused and practical"""

        return base_prompt