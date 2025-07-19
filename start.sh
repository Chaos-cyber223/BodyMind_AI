#!/bin/bash

echo "🚀 BodyMind AI - 统一启动脚本"
echo "================================"

# 检查脚本目录是否存在
if [ ! -d "scripts" ]; then
    echo "❌ scripts目录未找到，请确保在项目根目录运行此脚本"
    exit 1
fi

# 传递所有参数到实际的启动脚本
./scripts/start_bodymind_ai.sh "$@"