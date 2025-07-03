"""Supabase service for authentication and database operations."""
import os
from typing import Optional, Dict, Any, List
from datetime import datetime
from supabase import create_client, Client
from pydantic_settings import BaseSettings
import logging

logger = logging.getLogger(__name__)


class SupabaseSettings(BaseSettings):
    """Supabase configuration settings."""
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_jwt_secret: str = ""
    
    class Config:
        env_file = ".env"


settings = SupabaseSettings()


class SupabaseService:
    """Service for interacting with Supabase."""
    
    def __init__(self):
        """Initialize Supabase client."""
        if not settings.supabase_url or not settings.supabase_key:
            logger.warning("Supabase credentials not configured")
            self.client = None
        else:
            self.client: Client = create_client(
                settings.supabase_url,
                settings.supabase_key
            )
    
    def is_configured(self) -> bool:
        """Check if Supabase is properly configured."""
        return self.client is not None
    
    # User Profile CRUD Operations
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile by user ID."""
        if not self.is_configured():
            return None
        
        try:
            response = self.client.table("user_profiles").select("*").eq("user_id", user_id).single().execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching user profile: {e}")
            return None
    
    async def create_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new user profile."""
        if not self.is_configured():
            return None
        
        try:
            data = {
                "user_id": user_id,
                **profile_data,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            response = self.client.table("user_profiles").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating user profile: {e}")
            return None
    
    async def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing user profile."""
        if not self.is_configured():
            return None
        
        try:
            data = {
                **profile_data,
                "updated_at": datetime.utcnow().isoformat()
            }
            response = self.client.table("user_profiles").update(data).eq("user_id", user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
            return None
    
    # Weight History Operations
    async def record_weight(self, user_id: str, weight: float, unit: str = "kg") -> Optional[Dict[str, Any]]:
        """Record a new weight entry."""
        if not self.is_configured():
            return None
        
        try:
            data = {
                "user_id": user_id,
                "weight": weight,
                "unit": unit,
                "recorded_at": datetime.utcnow().isoformat()
            }
            response = self.client.table("weight_history").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error recording weight: {e}")
            return None
    
    async def get_weight_history(self, user_id: str, limit: int = 30) -> List[Dict[str, Any]]:
        """Get weight history for a user."""
        if not self.is_configured():
            return []
        
        try:
            response = self.client.table("weight_history").select("*").eq("user_id", user_id).order("recorded_at", desc=True).limit(limit).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching weight history: {e}")
            return []
    
    async def get_latest_weight(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get the latest weight entry for a user."""
        if not self.is_configured():
            return None
        
        try:
            response = self.client.table("weight_history").select("*").eq("user_id", user_id).order("recorded_at", desc=True).limit(1).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error fetching latest weight: {e}")
            return None
    
    # Nutrition Log Operations
    async def log_nutrition(self, user_id: str, nutrition_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Log nutrition data."""
        if not self.is_configured():
            return None
        
        try:
            data = {
                "user_id": user_id,
                **nutrition_data,
                "logged_at": datetime.utcnow().isoformat()
            }
            response = self.client.table("nutrition_logs").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error logging nutrition: {e}")
            return None
    
    async def get_nutrition_logs(self, user_id: str, date: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get nutrition logs for a user."""
        if not self.is_configured():
            return []
        
        try:
            query = self.client.table("nutrition_logs").select("*").eq("user_id", user_id)
            
            if date:
                # Filter by date (assuming date format is YYYY-MM-DD)
                start_datetime = f"{date}T00:00:00"
                end_datetime = f"{date}T23:59:59"
                query = query.gte("logged_at", start_datetime).lte("logged_at", end_datetime)
            
            response = query.order("logged_at", desc=True).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching nutrition logs: {e}")
            return []
    
    # Exercise Log Operations
    async def log_exercise(self, user_id: str, exercise_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Log exercise data."""
        if not self.is_configured():
            return None
        
        try:
            data = {
                "user_id": user_id,
                **exercise_data,
                "logged_at": datetime.utcnow().isoformat()
            }
            response = self.client.table("exercise_logs").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error logging exercise: {e}")
            return None
    
    async def get_exercise_logs(self, user_id: str, date: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get exercise logs for a user."""
        if not self.is_configured():
            return []
        
        try:
            query = self.client.table("exercise_logs").select("*").eq("user_id", user_id)
            
            if date:
                # Filter by date (assuming date format is YYYY-MM-DD)
                start_datetime = f"{date}T00:00:00"
                end_datetime = f"{date}T23:59:59"
                query = query.gte("logged_at", start_datetime).lte("logged_at", end_datetime)
            
            response = query.order("logged_at", desc=True).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching exercise logs: {e}")
            return []


# Singleton instance
supabase_service = SupabaseService()