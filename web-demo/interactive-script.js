// BodyMind AI Interactive Chat Application
class InteractiveAI {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8766';
        this.isApiAvailable = false;
        this.conversationId = null;
        this.messageHistory = [];
        this.isTyping = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        this.init();
    }

    async init() {
        console.log('Initializing BodyMind AI Interactive...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check API health
        await this.checkApiHealth();
        
        // Auto-resize textarea
        this.setupTextareaAutoResize();
        
        console.log('BodyMind AI Interactive initialized');
    }

    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        // Input event listeners
        messageInput.addEventListener('input', this.handleInputChange.bind(this));
        messageInput.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Send button
        sendBtn.addEventListener('click', this.sendMessage.bind(this));
        
        // Window events
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }

    setupTextareaAutoResize() {
        const textarea = document.getElementById('messageInput');
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }

    async checkApiHealth() {
        const statusElement = document.getElementById('apiStatus');
        const statusDot = statusElement.querySelector('.status-dot');
        const statusText = statusElement.querySelector('.status-text');
        
        // Set checking state
        statusElement.className = 'api-status checking';
        statusText.textContent = '检测中...';
        
        try {
            console.log('Checking API health...');
            const response = await fetch(`${this.apiBaseUrl}/chat/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000
            });
            
            if (response.ok) {
                this.isApiAvailable = true;
                statusElement.className = 'api-status online';
                statusText.textContent = '在线 - 真实AI服务';
                console.log('API is available');
            } else {
                throw new Error('API health check failed');
            }
        } catch (error) {
            console.log('API not available:', error.message);
            this.isApiAvailable = false;
            statusElement.className = 'api-status offline';
            statusText.textContent = '离线 - 演示模式';
        }
    }

    handleInputChange(event) {
        const input = event.target;
        const charCount = input.value.length;
        const maxChars = 500;
        
        // Update character counter
        const charCountElement = document.getElementById('charCount');
        charCountElement.textContent = charCount;
        
        // Update character counter styling
        charCountElement.className = '';
        if (charCount > maxChars * 0.8) {
            charCountElement.className = 'warning';
        }
        if (charCount >= maxChars) {
            charCountElement.className = 'error';
        }
        
        // Update send button state
        const sendBtn = document.getElementById('sendBtn');
        const hasText = input.value.trim().length > 0;
        sendBtn.disabled = !hasText || this.isTyping || charCount > maxChars;
    }

    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    handleBeforeUnload(event) {
        if (this.messageHistory.length > 0) {
            event.preventDefault();
            event.returnValue = '你有未保存的对话，确定要离开吗？';
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        this.handleInputChange({ target: messageInput });
        
        // Hide welcome message and show chat
        this.showChatInterface();
        
        // Add user message to UI
        this.addMessageToUI('user', message);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Get AI response
            const response = await this.getAIResponse(message);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add AI response to UI
            this.addMessageToUI('ai', response.content, response.sources);
            
            // Update conversation ID
            if (response.conversation_id) {
                this.conversationId = response.conversation_id;
            }
            
            // Add to history
            this.messageHistory.push({
                user: message,
                ai: response.content,
                timestamp: new Date(),
                sources: response.sources
            });
            
            this.retryCount = 0; // Reset retry count on success
            
        } catch (error) {
            console.error('Failed to get AI response:', error);
            this.hideTypingIndicator();
            this.handleMessageError(error);
        }
    }

    async getAIResponse(message) {
        if (this.isApiAvailable) {
            return await this.callRealAPI(message);
        } else {
            return await this.getOfflineResponse(message);
        }
    }

    async callRealAPI(message) {
        const requestBody = {
            message: message,
            user_profile: {
                name: "Web Demo User",
                goal: "fat_loss",
                experience_level: "beginner",
                preferences: {
                    language: "chinese"
                }
            }
        };
        
        if (this.conversationId) {
            requestBody.conversation_id = this.conversationId;
        }
        
        const response = await fetch(`${this.apiBaseUrl}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer demo-web-token', // Demo token
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            content: data.response,
            sources: data.sources || [],
            conversation_id: data.conversation_id,
            timestamp: new Date(data.timestamp)
        };
    }

    async getOfflineResponse(message) {
        // Simulate API delay
        await this.delay(1500 + Math.random() * 1000);
        
        const lowerMessage = message.toLowerCase();
        let response = '';
        let sources = ['离线演示模式 - 基于预设知识库'];
        
        if (lowerMessage.includes('热量') || lowerMessage.includes('卡路里') || lowerMessage.includes('缺口') || lowerMessage.includes('计划')) {
            response = `## 个性化减脂计划建议

基于你提到的需求，我为你制定以下科学减脂计划：

### 🎯 目标设定
- **安全减脂速度**: 每周0.5-1公斤
- **推荐时间周期**: 3-6个月
- **健康第一原则**: 避免极端节食

### 📊 热量缺口计算
1. **基础代谢率估算** (以70kg成年人为例)
   - 男性: 约1650-1750卡路里/天
   - 女性: 约1350-1450卡路里/天

2. **总消耗估算** (TDEE)
   - 轻度活动: BMR × 1.375
   - 中度活动: BMR × 1.55

3. **建议缺口**: 每日500-750卡路里
   - 饮食控制: 300-500卡路里
   - 运动消耗: 200-300卡路里

### 🥗 营养分配建议
- **蛋白质**: 每公斤体重1.6-2.2克
- **碳水化合物**: 总热量的40-50%
- **健康脂肪**: 总热量的20-30%

### 💪 运动建议
- **力量训练**: 每周3次，保护肌肉量
- **有氧运动**: 每周2-3次，HIIT + 中等强度结合
- **日常活动**: 每日8000-10000步

需要更具体的个人化建议，请告诉我你的身高、体重、活动水平等信息！`;
            
        } else if (lowerMessage.includes('蛋白质') || lowerMessage.includes('营养') || lowerMessage.includes('食物')) {
            response = `## 减脂期蛋白质摄入指导

### 🥩 推荐摄入量
- **标准**: 每公斤体重1.6-2.2克
- **高强度训练**: 每公斤体重2.2-2.5克
- **举例**: 70kg成年人需要112-154克/天

### ⏰ 最佳摄入时间
1. **早餐**: 20-30克，启动代谢
2. **训练后**: 25-35克，促进恢复
3. **睡前**: 20-25克慢释蛋白质
4. **均匀分布**: 每餐20-40克

### 🍗 优质蛋白质来源
**动物性蛋白**:
- 瘦肉、鸡胸肉、鱼类
- 鸡蛋、低脂乳制品
- 完整氨基酸谱，吸收率高

**植物性蛋白**:
- 豆类、坚果、全谷物
- 需要合理搭配获得完整氨基酸

### 💡 实用建议
- 每餐确保有1-2个掌心大小的蛋白质
- 训练日可适当增加摄入量
- 关注蛋白质质量，不仅仅是数量`;

        } else if (lowerMessage.includes('运动') || lowerMessage.includes('hiit') || lowerMessage.includes('有氧') || lowerMessage.includes('训练')) {
            response = `## 科学运动方案推荐

### 🏃‍♀️ HIIT vs 传统有氧对比

**HIIT高强度间歇训练**:
✅ 时间效率高 (15-30分钟)
✅ 后燃效应强 (12-24小时持续燃脂)
✅ 保护肌肉量
✅ 提高代谢灵活性

**传统稳态有氧**:
✅ 可持续性强，容易坚持
✅ 恢复负担小
✅ 直接燃脂效果好
✅ 改善心血管健康

### 🏋️‍♀️ 最佳组合方案
**每周训练安排**:
- **力量训练**: 3-4次 (保护肌肉，提高代谢)
- **HIIT**: 2-3次 (高效燃脂)
- **中等强度有氧**: 2-3次 (心肺功能，恢复)
- **日常活动**: 每天8000+ 步

### 💪 力量训练重要性
- 每公斤肌肉比脂肪多消耗50-100卡路里/天
- 防止减脂期间肌肉流失
- 改善身体线条和比例
- 提高骨密度和功能性

### 📈 进阶建议
- 初学者: 先建立有氧基础 → 逐步加入力量 → 最后加入HIIT
- 有基础者: 力量训练为主体，有氧作为辅助
- 根据个人恢复能力调整训练频率和强度`;

        } else if (lowerMessage.includes('平台期') || lowerMessage.includes('停滞') || lowerMessage.includes('瓶颈')) {
            response = `## 减脂平台期突破策略

### 🔍 平台期形成原因
**生理适应**:
- 基础代谢率下降5-25%
- 非运动性热消耗减少(NEAT)
- 肌肉效率提高，同等运动消耗更少
- 激素水平变化(T3下降，皮质醇升高)

### 🚀 突破策略

**1. 重新计算热量需求**
- 根据新体重重新计算TDEE
- 调整热量缺口至300-500卡路里
- 避免过度削减热量(不低于基础代谢)

**2. 饮食结构调整**
- 提高蛋白质比例至总热量25-30%
- 采用碳水循环: 高碳日+低碳日交替
- 增加膳食纤维摄入
- 考虑间歇性断食

**3. 运动方案优化**
- 改变训练方式: 新的运动类型
- 增加日常活动量(NEAT)
- 调整运动强度和时长
- 力量训练 + HIIT组合

**4. 恢复策略**
- 安排1-2周饮食休息期
- 将热量提升至维持水平
- 确保充足睡眠(7-9小时)
- 管理压力，降低皮质醇

### ⚠️ 避免常见错误
❌ 大幅削减热量
❌ 过度增加有氧运动
❌ 忽视力量训练
❌ 频繁更换计划
✅ 耐心坚持，关注长期趋势`;

        } else {
            response = `## 个性化减脂建议

感谢你的咨询！基于你的问题，我为你提供以下科学减脂指导：

### 🎯 核心原则
1. **创造合理热量缺口** - 每日500-750卡路里
2. **保证营养均衡** - 蛋白质1.6-2.2g/kg体重
3. **结合力量训练** - 保护肌肉量，提高代谢
4. **循序渐进** - 每周减重0.5-1kg为宜

### 📋 行动步骤
1. **评估现状** - 计算TDEE和体脂率
2. **制定计划** - 饮食 + 运动方案
3. **监测进度** - 记录体重、围度、体感
4. **适时调整** - 根据反馈优化方案

### 💡 个性化建议
为了给你更精准的建议，建议你提供：
- 基本信息（身高、体重、年龄、性别）
- 运动基础和喜好
- 具体目标和时间期限
- 当前饮食和运动习惯

请告诉我更多信息，我会为你制定专属的科学减脂方案！`;
        }
        
        return {
            content: response,
            sources: sources,
            conversation_id: this.conversationId || this.generateConversationId(),
            timestamp: new Date()
        };
    }

    generateConversationId() {
        return 'web-demo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    showChatInterface() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const messagesContainer = document.getElementById('messagesContainer');
        
        if (welcomeMessage.style.display !== 'none') {
            welcomeMessage.style.display = 'none';
            messagesContainer.classList.add('active');
        }
    }

    addMessageToUI(sender, content, sources = null) {
        const messagesContainer = document.getElementById('messagesContainer');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        
        const timestamp = new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const avatarContent = sender === 'user' ? '👤' : '🤖';
        const sourcesHtml = sources && sources.length > 0 ? `
            <div class="message-sources">
                <div class="sources-title">📚 科学依据来源:</div>
                <div class="sources-list">${sources.map(source => `• ${source}`).join('<br>')}</div>
            </div>
        ` : '';
        
        messageElement.innerHTML = `
            <div class="message-avatar">${avatarContent}</div>
            <div class="message-content">
                <div class="message-text">${this.formatMessage(content)}</div>
                ${sourcesHtml}
                <div class="message-time">${timestamp}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    formatMessage(text) {
        return text
            .replace(/^### (.*$)/gm, '<h4>$1</h4>')
            .replace(/^## (.*$)/gm, '<h3>$1</h3>')
            .replace(/^# (.*$)/gm, '<h2>$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
            .replace(/✅ (.*$)/gm, '<li style="color: #4caf50;">✅ $1</li>')
            .replace(/❌ (.*$)/gm, '<li style="color: #f44336;">❌ $1</li>')
            .replace(/💡 (.*$)/gm, '<div style="background: #fff3cd; padding: 8px 12px; border-radius: 6px; margin: 8px 0;"><strong>💡 $1</strong></div>')
            .replace(/⚠️ (.*$)/gm, '<div style="background: #f8d7da; padding: 8px 12px; border-radius: 6px; margin: 8px 0;"><strong>⚠️ $1</strong></div>')
            .split('\n\n')
            .map(paragraph => paragraph.trim() ? `<p>${paragraph}</p>` : '')
            .join('')
            .replace(/<p>(<h[234]>)/g, '$1')
            .replace(/(<\/h[234]>)<\/p>/g, '$1')
            .replace(/<p>(<ul>)/g, '$1')
            .replace(/(<\/ul>)<\/p>/g, '$1')
            .replace(/<p>(<div)/g, '$1')
            .replace(/(<\/div>)<\/p>/g, '$1');
    }

    showTypingIndicator() {
        this.isTyping = true;
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.display = 'flex';
        this.scrollToBottom();
        
        // Update send button state
        document.getElementById('sendBtn').disabled = true;
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.display = 'none';
        
        // Update send button state
        const messageInput = document.getElementById('messageInput');
        const hasText = messageInput.value.trim().length > 0;
        document.getElementById('sendBtn').disabled = !hasText;
    }

    scrollToBottom() {
        setTimeout(() => {
            const messagesContainer = document.getElementById('messagesContainer');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    handleMessageError(error) {
        console.error('Message error:', error);
        
        if (this.retryCount < this.maxRetries) {
            // Show retry option
            this.addMessageToUI('ai', `❌ 抱歉，获取回答时出现问题：${error.message}\n\n正在尝试重新连接...请稍候。`);
            
            // Auto retry after delay
            setTimeout(() => {
                this.retryCount++;
                const lastMessage = this.getLastUserMessage();
                if (lastMessage) {
                    this.sendMessage();
                }
            }, 2000);
        } else {
            // Show error modal
            this.showErrorModal(error.message);
        }
    }

    getLastUserMessage() {
        const messages = document.querySelectorAll('.message.user .message-text');
        return messages.length > 0 ? messages[messages.length - 1].textContent : null;
    }

    showErrorModal(errorMessage) {
        const errorModal = document.getElementById('errorModal');
        const errorMessageElement = document.getElementById('errorMessage');
        
        errorMessageElement.textContent = errorMessage || '无法连接到AI服务，请检查网络连接或稍后重试。';
        errorModal.style.display = 'flex';
    }

    hideErrorModal() {
        document.getElementById('errorModal').style.display = 'none';
    }

    async retryConnection() {
        this.hideErrorModal();
        this.retryCount = 0;
        await this.checkApiHealth();
        
        // If still offline, add fallback message
        if (!this.isApiAvailable) {
            this.addMessageToUI('ai', '当前处于离线演示模式。虽然无法连接到真实AI服务，但我仍然可以基于预设知识库为你提供科学的减脂建议。\n\n请继续提问，我会尽力帮助你！');
        }
    }

    clearChat() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = '';
        messagesContainer.classList.remove('active');
        
        document.getElementById('welcomeMessage').style.display = 'block';
        
        // Reset state
        this.conversationId = null;
        this.messageHistory = [];
        this.retryCount = 0;
        
        // Clear input
        const messageInput = document.getElementById('messageInput');
        messageInput.value = '';
        messageInput.style.height = 'auto';
        this.handleInputChange({ target: messageInput });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions for HTML onclick events
function setInputText(text) {
    const messageInput = document.getElementById('messageInput');
    messageInput.value = text;
    messageInput.focus();
    
    // Trigger input change event
    const event = new Event('input', { bubbles: true });
    messageInput.dispatchEvent(event);
    
    // Auto resize
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

function clearChat() {
    interactiveAI.clearChat();
}

function hideErrorModal() {
    interactiveAI.hideErrorModal();
}

function retryConnection() {
    interactiveAI.retryConnection();
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.interactiveAI = new InteractiveAI();
});

// Expose functions globally for easier debugging
window.setInputText = setInputText;
window.clearChat = clearChat;
window.hideErrorModal = hideErrorModal;
window.retryConnection = retryConnection;