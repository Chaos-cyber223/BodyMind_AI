"""
Simple in-memory authentication service for development
Compatible with both test_simple_api.py and full AI service
"""
import bcrypt
import jwt
from datetime import datetime, timedelta
import uuid
from typing import Dict, Optional

# In-memory user store with test account
USERS = {
    "test@example.com": {
        "id": "test-user-id",
        "email": "test@example.com",
        "hashed_password": "$2b$12$GSZK3mgufL9yJIJHfe/Imej6zjAJTE1LijtSCOar9se6K8VCyg1EC",  # Test123456!
        "created_at": "2024-01-01T00:00:00Z"
    }
}

JWT_SECRET = "simple-test-secret"

class SimpleAuthService:
    def __init__(self):
        self.users = USERS.copy()
    
    def create_user(self, email: str, password: str) -> Dict:
        """Create a new user"""
        if email in self.users:
            raise ValueError("User already exists")
        
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters")
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Create user
        user_id = str(uuid.uuid4())
        self.users[email] = {
            "id": user_id,
            "email": email,
            "hashed_password": hashed_password.decode('utf-8'),
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Generate token
        token = self.generate_token(user_id)
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": 86400,
            "user": {
                "id": user_id,
                "email": email,
                "created_at": self.users[email]["created_at"]
            }
        }
    
    def sign_in(self, email: str, password: str) -> Dict:
        """Sign in with email and password"""
        user = self.users.get(email)
        if not user:
            raise ValueError("Invalid email or password")
        
        # Verify password
        password_valid = bcrypt.checkpw(
            password.encode('utf-8'), 
            user["hashed_password"].encode('utf-8')
        )
        
        if not password_valid:
            raise ValueError("Invalid email or password")
        
        # Generate token
        token = self.generate_token(user["id"])
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": 86400,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "created_at": user["created_at"]
            }
        }
    
    def generate_token(self, user_id: str) -> str:
        """Generate JWT token"""
        token_data = {
            "user_id": user_id,
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(token_data, JWT_SECRET, algorithm="HS256")
    
    def verify_token(self, token: str) -> Optional[str]:
        """Verify JWT token and return user_id"""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            return payload.get("user_id")
        except:
            return None
    
    def get_user(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        for email, user in self.users.items():
            if user["id"] == user_id:
                return {
                    "id": user["id"],
                    "email": email,
                    "created_at": user["created_at"]
                }
        return None

# Global instance
simple_auth = SimpleAuthService()