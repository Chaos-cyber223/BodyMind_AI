from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="BodyMind AI Service",
    description="AI-powered science-based fat loss expert backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:19006",  # Expo web
        "http://localhost:3000",   # Alternative frontend
        "exp://192.168.*:19000"    # Expo mobile
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
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

class ProfileSetupRequest(BaseModel):
    age: int
    gender: str  # "male" or "female"
    height: float  # cm
    weight: float  # kg
    body_fat_percentage: Optional[float] = None
    activity_level: str  # "sedentary", "light", "moderate", "active", "very_active"
    goal: str  # "lose_weight", "maintain", "gain_muscle"
    goal_weight: Optional[float] = None

@app.get("/")
async def root():
    return {"message": "BodyMind AI Service is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "version": "1.0.0",
        "environment": "development"
    }

@app.post("/api/chat/message", response_model=MessageResponse)
async def send_message(request: MessageRequest):
    """
    Send a message to the AI and get a response
    """
    try:
        # Simple response for testing
        response_text = f"I received your message: '{request.message}'. This is a test response from the AI service. Based on scientific research, I recommend focusing on a balanced approach to fat loss with proper nutrition and exercise."
        
        return MessageResponse(
            response=response_text,
            conversation_id=request.conversation_id or "test-conversation",
            sources=["Test Source"],
            timestamp=datetime.now()
        )
        
    except Exception as e:
        return MessageResponse(
            response=f"Sorry, I encountered an error: {str(e)}",
            conversation_id=request.conversation_id or "error-conversation",
            sources=[],
            timestamp=datetime.now()
        )

@app.post("/api/profile/setup")
async def setup_user_profile(request: ProfileSetupRequest):
    """
    Set up user profile and calculate TDEE
    """
    try:
        # Simple TDEE calculation (Mifflin-St Jeor)
        if request.gender.lower() == "male":
            bmr = 10 * request.weight + 6.25 * request.height - 5 * request.age + 5
        else:
            bmr = 10 * request.weight + 6.25 * request.height - 5 * request.age - 161
        
        # Activity multipliers
        activity_multipliers = {
            "sedentary": 1.2,
            "light": 1.375,
            "moderate": 1.55,
            "active": 1.725,
            "very_active": 1.9
        }
        
        tdee = bmr * activity_multipliers.get(request.activity_level, 1.55)
        
        # Calculate target calories based on goal
        if request.goal == "lose_weight":
            target_calories = tdee - 500  # 500 calorie deficit
        elif request.goal == "gain_muscle":
            target_calories = tdee + 300  # 300 calorie surplus
        else:
            target_calories = tdee
        
        return {
            "user_profile": request.dict(),
            "calculations": {
                "bmr": round(bmr, 1),
                "tdee": round(tdee, 1),
                "target_calories": round(target_calories, 1)
            },
            "recommendations": {
                "daily_calories": f"Target {round(target_calories)} calories per day",
                "protein": f"Eat {round(request.weight * 2.2)} grams of protein daily",
                "note": "This is a simplified calculation for testing"
            }
        }
        
    except Exception as e:
        return {"error": f"Failed to setup profile: {str(e)}"}

@app.get("/api/chat/health")
async def chat_health():
    """
    Health check for chat service
    """
    return {"status": "Chat service is healthy"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc)
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main_simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )