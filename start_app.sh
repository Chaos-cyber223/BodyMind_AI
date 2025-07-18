#!/bin/bash

# BodyMind AI 启动脚本

echo "🚀 启动 BodyMind AI 应用..."
echo ""

# 检查环境文件
if [ ! -f backend/ai-service/.env ]; then
    echo "⚠️  创建后端环境文件..."
    cp backend/ai-service/.env.local backend/ai-service/.env
fi

if [ ! -f mobile/.env ]; then
    echo "⚠️  创建前端环境文件..."
    cat > mobile/.env << EOF
EXPO_PUBLIC_API_URL=http://localhost:8765
EXPO_PUBLIC_SUPABASE_URL=http://localhost:5432
EXPO_PUBLIC_SUPABASE_ANON_KEY=local_development_key
EOF
fi

# 启动后端
echo "1️⃣  启动简化认证后端服务..."
echo "   运行命令: cd backend/ai-service && python test_simple_api.py"
echo ""
osascript -e 'tell app "Terminal" to do script "cd '$PWD'/backend/ai-service && python test_simple_api.py"'

# 等待后端启动
echo "⏳ 等待后端启动..."
sleep 5

# 启动前端
echo "2️⃣  启动移动端应用..."
echo "   运行命令: cd mobile && npm run web"
echo ""
osascript -e 'tell app "Terminal" to do script "cd '$PWD'/mobile && npm run web"'

echo ""
echo "✅ 应用正在启动！"
echo ""
echo "📱 几秒后访问: http://localhost:8081 (Web) 或 http://localhost:19006 (Expo)"
echo ""
echo "🔐 测试账号:"
echo "   邮箱: test@example.com"
echo "   密码: Test123456!"
echo ""
echo "💡 提示: 两个新的终端窗口已打开，分别运行后端和前端"
echo ""
echo "🔧 调试提示:"
echo "   - 如果直接进入 ProfileSetup 页面，点击右上角的 'Skip' 按钮"
echo "   - 或者使用 ./clear_cache.sh 清除缓存后重新启动"