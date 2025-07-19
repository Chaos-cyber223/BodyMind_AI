#!/bin/bash

echo "🚀 设置BodyMind AI增强版RAG系统"
echo "================================"

# 检查Python版本
python_version=$(python3 --version 2>&1)
echo "📋 检测到Python版本: $python_version"

# 进入AI服务目录
cd backend/ai-service

# 检查是否存在虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "🔧 激活虚拟环境..."
source venv/bin/activate

# 升级pip
echo "⬆️  升级pip..."
pip install --upgrade pip

# 安装RAG系统依赖
echo "📚 安装RAG系统依赖..."
pip install -r requirements-rag.txt

# 检查关键依赖是否安装成功
echo "✅ 验证关键依赖..."
python3 -c "import langchain; print('✅ LangChain安装成功')" || echo "❌ LangChain安装失败"
python3 -c "import chromadb; print('✅ ChromaDB安装成功')" || echo "❌ ChromaDB安装失败"
python3 -c "import httpx; print('✅ HTTPX安装成功')" || echo "❌ HTTPX安装失败"

# 创建必要的目录
echo "📁 创建目录结构..."
mkdir -p knowledge_base
mkdir -p chroma_db
mkdir -p logs

# 测试RAG知识库管理器
echo "🧪 测试RAG知识库管理器..."
python3 rag_knowledge_manager.py

echo ""
echo "🎉 RAG系统设置完成！"
echo ""
echo "📖 使用说明："
echo "1. 启动增强版AI服务:"
echo "   cd backend/ai-service"
echo "   source venv/bin/activate"
echo "   python3 enhanced_ai_api.py"
echo ""
echo "2. 测试RAG功能:"
echo "   python3 ../../test_enhanced_rag.py"
echo ""
echo "3. 服务地址:"
echo "   - 增强版AI服务: http://localhost:8766"
echo "   - API文档: http://localhost:8766/docs"
echo ""
echo "💡 重要说明："
echo "- 增强版服务使用端口8766（避免与简化版冲突）"
echo "- 支持真正的向量化RAG检索"
echo "- 可以动态添加科学论文到知识库"
echo "- 包含对话上下文记忆"