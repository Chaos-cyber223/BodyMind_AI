"""简化的AI API服务 - 结合认证和AI功能"""
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import bcrypt
import jwt
from datetime import datetime, timedelta
import uuid
from typing import Optional, Dict, Any, List
import os
import httpx
import json
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="BodyMind AI Service - Simplified")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "http://localhost:19006", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 内存中的用户数据
USERS = {
    "test@example.com": {
        "id": "test-user-id",
        "email": "test@example.com",
        "hashed_password": "$2b$12$GSZK3mgufL9yJIJHfe/Imej6zjAJTE1LijtSCOar9se6K8VCyg1EC"  # Test123456!
    }
}

JWT_SECRET = "simple-test-secret"

# AI配置 - 使用硬编码值避免环境变量覆盖
OPENAI_API_KEY = "sk-kdvulnziosbklpvxkiaubmydlybijhuiynitpljikhvtquiz"
OPENAI_API_BASE = "https://api.siliconflow.cn/v1"
DEFAULT_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B"

# AI API客户端
async def call_ai(messages: List[Dict[str, str]]) -> str:
    """调用AI API"""
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": DEFAULT_MODEL,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1500
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{OPENAI_API_BASE}/chat/completions",
            headers=headers,
            json=data,
            timeout=30.0
        )
        
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            logger.error(f"AI API error: {response.status_code} - {response.text}")
            raise Exception("AI API call failed")

# 知识库（简化版）
KNOWLEDGE_BASE = {
    "caloric_deficit": """
    科学减脂的核心原理是创造热量缺口。研究表明：
    - 3500卡路里的缺口理论上等于1磅脂肪减少
    - 每天500-750卡路里的缺口可达到每周1-2磅的安全减脂速度
    - 过大的热量缺口会导致肌肉流失和代谢降低
    来源：美国医学会杂志(JAMA)、美国临床营养学杂志
    """,
    "protein_intake": """
    减脂期间的蛋白质摄入建议：
    - 每磅体重0.8-1.2克蛋白质有助于保持肌肉量
    - 蛋白质的热效应(TEF)比碳水和脂肪更高
    - 高蛋白饮食能增加饱腹感，减少总热量摄入
    来源：国际肥胖杂志、营养学杂志
    """,
    "exercise": """
    减脂运动策略：
    - 力量训练对保持肌肉量和代谢率至关重要
    - HIIT训练时间效率高，燃脂效果好
    - 结合力量训练和适度有氧的效果最优
    来源：应用生理学杂志、运动医学研究
    """,
    "metabolic_adaptation": """
    代谢适应与平台期：
    - 长期热量限制会导致代谢率下降
    - 策略：饮食休息、重喂日、保持力量训练
    - 快速减重比渐进式更容易导致代谢减慢
    来源：肥胖评论、国际肥胖杂志
    """
}

# 请求模型
class LoginRequest(BaseModel):
    email: str
    password: str

class MessageRequest(BaseModel):
    message: str
    user_profile: Optional[Dict[str, Any]] = None
    conversation_id: Optional[str] = None

class ProfileSetupRequest(BaseModel):
    age: int
    gender: str
    height: float
    weight: float
    activity_level: str
    goal: str
    target_weight: Optional[float] = None

# 认证函数
def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload["user_id"]
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# API端点
@app.get("/health")
async def health():
    return {"status": "ok", "message": "AI Service Running", "ai_model": DEFAULT_MODEL}

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    user = USERS.get(request.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    password_valid = bcrypt.checkpw(request.password.encode('utf-8'), user["hashed_password"].encode('utf-8'))
    if not password_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
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

@app.post("/api/chat/message")
async def chat_message(request: MessageRequest, user_id: str = Depends(verify_token)):
    """AI聊天接口"""
    try:
        # 搜索相关知识
        relevant_knowledge = []
        message_lower = request.message.lower()
        
        if "热量" in message_lower or "卡路里" in message_lower or "deficit" in message_lower:
            relevant_knowledge.append(KNOWLEDGE_BASE["caloric_deficit"])
        if "蛋白" in message_lower or "protein" in message_lower:
            relevant_knowledge.append(KNOWLEDGE_BASE["protein_intake"])
        if "运动" in message_lower or "锻炼" in message_lower or "exercise" in message_lower:
            relevant_knowledge.append(KNOWLEDGE_BASE["exercise"])
        if "平台期" in message_lower or "代谢" in message_lower:
            relevant_knowledge.append(KNOWLEDGE_BASE["metabolic_adaptation"])
        
        # 构建系统提示
        system_prompt = """你是一位专业的科学减脂专家。你的回答应该：
1. 基于科学研究和证据
2. 考虑用户的个人情况
3. 提供具体可行的建议
4. 注重安全和健康
5. 鼓励可持续的生活方式改变"""

        if relevant_knowledge:
            system_prompt += "\n\n相关科学知识：\n" + "\n".join(relevant_knowledge)

        if request.user_profile:
            system_prompt += f"\n\n用户信息：{request.user_profile}"

        # 调用AI
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.message}
        ]
        
        ai_response = await call_ai(messages)
        
        # 提取来源
        sources = []
        if relevant_knowledge:
            if "蛋白" in message_lower:
                sources.append("国际肥胖杂志")
            if "热量" in message_lower:
                sources.append("美国临床营养学杂志")
            if "运动" in message_lower:
                sources.append("应用生理学杂志")
        
        return {
            "response": ai_response,
            "conversation_id": request.conversation_id or str(uuid.uuid4()),
            "sources": sources,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}", exc_info=True)
        return {
            "response": "抱歉，我现在无法处理您的请求。请稍后再试。",
            "conversation_id": request.conversation_id or str(uuid.uuid4()),
            "sources": [],
            "timestamp": datetime.now().isoformat()
        }

@app.post("/api/profile/setup")
async def profile_setup(request: ProfileSetupRequest, user_id: str = Depends(verify_token)):
    """个人资料设置和TDEE计算"""
    try:
        # 计算BMR (Mifflin-St Jeor公式)
        if request.gender == "male":
            bmr = 10 * request.weight + 6.25 * request.height - 5 * request.age + 5
        else:
            bmr = 10 * request.weight + 6.25 * request.height - 5 * request.age - 161
        
        # 活动系数
        activity_multipliers = {
            "sedentary": 1.2,
            "light": 1.375,
            "moderate": 1.55,
            "very_active": 1.725
        }
        
        tdee = bmr * activity_multipliers.get(request.activity_level, 1.55)
        
        # 根据目标计算每日热量
        if request.goal == "lose_weight":
            daily_calories = tdee - 500  # 适度减脂
            weekly_change = -0.5  # kg per week
        elif request.goal == "maintain":
            daily_calories = tdee
            weekly_change = 0
        else:
            daily_calories = tdee + 300  # 增肌
            weekly_change = 0.25
        
        # 计算宏量营养素
        protein_g = request.weight * 2.0  # 2g/kg体重
        fat_g = daily_calories * 0.25 / 9  # 25%来自脂肪
        carbs_g = (daily_calories - protein_g * 4 - fat_g * 9) / 4
        
        recommendations = [
            f"您的每日热量目标是 {int(daily_calories)} 卡路里",
            f"建议摄入：蛋白质 {int(protein_g)}g，碳水 {int(carbs_g)}g，脂肪 {int(fat_g)}g",
            "记得多喝水，每天至少8杯",
            "保持充足睡眠，每晚7-9小时"
        ]
        
        if request.goal == "lose_weight":
            recommendations.append("建议结合力量训练，保持肌肉量")
        
        return {
            "tdee": int(tdee),
            "bmr": int(bmr),
            "daily_calorie_target": int(daily_calories),
            "weekly_weight_change_target": weekly_change,
            "macros": {
                "protein_g": int(protein_g),
                "carbs_g": int(carbs_g),
                "fat_g": int(fat_g)
            },
            "recommendations": recommendations
        }
        
    except Exception as e:
        logger.error(f"Profile setup error: {str(e)}")
        raise HTTPException(status_code=500, detail="计算失败")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8765)