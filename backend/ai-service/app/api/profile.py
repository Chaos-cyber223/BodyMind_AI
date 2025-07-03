from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
import math

from ..models.user import UserProfile, TDEECalculation
from ..services.tdee_service import TDEEService
from ..services.supabase_service import supabase_service
from ..middleware.auth import auth_bearer, get_current_user_id

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

@router.post("/setup", response_model=ProfileSetupResponse, dependencies=[Depends(auth_bearer)])
async def setup_user_profile(request: ProfileSetupRequest, req: Request):
    """
    Set up user profile and calculate TDEE
    """
    try:
        # Get current user ID
        user_id = get_current_user_id(req)
        
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
        
        # Store profile in database
        profile_data = {
            "age": request.age,
            "gender": request.gender,
            "height": request.height,
            "weight": request.weight,
            "body_fat_percentage": request.body_fat_percentage,
            "activity_level": request.activity_level,
            "goal": request.goal,
            "goal_weight": request.goal_weight,
            "bmr": tdee_calculation.bmr,
            "tdee": tdee_calculation.tdee,
            "target_calories": tdee_calculation.target_calories,
            "target_protein": tdee_calculation.target_protein,
            "target_fat": tdee_calculation.target_fat,
            "target_carbs": tdee_calculation.target_carbs
        }
        
        # Check if profile exists
        existing_profile = await supabase_service.get_user_profile(user_id)
        if existing_profile:
            await supabase_service.update_user_profile(user_id, profile_data)
        else:
            await supabase_service.create_user_profile(user_id, profile_data)
        
        # Record initial weight
        await supabase_service.record_weight(user_id, request.weight)
        
        return ProfileSetupResponse(
            user_profile=user_profile,
            tdee_calculation=tdee_calculation,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to setup profile: {str(e)}")

@router.get("/current", dependencies=[Depends(auth_bearer)])
async def get_current_profile(req: Request):
    """
    Get current user's profile
    """
    try:
        user_id = get_current_user_id(req)
        profile = await supabase_service.get_user_profile(user_id)
        
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return profile
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")

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