# BodyMind AI 应用导航指南

## 🚀 快速开始

### 1. 清除旧的登录状态
如果你直接进入了主界面而不是登录页面，说明浏览器保存了之前的登录状态。

**解决方法：**
```bash
# 方法1：使用清除脚本
./clear_cache.sh

# 方法2：手动清除浏览器存储
1. 打开 http://localhost:8081
2. 按 F12 打开开发者工具
3. 在控制台输入：localStorage.clear()
4. 刷新页面
```

### 2. 启动应用
```bash
./start_app.sh
```

## 📱 应用流程

### 未登录状态
```
Welcome Screen (欢迎页面)
    ├── Login (登录)
    │   └── 输入邮箱密码 → MainApp
    └── Sign Up (注册)
        └── 创建账号 → ProfileSetup → MainApp
```

### 已登录状态
```
根据 isProfileComplete 状态：
├── false → ProfileSetup (个人资料设置)
│   ├── 完成3步设置 → MainApp
│   └── Skip (跳过) → MainApp
└── true → MainApp (主应用)
```

### MainApp 结构
```
MainApp (底部4个标签)
├── Chat (聊天) - AI减脂专家对话
├── Plan (计划) - 膳食和运动记录
├── Progress (进度) - 数据可视化
└── Settings (设置) 
    ├── 语言切换
    ├── 主题切换
    └── Sign Out (登出) → Welcome Screen
```

## 🔐 测试账号
- 邮箱：test@example.com
- 密码：Test123456!

## 💡 常见场景

### 场景1：首次使用
1. 访问 http://localhost:8081
2. 在Welcome页面点击 "Get Started"
3. 输入测试账号登录
4. 进入ProfileSetup，可以选择：
   - 完成3步设置
   - 点击右上角 "Skip" 跳过
5. 进入主应用

### 场景2：已登录想退出
1. 点击底部 "Settings" 标签
2. 滚动到底部
3. 点击 "Sign Out" / "退出登录"
4. 确认退出
5. 返回Welcome页面

### 场景3：切换语言
1. 在任何页面都能看到语言切换按钮
2. 或在Settings页面切换语言
3. 支持中文/英文实时切换

### 场景4：切换主题
1. 进入Settings页面
2. 找到Theme部分
3. 切换开关启用深色/浅色主题

## 🛠️ 故障排除

### 问题：直接进入主界面，看不到登录页面
**原因：** 浏览器保存了登录状态
**解决：** 
```javascript
// 在浏览器控制台执行
localStorage.clear()
location.reload()
```

### 问题：ProfileSetup页面无法退出
**原因：** 已修复，现在有Skip按钮
**解决：** 点击右上角 "Skip" 按钮

### 问题：API连接失败
**原因：** 后端服务未启动
**解决：**
```bash
cd backend/ai-service
python test_simple_api.py
```

## 📊 应用状态管理

### AsyncStorage 存储的数据
- `access_token` - JWT认证令牌
- `user_data` - 用户基本信息
- `profile_complete` - Profile完成状态
- `language` - 语言偏好
- `user_profile` - 用户详细资料

### 清除所有数据
```javascript
// 在浏览器控制台执行
localStorage.clear()
```

## 🎯 总结
- **登录/登出**：Welcome → Login → MainApp → Settings → Sign Out
- **跳过设置**：ProfileSetup → Skip → MainApp
- **清除状态**：localStorage.clear() 或使用 ./clear_cache.sh