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

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface ChatScreenProps {
  navigation: any;
}

export default function ChatScreen({ navigation }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI fat loss expert. I\'m here to help you achieve your goals with science-based advice. What would you like to know today?',
      sender: 'ai',
      timestamp: new Date(),
      status: 'sent',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 自动滚动到底部
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

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

    // 模拟AI回复
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText.trim());
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
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
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "Based on scientific research, I'd recommend focusing on a balanced approach. Studies show that combining proper nutrition with regular exercise yields the best long-term results for fat loss.",
      "That's a great question! Research from the Journal of Nutrition suggests that meal timing can indeed impact fat loss, but the quality of your food choices matters more than when you eat.",
      "I understand your concern. The key is sustainability - rapid weight loss often leads to muscle loss and metabolic slowdown. A gradual approach of 1-2 pounds per week is more effective long-term.",
      "Excellent question! High-intensity interval training (HIIT) has been shown to be particularly effective for fat loss. Studies indicate it can burn more calories in less time compared to steady-state cardio.",
      "That's a common misconception! While cardio is important, strength training is crucial for fat loss because it builds muscle, which increases your resting metabolic rate.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
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
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {formatTime(message.timestamp)}
            </Text>
            {message.status === 'sending' && (
              <ActivityIndicator size="small" color="#4285f4" style={styles.statusIndicator} />
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
    <View style={styles.container}>
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
            <Text style={styles.aiAvatarText}>💪</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI Expert</Text>
            <Text style={styles.headerSubtitle}>
              {isLoading ? 'Typing...' : 'Online'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => Alert.alert('Settings', 'Settings coming soon!')}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          
          {isLoading && (
            <View style={styles.aiMessageContainer}>
              <View style={styles.aiMessageBubble}>
                <View style={styles.typingIndicator}>
                  <ActivityIndicator size="small" color="#4285f4" />
                  <Text style={styles.typingText}>AI is thinking...</Text>
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
              placeholder="Ask me anything about fat loss..."
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
                onPress={() => Alert.alert('Voice', 'Voice input coming soon!')}
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
        </View>
      </KeyboardAvoidingView>
    </View>
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
    fontSize: 14,
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
  statusIndicator: {
    marginLeft: 4,
  },
  errorIndicator: {
    fontSize: 12,
    marginLeft: 4,
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
}); 