from typing import Dict, List, Optional, Any
import os
import json

from ..config import get_settings

class RAGService:
    def __init__(self):
        self.settings = get_settings()
        self.knowledge_base = self._load_basic_knowledge()
        
    def _load_basic_knowledge(self) -> Dict[str, Any]:
        """
        Load basic fat loss knowledge base
        This is a simplified version that will be enhanced with vector search later
        """
        return {
            "caloric_deficit": {
                "content": """
                The fundamental principle of fat loss is creating a caloric deficit - consuming fewer calories than you expend. 
                Research shows that a deficit of 3,500 calories theoretically leads to 1 pound of fat loss, though individual 
                variation exists. A moderate deficit of 500-750 calories per day typically results in 1-2 pounds of fat loss 
                per week, which is considered safe and sustainable.
                """,
                "sources": ["Journal of the American Medical Association", "American Journal of Clinical Nutrition"]
            },
            "protein_intake": {
                "content": """
                Higher protein intake (0.8-1.2g per pound of body weight) during fat loss helps preserve lean muscle mass 
                and increases satiety. Research demonstrates that protein has a higher thermic effect of food (TEF) compared 
                to carbohydrates and fats, meaning more calories are burned during digestion and metabolism.
                """,
                "sources": ["International Journal of Obesity", "Journal of Nutrition"]
            },
            "exercise_types": {
                "content": """
                Resistance training is crucial during fat loss to preserve muscle mass and maintain metabolic rate. 
                Cardiovascular exercise, particularly HIIT, can be effective for fat loss and time efficiency. 
                Studies show that combining resistance training with moderate cardio yields optimal body composition changes.
                """,
                "sources": ["Journal of Applied Physiology", "Sports Medicine"]
            },
            "metabolic_adaptation": {
                "content": """
                During prolonged caloric restriction, the body adapts by reducing metabolic rate, a phenomenon known as 
                metabolic adaptation. Strategies to minimize this include diet breaks, refeed days, and maintaining 
                resistance training. Research suggests that rapid weight loss can lead to greater metabolic slowdown 
                compared to gradual approaches.
                """,
                "sources": ["Obesity Reviews", "International Journal of Obesity"]
            },
            "meal_timing": {
                "content": """
                While total caloric intake is most important for fat loss, meal timing can have modest effects. 
                Research on intermittent fasting shows it can be effective primarily due to its impact on total 
                caloric intake rather than metabolic advantages. Eating adequate protein at each meal may help 
                with satiety and muscle protein synthesis.
                """,
                "sources": ["Annual Review of Nutrition", "Cell Metabolism"]
            }
        }
    
    async def get_relevant_context(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Get relevant context for a user query
        This is a simplified keyword-based approach that will be enhanced with vector similarity later
        """
        query_lower = query.lower()
        relevant_topics = []
        
        # Simple keyword matching
        if any(word in query_lower for word in ["calorie", "deficit", "weight loss", "lose weight"]):
            relevant_topics.append("caloric_deficit")
            
        if any(word in query_lower for word in ["protein", "macros", "macronutrient"]):
            relevant_topics.append("protein_intake")
            
        if any(word in query_lower for word in ["exercise", "workout", "training", "cardio", "hiit"]):
            relevant_topics.append("exercise_types")
            
        if any(word in query_lower for word in ["plateau", "stall", "stopped losing", "metabolic"]):
            relevant_topics.append("metabolic_adaptation")
            
        if any(word in query_lower for word in ["meal timing", "intermittent fasting", "when to eat"]):
            relevant_topics.append("meal_timing")
        
        if not relevant_topics:
            return None
            
        # Combine relevant content
        combined_content = []
        all_sources = []
        
        for topic in relevant_topics:
            if topic in self.knowledge_base:
                combined_content.append(self.knowledge_base[topic]["content"].strip())
                all_sources.extend(self.knowledge_base[topic]["sources"])
        
        if not combined_content:
            return None
            
        return {
            "content": "\n\n".join(combined_content),
            "sources": list(set(all_sources)),  # Remove duplicates
            "topics": relevant_topics
        }
    
    def get_all_topics(self) -> List[str]:
        """
        Get all available knowledge base topics
        """
        return list(self.knowledge_base.keys())
    
    def get_topic_content(self, topic: str) -> Optional[Dict[str, Any]]:
        """
        Get content for a specific topic
        """
        return self.knowledge_base.get(topic)