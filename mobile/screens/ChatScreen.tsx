import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import apiService from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../localization/i18n';
import LanguageToggle from '../components/LanguageToggle';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  sources?: string[];
}

interface ChatScreenProps {
  navigation: any;
}

export default function ChatScreen({ navigation }: ChatScreenProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize chat on component mount
  useEffect(() => {
    console.log('ChatScreen mounted');
    initializeChat();
    loadUserProfile();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const loadUserProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const initializeChat = async () => {
    try {
      console.log('Initializing chat...');
      // 暂时跳过API检查，直接显示欢迎消息
      setMessages([{
        id: '1',
        text: 'Welcome to BodyMind AI! How can I help you with your fat loss journey?',
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent',
      }]);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setMessages([{
        id: '1',
        text: 'Welcome to BodyMind AI! How can I help you with your fat loss journey?',
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent',
      }]);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 暂时模拟AI响应
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `I received your message: "${inputText.trim()}". This is a test response.`,
          sender: 'ai',
          timestamp: new Date(),
          status: 'sent',
        };

        setMessages(prev => 
          prev.map(msg => 
            msg.id === userMessage.id 
              ? { ...msg, status: 'sent' as const }
              : msg
          ).concat(aiMessage)
        );
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system';

    if (isSystem) {
      return (
        <View key={message.id} style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{message.text}</Text>
        </View>
      );
    }

    return (
      <View key={message.id} style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.aiMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.aiMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.aiMessageText
          ]}>
            {message.text}
          </Text>
          
          {/* Show sources if available */}
          {message.sources && message.sources.length > 0 && (
            <View style={styles.sourcesContainer}>
              <Text style={styles.sourcesTitle}>{t('chat.sources')}</Text>
              {message.sources.map((source, index) => (
                <Text key={index} style={styles.sourceText}>• {source}</Text>
              ))}
            </View>
          )}
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isUser && styles.userMessageTime
            ]}>
              {formatTime(message.timestamp)}
            </Text>
            {message.status === 'sending' && (
              <ActivityIndicator size="small" color={isUser ? '#ffffff' : '#4285f4'} style={styles.statusIndicator} />
            )}
            {message.status === 'error' && (
              <Text style={styles.errorIndicator}>⚠️</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>🦾</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{t('chat.title')}</Text>
            <Text style={styles.headerSubtitle}>
              {isLoading ? t('chat.analyzing') : t('chat.subtitle')}
            </Text>
          </View>
        </View>
        
        <LanguageToggle size="small" />
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          
          {isLoading && (
            <View style={styles.aiMessageContainer}>
              <View style={styles.aiMessageBubble}>
                <View style={styles.typingIndicator}>
                  <ActivityIndicator size="small" color="#4285f4" />
                  <Text style={styles.typingText}>{t('chat.typingIndicator')}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={t('chat.placeholder')}
              placeholderTextColor="#9aa0a6"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
            />
            
            <View style={styles.inputActions}>
              <TouchableOpacity
                style={styles.voiceButton}
                onPress={() => Alert.alert(t('chat.voiceInput'), t('chat.voiceInputSoon'))}
                activeOpacity={0.7}
              >
                <Text style={styles.voiceButtonText}>🎤</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !inputText.trim() && styles.sendButtonDisabled
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.sendButtonText,
                  !inputText.trim() && styles.sendButtonTextDisabled
                ]}>
                  →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Quick Actions */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickActions}
            contentContainerStyle={styles.quickActionsContent}
          >
            {[
              t('chat.quickActions.protein'),
              t('chat.quickActions.exercise'),
              t('chat.quickActions.plateau'),
              t('chat.quickActions.hiit'),
            ].map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionButton}
                onPress={() => setInputText(question)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickActionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 20,
    color: '#5f6368',
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4285f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aiAvatarText: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonText: {
    fontSize: 18,
  },
  
  // Chat Container
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  
  // Messages
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userMessageBubble: {
    backgroundColor: '#4285f4',
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  aiMessageText: {
    color: '#202124',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#9aa0a6',
    marginRight: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statusIndicator: {
    marginLeft: 4,
  },
  errorIndicator: {
    fontSize: 12,
    marginLeft: 4,
  },
  
  // Sources
  sourcesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  sourcesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5f6368',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 11,
    color: '#5f6368',
    marginBottom: 2,
  },
  
  // System Messages
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessageText: {
    fontSize: 14,
    color: '#9aa0a6',
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  
  // Typing Indicator
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    color: '#9aa0a6',
    marginLeft: 8,
  },
  
  // Input Area
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e8eaed',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#202124',
    maxHeight: 100,
    paddingVertical: 8,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  voiceButtonText: {
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4285f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e8eaed',
  },
  sendButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: '#9aa0a6',
  },
  
  // Quick Actions
  quickActions: {
    marginTop: 8,
  },
  quickActionsContent: {
    paddingRight: 16,
  },
  quickActionButton: {
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: '#5f6368',
  },
});