#!/bin/bash

echo "🧹 清除应用缓存和存储数据..."

# 停止所有相关进程
echo "1️⃣ 停止后端服务..."
pkill -f "test_simple_api.py" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true

echo "2️⃣ 停止前端服务..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# 清除 React Native / Expo 缓存
echo "3️⃣ 清除前端缓存..."
cd mobile
npm run web -- --clear 2>/dev/null || true
rm -rf .expo 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# 清除 AsyncStorage (这是关键！)
echo "4️⃣ 清除 AsyncStorage 数据..."
# 对于 Web 版本，AsyncStorage 使用 localStorage
# 创建一个清除脚本
cat > clear_storage.js << 'EOF'
// 清除所有 AsyncStorage 数据
if (typeof window !== 'undefined' && window.localStorage) {
  console.log('Clearing AsyncStorage data...');
  const keysToRemove = ['access_token', 'user_data', 'profile_complete', 'language', 'user_profile'];
  keysToRemove.forEach(key => {
    window.localStorage.removeItem(key);
    console.log(`Removed: ${key}`);
  });
  console.log('AsyncStorage cleared!');
}
EOF

# 返回根目录
cd ..

echo ""
echo "✅ 服务端缓存已清除！"
echo ""
echo "🚨 重要：你还需要清除浏览器数据！"
echo ""
echo "请选择以下任一方法："
echo ""
echo "方法1 (推荐)："
echo "   打开: file://$PWD/force_logout.html"
echo "   点击'强制登出'按钮"
echo ""
echo "方法2 (快速)："
echo "   1. 打开 http://localhost:8081"
echo "   2. 按F12打开控制台"
echo "   3. 粘贴运行: localStorage.clear(); location.reload();"
echo ""
echo "完成后使用 ./start_app.sh 重新启动应用"