#!/bin/bash

echo "🚀 启动 BodyMind AI 完整系统"
echo "================================"

# 函数：显示使用说明
show_usage() {
    echo "使用方法:"
    echo "  $0 [选项]"
    echo ""
    echo "选项:"
    echo "  simple     启动简化版AI服务 (端口8765)"
    echo "  enhanced   启动增强版RAG服务 (端口8766)"
    echo "  mobile     启动移动端开发服务"
    echo "  full       启动完整系统 (移动端 + 增强版AI)"
    echo "  clean      清理缓存并重新启动"
    echo "  help       显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 enhanced    # 启动增强版AI服务"
    echo "  $0 full        # 启动完整系统"
    echo "  $0 clean       # 清理后启动"
}

# 函数：检查端口是否被占用
check_port() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo "⚠️  端口 $port 已被占用 ($service_name)"
        echo "   是否要停止现有服务? (y/n)"
        read -r response
        if [[ "$response" == "y" ]]; then
            lsof -ti:$port | xargs kill -9 2>/dev/null
            sleep 2
            echo "✅ 已停止端口 $port 上的服务"
        else
            echo "❌ 取消启动"
            exit 1
        fi
    fi
}

# 函数：启动移动端开发服务
start_mobile() {
    echo "📱 启动移动端开发服务..."
    check_port 8081 "移动端"
    
    cd mobile
    if [ ! -d "node_modules" ]; then
        echo "📦 安装移动端依赖..."
        npm install
    fi
    
    echo "🌐 启动React Native Web开发服务 (端口8081)..."
    npm run web > ../mobile.log 2>&1 &
    
    echo "✅ 移动端服务已启动"
    echo "   访问地址: http://localhost:8081"
    echo "   日志文件: mobile.log"
    cd ..
}

# 函数：启动简化版AI服务
start_simple_ai() {
    echo "🤖 启动简化版AI服务..."
    check_port 8765 "简化版AI"
    
    cd backend/ai-service
    
    # 清除可能冲突的环境变量
    unset OPENAI_API_KEY
    
    echo "🔧 启动简化版AI服务 (端口8765)..."
    python3 simple_ai_api.py > ../../simple_ai.log 2>&1 &
    
    echo "✅ 简化版AI服务已启动"
    echo "   访问地址: http://localhost:8765"
    echo "   API文档: http://localhost:8765/docs"
    echo "   日志文件: simple_ai.log"
    cd ../..
}

# 函数：启动增强版RAG服务
start_enhanced_ai() {
    echo "🧠 启动增强版RAG AI服务..."
    check_port 8766 "增强版RAG AI"
    
    cd backend/ai-service
    
    # 检查虚拟环境
    if [ ! -d "venv" ]; then
        echo "📦 首次设置：创建虚拟环境和安装依赖..."
        python3 -m venv venv
        source venv/bin/activate
        pip install --upgrade pip
        pip install -r requirements-rag.txt
        echo "✅ 环境设置完成"
    else
        echo "🔧 激活虚拟环境..."
        source venv/bin/activate
    fi
    
    # 检查必要的目录
    mkdir -p knowledge_base chroma_db logs
    
    # 清除可能冲突的环境变量
    unset OPENAI_API_KEY
    
    echo "🚀 启动增强版RAG服务 (端口8766)..."
    python3 enhanced_ai_api.py > ../../enhanced_ai.log 2>&1 &
    
    echo "✅ 增强版RAG AI服务已启动"
    echo "   访问地址: http://localhost:8766"
    echo "   API文档: http://localhost:8766/docs"
    echo "   日志文件: enhanced_ai.log"
    cd ../..
}

# 函数：等待服务启动
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ 等待 $name 启动..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ $name 已就绪"
            return 0
        fi
        
        sleep 1
        attempt=$((attempt + 1))
        echo -n "."
    done
    
    echo ""
    echo "⚠️  $name 启动超时，请检查日志"
    return 1
}

# 函数：清理缓存
clean_cache() {
    echo "🧹 清理缓存..."
    
    if [ -f "./clear_cache.sh" ]; then
        ./clear_cache.sh
    fi
    
    # 清理日志文件
    rm -f *.log
    
    # 清理可能的进程
    pkill -f "simple_ai_api.py" 2>/dev/null || true
    pkill -f "enhanced_ai_api.py" 2>/dev/null || true
    pkill -f "npm run web" 2>/dev/null || true
    
    echo "✅ 缓存清理完成"
}

# 函数：显示状态
show_status() {
    echo ""
    echo "📊 服务状态:"
    echo "--------------------------------"
    
    # 检查移动端
    if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null; then
        echo "📱 移动端: ✅ 运行中 (http://localhost:8081)"
    else
        echo "📱 移动端: ❌ 未运行"
    fi
    
    # 检查简化版AI
    if lsof -Pi :8765 -sTCP:LISTEN -t >/dev/null; then
        echo "🤖 简化版AI: ✅ 运行中 (http://localhost:8765)"
    else
        echo "🤖 简化版AI: ❌ 未运行"
    fi
    
    # 检查增强版AI
    if lsof -Pi :8766 -sTCP:LISTEN -t >/dev/null; then
        echo "🧠 增强版RAG AI: ✅ 运行中 (http://localhost:8766)"
    else
        echo "🧠 增强版RAG AI: ❌ 未运行"
    fi
    
    echo ""
}

# 主逻辑
case "${1:-help}" in
    "simple")
        clean_cache
        start_simple_ai
        wait_for_service "http://localhost:8765/health" "简化版AI服务"
        show_status
        echo "🎉 简化版系统启动完成！"
        ;;
        
    "enhanced")
        clean_cache
        start_enhanced_ai
        wait_for_service "http://localhost:8766/health" "增强版RAG AI服务"
        show_status
        echo "🎉 增强版RAG系统启动完成！"
        echo ""
        echo "💡 测试RAG功能:"
        echo "   python3 test_enhanced_rag.py"
        ;;
        
    "mobile")
        clean_cache
        start_mobile
        wait_for_service "http://localhost:8081" "移动端服务"
        show_status
        echo "🎉 移动端开发环境启动完成！"
        ;;
        
    "full")
        clean_cache
        start_mobile
        start_enhanced_ai
        
        echo "⏳ 等待所有服务启动..."
        wait_for_service "http://localhost:8081" "移动端服务"
        wait_for_service "http://localhost:8766/health" "增强版RAG AI服务"
        
        show_status
        echo "🎉 完整系统启动完成！"
        echo ""
        echo "🌐 访问地址:"
        echo "   移动端应用: http://localhost:8081"
        echo "   AI API文档: http://localhost:8766/docs"
        echo ""
        echo "🧪 测试命令:"
        echo "   python3 test_enhanced_rag.py"
        ;;
        
    "clean")
        clean_cache
        echo "✅ 清理完成，请选择要启动的服务:"
        show_usage
        ;;
        
    "status")
        show_status
        ;;
        
    "stop")
        echo "🛑 停止所有服务..."
        pkill -f "simple_ai_api.py" 2>/dev/null || true
        pkill -f "enhanced_ai_api.py" 2>/dev/null || true
        pkill -f "npm run web" 2>/dev/null || true
        echo "✅ 所有服务已停止"
        ;;
        
    "help"|*)
        show_usage
        ;;
esac