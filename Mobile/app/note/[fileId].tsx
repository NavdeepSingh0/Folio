import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, Dimensions, useColorScheme as useSystemColorScheme
} from 'react-native';
import { useThemeStore } from '../../src/store/themeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Paperclip, MessageSquare, Search, X } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { api } from '../../src/api';
import { cache } from '../../src/cache';
import MobileMarkdown from '../../src/components/mobile/MobileMarkdown';
import ChatBottomSheet from '../../src/components/mobile/ChatBottomSheet';
import AttachmentPicker from '../../src/components/mobile/AttachmentPicker';
import AttachmentEdgeTab from '../../src/components/mobile/AttachmentEdgeTab';
import NoteStackViewer from '../../src/components/NoteStackViewer';
import FilePickerModal from '../../src/components/FilePickerModal';

// Skeleton blocks
function SkeletonBlock({ width, height, className }: { width: number | string; height: number; className?: string }) {
  return <View style={{ width, height }} className={`bg-muted rounded-md ${className}`} />;
}
function NoteReaderSkeleton() {
  return (
    <View className="flex-1 p-6 gap-4 bg-background">
      <SkeletonBlock width="70%" height={32} />
      <SkeletonBlock width="100%" height={16} className="mt-2" />
      <SkeletonBlock width="95%" height={16} />
      <SkeletonBlock width="88%" height={16} />
      <SkeletonBlock width="60%" height={24} className="mt-6" />
      <SkeletonBlock width="100%" height={16} className="mt-2" />
      <SkeletonBlock width="92%" height={16} />
      <SkeletonBlock width="78%" height={16} />
      <SkeletonBlock width="100%" height={80} className="mt-4 rounded-xl" />
    </View>
  );
}

export default function NoteReaderScreen() {
  const { fileId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');
  
  const iconColor = isDark ? '#E0E0E0' : '#121212';
  const mutedIconColor = isDark ? '#8C8C91' : '#6B6B70';
  
  const [fileData, setFileData] = useState<any>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Panels
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAttachmentPickerOpen, setIsAttachmentPickerOpen] = useState(false);
  const [isNoteSwitcherOpen, setIsNoteSwitcherOpen] = useState(false);
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<any>(null);
  const [isEdgeTabOpen, setIsEdgeTabOpen] = useState(false);
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);

  useEffect(() => {
    if (fileId && !openNoteIds.includes(fileId as string)) {
      setOpenNoteIds(prev => [fileId as string, ...prev]);
    }
  }, [fileId]);

  useEffect(() => {
    loadNote();
  }, [fileId]);

  const loadNote = async () => {
    setLoading(true);
    const cacheKey = `note_${fileId}`;
    const filesKey = `all_files`;
    const attKey = `attachments_${fileId}`;

    try {
      // Serve cached data instantly
      const cachedContent = cache.get<string>(cacheKey);
      const cachedFiles = cache.get<any[]>(filesKey);
      const cachedAtts = cache.get<any[]>(attKey);

      if (cachedFiles) {
        setAllFiles(cachedFiles);
        const f = cachedFiles.find((f: any) => f.id.toString() === fileId?.toString());
        if (f) setFileData(f);
      }
      if (cachedContent) { setContent(cachedContent); setLoading(false); }
      if (cachedAtts) setAttachments(cachedAtts);

      // Always fetch fresh in parallel
      const [files, rawMarkdown, atts] = await Promise.all([
        api.getAllFiles(),
        api.getFileContent(fileId as string),
        api.getAttachments(fileId as string).catch(() => []),
      ]);

      cache.set(filesKey, files);
      cache.set(cacheKey, rawMarkdown);
      cache.set(attKey, atts);

      const currentFile = files.find((f: any) => f.id.toString() === fileId?.toString());
      if (currentFile) setFileData(currentFile);
      setAllFiles(files);
      setContent(rawMarkdown);
      setAttachments(atts || []);
    } catch (error) {
      console.error("Failed to load note:", error);
      // OFFLINE FALLBACK
      const contentFallback = cache.getOfflineFallback<string>(cacheKey);
      if (contentFallback) setContent(contentFallback);
      
      const filesFallback = cache.getOfflineFallback<any[]>(filesKey);
      if (filesFallback) {
        setAllFiles(filesFallback);
        const f = filesFallback.find((f: any) => f.id.toString() === fileId?.toString());
        if (f) setFileData(f);
      }
      const attFallback = cache.getOfflineFallback<any[]>(attKey);
      if (attFallback && attFallback.length > 0) {
        setAttachments(attFallback);
      } else {
        // Force mock attachments if offline and no cache
        setAttachments([
          { id: 1, filename: "study_guide.pdf" },
          { id: 2, filename: "reference.pdf" }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentSelect = (att: any) => {
    setIsAttachmentPickerOpen(false);
    setActiveAttachment(att);
    setIsEdgeTabOpen(true);
  };

  const screenScale = useSharedValue(1);
  const screenBorderRadius = useSharedValue(0);
  const screenTranslateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const handleDismiss = () => {
    router.replace('/');
  };

  const windowHeight = Dimensions.get('window').height;

  const gesture = Gesture.Pan()
    .enabled(isNoteSwitcherOpen)
    .onUpdate((e) => {
      if (e.translationY < 0) { // only allow upward swipe to close
        screenTranslateY.value = e.translationY;
        opacity.value = 1 + e.translationY / (windowHeight * 0.3);
      }
    })
    .onEnd((e) => {
      if (e.translationY < -120 || e.velocityY < -800) {
        screenTranslateY.value = withTiming(-windowHeight, { duration: 250 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(handleDismiss)();
      } else {
        screenTranslateY.value = withTiming(0, { duration: 300 });
        opacity.value = withTiming(1, { duration: 300 });
      }
    });

  const handleDismissTab = (id: string) => {
    setOpenNoteIds(prev => {
      const next = prev.filter(nid => nid !== id);
      // If we dismissed the currently active note, we might want to navigate
      // But the 3D switcher is handling the UI. If it's empty, we close it and go back.
      if (next.length === 0) {
        setIsNoteSwitcherOpen(false);
        router.back();
      } else if (id === fileId) {
        // If we closed the active note, switch active to the first available
        router.setParams({ fileId: next[0] });
      }
      return next;
    });
  };

  useEffect(() => {
    if (isNoteSwitcherOpen) {
      screenScale.value = withTiming(0.75, { duration: 300 });
      screenBorderRadius.value = withTiming(32, { duration: 300 });
      screenTranslateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      screenScale.value = withTiming(1, { duration: 300 });
      screenBorderRadius.value = withTiming(0, { duration: 300 });
      screenTranslateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [isNoteSwitcherOpen]);

  const animatedScreenStyle = useAnimatedStyle(() => ({
    transform: [{ scale: screenScale.value }, { translateY: screenTranslateY.value }],
    borderRadius: screenBorderRadius.value,
    overflow: 'hidden',
    opacity: opacity.value,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#E5E5E5' }}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[{ flex: 1, backgroundColor: isDark ? '#121212' : '#FFFFFF' }, animatedScreenStyle]}>
          <SafeAreaView className="flex-1" edges={['top']}>
          {/* Title Bar — icons always visible */}
          <View className="flex-row items-center px-1 py-2.5 border-b border-border bg-background">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <ArrowLeft size={24} color={iconColor} />
            </TouchableOpacity>
            {isSearchOpen ? (
              <View className="flex-1 flex-row items-center bg-muted rounded-lg px-3 mx-2 h-9">
                <TextInput
                  className="flex-1 text-base text-foreground p-0"
                  placeholder="Search note..."
                  placeholderTextColor={mutedIconColor}
                  autoFocus
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <TouchableOpacity onPress={() => { setIsSearchOpen(false); setSearchQuery(''); }}>
                  <X size={16} color={mutedIconColor} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                className="flex-1 px-1.5 justify-center"
                activeOpacity={0.7}
                onLongPress={() => setIsNoteSwitcherOpen(true)}
              >
                <Text className="text-foreground text-[17px] font-semibold" numberOfLines={1}>
                  {fileData ? fileData.name : ''}
                </Text>
              </TouchableOpacity>
            )}

            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => setIsFilePickerOpen(true)} className="p-2">
                <Plus size={22} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsSearchOpen(true)} className="p-2">
                <Search size={22} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsAttachmentPickerOpen(true)} className="p-2">
                <Paperclip size={22} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsChatOpen(true)} className="p-2">
                <MessageSquare size={22} color={iconColor} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Content */}
          <View className="flex-1 bg-background">
            {loading && !content ? (
              <NoteReaderSkeleton />
            ) : (
              <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(300)}>
                <MobileMarkdown content={content} searchQuery={searchQuery} />
              </Animated.View>
            )}
          </View>

          {/* Attachment Edge Tab */}
          {activeAttachment && !isAttachmentPickerOpen && !isChatOpen && (
            <AttachmentEdgeTab 
              attachment={activeAttachment} 
              isOpen={isEdgeTabOpen} 
              onClose={() => setIsEdgeTabOpen(false)} 
              onChangeAttachment={() => setIsAttachmentPickerOpen(true)}
            />
          )}

          {/* Bottom Sheets */}
          <AttachmentPicker 
            attachments={attachments.length > 0 ? attachments : [
              { id: '1', filename: 'Syllabus.pdf' },
              { id: '2', filename: 'diagram.png' }
            ]} 
            isOpen={isAttachmentPickerOpen} 
            onClose={() => setIsAttachmentPickerOpen(false)}
            onSelect={handleAttachmentSelect}
          />
          
          <ChatBottomSheet 
            fileId={fileId as string}
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
          />
          </SafeAreaView>
        </Animated.View>
      </GestureDetector>

      <FilePickerModal 
        notes={allFiles.filter(f => !openNoteIds.includes(f.id.toString()))}
        isOpen={isFilePickerOpen}
        onClose={() => setIsFilePickerOpen(false)}
        activeNoteId={fileId as string}
        onNoteSelect={(id) => {
          setIsFilePickerOpen(false);
          router.setParams({ fileId: id });
        }}
      />

      <NoteStackViewer 
        notes={openNoteIds.map(id => allFiles.find(f => f.id.toString() === id)).filter(Boolean)}
        isOpen={isNoteSwitcherOpen}
        onClose={() => setIsNoteSwitcherOpen(false)}
        activeNoteId={fileId as string}
        onNoteSelect={(id) => {
          setIsNoteSwitcherOpen(false);
          router.setParams({ fileId: id });
        }}
        onDismissNote={handleDismissTab}
        onCloseAll={() => {
          setIsNoteSwitcherOpen(false);
          router.back();
        }}
      />
    </View>
  );
}
