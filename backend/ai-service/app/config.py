from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache
import os

class Settings(BaseSettings):
    # AI API Keys
    openai_api_key: str = ""
    openai_api_base: Optional[str] = None
    anthropic_api_key: str = ""
    
    # Service Configuration
    environment: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8765
    api_reload: bool = True
    
    # CORS Settings
    cors_origins: List[str] = [
        "http://localhost:19006",  # Expo web
        "http://localhost:3000",   # Alternative frontend
        "exp://192.168.*:19000"    # Expo mobile
    ]
    
    # Database
    database_url: str = "sqlite:///./ai_service.db"
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    
    # RAG Configuration
    vector_store_path: str = "./knowledge_base/embeddings"
    max_context_length: int = 4000
    similarity_threshold: float = 0.7
    
    # Rate Limiting
    max_requests_per_minute: int = 60
    
    # Model Configuration
    default_model: str = "gpt-3.5-turbo"
    embedding_model: str = "text-embedding-ada-002"
    max_tokens: int = 1500
    temperature: float = 0.7
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()