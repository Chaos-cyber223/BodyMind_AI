"""
Authentication API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Dict, Any
import os
import logging

from ..services.supabase_service import supabase_service
from ..services.local_auth_service import local_auth

logger = logging.getLogger(__name__)

router = APIRouter()


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Dict[str, Any]


def get_auth_service():
    """Get the appropriate auth service based on environment"""
    # Use simple auth for development
    if os.getenv("USE_SIMPLE_AUTH", "true").lower() == "true":
        from ..services.simple_auth_service import simple_auth
        return simple_auth
    elif os.getenv("SUPABASE_URL", "").startswith("http://localhost"):
        return local_auth
    return supabase_service


@router.post("/signup", response_model=AuthResponse)
async def sign_up(request: SignUpRequest):
    """Create a new user account"""
    try:
        auth = get_auth_service()
        
        # For Supabase
        if hasattr(auth, 'client'):
            response = auth.client.auth.sign_up({
                "email": request.email,
                "password": request.password
            })
            
            if response.error:
                raise HTTPException(status_code=400, detail=str(response.error))
            
            return AuthResponse(
                access_token=response.session.access_token,
                token_type="bearer",
                expires_in=response.session.expires_in,
                user={
                    "id": response.user.id,
                    "email": response.user.email,
                    "created_at": response.user.created_at
                }
            )
        
        # For local auth
        else:
            result = auth.create_user(request.email, request.password)
            return AuthResponse(**result)
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Sign up error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create account")


@router.post("/signin", response_model=AuthResponse)
@router.post("/login", response_model=AuthResponse)  # Compatibility with test_simple_api
async def sign_in(request: SignInRequest):
    """Sign in with email and password"""
    try:
        auth = get_auth_service()
        
        # For Supabase
        if hasattr(auth, 'client'):
            response = auth.client.auth.sign_in_with_password({
                "email": request.email,
                "password": request.password
            })
            
            if response.error:
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            return AuthResponse(
                access_token=response.session.access_token,
                token_type="bearer",
                expires_in=response.session.expires_in,
                user={
                    "id": response.user.id,
                    "email": response.user.email,
                    "created_at": response.user.created_at
                }
            )
        
        # For local auth
        else:
            result = auth.sign_in(request.email, request.password)
            return AuthResponse(**result)
            
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error(f"Sign in error: {e}")
        raise HTTPException(status_code=500, detail="Failed to sign in")


@router.post("/signout")
async def sign_out():
    """Sign out the current user"""
    try:
        auth = get_auth_service()
        
        # For Supabase
        if hasattr(auth, 'client'):
            auth.client.auth.sign_out()
        
        return {"message": "Successfully signed out"}
        
    except Exception as e:
        logger.error(f"Sign out error: {e}")
        raise HTTPException(status_code=500, detail="Failed to sign out")


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token"""
    try:
        auth = get_auth_service()
        
        # For Supabase
        if hasattr(auth, 'client'):
            response = auth.client.auth.refresh_session(refresh_token)
            
            if response.error:
                raise HTTPException(status_code=401, detail="Invalid refresh token")
            
            return AuthResponse(
                access_token=response.session.access_token,
                token_type="bearer",
                expires_in=response.session.expires_in,
                user={
                    "id": response.user.id,
                    "email": response.user.email,
                    "created_at": response.user.created_at
                }
            )
        
        # For local auth - just generate a new token
        else:
            user_id = auth.verify_token(refresh_token)
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid refresh token")
            
            new_token = auth.generate_token(user_id)
            user = auth.get_user(user_id)
            
            return AuthResponse(
                access_token=new_token,
                token_type="bearer",
                expires_in=86400,  # 24 hours
                user=user
            )
            
    except Exception as e:
        logger.error(f"Refresh token error: {e}")
        raise HTTPException(status_code=500, detail="Failed to refresh token")