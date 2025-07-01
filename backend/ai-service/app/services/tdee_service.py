from typing import Dict, Any
import math

from ..models.user import UserProfile, TDEECalculation, Gender, ActivityLevel, Goal

class TDEEService:
    def __init__(self):
        # Activity level multipliers
        self.activity_multipliers = {
            ActivityLevel.SEDENTARY: 1.2,
            ActivityLevel.LIGHT: 1.375,
            ActivityLevel.MODERATE: 1.55,
            ActivityLevel.ACTIVE: 1.725,
            ActivityLevel.VERY_ACTIVE: 1.9
        }
    
    def calculate_tdee(self, profile: UserProfile) -> TDEECalculation:
        """
        Calculate Total Daily Energy Expenditure using Mifflin-St Jeor equation
        """
        # Calculate BMR
        if profile.body_fat_percentage and profile.body_fat_percentage > 0:
            # Use Katch-McArdle if body fat is available (more accurate)
            lean_mass = profile.weight * (100 - profile.body_fat_percentage) / 100
            bmr = 370 + (21.6 * lean_mass)
            method = "Katch-McArdle"
        else:
            # Use Mifflin-St Jeor equation
            if profile.gender == Gender.MALE:
                bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
            else:  # Female
                bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161
            method = "Mifflin-St Jeor"
        
        # Calculate TDEE
        activity_multiplier = self.activity_multipliers[profile.activity_level]
        tdee = bmr * activity_multiplier
        
        # Calculate target calories based on goal
        target_calories = self._calculate_target_calories(tdee, profile.goal)
        
        # Calculate recommended macros
        macros = self._calculate_macros(target_calories, profile)
        
        return TDEECalculation(
            bmr=round(bmr, 1),
            tdee=round(tdee, 1),
            target_calories=round(target_calories, 1),
            macros=macros,
            activity_multiplier=activity_multiplier,
            method=method
        )
    
    def _calculate_target_calories(self, tdee: float, goal: Goal) -> float:
        """
        Calculate target calories based on goal
        """
        if goal == Goal.LOSE_WEIGHT:
            # 500-750 calorie deficit for 1-1.5 lbs per week
            return tdee - 500
        elif goal == Goal.GAIN_MUSCLE:
            # 200-500 calorie surplus
            return tdee + 300
        else:  # Maintain
            return tdee
    
    def _calculate_macros(self, target_calories: float, profile: UserProfile) -> Dict[str, float]:
        """
        Calculate recommended macronutrient breakdown
        """
        # Protein: 0.8-1.2g per lb of body weight (prioritize protein)
        weight_lbs = profile.weight * 2.205
        protein_grams = weight_lbs * 1.0  # 1g per lb
        protein_calories = protein_grams * 4
        
        # Fat: 25-30% of total calories
        fat_calories = target_calories * 0.27
        fat_grams = fat_calories / 9
        
        # Carbs: remaining calories
        carb_calories = target_calories - protein_calories - fat_calories
        carb_grams = carb_calories / 4
        
        return {
            "protein_grams": round(protein_grams, 1),
            "carb_grams": round(carb_grams, 1),
            "fat_grams": round(fat_grams, 1),
            "protein_calories": round(protein_calories, 1),
            "carb_calories": round(carb_calories, 1),
            "fat_calories": round(fat_calories, 1)
        }
    
    def generate_recommendations(self, profile: UserProfile, tdee_calc: TDEECalculation) -> Dict[str, Any]:
        """
        Generate personalized recommendations
        """
        recommendations = {
            "daily_calories": f"Target {tdee_calc.target_calories} calories per day",
            "protein": f"Eat {tdee_calc.macros['protein_grams']}g protein daily",
            "hydration": "Drink at least 2-3 liters of water daily",
            "meal_frequency": "3-4 meals per day with protein at each meal"
        }
        
        if profile.goal == Goal.LOSE_WEIGHT:
            recommendations.update({
                "deficit": "You're in a 500-calorie deficit for healthy weight loss",
                "rate": "Expect to lose 1-2 pounds per week",
                "exercise": "Combine resistance training with moderate cardio"
            })
        elif profile.goal == Goal.GAIN_MUSCLE:
            recommendations.update({
                "surplus": "You're in a calorie surplus to support muscle growth",
                "exercise": "Focus on progressive overload resistance training",
                "protein_timing": "Spread protein intake throughout the day"
            })
        
        return recommendations