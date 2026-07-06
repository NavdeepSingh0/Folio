import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { FileText, Image as ImageIcon, Code, X, File } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AttachmentPickerProps {
  attachments: any[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (attachment: any) => void;
}

export default function AttachmentPicker({ attachments, isOpen, onClose, onSelect }: AttachmentPickerProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const { theme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');
  const iconColor = isDark ? '#E0E0E0' : '#121212';
  
  React.useEffect(() => {
    if (isOpen) {
      translateY.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.ease) });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250, easing: Easing.in(Easing.ease) });
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }]
    };
  });

  const getIcon = (filename: string) => {
    if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) return <ImageIcon size={24} color="#3b82f6" />;
    if (filename.match(/\.(js|ts|py|cpp|html|css)$/i)) return <Code size={24} color="#10b981" />;
    if (filename.match(/\.pdf$/i)) return <FileText size={24} color="#ef4444" />;
    return <File size={24} color="#8b5cf6" />;
  };

  // Do not read translateY.value here to avoid Reanimated v3 warnings.
  // The absolute container just slides off screen when not open.

  return (
    <>
      {isOpen && <TouchableOpacity className="absolute inset-0 bg-black/30 z-[90]" activeOpacity={1} onPress={onClose} />}
      <Animated.View style={animatedStyle} className="absolute left-0 right-0 bottom-0 h-1/2 bg-card rounded-t-3xl z-[100] border-t border-border" pointerEvents={isOpen ? 'auto' : 'none'}>
        <View className="flex-row items-center justify-between px-6 py-5 border-b border-border">
          <Text className="text-foreground text-xl font-bold">Attachments</Text>
          <TouchableOpacity onPress={onClose} className="p-2 bg-muted rounded-full">
            <X size={20} color={iconColor} />
          </TouchableOpacity>
        </View>

        {attachments.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-muted-foreground text-base">No attachments for this note.</Text>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
            {attachments.map(att => (
              <TouchableOpacity 
                key={att.id} 
                className="flex-row items-center p-4 bg-background rounded-2xl mb-4 border border-border shadow-sm"
                activeOpacity={0.7}
                onPress={() => onSelect(att)}
              >
                <View className="w-12 h-12 bg-muted rounded-xl justify-center items-center mr-4">
                  {getIcon(att.filename)}
                </View>
                <Text className="text-foreground text-base font-semibold flex-1" numberOfLines={1}>{att.filename}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </>
  );
}
