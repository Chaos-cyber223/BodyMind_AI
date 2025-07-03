from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from ..services.parser_service import ParserService
from ..services.supabase_service import supabase_service
from ..models.nutrition import FoodItem, ExerciseItem
from ..middleware.auth import auth_bearer, get_current_user_id

router = APIRouter()

class FoodAnalysisRequest(BaseModel):
    text: str  # e.g., "I ate an apple and two slices of bread"
    
class FoodAnalysisResponse(BaseModel):
    foods: List[FoodItem]
    total_calories: float
    total_macros: dict
    suggestions: List[str]

class ExerciseAnalysisRequest(BaseModel):
    text: str  # e.g., "I ran for 30 minutes and did 20 push-ups"
    user_weight: Optional[float] = None  # kg

class ExerciseAnalysisResponse(BaseModel):
    exercises: List[ExerciseItem]
    total_calories_burned: float
    suggestions: List[str]

@router.post("/food", response_model=FoodAnalysisResponse, dependencies=[Depends(auth_bearer)])
async def analyze_food(request: FoodAnalysisRequest, req: Request):
    """
    Analyze food intake from natural language description
    """
    try:
        parser_service = ParserService()
        
        # Parse food items
        foods = await parser_service.parse_food_description(request.text)
        
        # Calculate totals
        total_calories = sum(food.calories for food in foods)
        total_macros = {
            "protein": sum(food.protein for food in foods),
            "carbs": sum(food.carbs for food in foods),
            "fat": sum(food.fat for food in foods),
            "fiber": sum(food.fiber or 0 for food in foods)
        }
        
        # Generate suggestions
        suggestions = parser_service.generate_food_suggestions(foods, total_macros)
        
        # Store in database
        user_id = get_current_user_id(req)
        for food in foods:
            nutrition_data = {
                "description": request.text,
                "food_name": food.name,
                "quantity": food.quantity,
                "unit": food.unit,
                "calories": food.calories,
                "protein": food.protein,
                "carbs": food.carbs,
                "fat": food.fat,
                "fiber": food.fiber,
                "meal_type": food.meal_type
            }
            await supabase_service.log_nutrition(user_id, nutrition_data)
        
        return FoodAnalysisResponse(
            foods=foods,
            total_calories=total_calories,
            total_macros=total_macros,
            suggestions=suggestions
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze food: {str(e)}")

@router.post("/exercise", response_model=ExerciseAnalysisResponse, dependencies=[Depends(auth_bearer)])
async def analyze_exercise(request: ExerciseAnalysisRequest, req: Request):
    """
    Analyze exercise from natural language description
    """
    try:
        parser_service = ParserService()
        
        # Parse exercise items
        exercises = await parser_service.parse_exercise_description(
            request.text, 
            user_weight=request.user_weight
        )
        
        # Calculate total calories burned
        total_calories_burned = sum(exercise.calories_burned for exercise in exercises)
        
        # Generate suggestions
        suggestions = parser_service.generate_exercise_suggestions(exercises)
        
        # Store in database
        user_id = get_current_user_id(req)
        for exercise in exercises:
            exercise_data = {
                "description": request.text,
                "exercise_name": exercise.name,
                "duration_minutes": exercise.duration_minutes,
                "intensity": exercise.intensity,
                "calories_burned": exercise.calories_burned,
                "exercise_type": exercise.exercise_type
            }
            await supabase_service.log_exercise(user_id, exercise_data)
        
        return ExerciseAnalysisResponse(
            exercises=exercises,
            total_calories_burned=total_calories_burned,
            suggestions=suggestions
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze exercise: {str(e)}")

@router.get("/nutrition-logs", dependencies=[Depends(auth_bearer)])
async def get_nutrition_logs(req: Request, date: Optional[str] = None):
    """
    Get nutrition logs for the current user
    
    Args:
        date: Optional date filter in YYYY-MM-DD format
    """
    try:
        user_id = get_current_user_id(req)
        logs = await supabase_service.get_nutrition_logs(user_id, date)
        return {"logs": logs, "count": len(logs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get nutrition logs: {str(e)}")

@router.get("/exercise-logs", dependencies=[Depends(auth_bearer)])
async def get_exercise_logs(req: Request, date: Optional[str] = None):
    """
    Get exercise logs for the current user
    
    Args:
        date: Optional date filter in YYYY-MM-DD format
    """
    try:
        user_id = get_current_user_id(req)
        logs = await supabase_service.get_exercise_logs(user_id, date)
        return {"logs": logs, "count": len(logs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get exercise logs: {str(e)}")

@router.get("/daily-summary", dependencies=[Depends(auth_bearer)])
async def get_daily_summary(req: Request, date: Optional[str] = None):
    """
    Get daily summary of nutrition and exercise
    
    Args:
        date: Date in YYYY-MM-DD format (defaults to today)
    """
    try:
        user_id = get_current_user_id(req)
        
        # Default to today if no date provided
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")
        
        # Get logs
        nutrition_logs = await supabase_service.get_nutrition_logs(user_id, date)
        exercise_logs = await supabase_service.get_exercise_logs(user_id, date)
        
        # Calculate totals
        total_calories = sum(log.get("calories", 0) for log in nutrition_logs)
        total_protein = sum(log.get("protein", 0) for log in nutrition_logs)
        total_carbs = sum(log.get("carbs", 0) for log in nutrition_logs)
        total_fat = sum(log.get("fat", 0) for log in nutrition_logs)
        total_fiber = sum(log.get("fiber", 0) for log in nutrition_logs)
        total_calories_burned = sum(log.get("calories_burned", 0) for log in exercise_logs)
        
        return {
            "date": date,
            "nutrition": {
                "total_calories": total_calories,
                "total_protein": total_protein,
                "total_carbs": total_carbs,
                "total_fat": total_fat,
                "total_fiber": total_fiber,
                "log_count": len(nutrition_logs)
            },
            "exercise": {
                "total_calories_burned": total_calories_burned,
                "total_duration_minutes": sum(log.get("duration_minutes", 0) for log in exercise_logs),
                "log_count": len(exercise_logs)
            },
            "net_calories": total_calories - total_calories_burned
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get daily summary: {str(e)}")

@router.get("/nutrition-database")
async def get_nutrition_info():
    """
    Get information about nutrition database
    """
    return {
        "description": "Common foods nutrition information",
        "source": "USDA FoodData Central",
        "note": "Values are approximate and may vary based on preparation and brand"
    }