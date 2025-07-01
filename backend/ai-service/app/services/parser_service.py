from typing import List, Dict, Optional
import re

from ..models.nutrition import FoodItem, ExerciseItem

class ParserService:
    def __init__(self):
        # Basic food database (simplified for MVP)
        self.food_database = {
            "apple": {"calories": 95, "protein": 0.5, "carbs": 25, "fat": 0.3, "fiber": 4},
            "banana": {"calories": 105, "protein": 1.3, "carbs": 27, "fat": 0.4, "fiber": 3},
            "bread": {"calories": 80, "protein": 3, "carbs": 15, "fat": 1, "fiber": 2},
            "chicken breast": {"calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "fiber": 0},
            "rice": {"calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3, "fiber": 0.4},
            "egg": {"calories": 70, "protein": 6, "carbs": 0.5, "fat": 5, "fiber": 0},
            "milk": {"calories": 150, "protein": 8, "carbs": 12, "fat": 8, "fiber": 0},
            "yogurt": {"calories": 100, "protein": 10, "carbs": 12, "fat": 0, "fiber": 0},
            "oats": {"calories": 150, "protein": 5, "carbs": 27, "fat": 3, "fiber": 4}
        }
        
        # Exercise database (calories per minute for 70kg person)
        self.exercise_database = {
            "running": 10,
            "walking": 4,
            "cycling": 8,
            "swimming": 12,
            "push-ups": 8,
            "squats": 6,
            "planks": 3,
            "jumping jacks": 9
        }
    
    async def parse_food_description(self, text: str) -> List[FoodItem]:
        """
        Parse food description into FoodItem objects
        """
        foods = []
        text_lower = text.lower()
        
        # Simple pattern matching for quantities and foods
        for food_name, nutrition in self.food_database.items():
            if food_name in text_lower:
                # Try to extract quantity
                quantity = self._extract_quantity(text_lower, food_name)
                multiplier = self._quantity_to_multiplier(quantity)
                
                food_item = FoodItem(
                    name=food_name.title(),
                    quantity=quantity or "1 serving",
                    calories=nutrition["calories"] * multiplier,
                    protein=nutrition["protein"] * multiplier,
                    carbs=nutrition["carbs"] * multiplier,
                    fat=nutrition["fat"] * multiplier,
                    fiber=nutrition.get("fiber", 0) * multiplier,
                    confidence=0.8
                )
                foods.append(food_item)
        
        return foods
    
    async def parse_exercise_description(self, text: str, user_weight: Optional[float] = None) -> List[ExerciseItem]:
        """
        Parse exercise description into ExerciseItem objects
        """
        exercises = []
        text_lower = text.lower()
        weight_kg = user_weight or 70  # Default to 70kg
        
        for exercise_name, cals_per_min in self.exercise_database.items():
            if exercise_name in text_lower:
                # Extract duration or reps
                duration = self._extract_duration(text_lower, exercise_name)
                reps = self._extract_reps(text_lower, exercise_name)
                
                if duration:
                    calories_burned = cals_per_min * duration * (weight_kg / 70)
                    exercise_item = ExerciseItem(
                        name=exercise_name.title(),
                        duration=duration,
                        calories_burned=round(calories_burned, 1),
                        intensity="moderate",
                        confidence=0.8
                    )
                elif reps:
                    # Estimate calories for rep-based exercises
                    estimated_duration = reps / 20  # Rough estimate: 20 reps per minute
                    calories_burned = cals_per_min * estimated_duration * (weight_kg / 70)
                    exercise_item = ExerciseItem(
                        name=exercise_name.title(),
                        repetitions=reps,
                        calories_burned=round(calories_burned, 1),
                        intensity="moderate",
                        confidence=0.7
                    )
                else:
                    # Default assumption: 10 minutes
                    calories_burned = cals_per_min * 10 * (weight_kg / 70)
                    exercise_item = ExerciseItem(
                        name=exercise_name.title(),
                        duration=10,
                        calories_burned=round(calories_burned, 1),
                        intensity="moderate",
                        confidence=0.6
                    )
                
                exercises.append(exercise_item)
        
        return exercises
    
    def _extract_quantity(self, text: str, food_name: str) -> Optional[str]:
        """
        Extract quantity from text
        """
        # Look for numbers before the food name
        pattern = r'(\d+\.?\d*)\s*(?:cups?|slices?|pieces?|servings?)?\s*' + re.escape(food_name)
        match = re.search(pattern, text)
        if match:
            return f"{match.group(1)} serving(s)"
        return None
    
    def _quantity_to_multiplier(self, quantity: Optional[str]) -> float:
        """
        Convert quantity string to multiplier
        """
        if not quantity:
            return 1.0
        
        # Extract number from quantity
        match = re.search(r'(\d+\.?\d*)', quantity)
        if match:
            return float(match.group(1))
        return 1.0
    
    def _extract_duration(self, text: str, exercise_name: str) -> Optional[int]:
        """
        Extract duration in minutes
        """
        # Look for patterns like "30 minutes", "for 20 min"
        patterns = [
            r'(\d+)\s*(?:minutes?|mins?)',
            r'for\s*(\d+)',
            r'(\d+)\s*' + re.escape(exercise_name)
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return int(match.group(1))
        return None
    
    def _extract_reps(self, text: str, exercise_name: str) -> Optional[int]:
        """
        Extract repetitions
        """
        # Look for patterns like "20 push-ups", "did 15"
        patterns = [
            r'(\d+)\s*' + re.escape(exercise_name),
            r'did\s*(\d+)',
            r'(\d+)\s*reps?'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return int(match.group(1))
        return None
    
    def generate_food_suggestions(self, foods: List[FoodItem], total_macros: Dict) -> List[str]:
        """
        Generate food suggestions based on intake
        """
        suggestions = []
        
        if total_macros["protein"] < 20:
            suggestions.append("Consider adding more protein-rich foods like chicken, eggs, or yogurt")
        
        if total_macros["fiber"] < 10:
            suggestions.append("Add more fiber with fruits, vegetables, or whole grains")
        
        if len(foods) == 0:
            suggestions.append("I couldn't identify specific foods. Try describing them more clearly (e.g., '1 apple', '2 slices of bread')")
        
        return suggestions
    
    def generate_exercise_suggestions(self, exercises: List[ExerciseItem]) -> List[str]:
        """
        Generate exercise suggestions
        """
        suggestions = []
        
        total_calories = sum(ex.calories_burned for ex in exercises)
        
        if total_calories < 200:
            suggestions.append("Consider adding more activity to boost calorie burn")
        
        if len(exercises) == 0:
            suggestions.append("I couldn't identify specific exercises. Try describing them more clearly (e.g., 'ran for 30 minutes', 'did 20 push-ups')")
        
        return suggestions