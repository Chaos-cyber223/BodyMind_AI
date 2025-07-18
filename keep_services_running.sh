#!/bin/bash

# BodyMind AI 服务保持运行脚本
# 自动检查并重启停止的服务

echo "🔁 BodyMind AI 服务监控启动..."
echo "按 Ctrl+C 停止监控"
echo ""

while true; do
    # 检查后端API服务
    if ! curl -s http://localhost:8765/health > /dev/null 2>&1; then
        echo "⚠️  $(date '+%Y-%m-%d %H:%M:%S') - 后端API服务已停止，正在重启..."
        cd backend/ai-service && python test_simple_api.py > /tmp/bodymind_api.log 2>&1 &
        sleep 5
        
        if curl -s http://localhost:8765/health > /dev/null 2>&1; then
            echo "✅ 后端API服务已重启成功"
        else
            echo "❌ 后端API服务重启失败，请手动检查"
        fi
    fi
    
    # 检查前端服务
    if ! curl -s http://localhost:8081 > /dev/null 2>&1; then
        echo "⚠️  $(date '+%Y-%m-%d %H:%M:%S') - 前端服务已停止，正在重启..."
        cd mobile && npm run web > /tmp/bodymind_web.log 2>&1 &
        sleep 10
        
        if curl -s http://localhost:8081 > /dev/null 2>&1; then
            echo "✅ 前端服务已重启成功"
        else
            echo "❌ 前端服务重启失败，请手动检查"
        fi
    fi
    
    # 每30秒检查一次
    sleep 30
done