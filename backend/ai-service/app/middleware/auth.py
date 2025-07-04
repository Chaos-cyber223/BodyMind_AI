"""Authentication middleware for JWT verification."""
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic_settings import BaseSettings
import logging

logger = logging.getLogger(__name__)


class AuthSettings(BaseSettings):
    """Authentication configuration settings."""
    supabase_jwt_secret: str = "your-jwt-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_audience: str = "authenticated"
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # 忽略额外的环境变量


settings = AuthSettings()


class JWTBearer(HTTPBearer):
    """JWT Bearer token verification."""
    
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)
    
    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid authentication scheme."
                )
            user_data = self.verify_jwt(credentials.credentials)
            if not user_data:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid token or expired token."
                )
            # Store user data in request state for use in endpoints
            request.state.user = user_data
            return credentials.credentials
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authorization code."
            )
    
    def verify_jwt(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token and extract user data."""
        if not settings.supabase_jwt_secret:
            logger.warning("JWT secret not configured")
            return None
        
        try:
            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=[settings.jwt_algorithm],
                audience=settings.jwt_audience
            )
            
            # Extract user ID and other relevant data
            user_data = {
                "user_id": payload.get("sub"),
                "email": payload.get("email"),
                "role": payload.get("role", "authenticated"),
                "exp": payload.get("exp")
            }
            
            return user_data
        except JWTError as e:
            logger.error(f"JWT verification error: {e}")
            return None


# Create auth dependency
auth_bearer = JWTBearer()


def get_current_user(request: Request) -> Dict[str, Any]:
    """Get current user from request state."""
    if not hasattr(request.state, "user"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )
    return request.state.user


def get_current_user_id(request: Request) -> str:
    """Get current user ID from request state."""
    user = get_current_user(request)
    user_id = user.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    return user_id