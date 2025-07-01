import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from '../localization/i18n';

interface LanguageToggleProps {
  style?: any;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'text';
}

export default function LanguageToggle({ 
  style, 
  size = 'medium', 
  variant = 'default' 
}: LanguageToggleProps) {
  const { language, setLanguage, isZh } = useTranslation();
  
  const toggleLanguage = () => {
    setLanguage(isZh ? 'en' : 'zh');
  };

  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  const variantStyles = {
    default: styles.default,
    outline: styles.outline,
    text: styles.text,
  };

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
  };

  const combinedStyle = [
    styles.button,
    sizeStyles[size],
    variantStyles[variant],
    style,
  ];

  const textStyle = [
    styles.buttonText,
    textSizeStyles[size],
    variant === 'outline' && styles.outlineText,
    variant === 'text' && styles.plainText,
  ];

  return (
    <TouchableOpacity style={combinedStyle} onPress={toggleLanguage}>
      <Text style={textStyle}>{isZh ? 'EN' : '中文'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  
  // Sizes
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  large: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  
  // Variants
  default: {
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
    borderWidth: 1,
    borderColor: '#4285f4',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4285f4',
  },
  text: {
    backgroundColor: 'transparent',
  },
  
  // Text styles
  buttonText: {
    fontWeight: '600',
    color: '#4285f4',
  },
  textSmall: {
    fontSize: 11,
  },
  textMedium: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 14,
  },
  outlineText: {
    color: '#4285f4',
  },
  plainText: {
    color: '#5f6368',
  },
});