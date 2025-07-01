from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import math

from ..models.user import UserProfile, TDEECalculation
from ..services.tdee_service import TDEEService

router = APIRouter()

class ProfileSetupRequest(BaseModel):
    age: int
    gender: str  # "male" or "female"
    height: float  # cm
    weight: float  # kg
    body_fat_percentage: Optional[float] = None
    activity_level: str  # "sedentary", "light", "moderate", "active", "very_active"
    goal: str  # "lose_weight", "maintain", "gain_muscle"
    goal_weight: Optional[float] = None

class ProfileSetupResponse(BaseModel):
    user_profile: UserProfile
    tdee_calculation: TDEECalculation
    recommendations: dict

@router.post("/setup", response_model=ProfileSetupResponse)
async def setup_user_profile(request: ProfileSetupRequest):
    """
    Set up user profile and calculate TDEE
    """
    try:
        # Create user profile
        user_profile = UserProfile(
            age=request.age,
            gender=request.gender,
            height=request.height,
            weight=request.weight,
            body_fat_percentage=request.body_fat_percentage,
            activity_level=request.activity_level,
            goal=request.goal,
            goal_weight=request.goal_weight
        )
        
        # Calculate TDEE
        tdee_service = TDEEService()
        tdee_calculation = tdee_service.calculate_tdee(user_profile)
        
        # Generate recommendations
        recommendations = tdee_service.generate_recommendations(user_profile, tdee_calculation)
        
        return ProfileSetupResponse(
            user_profile=user_profile,
            tdee_calculation=tdee_calculation,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to setup profile: {str(e)}")

@router.get("/tdee")
async def get_tdee_info():
    """
    Get information about TDEE calculation
    """
    return {
        "description": "Total Daily Energy Expenditure calculation",
        "components": {
            "BMR": "Basal Metabolic Rate - energy needed at rest",
            "NEAT": "Non-Exercise Activity Thermogenesis",
            "TEF": "Thermic Effect of Food",
            "EAT": "Exercise Activity Thermogenesis"
        },
        "activity_levels": {
            "sedentary": "Little to no exercise (1.2x BMR)",
            "light": "Light exercise 1-3 days/week (1.375x BMR)",
            "moderate": "Moderate exercise 3-5 days/week (1.55x BMR)",
            "active": "Heavy exercise 6-7 days/week (1.725x BMR)",
            "very_active": "Very heavy exercise, physical job (1.9x BMR)"
        }
    }