import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, useColorScheme as useSystemColorScheme, DimensionValue
} from 'react-native';
import { useThemeStore } from '../../src/store/themeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Paperclip, MessageSquare, Search, X } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { api } from '../../src/api';
import { cache } from '../../src/cache';
import MobileMarkdown from '../../src/components/mobile/MobileMarkdown';
import ChatBottomSheet from '../../src/components/mobile/ChatBottomSheet';
import AttachmentPicker from '../../src/components/mobile/AttachmentPicker';
import AttachmentEdgeTab from '../../src/components/mobile/AttachmentEdgeTab';
import NoteStackViewer from '../../src/components/NoteStackViewer';
import FilePickerModal from '../../src/components/FilePickerModal';
import { useAuthStore } from '../../src/store/authStore';
import { useScrollStore } from '../../src/store/scrollStore';

// Skeleton blocks
function SkeletonBlock({ width, height, className }: { width: DimensionValue; height: number; className?: string }) {
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
  const theme = useThemeStore(s => s.theme);
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');
  
  const iconColor = isDark ? '#E0E0E0' : '#121212';
  const mutedIconColor = isDark ? '#8C8C91' : '#6B6B70';
  
  const [fileData, setFileData] = useState<any>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);

  const setScrollPosition = useScrollStore(s => s.setScrollPosition);
  const initialScrollY = useRef(useScrollStore.getState().positions[fileId as string] || 0).current;
  const handleScroll = useCallback((y: number) => {
    setScrollPosition(fileId as string, y);
  }, [fileId, setScrollPosition]);

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Panels
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAttachmentPickerOpen, setIsAttachmentPickerOpen] = useState(false);
  const [isNoteSwitcherOpen, setIsNoteSwitcherOpen] = useState(false);
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<any>(null);
  const [isEdgeTabOpen, setIsEdgeTabOpen] = useState(false);
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);

  useEffect(() => {
    if (!fileId) return;
    setOpenNoteIds(prev => {
      const next = [fileId as string, ...prev.filter(id => id !== fileId)];
      return next;
    });
  }, [fileId]);

  // Keyed on user id (not session) so token refreshes don't reload the note
  const initialized = useAuthStore(s => s.initialized);
  const userId = useAuthStore(s => s.user?.id);

  // Parsed note bodies for the switcher, so render never parses MMKV
  const noteContentRef = useRef<Map<string, string>>(new Map());
  const [noteContentVersion, setNoteContentVersion] = useState(0);

  // Guards against a slower load for a previous note overwriting the current one
  const loadIdRef = useRef(0);

  // Clear the previous note immediately so it never shows under the new title
  useEffect(() => {
    setContent('');
    setFileData(null);
    setAttachments([]);
    setActiveAttachment(null);
    setIsEdgeTabOpen(false);
  }, [fileId]);

  useEffect(() => {
    if (initialized && userId) {
      loadNote();
    }
  }, [fileId, initialized, userId]);

  useEffect(() => {
    let added = false;
    for (const id of openNoteIds) {
      if (noteContentRef.current.has(id)) continue;
      // Display uses the offline fallback; TTL only governs refetching
      const cached = cache.getOfflineFallback<string>(`note_${id}`);
      if (cached) { noteContentRef.current.set(id, cached); added = true; }
    }
    if (added) setNoteContentVersion(v => v + 1);
  }, [openNoteIds]);

  const loadNote = async () => {
    const loadId = ++loadIdRef.current;
    const isStale = () => loadId !== loadIdRef.current;
    setLoading(true);
    const cacheKey = `note_${fileId}`;
    const filesKey = `all_files`;
    const foldersKey = `library_folders`;
    const attKey = `attachments_${fileId}`;

    try {
      // Serve cached data instantly
      const cachedContent = cache.getOfflineFallback<string>(cacheKey);
      const cachedFiles = cache.get<any[]>(filesKey);
      const cachedFolders = cache.get<any[]>(foldersKey);
      const cachedAtts = cache.get<any[]>(attKey);

      if (cachedFiles) {
        setAllFiles(cachedFiles);
        const f = cachedFiles.find((f: any) => f.id.toString() === fileId?.toString());
        if (f) setFileData(f);
      }
      if (cachedFolders) setFolders(cachedFolders);
      if (cachedContent) { setContent(cachedContent); setLoading(false); }
      if (cachedAtts) setAttachments(cachedAtts);

      // The list is metadata-only; load the full document once for the active reader.
      const [files, foldersData, currentFile, atts] = await Promise.all([
        api.fetchAllFiles(),
        api.getFolders().catch(() => []),
        api.getFile(fileId as string),
        api.getAttachments(fileId as string).catch(() => []),
      ]);

      cache.set(filesKey, files);
      cache.set(foldersKey, foldersData);
      cache.set(cacheKey, currentFile.markdown_content || '');
      cache.set(attKey, atts);
      noteContentRef.current.set(fileId as string, currentFile.markdown_content || '');
      if (isStale()) return;

      setFileData(currentFile);
      setAllFiles(files);
      setFolders(foldersData);
      setContent(currentFile.markdown_content || '');
      setNoteContentVersion(v => v + 1);
      setAttachments(atts || []);
    } catch (error) {
      if (isStale()) return;
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
      if (attFallback) setAttachments(attFallback);
    } finally {
      if (!isStale()) setLoading(false);
    }
  };

  const notes = useMemo(() => openNoteIds.map(id => {
    // Fall back to the active file's metadata when the list hasn't loaded it yet
    const f = allFiles.find(f => f.id.toString() === id)
      || (fileData && fileData.id?.toString() === id ? fileData : null);
    if (!f) return null;
    return { ...f, content: noteContentRef.current.get(id) };
  }).filter(Boolean), [openNoteIds, allFiles, fileData, noteContentVersion]);

  const handleCloseSwitcher = useCallback(() => setIsNoteSwitcherOpen(false), []);
  const handleSwitcherSelect = useCallback((id: string) => {
    setIsNoteSwitcherOpen(false);
    router.setParams({ fileId: id });
  }, [router]);
  const handleCloseAll = useCallback(() => {
    setIsNoteSwitcherOpen(false);
    router.back();
  }, [router]);

  const handleAttachmentSelect = (att: any) => {
    setIsAttachmentPickerOpen(false);
    setActiveAttachment(att);
    setIsEdgeTabOpen(true);
  };

  const handleDismissTab = (id: string) => {
    setOpenNoteIds(prev => {
      const next = prev.filter(nid => nid !== id);
      if (next.length === 0) {
        setIsNoteSwitcherOpen(false);
        router.back();
      } else if (id === fileId) {
        router.setParams({ fileId: next[0] });
      }
      return next;
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#121212' }}>
      
      {/* The Unified NoteStackViewer handles rendering the entire UI via activeCardContent */}
      <NoteStackViewer 
        notes={notes}
        isOpen={isNoteSwitcherOpen}
        onClose={handleCloseSwitcher}
        activeNoteId={fileId as string}
        onNoteSelect={handleSwitcherSelect}
        onDismissNote={handleDismissTab}
        onCloseAll={handleCloseAll}
        activeCardContent={
          <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#FFFFFF' }}>
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
                    <TouchableOpacity onPress={() => setSearchTrigger(prev => prev + 1)} className="px-2 border-l border-border ml-2">
                      <Text className="text-primary font-bold text-lg">↓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSearchTrigger(prev => prev - 1)} className="px-2">
                      <Text className="text-primary font-bold text-lg">↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchTrigger(0); }} className="pl-2">
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
                    <MobileMarkdown 
                      content={content} 
                      searchQuery={searchQuery} 
                      searchTrigger={searchTrigger}
                      initialScrollY={initialScrollY}
                      onScroll={handleScroll}
                    />
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
            </SafeAreaView>
          </View>
        }
      />

      {/* ── Modals and Bottom Sheets (rendered outside so they can overlay the switcher if needed) ── */}
      <AttachmentPicker 
        attachments={attachments} 
        isOpen={isAttachmentPickerOpen} 
        onClose={() => setIsAttachmentPickerOpen(false)}
        onSelect={handleAttachmentSelect}
      />
      
      <ChatBottomSheet 
        fileId={fileId as string}
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      <FilePickerModal 
        notes={allFiles.filter(f => !openNoteIds.includes(f.id.toString()))}
        folders={folders}
        isOpen={isFilePickerOpen}
        onClose={() => setIsFilePickerOpen(false)}
        activeNoteId={fileId as string}
        onNoteSelect={(id) => {
          setIsFilePickerOpen(false);
          router.setParams({ fileId: id });
        }}
      />
    </View>
  );
}
