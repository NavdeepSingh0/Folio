import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image, ScrollView, Linking, useColorScheme as useSystemColorScheme, Platform, ActivityIndicator } from 'react-native';
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
import { cache } from '../../cache';
import ReactNativeBlobUtil from 'react-native-blob-util';

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
  const [pdfError, setPdfError] = useState(false);
  const [localPdfPath, setLocalPdfPath] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  const theme = useThemeStore(s => s.theme);
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');
  const iconColor = isDark ? '#E0E0E0' : '#121212';
  const mutedIconColor = isDark ? '#8C8C91' : '#6B6B70';

  // Read the saved page once per attachment, not on every render
  const savedPageRef = useRef<{ id: any; page: number }>({ id: null, page: 1 });
  if (savedPageRef.current.id !== (attachment?.id ?? null)) {
    savedPageRef.current = {
      id: attachment?.id ?? null,
      page: attachment?.id ? cache.getOfflineFallback<number>(`pdf_page_${attachment.id}`) || 1 : 1,
    };
  }
  const savedPage = savedPageRef.current.page;

  useEffect(() => {
    let cancelled = false;
    let task: ReturnType<ReturnType<typeof ReactNativeBlobUtil.config>['fetch']> | null = null;

    if (isOpen) {
      setIsMounted(true);
      setIsFullScreen(true);
      
      if (attachment && attachment.filename?.match(/\.pdf$/i)) {
        let url = attachment.public_url || attachment.url || null;
        if (url) {
          setLocalPdfPath(null);
          setPdfError(false);
          setPdfLoading(true);

          // Download to a cached file once; reuse it on later opens
          const path = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/attachment-${attachment.id}.pdf`;
          const done = (p: string) => {
            if (cancelled) return;
            setLocalPdfPath(`file://${p}`);
            setPdfLoading(false);
          };
          ReactNativeBlobUtil.fs.exists(path)
            .then(exists => {
              if (cancelled) return;
              if (exists) { done(path); return; }
              task = ReactNativeBlobUtil.config({ fileCache: true, path }).fetch('GET', url);
              return task.then(res => {
                if (res.info().status >= 400) {
                  ReactNativeBlobUtil.fs.unlink(path).catch(() => {});
                  throw new Error(`HTTP ${res.info().status}`);
                }
                done(res.path());
              });
            })
            .catch(err => {
              // Drop partial/failed downloads (including cancelled ones) so they aren't reused
              ReactNativeBlobUtil.fs.unlink(path).catch(() => {});
              if (cancelled) return;
              console.error("Local download error", err);
              setPdfError(true);
              setPdfLoading(false);
            });
        }
      } else {
        setPdfError(false);
      }
      return () => {
        cancelled = true;
        // blob-util's cancel() returns undefined at runtime (not a promise)
        if (task) {
          try {
            task.cancel();
          } catch {}
        }
      };
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
    let fileUrl: string | null = att?.public_url || att?.url || null;
    if (fileUrl) {
      fileUrl = fileUrl.split('?')[0];
    }

    let pdfSource: any = { uri: fileUrl, cache: true };

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
      if (pdfError) {
        const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl as string)}`;
        return (
          <View className={`flex-1 w-full ${isDark ? 'bg-background' : 'bg-muted'}`}>
            <WebView 
              source={{ uri: googleDocsUrl }} 
              style={{ flex: 1, width: '100%' }} 
              startInLoadingState={true}
              renderLoading={() => (
                <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#8b5cf6" />
                </View>
              )}
            />
          </View>
        );
      }

      if (pdfLoading || !localPdfPath) {
        return (
          <View className={`flex-1 w-full justify-center items-center ${isDark ? 'bg-background' : 'bg-muted'}`}>
            <ActivityIndicator size="large" color="#ef4444" />
            <Text className="mt-4 text-muted-foreground font-medium">Bypassing secure download...</Text>
          </View>
        );
      }

      return (
        <View className={`flex-1 w-full ${isDark ? 'bg-background' : 'bg-muted'}`}>
          <Pdf
            source={{ uri: localPdfPath, cache: false }}
            page={savedPage}
            onLoadComplete={(numberOfPages,filePath) => {}}
            onPageChanged={(page,numberOfPages) => {
              if (att?.id) {
                cache.set(`pdf_page_${att.id}`, page);
              }
            }}
            onError={(error) => { 
              console.log(error); 
              setPdfError(true);
            }}
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


