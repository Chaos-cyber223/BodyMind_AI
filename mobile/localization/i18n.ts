import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';

export type Language = 'en' | 'zh';

const STORAGE_KEY = 'user_language';

// Get device language
const getDeviceLanguage = (): Language => {
  const deviceLanguage = Platform.OS === 'ios'
    ? NativeModules.SettingsManager?.settings?.AppleLocale || 
      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
    : NativeModules.I18nManager?.localeIdentifier;
  
  if (deviceLanguage?.includes('zh') || deviceLanguage?.includes('cn')) {
    return 'zh';
  }
  return 'en';
};

class I18nManager {
  private currentLanguage: Language = 'en';
  private listeners: Array<(language: Language) => void> = [];

  async initialize() {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
        this.currentLanguage = savedLanguage as Language;
      } else {
        this.currentLanguage = getDeviceLanguage();
        await this.setLanguage(this.currentLanguage);
      }
    } catch (error) {
      console.error('Failed to initialize language:', error);
      this.currentLanguage = getDeviceLanguage();
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  async setLanguage(language: Language) {
    try {
      this.currentLanguage = language;
      await AsyncStorage.setItem(STORAGE_KEY, language);
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  }

  subscribe(listener: (language: Language) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }

  t(key: string): string {
    return (translations[this.currentLanguage] as any)[key] || (translations.en as any)[key] || key;
  }
}

export const i18n = new I18nManager();

// Translations
const translations = {
  en: {
    // Welcome Screen
    'welcome.title': 'BodyMind AI',
    'welcome.subtitle': 'Smarter Fat Loss, Backed by Science.',
    'welcome.description': 'Personalized, sustainable results—powered by AI.',
    'welcome.getStarted': 'Get Started',
    'welcome.features.science': 'Science-Based',
    'welcome.features.scienceDesc': 'Evidence-backed recommendations',
    'welcome.features.personalized': 'Personalized',
    'welcome.features.personalizedDesc': 'Tailored to your unique needs',
    'welcome.features.ai': 'AI-Powered',
    'welcome.features.aiDesc': 'Advanced machine learning',

    // Profile Setup Screen
    'profile.title': 'Profile Setup',
    'profile.step': 'Step {{current}} of {{total}}',
    'profile.next': 'Next',
    'profile.complete': 'Complete Setup',
    'profile.back': 'Back',

    // Step 1: Basic Info
    'profile.step1.title': 'Basic Information',
    'profile.step1.subtitle': 'Help us understand your current situation',
    'profile.unitSystem': 'Unit System',
    'profile.metric': 'Metric (cm/kg)',
    'profile.imperial': 'Imperial (in/lbs)',
    'profile.age': 'Age',
    'profile.agePlaceholder': 'Enter your age',
    'profile.gender': 'Gender',
    'profile.male': 'Male',
    'profile.female': 'Female',
    'profile.other': 'Other',
    'profile.height': 'Height',
    'profile.heightPlaceholderMetric': 'e.g., 170',
    'profile.heightPlaceholderImperial': 'e.g., 67',
    'profile.currentWeight': 'Current Weight',
    'profile.weightPlaceholderMetric': 'e.g., 70',
    'profile.weightPlaceholderImperial': 'e.g., 154',
    'profile.targetWeight': 'Target Weight',
    'profile.targetWeightPlaceholderMetric': 'e.g., 65',
    'profile.targetWeightPlaceholderImperial': 'e.g., 143',
    'profile.activityLevel': 'Activity Level',
    'profile.sedentary': 'Sedentary',
    'profile.sedentaryDesc': 'Little or no exercise',
    'profile.light': 'Light',
    'profile.lightDesc': 'Light exercise 1-3 days/week',
    'profile.moderate': 'Moderate',
    'profile.moderateDesc': 'Moderate exercise 3-5 days/week',
    'profile.veryActive': 'Very Active',
    'profile.veryActiveDesc': 'Hard exercise 6-7 days/week',

    // Step 2: Goals & Exercise
    'profile.step2.title': 'Goals & Exercise',
    'profile.step2.subtitle': 'Tell us about your fitness goals and preferences',
    'profile.weightLossGoal': 'Weight Loss Goal',
    'profile.slow': 'Slow & Steady',
    'profile.slowDesc': '0.25-0.5 kg/week',
    'profile.moderateGoal': 'Moderate',
    'profile.moderateGoalDesc': '0.5-1 kg/week',
    'profile.fast': 'Faster',
    'profile.fastDesc': '1-1.5 kg/week',
    'profile.exerciseExperience': 'Exercise Experience',
    'profile.beginner': 'Beginner',
    'profile.beginnerDesc': 'New to exercise',
    'profile.intermediate': 'Intermediate',
    'profile.intermediateDesc': 'Some experience',
    'profile.advanced': 'Advanced',
    'profile.advancedDesc': 'Regular exerciser',
    'profile.expert': 'Expert',
    'profile.expertDesc': 'Very experienced',
    'profile.exerciseFrequency': 'Weekly Exercise Frequency',
    'profile.never': 'Never',
    'profile.neverDesc': 'No exercise',
    'profile.occasionally': 'Occasionally',
    'profile.occasionallyDesc': '1-2 times/week',
    'profile.regular': 'Regular',
    'profile.regularDesc': '3-4 times/week',
    'profile.frequent': 'Frequent',
    'profile.frequentDesc': '5-6 times/week',
    'profile.daily': 'Daily',
    'profile.dailyDesc': 'Every day',
    'profile.exerciseDuration': 'Exercise Duration',
    'profile.duration15': '15-30 minutes',
    'profile.duration30': '30-45 minutes',
    'profile.duration45': '45-60 minutes',
    'profile.duration60': '60+ minutes',

    // Step 3: Health Info
    'profile.step3.title': 'Health Information',
    'profile.step3.subtitle': 'Optional - Help us provide better recommendations',
    'profile.healthConditions': 'Health Conditions (Optional)',
    'profile.healthConditionsPlaceholder': 'Any health conditions we should know about?',
    'profile.allergies': 'Food Allergies (Optional)',
    'profile.allergiesPlaceholder': 'Any food allergies or intolerances?',
    'profile.medications': 'Medications (Optional)',
    'profile.medicationsPlaceholder': 'Any medications you\'re currently taking?',
    'profile.completeTitle': 'Profile Complete!',
    'profile.completeMessage': 'Your personalized plan is being generated...',
    'profile.continue': 'Continue',

    // Chat Screen
    'chat.title': 'AI Fat Loss Expert',
    'chat.subtitle': 'Powered by LangChain RAG',
    'chat.analyzing': 'Analyzing...',
    'chat.placeholder': 'Ask about diet, exercise, or fat loss...',
    'chat.voiceInput': 'Voice Input',
    'chat.voiceInputSoon': 'Voice input coming soon!',
    'chat.typingIndicator': 'AI is analyzing scientific research...',
    'chat.connectionError': 'Connection Error',
    'chat.connectionErrorMessage': 'Unable to send message. Please check your internet connection and try again.',
    'chat.retry': 'Retry',
    'chat.ok': 'OK',
    'chat.sources': 'Sources:',
    'chat.quickActions.protein': 'How much protein should I eat?',
    'chat.quickActions.exercise': 'Best exercises for fat loss',
    'chat.quickActions.plateau': 'Why am I not losing weight?',
    'chat.quickActions.hiit': 'HIIT vs cardio',

    // Meal Plan Screen
    'mealPlan.title': 'Your Personal Plan',
    'mealPlan.subtitle': 'Science-backed strategy',
    'mealPlan.goalProgress': 'Goal Progress',
    'mealPlan.week': 'Week {{current}} of {{total}}',
    'mealPlan.current': 'Current: {{weight}}kg',
    'mealPlan.target': 'Target: {{weight}}kg',
    'mealPlan.kgLost': 'kg lost',
    'mealPlan.aiLogging': 'AI Smart Logging',
    'mealPlan.aiPowered': '🧠 AI Powered',
    'mealPlan.recentEntries': 'Recent entries:',
    'mealPlan.aiPlaceholder': 'Tell AI what you ate or exercised...',
    'mealPlan.aiTipsTitle': '💡 AI Logging Tips',
    'mealPlan.aiTip1': '• "Had oatmeal for breakfast"',
    'mealPlan.aiTip2': '• "Ran for 30 minutes"',
    'mealPlan.aiTip3': '• "Ate a chicken salad and went to gym"',
    'mealPlan.nutrition': 'Today\'s Nutrition',
    'mealPlan.chatToUpdate': '💬 Chat to Update',
    'mealPlan.calories': 'Calories',
    'mealPlan.caloriesFormat': '{{current}} / {{target}} kcal',
    'mealPlan.protein': 'Protein',
    'mealPlan.carbs': 'Carbs',
    'mealPlan.fats': 'Fats',
    'mealPlan.workout': 'Today\'s Workout',
    'mealPlan.aiGenerated': '🧠 AI Generated',
    'mealPlan.aiSuggestion': 'AI Suggestion: Complete the Plank exercise for a balanced workout!',
    'mealPlan.latestResearch': 'Latest Research',
    'mealPlan.researchText': 'Combined strength + cardio training increases fat loss by 28% compared to cardio alone',
    'mealPlan.foodLoggedSuccess': 'Food Logged Successfully!',
    'mealPlan.foodLoggedMessage': 'Added {{calories}} calories from: {{description}}',
    'mealPlan.exerciseLoggedSuccess': 'Exercise Logged Successfully!',
    'mealPlan.exerciseLoggedMessage': 'Burned {{calories}} calories from {{duration}} minutes of exercise',
    'mealPlan.processingError': 'Processing Error',
    'mealPlan.processingErrorMessage': 'Unable to process your input. Please try again or be more specific.',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.settings': 'Settings',
  },
  zh: {
    // Welcome Screen
    'welcome.title': 'BodyMind AI',
    'welcome.subtitle': '智能减脂，科学为本。',
    'welcome.description': 'AI赋能，专属你的健康方案。',
    'welcome.getStarted': '开始使用',
    'welcome.features.science': '科学依据',
    'welcome.features.scienceDesc': '基于证据的建议',
    'welcome.features.personalized': '个性化',
    'welcome.features.personalizedDesc': '量身定制您的独特需求',
    'welcome.features.ai': 'AI驱动',
    'welcome.features.aiDesc': '先进的机器学习',

    // Profile Setup Screen
    'profile.title': '个人资料设置',
    'profile.step': '第{{current}}步，共{{total}}步',
    'profile.next': '下一步',
    'profile.complete': '完成设置',
    'profile.back': '返回',

    // Step 1: Basic Info
    'profile.step1.title': '基本信息',
    'profile.step1.subtitle': '帮助我们了解您的当前情况',
    'profile.unitSystem': '单位制',
    'profile.metric': '公制 (厘米/公斤)',
    'profile.imperial': '英制 (英寸/磅)',
    'profile.age': '年龄',
    'profile.agePlaceholder': '请输入您的年龄',
    'profile.gender': '性别',
    'profile.male': '男性',
    'profile.female': '女性',
    'profile.other': '其他',
    'profile.height': '身高',
    'profile.heightPlaceholderMetric': '例如：170',
    'profile.heightPlaceholderImperial': '例如：67',
    'profile.currentWeight': '当前体重',
    'profile.weightPlaceholderMetric': '例如：70',
    'profile.weightPlaceholderImperial': '例如：154',
    'profile.targetWeight': '目标体重',
    'profile.targetWeightPlaceholderMetric': '例如：65',
    'profile.targetWeightPlaceholderImperial': '例如：143',
    'profile.activityLevel': '活动水平',
    'profile.sedentary': '久坐不动',
    'profile.sedentaryDesc': '很少或不运动',
    'profile.light': '轻度活动',
    'profile.lightDesc': '每周轻度运动1-3天',
    'profile.moderate': '中度活动',
    'profile.moderateDesc': '每周中度运动3-5天',
    'profile.veryActive': '高度活跃',
    'profile.veryActiveDesc': '每周剧烈运动6-7天',

    // Step 2: Goals & Exercise
    'profile.step2.title': '目标与运动',
    'profile.step2.subtitle': '告诉我们您的健身目标和偏好',
    'profile.weightLossGoal': '减重目标',
    'profile.slow': '缓慢稳定',
    'profile.slowDesc': '每周0.25-0.5公斤',
    'profile.moderateGoal': '中等速度',
    'profile.moderateGoalDesc': '每周0.5-1公斤',
    'profile.fast': '较快',
    'profile.fastDesc': '每周1-1.5公斤',
    'profile.exerciseExperience': '运动经验',
    'profile.beginner': '初学者',
    'profile.beginnerDesc': '运动新手',
    'profile.intermediate': '中级',
    'profile.intermediateDesc': '有一些经验',
    'profile.advanced': '高级',
    'profile.advancedDesc': '经常运动',
    'profile.expert': '专家',
    'profile.expertDesc': '非常有经验',
    'profile.exerciseFrequency': '每周运动频率',
    'profile.never': '从不',
    'profile.neverDesc': '不运动',
    'profile.occasionally': '偶尔',
    'profile.occasionallyDesc': '每周1-2次',
    'profile.regular': '经常',
    'profile.regularDesc': '每周3-4次',
    'profile.frequent': '频繁',
    'profile.frequentDesc': '每周5-6次',
    'profile.daily': '每天',
    'profile.dailyDesc': '每天都运动',
    'profile.exerciseDuration': '运动时长',
    'profile.duration15': '15-30分钟',
    'profile.duration30': '30-45分钟',
    'profile.duration45': '45-60分钟',
    'profile.duration60': '60分钟以上',

    // Step 3: Health Info
    'profile.step3.title': '健康信息',
    'profile.step3.subtitle': '可选 - 帮助我们提供更好的建议',
    'profile.healthConditions': '健康状况（可选）',
    'profile.healthConditionsPlaceholder': '有什么健康状况需要我们了解的吗？',
    'profile.allergies': '食物过敏（可选）',
    'profile.allergiesPlaceholder': '有什么食物过敏或不耐受吗？',
    'profile.medications': '药物（可选）',
    'profile.medicationsPlaceholder': '目前正在服用什么药物吗？',
    'profile.completeTitle': '资料完成！',
    'profile.completeMessage': '正在生成您的个性化计划...',
    'profile.continue': '继续',

    // Chat Screen
    'chat.title': 'AI减脂专家',
    'chat.subtitle': '由LangChain RAG驱动',
    'chat.analyzing': '分析中...',
    'chat.placeholder': '询问饮食、运动或减脂相关问题...',
    'chat.voiceInput': '语音输入',
    'chat.voiceInputSoon': '语音输入即将推出！',
    'chat.typingIndicator': 'AI正在分析科学研究...',
    'chat.connectionError': '连接错误',
    'chat.connectionErrorMessage': '无法发送消息。请检查您的网络连接并重试。',
    'chat.retry': '重试',
    'chat.ok': '确定',
    'chat.sources': '来源：',
    'chat.quickActions.protein': '我应该吃多少蛋白质？',
    'chat.quickActions.exercise': '减脂最佳运动',
    'chat.quickActions.plateau': '为什么我不减重了？',
    'chat.quickActions.hiit': 'HIIT与有氧运动',

    // Meal Plan Screen
    'mealPlan.title': '您的个人计划',
    'mealPlan.subtitle': '科学支持的策略',
    'mealPlan.goalProgress': '目标进度',
    'mealPlan.week': '第{{current}}周，共{{total}}周',
    'mealPlan.current': '当前：{{weight}}公斤',
    'mealPlan.target': '目标：{{weight}}公斤',
    'mealPlan.kgLost': '公斤已减',
    'mealPlan.aiLogging': 'AI智能记录',
    'mealPlan.aiPowered': '🧠 AI驱动',
    'mealPlan.recentEntries': '最近记录：',
    'mealPlan.aiPlaceholder': '告诉AI您吃了什么或做了什么运动...',
    'mealPlan.aiTipsTitle': '💡 AI记录小贴士',
    'mealPlan.aiTip1': '• "早餐吃了燕麦"',
    'mealPlan.aiTip2': '• "跑步30分钟"',
    'mealPlan.aiTip3': '• "吃了鸡肉沙拉，去了健身房"',
    'mealPlan.nutrition': '今日营养',
    'mealPlan.chatToUpdate': '💬 聊天更新',
    'mealPlan.calories': '卡路里',
    'mealPlan.caloriesFormat': '{{current}} / {{target}} 千卡',
    'mealPlan.protein': '蛋白质',
    'mealPlan.carbs': '碳水化合物',
    'mealPlan.fats': '脂肪',
    'mealPlan.workout': '今日锻炼',
    'mealPlan.aiGenerated': '🧠 AI生成',
    'mealPlan.aiSuggestion': 'AI建议：完成平板支撑练习以获得平衡的锻炼！',
    'mealPlan.latestResearch': '最新研究',
    'mealPlan.researchText': '力量训练加有氧运动相比单独有氧运动可增加28%的减脂效果',
    'mealPlan.foodLoggedSuccess': '食物记录成功！',
    'mealPlan.foodLoggedMessage': '已添加{{calories}}卡路里：{{description}}',
    'mealPlan.exerciseLoggedSuccess': '运动记录成功！',
    'mealPlan.exerciseLoggedMessage': '{{duration}}分钟运动消耗了{{calories}}卡路里',
    'mealPlan.processingError': '处理错误',
    'mealPlan.processingErrorMessage': '无法处理您的输入。请重试或提供更具体的信息。',

    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.settings': '设置',
  }
};

// Hook for React components
import { useState, useEffect } from 'react';

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(i18n.getCurrentLanguage());

  useEffect(() => {
    const unsubscribe = i18n.subscribe(setLanguage);
    return unsubscribe;
  }, []);

  return {
    t: (key: string, params?: Record<string, string | number>) => {
      let text = i18n.t(key);
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          text = text.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
        });
      }
      return text;
    },
    language,
    setLanguage: i18n.setLanguage.bind(i18n),
    isZh: language === 'zh',
    isEn: language === 'en',
  };
};

export default i18n;