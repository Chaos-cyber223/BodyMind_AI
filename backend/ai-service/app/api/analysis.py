from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from ..services.parser_service import ParserService
from ..models.nutrition import FoodItem, ExerciseItem

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

@router.post("/food", response_model=FoodAnalysisResponse)
async def analyze_food(request: FoodAnalysisRequest):
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
        
        return FoodAnalysisResponse(
            foods=foods,
            total_calories=total_calories,
            total_macros=total_macros,
            suggestions=suggestions
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze food: {str(e)}")

@router.post("/exercise", response_model=ExerciseAnalysisResponse)
async def analyze_exercise(request: ExerciseAnalysisRequest):
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
        
        return ExerciseAnalysisResponse(
            exercises=exercises,
            total_calories_burned=total_calories_burned,
            suggestions=suggestions
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze exercise: {str(e)}")

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