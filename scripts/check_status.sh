#!/bin/bash

echo "🔍 BodyMind AI 服务状态检查"
echo "============================="
echo ""

# 检查后端API
echo "1️⃣ 后端API服务 (端口 8765):"
if curl -s http://localhost:8765/health > /dev/null 2>&1; then
    echo "   ✅ 运行中"
    echo "   测试账号: test@example.com / Test123456!"
else
    echo "   ❌ 未运行"
    echo "   启动命令: cd backend/ai-service && python test_simple_api.py"
fi
echo ""

# 检查前端服务
echo "2️⃣ 前端Web服务 (端口 8081):"
if curl -s http://localhost:8081 > /dev/null 2>&1; then
    echo "   ✅ 运行中"
    echo "   访问地址: http://localhost:8081"
else
    echo "   ❌ 未运行"
    echo "   启动命令: cd mobile && npm run web"
fi
echo ""

# 检查进程
echo "3️⃣ 运行中的进程:"
ps aux | grep -E "(test_simple_api|expo|metro)" | grep -v grep | while read line; do
    echo "   - $(echo $line | awk '{print $11, $12, $13}')"
done
echo ""

echo "💡 提示:"
echo "   - 如果服务未运行，使用 ./start_app.sh 启动所有服务"
echo "   - 如果需要清除数据，先运行 ./clear_cache.sh"
echo "   - 然后在浏览器控制台执行: localStorage.clear()"