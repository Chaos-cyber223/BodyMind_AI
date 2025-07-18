"""简单的FastAPI测试服务"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import bcrypt
import jwt
from datetime import datetime, timedelta
import uuid

app = FastAPI(title="简单认证API")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "http://localhost:19006", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 内存中的用户数据（简化版）
USERS = {
    "test@example.com": {
        "id": "test-user-id",
        "email": "test@example.com",
        "hashed_password": "$2b$12$GSZK3mgufL9yJIJHfe/Imej6zjAJTE1LijtSCOar9se6K8VCyg1EC"  # Test123456!
    }
}

JWT_SECRET = "simple-test-secret"

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Simple API running"}

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    print(f"登录请求: email={request.email}, password={request.password}")
    
    user = USERS.get(request.email)
    if not user:
        print(f"用户不存在: {request.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # 验证密码
    password_valid = bcrypt.checkpw(request.password.encode('utf-8'), user["hashed_password"].encode('utf-8'))
    print(f"密码验证结果: {password_valid}")
    
    if not password_valid:
        print(f"密码错误: {request.password}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # 生成JWT token
    token_data = {
        "user_id": user["id"],
        "email": user["email"],
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    access_token = jwt.encode(token_data, JWT_SECRET, algorithm="HS256")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 86400,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "created_at": datetime.utcnow().isoformat()
        }
    }

@app.post("/api/auth/signup")
async def signup(request: SignupRequest):
    print(f"注册请求: email={request.email}")
    
    # 检查用户是否已存在
    if request.email in USERS:
        print(f"用户已存在: {request.email}")
        raise HTTPException(status_code=400, detail="User already exists")
    
    # 密码强度检查
    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    # 哈希密码
    hashed_password = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt())
    
    # 创建新用户
    user_id = str(uuid.uuid4())
    USERS[request.email] = {
        "id": user_id,
        "email": request.email,
        "hashed_password": hashed_password.decode('utf-8')
    }
    
    print(f"用户注册成功: {request.email}")
    
    # 生成JWT token
    token_data = {
        "user_id": user_id,
        "email": request.email,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    access_token = jwt.encode(token_data, JWT_SECRET, algorithm="HS256")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 86400,
        "user": {
            "id": user_id,
            "email": request.email,
            "created_at": datetime.utcnow().isoformat()
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8765)