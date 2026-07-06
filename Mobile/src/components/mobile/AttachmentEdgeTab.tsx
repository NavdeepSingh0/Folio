import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image, ScrollView, Linking, useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  withSpring,
} from 'react-native-reanimated';
import { FileText, Image as ImageIcon, Code, File, ArrowLeft, Settings, Paperclip } from 'lucide-react-native';
import Pdf from 'react-native-pdf';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AttachmentEdgeTabProps {
  attachment: any | null;
  isOpen: boolean; 
  onClose: () => void; 
  onChangeAttachment?: () => void; 
}

export default function AttachmentEdgeTab({ attachment, isOpen, onClose, onChangeAttachment }: AttachmentEdgeTabProps) {
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const { theme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');
  const iconColor = isDark ? '#E0E0E0' : '#121212';
  const mutedIconColor = isDark ? '#8C8C91' : '#6B6B70';

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setIsFullScreen(true);
    } else {
      const t = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [attachment, isOpen]);

  const translateX = useSharedValue(SCREEN_WIDTH);

  useEffect(() => {
    if (isOpen) {
      if (isFullScreen) {
        translateX.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
      } else {
        // Slide almost off-screen leaving just 56px tab visible
        translateX.value = withTiming(SCREEN_WIDTH - 56, { duration: 200, easing: Easing.out(Easing.cubic) });
      }
    } else {
      translateX.value = withTiming(SCREEN_WIDTH, { duration: 200, easing: Easing.in(Easing.cubic) });
    }
  }, [isOpen, isFullScreen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  const getMinIcon = (filename: string) => {
    if (!filename) return null;
    if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) return <ImageIcon size={20} color="#3b82f6" />;
    if (filename.match(/\.(js|ts|py|cpp|html|css)$/i)) return <Code size={20} color="#10b981" />;
    if (filename.match(/\.pdf$/i)) return <FileText size={20} color="#ef4444" />;
    return <File size={20} color="#8b5cf6" />;
  };

  const openWithFileViewer = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const renderPreview = (att: any) => {
    const filename: string = att?.filename || '';

    // Build the file URL — real API returns it on att.url, fallback to constructed path
    const BASE_URL = 'https://folio-g049.onrender.com/api';
    let fileUrl: string | null = att?.url || (att?.id ? `${BASE_URL}/attachments/${att.id}/download` : null);

    let pdfSource: any = { uri: fileUrl, cache: true };

    if (att?.id && String(att.id).match(/^[12345]$/) && filename.match(/\.pdf$/i)) {
      const b64 = 'JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCj4+CiAgPj4KICAvQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCgo0IDAgb2JqCjw8CiAgL1R5cGUgL0ZvbnQKICAvU3VidHlwZSAvVHlwZTUKICAvQmFzZUZvbnQgL1RpbWVzLVJvbWFuCj4+CmVuZG9iagoKNSAwIG9iago8PAogIC9MZW5ndGggMzAKPj4Kc3RyZWFtCkJUCi9GMSAxOCBUZgoyMCA4NSBUZAooSGVsbG8gV29ybGQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDY5IDAwMDAwIG4gCjAwMDAwMDAxNTIgMDAwMDAgbiAKMDAwMDAwMDI1MyAwMDAwMCBuIAowMDAwMDAwMzUyIDAwMDAwIG4gCnRyYWlsZXIKPDwKICAvU2l6ZSA2CiAgL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQzNAolJUVPRgo=';
      pdfSource = { uri: `data:application/pdf;base64,${b64}`, cache: true };
    }

    if (!fileUrl) {
      return (
      <View className="flex-1 justify-center items-center bg-card">
        <File size={56} color="#8b5cf6" />
        <Text className="text-muted-foreground text-base mt-4">No preview available.</Text>
      </View>
      );
    }

    if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return <Image source={{ uri: fileUrl }} className="flex-1 w-full bg-background" resizeMode="contain" />;
    }
    
    if (filename.match(/\.pdf$/i)) {
      return (
        <View className={`flex-1 w-full ${isDark ? 'bg-background' : 'bg-muted'}`}>
          <Pdf
            source={pdfSource}
            onLoadComplete={(numberOfPages,filePath) => {}}
            onPageChanged={(page,numberOfPages) => {}}
            onError={(error) => { console.log(error); }}
            onPressLink={(uri) => {}}
            trustAllCerts={false}
            style={{ flex: 1, backgroundColor: isDark ? '#151516' : '#F5F5F7' }}
          />
        </View>
      );
    }

    if (filename.match(/\.(html|htm)$/i)) {
      return (
        <WebView source={{ uri: fileUrl }} style={{ flex: 1, width: '100%' }} />
      );
    }

    return (
        <View className="flex-1 justify-center items-center p-6 bg-card">
          <Code size={48} color="#10b981" />
          <Text className="text-foreground text-lg font-semibold mt-4 text-center">Source code preview not available.</Text>
          <TouchableOpacity 
            className="mt-6 px-6 py-3 bg-primary rounded-full"
            onPress={() => openWithFileViewer(fileUrl as string)}
          >
            <Text className="text-primary-foreground font-semibold">Open in Browser</Text>
          </TouchableOpacity>
        </View>
    );
  };

  if (!isMounted) return null;

  return (
    <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, right: 0, width: SCREEN_WIDTH, zIndex: 50 }, animatedStyle]} pointerEvents={isOpen ? 'auto' : 'none'}>
      {isFullScreen ? (
        <View className={`flex-1 ${isDark ? 'bg-background border-border' : 'bg-background border-border'} border-l`}>
          <View className={`flex-row items-center p-3 pt-14 border-b ${isDark ? 'bg-background border-border' : 'bg-background border-border'}`}>
            <TouchableOpacity onPress={() => setIsFullScreen(false)} className="p-2">
              <ArrowLeft size={24} color={isDark ? '#E0E0E0' : '#121212'} />
            </TouchableOpacity>
            <Text className={`flex-1 text-center text-lg font-semibold px-2 ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
              {attachment ? attachment.filename : ''}
            </Text>
            <TouchableOpacity 
              onPress={() => { onClose(); if (onChangeAttachment) onChangeAttachment(); }} 
              className="p-2"
            >
              <Settings size={22} color={isDark ? '#E0E0E0' : '#121212'} />
            </TouchableOpacity>
          </View>
          
          <View className="flex-1">
            {attachment ? renderPreview(attachment) : null}
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          className={`absolute left-0 w-14 h-22 bg-card rounded-l-2xl border border-r-0 border-border justify-center items-center gap-2 shadow-lg ${isDark ? 'border-border' : ''}`}
          style={{ top: SCREEN_HEIGHT / 2 - 44 }}
          onPress={() => setIsFullScreen(true)}
          activeOpacity={0.75}
        >
          <Paperclip size={14} color={isDark ? '#8C8C91' : '#6B6B70'} />
          {attachment && getMinIcon(attachment.filename)}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}


