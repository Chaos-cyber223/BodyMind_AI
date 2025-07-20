// BodyMind AI Interactive Chat Application - Clean Version
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
        
        // Auto-focus input
        document.getElementById('messageInput').focus();
        
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
            this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });
    }

    async checkApiHealth() {
        const statusElement = document.getElementById('apiStatus');
        const statusText = statusElement.querySelector('.status-text');
        
        // Set checking state
        statusElement.className = 'api-status checking';
        statusText.textContent = '检测中...';
        
        try {
            console.log('Checking API health...');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${this.apiBaseUrl}/chat/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                this.isApiAvailable = true;
                statusElement.className = 'api-status online';
                statusText.textContent = '在线 - 真实AI服务';
                console.log('API is available');
                
                // Show initial welcome message
                this.addWelcomeMessage();
            } else {
                throw new Error('API health check failed');
            }
        } catch (error) {
            console.log('API not available:', error.message);
            this.isApiAvailable = false;
            statusElement.className = 'api-status offline';
            statusText.textContent = '离线 - 演示模式';
            
            // Show offline welcome message
            this.addOfflineWelcomeMessage();
        }
    }

    addWelcomeMessage() {
        // Auto-switch to chat view and add welcome message
        setTimeout(() => {
            this.showChatInterface();
            this.addMessageToUI('ai', '你好！我是你的AI减脂专家。基于科学研究论文和RAG系统，我可以为你提供个性化的减脂建议。\n\n请告诉我你的问题，比如：\n• 如何制定个人减脂计划？\n• 蛋白质摄入有什么要求？\n• 运动方案怎么安排？');
        }, 1000);
    }

    addOfflineWelcomeMessage() {
        setTimeout(() => {
            this.showChatInterface();
            this.addMessageToUI('ai', '你好！我是你的AI减脂专家。\n\n⚠️ 当前处于离线演示模式，无法连接到真实AI服务。\n\n不过我仍然可以基于预设知识库为你提供科学的减脂建议。请继续提问！');
        }, 1000);
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
        
        // Ensure chat interface is shown
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
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(`${this.apiBaseUrl}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer demo-web-token',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
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
            response = `## 科学减脂计划制定

基于你的问题，我为你提供以下建议：

### 🎯 热量缺口设定
**安全减脂速度**: 每周0.5-1公斤
**推荐缺口**: 每日500-750卡路里
- 饮食控制: 300-500卡路里
- 运动消耗: 200-300卡路里

### 📊 个人化计算
**基础代谢率(BMR)估算**:
- 男性: 88.4 + (13.4 × 体重kg) + (4.8 × 身高cm) - (5.7 × 年龄)
- 女性: 447.6 + (9.2 × 体重kg) + (3.1 × 身高cm) - (4.3 × 年龄)

**总消耗(TDEE)**: BMR × 活动系数
- 久坐: ×1.2
- 轻度活动: ×1.375
- 中度活动: ×1.55

### 💡 实用建议
1. 避免过度节食(不低于基础代谢)
2. 蛋白质摄入: 每公斤体重1.6-2.2克
3. 结合力量训练保护肌肉量
4. 定期调整计划适应代谢变化`;
            
        } else if (lowerMessage.includes('蛋白质') || lowerMessage.includes('营养') || lowerMessage.includes('食物')) {
            response = `## 减脂期蛋白质营养指导

### 🥩 摄入量建议
**标准推荐**: 每公斤体重1.6-2.2克
**高强度训练**: 每公斤体重2.2-2.5克
**示例**: 70kg成年人需要112-154克/天

### ⏰ 摄入时机
**优化分配**:
- 早餐: 20-30克(启动代谢)
- 训练后: 25-35克(促进恢复)
- 睡前: 20-25克(夜间修复)
- 每餐均匀: 20-40克

### 🍗 食物来源
**高质量蛋白质**:
- 瘦肉、鸡胸肉、鱼类
- 鸡蛋、希腊酸奶
- 豆类、坚果
- 蛋白粉(补充用)

### 💪 减脂期作用
- 保护肌肉量，防止肌肉流失
- 提高饱腹感，控制总热量
- 增加食物热效应，消耗额外能量
- 稳定血糖，减少饥饿感`;

        } else if (lowerMessage.includes('运动') || lowerMessage.includes('训练') || lowerMessage.includes('hiit')) {
            response = `## 科学运动方案设计

### 🏋️‍♀️ 力量训练(核心)
**重要性**: 减脂期保护肌肉量的关键
**频率**: 每周3-4次
**强度**: 70-85% 1RM，8-12次/组
**动作**: 深蹲、硬拉、卧推、划船等复合动作

### 🏃‍♀️ 有氧运动方案
**HIIT高强度间歇**:
- 时间效率高(15-30分钟)
- 后燃效应强(12-24小时持续燃脂)
- 每周2-3次

**稳态有氧**:
- 可持续性强，恢复负担小
- 直接燃脂效果好
- 每周2-3次，30-45分钟

### 📅 每周训练安排
**理想组合**:
- 周一: 力量训练(上肢)
- 周二: HIIT训练
- 周三: 力量训练(下肢)
- 周四: 中等强度有氧
- 周五: 力量训练(全身)
- 周六: 轻松有氧或休息
- 周日: 完全休息

### 💡 进阶提示
- 初学者先建立有氧基础
- 有经验者以力量训练为主体
- 根据个人恢复能力调整频率`;

        } else {
            response = `## 个性化减脂咨询回复

感谢你的问题！作为AI减脂专家，我基于科学研究为你提供以下建议：

### 🎯 减脂核心原则
1. **热量缺口**: 每日500-750卡路里适度缺口
2. **营养平衡**: 蛋白质1.6-2.2g/kg + 均衡碳水脂肪
3. **力量训练**: 保护肌肉量，维持代谢
4. **渐进调整**: 根据身体反馈优化方案

### 📋 个性化建议
为了给你更精准的指导，请告诉我：
- 你的基本信息(身高体重年龄)
- 减脂目标和时间期限
- 当前运动习惯
- 具体想了解的方面

### 💬 常见问题
你可以问我：
• "如何制定个人减脂计划？"
• "减脂期间蛋白质怎么安排？"
• "HIIT和传统有氧哪个更好？"
• "减脂遇到平台期怎么办？"

我会基于科学研究为你提供详细的专业建议！`;
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
            .replace(/^• (.*$)/gm, '<li>$1</li>')
            .split('\n\n')
            .map(paragraph => paragraph.trim() ? `<p>${paragraph}</p>` : '')
            .join('')
            .replace(/<p>(<h[234]>)/g, '$1')
            .replace(/(<\/h[234]>)<\/p>/g, '$1')
            .replace(/<p>(<ul>)/g, '$1')
            .replace(/(<\/ul>)<\/p>/g, '$1');
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
        
        if (this.retryCount < this.maxRetries && this.isApiAvailable) {
            this.retryCount++;
            this.addMessageToUI('ai', `❌ 获取回答时出现问题：${error.message}\n\n正在尝试重新连接 (${this.retryCount}/${this.maxRetries})...`);
            
            // Auto retry after delay
            setTimeout(() => {
                this.showTypingIndicator();
                const lastMessage = this.getLastUserMessage();
                if (lastMessage) {
                    // Retry the last message
                    this.getAIResponse(lastMessage).then(response => {
                        this.hideTypingIndicator();
                        this.addMessageToUI('ai', response.content, response.sources);
                        this.retryCount = 0;
                    }).catch(err => {
                        this.hideTypingIndicator();
                        this.handleMessageError(err);
                    });
                }
            }, 2000);
        } else {
            // Show error modal or fallback
            if (this.isApiAvailable) {
                this.showErrorModal(error.message);
            } else {
                // Switch to offline mode
                this.addMessageToUI('ai', '⚠️ 无法连接到AI服务，已切换到离线演示模式。请继续提问，我会基于预设知识库为你提供建议。');
            }
        }
    }

    getLastUserMessage() {
        if (this.messageHistory.length > 0) {
            return this.messageHistory[this.messageHistory.length - 1].user;
        }
        return null;
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
        
        if (!this.isApiAvailable) {
            this.addMessageToUI('ai', '⚠️ 仍无法连接到AI服务，已切换到离线演示模式。请继续提问！');
        } else {
            this.addMessageToUI('ai', '✅ 连接已恢复！请继续你的减脂咨询。');
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
        
        // Re-add welcome message if API is available
        if (this.isApiAvailable) {
            this.addWelcomeMessage();
        } else {
            this.addOfflineWelcomeMessage();
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions for HTML onclick events
function clearChat() {
    interactiveAI.clearChat();
}

function hideErrorModal() {
    interactiveAI.hideErrorModal();
}

function retryConnection() {
    interactiveAI.retryConnection();
}

function sendMessage() {
    interactiveAI.sendMessage();
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.interactiveAI = new InteractiveAI();
});

// Expose functions globally for easier debugging
window.clearChat = clearChat;
window.hideErrorModal = hideErrorModal;
window.retryConnection = retryConnection;
window.sendMessage = sendMessage;