"""
Local authentication service for development
Provides simple JWT-based auth without Supabase
"""
import os
import jwt
import bcrypt
import psycopg2
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import uuid4
import logging

logger = logging.getLogger(__name__)


class LocalAuthService:
    """Local authentication service for development"""
    
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL")
        self.jwt_secret = os.getenv("SUPABASE_JWT_SECRET", "local-dev-secret-key")
        self.jwt_algorithm = "HS256"
        self.token_expiry = timedelta(hours=24)
    
    def get_connection(self):
        """Get database connection"""
        return psycopg2.connect(self.database_url)
    
    def create_user(self, email: str, password: str) -> Dict[str, Any]:
        """Create a new user"""
        try:
            # Hash password
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
            
            conn = self.get_connection()
            cur = conn.cursor()
            
            # Insert user
            user_id = str(uuid4())
            cur.execute("""
                INSERT INTO auth.users (id, email, encrypted_password)
                VALUES (%s, %s, %s)
                RETURNING id, email, created_at
            """, (user_id, email, hashed_password))
            
            user = cur.fetchone()
            conn.commit()
            
            # Generate tokens
            access_token = self.generate_token(user_id)
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": self.token_expiry.total_seconds(),
                "user": {
                    "id": user[0],
                    "email": user[1],
                    "created_at": user[2].isoformat()
                }
            }
            
        except psycopg2.IntegrityError:
            raise ValueError("User with this email already exists")
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
        finally:
            if conn:
                cur.close()
                conn.close()
    
    def sign_in(self, email: str, password: str) -> Dict[str, Any]:
        """Sign in a user"""
        try:
            conn = self.get_connection()
            cur = conn.cursor()
            
            # Get user
            cur.execute("""
                SELECT id, email, encrypted_password, created_at
                FROM auth.users
                WHERE email = %s
            """, (email,))
            
            user = cur.fetchone()
            if not user:
                raise ValueError("Invalid email or password")
            
            # Verify password
            if not bcrypt.checkpw(password.encode('utf-8'), user[2].encode('utf-8')):
                raise ValueError("Invalid email or password")
            
            # Generate token
            access_token = self.generate_token(str(user[0]))
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": self.token_expiry.total_seconds(),
                "user": {
                    "id": str(user[0]),
                    "email": user[1],
                    "created_at": user[3].isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error signing in: {e}")
            raise
        finally:
            if conn:
                cur.close()
                conn.close()
    
    def verify_token(self, token: str) -> Optional[str]:
        """Verify JWT token and return user ID"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            return payload.get("sub")
        except jwt.ExpiredSignatureError:
            logger.error("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token: {e}")
            return None
    
    def generate_token(self, user_id: str) -> str:
        """Generate JWT token"""
        payload = {
            "sub": user_id,
            "exp": datetime.utcnow() + self.token_expiry,
            "iat": datetime.utcnow(),
            "iss": "bodymind-ai-local"
        }
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
    
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            conn = self.get_connection()
            cur = conn.cursor()
            
            cur.execute("""
                SELECT id, email, created_at
                FROM auth.users
                WHERE id = %s
            """, (user_id,))
            
            user = cur.fetchone()
            if user:
                return {
                    "id": str(user[0]),
                    "email": user[1],
                    "created_at": user[2].isoformat()
                }
            return None
            
        except Exception as e:
            logger.error(f"Error getting user: {e}")
            return None
        finally:
            if conn:
                cur.close()
                conn.close()


# Singleton instance
local_auth = LocalAuthService()