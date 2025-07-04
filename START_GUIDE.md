# 🚀 BodyMind AI 启动指南

## 🔥 快速启动（3步搞定）

### 1️⃣ 启动后端API服务
```bash
cd backend/ai-service
python test_simple_api.py &
```
**看到这个就成功了：**
```
INFO:     Uvicorn running on http://0.0.0.0:8765 (Press CTRL+C to quit)
```

### 2️⃣ 启动前端应用
```bash
cd mobile
npm run web
```
**看到这个就成功了：**
```
Web Bundled 318ms mobile/index.ts (433 modules)
```

### 3️⃣ 打开浏览器
在浏览器中访问：**http://localhost:8081**

---

## 🔑 测试登录账号
- **邮箱**：`test@example.com`
- **密码**：`Test123456!`

---

## 🛠️ 完整启动流程

### 第一步：打开终端
```bash
cd /Users/chaos/Documents/Portfolio/BodyMind_AI
```

### 第二步：启动后端
```bash
# 进入后端目录
cd backend/ai-service

# 启动简化API服务（在后台运行）
python test_simple_api.py &

# 检查服务是否启动成功
curl http://localhost:8765/health
# 应该返回：{"status":"ok","message":"Simple API running"}
```

### 第三步：启动前端
```bash
# 回到项目根目录
cd /Users/chaos/Documents/Portfolio/BodyMind_AI

# 进入前端目录
cd mobile

# 启动React Native Web开发服务器
npm run web

# 等待看到成功信息
```

### 第四步：打开应用
1. 打开浏览器（Chrome推荐）
2. 访问 http://localhost:8081
3. 用测试账号登录

---

## 🚨 常见问题解决

### 问题1：端口被占用
```bash
# 查看占用8765端口的进程
lsof -i :8765

# 杀掉进程（替换PID为实际进程ID）
kill -9 [PID]

# 查看占用8081端口的进程
lsof -i :8081

# 杀掉进程
kill -9 [PID]
```

### 问题2：后端启动失败
```bash
# 检查Python依赖
pip install fastapi uvicorn bcrypt pyjwt python-jose

# 手动启动
cd backend/ai-service
python test_simple_api.py
```

### 问题3：前端启动失败
```bash
# 重新安装依赖
cd mobile
npm install

# 清除缓存
npm start -- --clear
```

### 问题4：CORS错误
确保后端的test_simple_api.py中包含：
```python
allow_origins=["http://localhost:8081", "http://localhost:19006", "http://localhost:3000"]
```

### 问题5：登录失败
1. 检查后端是否在运行：`curl http://localhost:8765/health`
2. 清除浏览器缓存：Ctrl+Shift+R (或 Cmd+Shift+R)
3. 检查网络请求（F12开发者工具 → Network）
4. 确保使用正确的测试账号
5. 重启后端服务：
   ```bash
   # 找到并杀掉进程
   ps aux | grep test_simple_api.py | grep -v grep
   kill -9 [PID]
   
   # 重新启动
   python test_simple_api.py &
   ```

---

## 📱 端口说明

| 服务 | 端口 | 地址 | 用途 |
|-----|------|------|------|
| 后端API | 8765 | http://localhost:8765 | 认证和AI服务 |
| 前端Web | 8081 | http://localhost:8081 | React Native Web应用 |

---

## 🔄 停止服务

### 停止后端
```bash
# 查找Python进程
ps aux | grep test_simple_api.py

# 杀掉进程
kill -9 [PID]
```

### 停止前端
在运行npm run web的终端中按 `Ctrl+C`

---

## 🎯 开发模式快捷命令

### 一键启动脚本
创建启动脚本：
```bash
#!/bin/bash
echo "🚀 启动BodyMind AI..."

# 启动后端
cd /Users/chaos/Documents/Portfolio/BodyMind_AI/backend/ai-service
python test_simple_api.py &
echo "✅ 后端已启动在 http://localhost:8765"

# 等待后端启动
sleep 3

# 启动前端
cd /Users/chaos/Documents/Portfolio/BodyMind_AI/mobile
npm run web &
echo "✅ 前端已启动在 http://localhost:8081"

echo "🎉 系统启动完成！"
echo "📱 打开浏览器访问: http://localhost:8081"
echo "🔑 测试账号: test@example.com / Test123456!"
```

保存为 `start.sh`，然后：
```bash
chmod +x start.sh
./start.sh
```

---

## 📝 注意事项

1. **每次启动前确保端口没被占用**
2. **后端必须先启动，前端才能正常工作**
3. **浏览器建议用Chrome，移动端调试用Safari**
4. **修改代码后前端会自动重载，后端需要手动重启**
5. **网络问题检查开发者工具的Network面板**

---

## 🏆 成功标志

✅ 后端启动成功：`curl http://localhost:8765/health` 返回 `{"status":"ok"}`  
✅ 前端启动成功：浏览器能访问 `http://localhost:8081`  
✅ 登录成功：能用测试账号进入应用主界面  

**记住这个文件的位置**：`/Users/chaos/Documents/Portfolio/BodyMind_AI/START_GUIDE.md`