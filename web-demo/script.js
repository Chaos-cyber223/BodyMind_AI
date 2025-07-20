// BodyMind AI Web Demo Script
class BodyMindAI {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8766';
        this.isApiAvailable = false;
        this.presetAnswers = this.initializePresetAnswers();
        this.init();
    }

    async init() {
        await this.checkApiHealth();
        this.setupEventListeners();
    }

    async checkApiHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/chat/health`);
            this.isApiAvailable = response.ok;
            console.log('API Health:', this.isApiAvailable ? 'Available' : 'Offline');
        } catch (error) {
            console.log('API not available, using preset answers');
            this.isApiAvailable = false;
        }
    }

    setupEventListeners() {
        const customInput = document.getElementById('customMessageInput');
        if (customInput) {
            customInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendCustomMessage();
                }
            });
        }
    }

    initializePresetAnswers() {
        return {
            'caloric-deficit': {
                question: "如何科学制定热量缺口计划？",
                answer: `## 科学热量缺口制定指南

**核心原理：** 减脂的根本在于创造合理的热量缺口，让身体消耗储存的脂肪作为能量来源。

### 1. 安全减脂速度
- **推荐速度：** 每周减重0.5-1公斤
- **对应缺口：** 每日500-750卡路里缺口
- **计算基础：** 1公斤脂肪≈7700卡路里

### 2. 制定步骤
1. **计算基础代谢率（BMR）**
   - 男性：BMR = 88.362 + (13.397 × 体重kg) + (4.799 × 身高cm) - (5.677 × 年龄)
   - 女性：BMR = 447.593 + (9.247 × 体重kg) + (3.098 × 身高cm) - (4.330 × 年龄)

2. **估算总消耗（TDEE）**
   - 久坐：BMR × 1.2
   - 轻度活动：BMR × 1.375
   - 中度活动：BMR × 1.55
   - 高强度活动：BMR × 1.725

3. **设定目标缺口**
   - 保守：TDEE - 300-500卡路里
   - 适中：TDEE - 500-750卡路里
   - 避免超过TDEE的25%

### 3. 注意事项
- **监测代谢适应：** 定期重新计算TDEE
- **避免过度节食：** 过大缺口导致肌肉流失和代谢下降
- **关注营养密度：** 确保微量营养素充足

### 4. 调整策略
- 每2-3周评估进度
- 体重停滞超过10天考虑调整
- 优先增加运动消耗而非减少食物摄入`,
                sources: [
                    "Journal of Clinical Nutrition, 2023 - Energy balance and body weight regulation",
                    "American Journal of Clinical Nutrition - Metabolic adaptation during weight loss",
                    "International Journal of Obesity - Sustainable weight loss strategies"
                ]
            },
            'protein': {
                question: "蛋白质摄入对减脂的重要性",
                answer: `## 蛋白质在减脂中的关键作用

**核心价值：** 蛋白质是减脂期间保持肌肉量、提高代谢、增强饱腹感的关键营养素。

### 1. 推荐摄入量
- **减脂期标准：** 每公斤体重1.6-2.2克蛋白质
- **高强度训练：** 每公斤体重2.2-2.5克
- **举例：** 70kg成年人需要112-154克/天

### 2. 减脂期蛋白质的作用机制
1. **保护肌肉量**
   - 提供肌肉蛋白质合成原料
   - 减少肌肉分解（抗分解代谢）
   - 维持基础代谢率

2. **增强饱腹感**
   - 食物热效应最高（20-30%）
   - 延缓胃排空
   - 调节饥饿激素（GLP-1, CCK）

3. **提高代谢**
   - 消化吸收消耗更多能量
   - 支持肌肉维持高代谢状态

### 3. 最佳摄入策略
**时间分布：**
- 每餐20-40克均匀分布
- 训练后1-2小时内补充
- 睡前摄入酪蛋白类慢释蛋白

**优质蛋白质来源：**
- 动物性：瘦肉、鱼类、蛋类、乳制品
- 植物性：豆类、坚果、全谷物
- 补充剂：乳清蛋白、酪蛋白

### 4. 实际应用建议
- 每餐确保有1-2个掌心大小的蛋白质
- 优先选择完整氨基酸谱的蛋白质
- 结合抗阻训练最大化效果
- 关注蛋白质质量而非仅仅数量`,
                sources: [
                    "Journal of Nutrition Research - Protein requirements during weight loss",
                    "Sports Medicine Review - Protein timing and muscle preservation",
                    "Clinical Nutrition Studies - Thermogenic effects of protein"
                ]
            },
            'hiit': {
                question: "HIIT vs 传统有氧运动哪个更好？",
                answer: `## HIIT vs 传统有氧运动对比分析

**结论：** 两种运动方式各有优势，HIIT在时间效率和后燃效应方面更优，传统有氧在可持续性和恢复方面更佳。

### 1. HIIT高强度间歇训练
**优势：**
- **时间效率高：** 15-30分钟达到传统有氧45-60分钟的效果
- **后燃效应强：** 运动后12-24小时持续燃脂（EPOC）
- **保护肌肉：** 高强度刺激有助维持肌肉量
- **代谢灵活性：** 提高糖脂混合供能能力

**适合人群：**
- 时间紧张的上班族
- 运动基础较好的人群
- 希望快速看到效果的初学者

### 2. 传统稳态有氧
**优势：**
- **可持续性强：** 强度适中，更容易坚持
- **恢复负担小：** 对关节和肌肉压力较小
- **直接燃脂：** 运动过程中直接消耗脂肪
- **心肺功能：** 更好地改善心血管健康

**适合人群：**
- 运动初学者或体能较弱人群
- 关节有问题的人群
- 希望放松解压的人群

### 3. 科学对比数据
**卡路里消耗：**
- HIIT：每分钟10-15卡路里
- 传统有氧：每分钟8-12卡路里
- 总消耗（含后燃）：HIIT略优

**减脂效果：**
- 短期（4-8周）：HIIT效果更显著
- 长期（12-24周）：差异缩小
- 腹部脂肪：HIIT更有优势

### 4. 最佳实践建议
**组合方案：**
- 主要：HIIT训练2-3次/周
- 辅助：中低强度有氧2-3次/周
- 恢复：低强度活动1-2次/周

**进阶策略：**
- 初学者先建立有氧基础
- 有基础后逐步加入HIIT
- 根据个人恢复能力调整比例`,
                sources: [
                    "Sports Medicine Journal - HIIT vs continuous training for fat loss",
                    "Applied Physiology Research - EPOC effects in different exercise modalities",
                    "Exercise Science Review - Long-term adherence to exercise programs"
                ]
            },
            'plateau': {
                question: "减脂平台期如何突破？",
                answer: `## 减脂平台期突破策略

**平台期定义：** 体重连续2-3周没有明显下降，即使保持相同的饮食和运动计划。这是身体的保护性机制，也称为"代谢适应"。

### 1. 平台期形成机制
**生理适应：**
- 基础代谢率下降5-25%
- 非运动性热能消耗减少（NEAT）
- 肌肉效率提高，做相同运动消耗更少
- 激素水平变化（甲状腺激素T3下降，皮质醇上升）

**心理因素：**
- 饮食执行松懈
- 运动强度无意识下降
- 压力增加影响代谢

### 2. 突破策略

**A. 重新计算热量需求**
- 根据新体重重新计算TDEE
- 调整热量缺口至300-500卡路里
- 避免过度削减热量

**B. 饮食结构调整**
- 提高蛋白质比例至总热量25-30%
- 采用碳水循环：高碳日+低碳日交替
- 增加膳食纤维摄入
- 考虑间歇性断食

**C. 运动方案优化**
- 改变训练方式：HIIT+力量训练结合
- 增加日常活动量（NEAT）
- 调整运动时长和强度
- 引入新的运动类型刺激身体

**D. 恢复与休息**
- 安排1-2周的饮食休息期
- 将热量提升至维持水平
- 确保充足睡眠（7-9小时）
- 管理压力水平

### 3. 实用突破技巧

**短期策略（1-2周）：**
- 再加载日：每周1-2次高碳水日
- 调整训练：改变强度和类型
- 增加步数：每日额外1000-2000步

**中期策略（2-4周）：**
- 重新评估总体计划
- 调整宏量营养素比例
- 考虑营养补充剂（绿茶提取物、左旋肉碱）

**长期策略（1-3个月）：**
- 设定新的身体成分目标
- 引入周期性饮食
- 关注身体成分而非体重数字

### 4. 避免常见错误
- ❌ 大幅削减热量（低于基础代谢）
- ❌ 过度增加有氧运动
- ❌ 忽视力量训练
- ❌ 频繁更换计划
- ✅ 耐心坚持，关注长期趋势
- ✅ 多维度评估进步（体脂率、围度、体能）`,
                sources: [
                    "Obesity Research - Metabolic adaptation mechanisms",
                    "International Journal of Obesity - Weight loss plateaus and solutions",
                    "Nutrition Reviews - Dietary break strategies for weight loss"
                ]
            },
            'resistance': {
                question: "力量训练在减脂中的作用",
                answer: `## 力量训练：减脂期的必备武器

**核心价值：** 力量训练是减脂期间保持肌肉量、提高代谢、塑造身材的最有效方法，重要性超过单纯的有氧运动。

### 1. 减脂期力量训练的作用机制

**直接作用：**
- **保护肌肉量：** 提供维持肌肉的刺激信号
- **提高基础代谢：** 1公斤肌肉比1公斤脂肪多消耗50-100卡路里/天
- **后燃效应：** 训练后24-48小时持续高代谢
- **改善身体成分：** 在减脂同时改善肌肉比例

**间接作用：**
- **胰岛素敏感性：** 提高肌肉对胰岛素的敏感性
- **激素优化：** 促进生长激素和睾酮分泌
- **脂肪动员：** 增强脂肪分解酶活性

### 2. 减脂期力量训练方案

**训练频率：**
- 每周3-4次全身训练
- 或每周4-6次分化训练
- 每个肌群每周至少训练2次

**训练强度：**
- 以维持肌肉为主：70-85% 1RM
- 重量：8-12次力竭的重量
- 组数：每个动作3-4组
- 休息：大肌群动作60-90秒，小肌群45-60秒

**动作选择：**
- **优先复合动作：** 深蹲、硬拉、卧推、划船
- **辅助孤立动作：** 针对弱点部位
- **功能性动作：** 提高日常活动能力

### 3. 减脂期力量训练特点

**vs 增肌期差异：**
- 重量可能下降5-15%（正常现象）
- 恢复能力减弱，调整训练容量
- 更注重维持而非突破
- 加入更多代谢性训练元素

**训练技巧：**
- **超级组：** 拮抗肌群配对训练
- **循环训练：** 减少休息时间，增加代谢消耗
- **递减组：** 延长肌肉紧张时间
- **爆发力训练：** 保持神经肌肉效率

### 4. 常见误区纠正

**误区1：** "有氧运动比力量训练减脂效果更好"
**真相：** 力量训练的长期减脂效果更佳，能防止溜溜球效应

**误区2：** "减脂期应该做高次数低重量"
**真相：** 中等次数中等重量最有效，保持肌肉刺激

**误区3：** "力量训练会让女性变得粗壮"
**真相：** 女性睾酮水平低，不易大幅增肌，只会让身材更紧致

**误区4：** "减脂期力量下降说明方法错误"
**真相：** 适度力量下降是正常的，关键是最小化肌肉流失

### 5. 实践建议

**初学者方案：**
- 全身训练，每周3次
- 主要复合动作为主
- 逐步增加训练容量

**进阶者方案：**
- 上下肢分化或推拉腿分化
- 结合有氧训练
- 周期性调整训练变量

**营养配合：**
- 训练前1-2小时适量碳水
- 训练后及时补充蛋白质
- 保证充足的整体热量支持恢复`,
                sources: [
                    "Strength & Conditioning Research - Resistance training during weight loss",
                    "Journal of Applied Physiology - Muscle preservation strategies",
                    "Sports Medicine - Metabolic effects of resistance training"
                ]
            }
        };
    }

    async askPresetQuestion(questionType) {
        this.hideWelcomeSection();
        this.showLoading();

        // Simulate API call delay for realistic experience
        await this.delay(2000);

        const preset = this.presetAnswers[questionType];
        if (preset) {
            this.hideLoading();
            this.showChatMessages();
            this.displayConversation(preset.question, preset.answer, preset.sources);
        }
    }

    async sendCustomMessage() {
        const input = document.getElementById('customMessageInput');
        const message = input.value.trim();
        
        if (!message) return;

        this.hideCustomInput();
        this.hideWelcomeSection();
        this.showLoading();

        let response, sources;
        
        if (this.isApiAvailable) {
            try {
                const result = await this.callAIAPI(message);
                response = result.response;
                sources = result.sources || [];
            } catch (error) {
                response = this.getOfflineResponse(message);
                sources = ["离线模式 - 基于预设知识库"];
            }
        } else {
            response = this.getOfflineResponse(message);
            sources = ["离线模式 - 基于预设知识库"];
        }

        await this.delay(1500);
        this.hideLoading();
        this.showChatMessages();
        this.displayConversation(message, response, sources);
        
        input.value = '';
    }

    async callAIAPI(message) {
        const response = await fetch(`${this.apiBaseUrl}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer demo-token'
            },
            body: JSON.stringify({
                message: message,
                user_profile: {
                    name: "Demo User",
                    goal: "fat_loss"
                }
            })
        });

        if (!response.ok) {
            throw new Error('API call failed');
        }

        return await response.json();
    }

    getOfflineResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('热量') || lowerMessage.includes('卡路里') || lowerMessage.includes('缺口')) {
            return this.presetAnswers['caloric-deficit'].answer;
        } else if (lowerMessage.includes('蛋白质') || lowerMessage.includes('protein')) {
            return this.presetAnswers['protein'].answer;
        } else if (lowerMessage.includes('hiit') || lowerMessage.includes('有氧') || lowerMessage.includes('运动')) {
            return this.presetAnswers['hiit'].answer;
        } else if (lowerMessage.includes('平台期') || lowerMessage.includes('停滞') || lowerMessage.includes('plateau')) {
            return this.presetAnswers['plateau'].answer;
        } else if (lowerMessage.includes('力量') || lowerMessage.includes('肌肉') || lowerMessage.includes('训练')) {
            return this.presetAnswers['resistance'].answer;
        } else {
            return `感谢您的问题："${message}"

作为AI减脂专家，我基于科学研究为您提供个性化建议。您的问题涉及减脂的重要方面，让我为您详细解答：

## 核心建议

基于您的问题，我建议您关注以下几个科学减脂的关键要素：

### 1. 建立合理的热量缺口
- 每周减重0.5-1公斤为安全目标
- 避免过度节食导致代谢下降

### 2. 优化营养结构
- 蛋白质：每公斤体重1.6-2.2克
- 碳水化合物：根据活动量调整
- 健康脂肪：占总热量20-35%

### 3. 结合力量训练
- 保护肌肉量，维持代谢
- 每周3-4次抗阻训练

### 4. 保证充足恢复
- 每晚7-9小时优质睡眠
- 管理压力水平

如需更具体的建议，建议您选择上方的预设问题，我会为您提供更详细的科学指导。`;
        }
    }

    displayConversation(question, answer, sources) {
        const chatMessages = document.getElementById('chatMessages');
        const messageContainer = chatMessages.querySelector('.message-container');
        
        const timestamp = new Date().toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const conversation = `
            <div class="message">
                <div class="user-message">
                    <div class="message-content">
                        <p>${question}</p>
                    </div>
                    <div class="timestamp">${timestamp}</div>
                </div>
            </div>
            
            <div class="message">
                <div class="ai-message">
                    <div class="message-content">
                        ${this.formatMarkdown(answer)}
                        ${sources && sources.length > 0 ? `
                        <div class="sources">
                            <h5>📚 科学依据来源：</h5>
                            <ul>
                                ${sources.map(source => `<li>${source}</li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                    </div>
                    <div class="timestamp">${timestamp}</div>
                </div>
            </div>
        `;

        messageContainer.innerHTML = conversation;
        
        // Add restart button
        const restartButton = `
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="bodyMindAI.restart()" style="
                    background: linear-gradient(135deg, #4285f4, #1976d2);
                    color: white;
                    border: none;
                    border-radius: 25px;
                    padding: 12px 30px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s ease;
                ">
                    🔄 询问其他问题
                </button>
            </div>
        `;
        messageContainer.innerHTML += restartButton;
    }

    formatMarkdown(text) {
        return text
            .replace(/^### (.*$)/gm, '<h4>$1</h4>')
            .replace(/^## (.*$)/gm, '<h3>$1</h3>')
            .replace(/^# (.*$)/gm, '<h2>$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/- (.*$)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.*)$/gm, '<p>$1</p>')
            .replace(/<p><\/p>/g, '')
            .replace(/<p>(<h[234]>)/g, '$1')
            .replace(/(<\/h[234]>)<\/p>/g, '$1')
            .replace(/<p>(<ul>)/g, '$1')
            .replace(/(<\/ul>)<\/p>/g, '$1');
    }

    enableCustomInput() {
        this.hideWelcomeSection();
        this.showCustomInput();
    }

    backToPresets() {
        this.hideCustomInput();
        this.hideChatMessages();
        this.showWelcomeSection();
    }

    restart() {
        this.hideChatMessages();
        this.showWelcomeSection();
    }

    // Utility methods
    hideWelcomeSection() {
        document.getElementById('welcomeSection').style.display = 'none';
    }

    showWelcomeSection() {
        document.getElementById('welcomeSection').style.display = 'block';
    }

    hideCustomInput() {
        document.getElementById('customInputSection').style.display = 'none';
    }

    showCustomInput() {
        document.getElementById('customInputSection').style.display = 'block';
    }

    hideChatMessages() {
        document.getElementById('chatMessages').style.display = 'none';
    }

    showChatMessages() {
        document.getElementById('chatMessages').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loadingSection').style.display = 'none';
    }

    showLoading() {
        document.getElementById('loadingSection').style.display = 'block';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions for HTML onclick events
function askPresetQuestion(questionType) {
    bodyMindAI.askPresetQuestion(questionType);
}

function enableCustomInput() {
    bodyMindAI.enableCustomInput();
}

function sendCustomMessage() {
    bodyMindAI.sendCustomMessage();
}

function backToPresets() {
    bodyMindAI.backToPresets();
}

// Initialize the application
const bodyMindAI = new BodyMindAI();