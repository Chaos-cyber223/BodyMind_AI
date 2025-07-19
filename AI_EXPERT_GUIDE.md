# AI Expert 功能测试指南

## 🚀 快速启动

### 1. 停止简单API服务
```bash
# 停止test_simple_api.py
lsof -ti:8765 | xargs kill -9 2>/dev/null || true
```

### 2. 启动完整AI服务
```bash
./start_ai_service.sh
```

### 3. 测试AI功能

#### A. 使用API文档测试（推荐）
1. 访问 http://localhost:8765/docs
2. 点击 `/api/chat/message` 端点
3. 点击 "Try it out"
4. 输入测试数据：
```json
{
  "message": "我想减脂，每天应该吃多少蛋白质？",
  "user_profile": {
    "age": 25,
    "gender": "male", 
    "height": 175,
    "weight": 80,
    "activity_level": "moderate",
    "goal": "lose_weight"
  }
}
```
5. 点击 "Execute"

#### B. 使用命令行测试
```bash
# 获取JWT Token（使用简单API的账号）
TOKEN=$(curl -s -X POST http://localhost:8765/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!"}' \
  | jq -r '.access_token')

# 测试AI聊天
curl -X POST http://localhost:8765/api/chat/message \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "如何科学地计算我的每日热量需求？",
    "user_profile": {
      "age": 30,
      "gender": "female",
      "height": 165,
      "weight": 70,
      "activity_level": "moderate",
      "goal": "lose_weight"
    }
  }'
```

## 📱 前端测试

1. 确保AI服务运行中
2. 刷新前端页面（F5）
3. 登录应用
4. 进入Chat页面
5. 发送测试消息，例如：
   - "我想减掉10公斤，需要多长时间？"
   - "什么是间歇性禁食？适合我吗？"
   - "如何突破减脂平台期？"

## 🧪 测试要点

### 1. RAG系统验证
- AI回复应该引用科学来源
- 回复内容应该基于知识库
- 检查sources字段是否有引用

### 2. 个性化验证
- 提供user_profile时，回复应该个性化
- TDEE计算应该准确
- 建议应该符合用户目标

### 3. 对话记忆验证
- 使用相同的conversation_id
- AI应该记住之前的对话内容
- 上下文应该保持连贯

## 🔍 常见问题

### Q: "Failed to process message" 错误
A: 检查：
1. SiliconFlow API key是否正确
2. `.env`文件是否存在
3. 网络是否能访问api.siliconflow.cn

### Q: 回复太慢
A: 正常情况：
- 首次查询需要初始化向量数据库
- RAG检索需要时间
- SiliconFlow API响应时间

### Q: 没有引用来源
A: 可能原因：
- 问题太泛，知识库没有相关内容
- 需要添加更多研究文档
- RAG检索参数需要调整

## 📚 扩展知识库

### 添加新文档
```bash
# 上传PDF文档
curl -X POST http://localhost:8765/api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@research_paper.pdf" \
  -F "topic=nutrition" \
  -F "source=Journal of Nutrition"
```

### 支持的文档格式
- PDF (推荐)
- TXT
- 未来：Markdown, DOCX

## 🎯 优化建议

1. **增加知识库内容**
   - 上传更多减脂相关的研究论文
   - 添加中文科学文献
   - 包含实践案例研究

2. **调整RAG参数**
   - 增加检索数量 (k=5 → k=10)
   - 调整chunk大小
   - 优化embedding模型

3. **改进Prompt**
   - 添加更多专业术语
   - 包含单位转换逻辑
   - 增强对话连贯性

## ✅ 成功标志

当你看到以下情况时，说明AI Expert功能正常：
1. Chat页面能发送消息
2. AI回复包含科学依据
3. 回复内容个性化且专业
4. 对话流畅且有记忆
5. API文档显示所有端点正常