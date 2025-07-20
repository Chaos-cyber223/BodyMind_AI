# BodyMind AI - Web演示版

## 🎯 项目简介

这是一个为Portfolio展示设计的AI减脂专家Web演示页面，采用类似Manus官网的预置问题设计，展示基于科学研究的AI回答能力。

## ✨ 核心特性

- **预置问题展示**: 5个精心设计的减脂相关问题
- **科学回答**: 基于真实研究文献的专业回答
- **现代界面**: 简洁优雅的用户界面设计
- **响应式布局**: 支持PC和移动端访问
- **API集成**: 可连接真实AI后端服务
- **离线支持**: 无API时使用预设回答

## 🚀 快速启动

### 📋 演示版 (适合Portfolio展示)
```bash
cd web-demo
python3 -m http.server 8080
# 访问: http://localhost:8080
```

### 💬 交互版 (真实AI对话)
```bash
# 1. 启动AI后端服务
cd .. && ./start.sh full

# 2. 启动Web界面
cd web-demo && python3 -m http.server 8080

# 访问: http://localhost:8080/interactive.html
```

### 🎯 版本对比 (新版本已优化)
| 特性 | 演示版 | 交互版 |
|------|--------|--------|
| 预设问题展示 | ✅ | ❌ (专注真实交互) |
| 真实AI对话 | ❌ | ✅ |
| API状态检测 | ❌ | ✅ |
| 谷歌Material Design | ❌ | ✅ |
| 移动端适配优化 | 基础 | ✅ |
| 错误处理机制 | ❌ | ✅ |
| 适用场景 | 快速展示 | 技术面试 |

## 📋 预置问题展示

1. **热量缺口科学制定** - 安全减脂速度和代谢保护
2. **蛋白质摄入重要性** - 肌肉保护和代谢提升
3. **HIIT vs 传统有氧** - 运动方式效果对比
4. **减脂平台期突破** - 代谢适应和应对策略
5. **力量训练作用** - 减脂期肌肉维持

每个问题都包含：
- 详细的科学解释
- 实用的操作建议
- 真实的研究来源引用

## 🎨 设计特点

- **谷歌Material Design**: 与移动端一致的配色方案
- **简洁白色背景**: 专业干净的视觉效果
- **真实AI交互**: 专注后端API集成体验
- **智能状态检测**: 自动检测API在线/离线状态
- **完整错误处理**: 包含重试机制和降级方案
- **响应式设计**: 完美适配PC和移动端

## 🔧 技术实现

- **前端**: 纯HTML + CSS + JavaScript
- **样式**: CSS3动画和渐变
- **交互**: 原生JavaScript，无框架依赖
- **API**: 支持连接FastAPI后端
- **部署**: 静态文件，易于部署到任何Web服务器

## 📁 文件结构

```
web-demo/
├── index.html      # 主页面
├── styles.css      # 样式文件
├── script.js       # 交互逻辑
└── README.md       # 说明文档
```

## 🌐 部署到Portfolio

### 选项1: 作为独立页面
直接将web-demo文件夹上传到你的Portfolio网站目录

### 选项2: 嵌入现有页面
```html
<!-- 在Portfolio页面中嵌入iframe -->
<iframe src="./bodymind-ai-demo/index.html" 
        width="100%" 
        height="800px" 
        frameborder="0">
</iframe>
```

### 选项3: 集成到现有网站
将styles.css和script.js的内容集成到现有网站中

## 🎯 展示重点

1. **技术能力**: 全栈AI应用开发
2. **界面设计**: 现代Web界面设计能力
3. **用户体验**: 直观的交互设计
4. **专业知识**: 对减脂科学的深度理解
5. **工程实践**: 完整的项目结构和文档

## 🔄 自定义扩展

### 添加新的预置问题
在`script.js`的`initializePresetAnswers()`中添加新问题：

```javascript
'new-topic': {
    question: "新问题标题",
    answer: "详细回答内容...",
    sources: ["科学来源1", "科学来源2"]
}
```

### 修改界面样式
编辑`styles.css`中的相应类名

### 连接其他AI服务
修改`script.js`中的`apiBaseUrl`和API调用方法

## 📞 联系信息

- **GitHub**: [你的GitHub链接]
- **Email**: [你的邮箱]
- **Portfolio**: [你的作品集网站]

---

**适合用途**: Portfolio展示、技术演示、客户展示、求职作品集