#!/bin/bash

echo "🤖 启动 BodyMind AI 完整服务..."
echo ""

# 检查环境变量
if [ ! -f backend/ai-service/.env ]; then
    echo "❌ 错误: 找不到 .env 文件"
    echo "请确保 backend/ai-service/.env 文件存在并包含:"
    echo "  - OPENAI_API_KEY (SiliconFlow API key)"
    echo "  - OPENAI_API_BASE=https://api.siliconflow.cn/v1"
    exit 1
fi

# 检查Python环境
echo "1️⃣ 检查Python环境..."
cd backend/ai-service

if [ ! -d "venv" ]; then
    echo "创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境并安装依赖
echo "2️⃣ 安装依赖..."
source venv/bin/activate
pip install -r requirements-minimal.txt

# 检查Chroma数据库
echo "3️⃣ 检查向量数据库..."
if [ -d "chroma_db" ]; then
    echo "✅ 找到现有的Chroma数据库"
else
    echo "📝 将创建新的向量数据库并加载初始知识"
fi

# 启动服务
echo ""
echo "4️⃣ 启动AI服务..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 API文档: http://localhost:8765/docs"
echo "💬 聊天接口: POST /api/chat/message"
echo "📚 知识库管理: POST /api/documents/upload"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 使用完整的app.main而不是test_simple_api
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8765