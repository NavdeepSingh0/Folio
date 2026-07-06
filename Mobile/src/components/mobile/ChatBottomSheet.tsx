import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ScrollView, useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Send, X } from 'lucide-react-native';
import { api } from '../../api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.9;
const SHEET_MID_HEIGHT = SCREEN_HEIGHT * 0.5;

interface ChatBottomSheetProps {
  fileId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatBottomSheet({ fileId, isOpen, onClose }: ChatBottomSheetProps) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: "Hello! I'm ready to answer questions about this document." }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const { theme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');
  const iconColor = isDark ? '#E0E0E0' : '#121212';
  const mutedIconColor = isDark ? '#8C8C91' : '#6B6B70';

  // We anchor the sheet to bottom:0.
  // 0 = fully expanded (MAX_HEIGHT)
  // MAX_HEIGHT - MID_HEIGHT = half expanded
  // MAX_HEIGHT = fully offscreen
  
  const translateY = useSharedValue(SHEET_MAX_HEIGHT);
  const contextY = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      translateY.value = withSpring(SHEET_MAX_HEIGHT - SHEET_MID_HEIGHT, { damping: 20, stiffness: 300 });
    } else {
      translateY.value = withSpring(SHEET_MAX_HEIGHT, { damping: 20, stiffness: 300 });
      const t = setTimeout(() => setIsMounted(false), 350);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value;
    })
    .onUpdate((event) => {
      let nextY = contextY.value + event.translationY;
      if (nextY < 0) nextY = 0; // Max expanded
      translateY.value = nextY;
    })
    .onEnd((event) => {
      const currentY = translateY.value;
      const velocity = event.velocityY;
      
      const midPoint = SHEET_MAX_HEIGHT - SHEET_MID_HEIGHT;
      
      if (velocity > 1000 || currentY > midPoint + 150) {
        // Snap closed
        translateY.value = withSpring(SHEET_MAX_HEIGHT, { damping: 20, stiffness: 300 });
        runOnJS(onClose)();
      } else if (velocity < -500 || currentY < midPoint / 2) {
        // Snap open
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      } else {
        // Snap to mid
        translateY.value = withSpring(midPoint, { damping: 20, stiffness: 300 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }]
    };
  });

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    
    const userMsg = message.trim();
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsSending(true);

    try {
      const response = await api.sendMessage(userMsg, fileId ? parseInt(fileId) : undefined);
      const reader = response.body?.getReader();
      let fullText = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += new TextDecoder().decode(value);
        }
      }
      setChatHistory(prev => [...prev, { role: 'model', text: fullText || 'No response.' }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'model', text: 'Failed to get a response. Please try again.' }]);
    } finally {
      setIsSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      {isOpen && <TouchableOpacity className="absolute inset-0 bg-black/20 z-[99]" activeOpacity={1} onPress={onClose} />}
      <Animated.View style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, height: SHEET_MAX_HEIGHT }, animatedStyle]} className="bg-background rounded-t-3xl shadow-2xl z-[100] border-t border-border">
        <GestureDetector gesture={panGesture}>
          <View className="h-7 justify-center items-center">
            <View className="w-9 h-1 bg-muted-foreground/30 rounded-full" />
          </View>
        </GestureDetector>

        <View className="flex-row justify-between items-center px-5 pb-3 border-b border-border">
          <Text className="text-foreground text-lg font-semibold">Study Chat</Text>
          <TouchableOpacity onPress={onClose} className="p-1 bg-muted rounded-full">
            <X size={20} color={iconColor} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {chatHistory.map((msg, i) => (
            <View key={i} className={`max-w-[82%] p-3 rounded-2xl ${msg.role === 'user' ? 'self-end bg-primary rounded-br-sm' : 'self-start bg-muted rounded-bl-sm border border-border'}`}>
              <Text className={`text-[15px] leading-relaxed ${msg.role === 'user' ? 'text-primary-foreground' : 'text-foreground'}`}>
                {msg.text}
              </Text>
            </View>
          ))}
          {isSending && (
            <View className="max-w-[82%] p-3 rounded-2xl self-start bg-muted rounded-bl-sm border border-border">
              <Text className="text-[15px] leading-relaxed text-foreground">Thinking...</Text>
            </View>
          )}
        </ScrollView>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="flex-row items-end p-3 pb-6 border-t border-border bg-card gap-2">
            <TextInput
              className="flex-1 min-h-[44px] max-h-[120px] bg-muted rounded-[22px] px-4 py-2.5 text-foreground text-base border border-border"
              placeholder="Ask about this document..."
              placeholderTextColor={mutedIconColor}
              value={message}
              onChangeText={setMessage}
              multiline
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity 
              className={`w-11 h-11 rounded-full justify-center items-center ${!message.trim() ? 'bg-muted-foreground/50' : 'bg-primary'}`}
              onPress={handleSend}
              disabled={!message.trim() || isSending}
            >
              <Send size={18} color={!message.trim() ? '#FAFAFC' : isDark ? '#151516' : '#FFFFFF'} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  );
}

