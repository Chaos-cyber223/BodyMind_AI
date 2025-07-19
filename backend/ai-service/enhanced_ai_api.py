#!/usr/bin/env python3
"""
增强版AI API服务 - 集成真正的LangChain RAG系统
"""

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import bcrypt
import jwt
from datetime import datetime, timedelta
import uuid
from typing import Optional, Dict, Any, List
import httpx
import logging

# 导入RAG知识库管理器
from rag_knowledge_manager import RAGKnowledgeManager, setup_default_knowledge

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="BodyMind AI Service - Enhanced RAG")

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

JWT_SECRET = "enhanced-ai-secret"

# AI配置
OPENAI_API_KEY = "sk-kdvulnziosbklpvxkiaubmydlybijhuiynitpljikhvtquiz"
OPENAI_API_BASE = "https://api.siliconflow.cn/v1"
DEFAULT_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B"

# 全局RAG管理器
rag_manager = None

# 会话记忆存储
conversation_memory = {}

async def initialize_rag():
    """初始化RAG系统"""
    global rag_manager
    try:
        logger.info("Initializing RAG knowledge manager...")
        rag_manager = RAGKnowledgeManager(OPENAI_API_KEY)
        
        # 检查是否需要设置默认知识库
        stats = rag_manager.get_knowledge_stats()
        if stats.get("total_chunks", 0) == 0:
            logger.info("Setting up default knowledge base...")
            await setup_default_knowledge(rag_manager)
        
        logger.info(f"RAG system initialized: {stats}")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize RAG: {e}")
        return False

# 启动时初始化RAG
@app.on_event("startup")
async def startup_event():
    await initialize_rag()

# AI API客户端
async def call_ai_with_rag(messages: List[Dict[str, str]], user_query: str) -> Dict[str, Any]:
    """调用AI API，集成RAG检索"""
    try:
        # 1. RAG检索相关知识
        relevant_docs = []
        if rag_manager:
            relevant_docs = rag_manager.search_knowledge(user_query, k=3, score_threshold=0.7)
        
        # 2. 构建增强的system prompt
        system_message = messages[0]["content"] if messages and messages[0]["role"] == "system" else ""
        
        if relevant_docs:
            rag_context = "\n\n## 相关科学研究：\n"
            sources = []
            for doc in relevant_docs:
                rag_context += f"### {doc['metadata']['title']}\n"
                rag_context += f"来源：{doc['metadata']['source']}\n"
                rag_context += f"{doc['content']}\n\n"
                sources.append(doc['metadata']['title'])
            
            # 更新system message
            enhanced_system = f"""{system_message}

{rag_context}

请基于上述科学研究回答用户问题。确保：
1. 引用具体的研究发现
2. 提供基于证据的建议
3. 保持科学性和准确性
4. 如果研究结果之间有矛盾，请说明
"""
            messages[0]["content"] = enhanced_system
        else:
            sources = []
        
        # 3. 调用AI API
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
                ai_response = result["choices"][0]["message"]["content"]
                
                return {
                    "response": ai_response,
                    "sources": sources,
                    "rag_docs_found": len(relevant_docs),
                    "success": True
                }
            else:
                logger.error(f"AI API error: {response.status_code} - {response.text}")
                raise Exception("AI API call failed")
                
    except Exception as e:
        logger.error(f"AI call with RAG failed: {str(e)}")
        return {
            "response": "抱歉，我现在无法处理您的请求。请稍后再试。",
            "sources": [],
            "rag_docs_found": 0,
            "success": False,
            "error": str(e)
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

class DocumentUploadRequest(BaseModel):
    content: str
    title: str
    source: str = "user_upload"
    category: str = "research"

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
    rag_status = "ready" if rag_manager else "not_initialized"
    rag_stats = rag_manager.get_knowledge_stats() if rag_manager else {}
    
    return {
        "status": "ok", 
        "message": "Enhanced AI Service Running",
        "ai_model": DEFAULT_MODEL,
        "rag_status": rag_status,
        "rag_stats": rag_stats
    }

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
    """增强版AI聊天接口 - 集成真正的RAG检索"""
    try:
        # 获取或创建会话
        conv_id = request.conversation_id or str(uuid.uuid4())
        if conv_id not in conversation_memory:
            conversation_memory[conv_id] = []
        
        # 构建系统提示
        system_prompt = """你是一位专业的科学减脂专家。你的回答应该：
1. 基于科学研究和证据
2. 考虑用户的个人情况
3. 提供具体可行的建议
4. 注重安全和健康
5. 鼓励可持续的生活方式改变

当引用科学研究时，请明确指出研究来源和关键发现。"""

        if request.user_profile:
            system_prompt += f"\n\n用户信息：{request.user_profile}"

        # 构建对话历史
        messages = [{"role": "system", "content": system_prompt}]
        
        # 添加历史对话（最近5轮）
        recent_history = conversation_memory[conv_id][-10:]  # 最近5轮对话
        messages.extend(recent_history)
        
        # 添加当前用户消息
        messages.append({"role": "user", "content": request.message})
        
        # 调用增强的AI（集成RAG）
        result = await call_ai_with_rag(messages, request.message)
        
        # 更新会话记忆
        conversation_memory[conv_id].append({"role": "user", "content": request.message})
        conversation_memory[conv_id].append({"role": "assistant", "content": result["response"]})
        
        # 限制会话长度
        if len(conversation_memory[conv_id]) > 20:
            conversation_memory[conv_id] = conversation_memory[conv_id][-20:]
        
        return {
            "response": result["response"],
            "conversation_id": conv_id,
            "sources": result["sources"],
            "rag_docs_found": result["rag_docs_found"],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}", exc_info=True)
        return {
            "response": "抱歉，我现在无法处理您的请求。请稍后再试。",
            "conversation_id": request.conversation_id or str(uuid.uuid4()),
            "sources": [],
            "rag_docs_found": 0,
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
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

# RAG知识库管理端点
@app.post("/api/knowledge/upload")
async def upload_knowledge(request: DocumentUploadRequest, user_id: str = Depends(verify_token)):
    """上传文档到知识库"""
    if not rag_manager:
        raise HTTPException(status_code=500, detail="RAG system not initialized")
    
    success = rag_manager.add_document_from_text(
        text=request.content,
        title=request.title,
        source=request.source,
        category=request.category
    )
    
    if success:
        stats = rag_manager.get_knowledge_stats()
        return {
            "message": "Document uploaded successfully",
            "title": request.title,
            "stats": stats
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to upload document")

@app.get("/api/knowledge/stats")
async def get_knowledge_stats(user_id: str = Depends(verify_token)):
    """获取知识库统计信息"""
    if not rag_manager:
        raise HTTPException(status_code=500, detail="RAG system not initialized")
    
    return rag_manager.get_knowledge_stats()

@app.post("/api/knowledge/search")
async def search_knowledge(query: str, k: int = 5, user_id: str = Depends(verify_token)):
    """搜索知识库"""
    if not rag_manager:
        raise HTTPException(status_code=500, detail="RAG system not initialized")
    
    results = rag_manager.search_knowledge(query, k=k)
    return {
        "query": query,
        "results": results,
        "total_found": len(results)
    }

@app.delete("/api/knowledge/clear")
async def clear_knowledge(user_id: str = Depends(verify_token)):
    """清空知识库"""
    if not rag_manager:
        raise HTTPException(status_code=500, detail="RAG system not initialized")
    
    success = rag_manager.clear_knowledge_base()
    if success:
        return {"message": "Knowledge base cleared successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to clear knowledge base")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8766)  # 使用不同端口避免冲突