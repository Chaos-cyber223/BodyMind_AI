# CLAUDE.md

Claude Code (claude.ai/code) 使用指南 - BodyMind_AI 项目

## 🎯 项目概述

BodyMind_AI 是一个基于科学研究的AI减脂专家应用，采用React Native前端 + Python FastAPI后端 + LangChain RAG系统架构。

## 🚀 快速启动

```bash
# 一键启动完整系统 (移动端 + AI服务)
./start.sh full

# 查看运行状态
./start.sh status
```

启动后访问: **http://localhost:8081** (移动端) 和 **http://localhost:8766** (AI服务)

## 🧪 测试验证

```bash
# 测试AI功能
python3 tests/test_enhanced_rag.py
```

**移动端测试**: 访问 http://localhost:8081
- 测试账号: `test@example.com` / `Test123456!`
- 登录后点击Chat标签，发送消息测试AI回答

## 📚 科学知识库

```bash
# 查看预设的5篇科学文章
python3 tests/show_preset_knowledge.py

# 直接阅读文档
cat knowledge_base/01_caloric_deficit_science.md
```

**预设知识库**: 5篇高质量减脂科学研究摘要，位于 `knowledge_base/` 目录
- 热量缺口原理、蛋白质摄入、力量训练、HIIT对比、减脂平台期
- 已向量化存储，支持AI智能检索

**扩展知识库**: 参考 `knowledge_base/SUMMARY_TEMPLATE.md` 创建新文章
```

## 🏗️ 技术架构

- **前端**: React Native + TypeScript (端口8081)
- **后端**: Python FastAPI + LangChain + Chroma向量数据库 (端口8766)
- **AI**: SiliconFlow API (DeepSeek-R1 + BGE-M3 embeddings)

**目录结构**:
- `mobile/` - React Native前端
- `backend/ai-service/` - Python AI后端  
- `knowledge_base/` - 科学研究文档
- `tests/` - 测试脚本

## 🔧 开发信息

**测试账号**: `test@example.com` / `Test123456!`

**API文档**: http://localhost:8766/docs

## ✨ 核心功能

- **科学减脂AI专家**: 基于真实研究的个性化建议
- **RAG检索系统**: 向量相似度搜索科学文献
- **双语聊天**: 中英文AI对话，显示研究来源
- **移动端应用**: 完整的减脂管理界面

## 🚨 问题排除

**常见问题**:
- 端口被占用 → 重新运行 `./start.sh full`
- 移动端白屏 → 运行 `cd mobile && npm install`
- 查看日志 → `tail -f enhanced_ai.log`

## 📋 开发计划

- [ ] 扩充科学知识库 (目标20-50篇研究)
- [ ] 优化AI个性化程度
- [ ] 实现食物/运动日志API集成

---

**快速开始**: `./start.sh full` → 访问 http://localhost:8081