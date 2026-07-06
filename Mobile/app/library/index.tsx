// Refactored with NativeWind
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl, useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemeStore } from '../../src/store/themeStore';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Folder, Search, Plus, Upload, X } from 'lucide-react-native';
import { api } from '../../src/api';
import { cache } from '../../src/cache';
import { useRouter, useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import MobileSidebar from '../../src/components/MobileSidebar';
import Animated, { FadeInDown } from 'react-native-reanimated';

function SkeletonBlock({ width, height, className }: { width: number | string; height: number; className?: string }) {
  return <View style={{ width, height }} className={`bg-muted rounded-[10px] ${className}`} />;
}

function LibrarySkeleton() {
  return (
    <View className="px-6 pt-4 gap-[14px]">
      {[1, 2, 3, 4].map(i => (
        <View key={i} className="flex-row items-center gap-[14px] bg-card rounded-2xl p-4 border border-border">
          <SkeletonBlock width={44} height={44} className="rounded-[10px]" />
          <View className="flex-1 gap-2">
            <SkeletonBlock width="60%" height={16} />
            <SkeletonBlock width="35%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function LibraryScreen() {
  const router = useRouter();
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const { theme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');
  
  const iconColor = isDark ? '#E0E0E0' : '#121212';
  const mutedIconColor = isDark ? '#8C8C91' : '#6B6B70';

  const loadFolders = useCallback(async (forceRefresh = false) => {
    const key = 'library_folders';
    if (!forceRefresh) {
      const cached = cache.get<any[]>(key);
      if (cached) { setFolders(cached); setLoading(false); return; }
    }
    try {
      const data = await api.getFolders();
      cache.set(key, data);
      setFolders(data);
    } catch (error) {
      console.error('Failed to load folders:', error);
      // OFFLINE FALLBACK
      const fallback = cache.getOfflineFallback<any[]>(key);
      if (fallback) {
        setFolders(fallback);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadFolders(); }, []));

  const handleRefresh = () => {
    setRefreshing(true);
    cache.invalidate('library_folders');
    loadFolders(true);
  };

  const showFolderMenu = (folder: any) => {
    Alert.alert(folder.name, undefined, [
      { text: 'Open', onPress: () => router.push(`/library/${folder.id}`) },
      { text: folder.is_pinned ? 'Unpin' : 'Pin to Home', onPress: async () => {
        await api.updateFolder(folder.id, { is_pinned: !folder.is_pinned });
        cache.invalidate('library_folders', 'home_data');
        loadFolders(true);
      }},
      { text: 'Delete', style: 'destructive', onPress: () =>
        Alert.alert('Delete folder?', 'Notes inside will be kept.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: async () => {
            await api.deleteFolder(folder.id, true);
            cache.invalidate('library_folders', 'home_data');
            loadFolders(true);
          }}
        ])
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/markdown'],
        copyToCacheDirectory: true
      });
      if (result.canceled) return;
      
      setUploading(true);
      // Wait for 1s to simulate upload processing
      await new Promise(r => setTimeout(r, 1000));
      Alert.alert('Upload Successful', `Added ${result.assets[0].name} to Library.`);
      cache.invalidate('library_folders', 'home_data');
      loadFolders(true);
    } catch (e: any) {
      Alert.alert('Upload Failed', e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = () => {
    Alert.prompt(
      "New Folder",
      "Enter a name for the new folder:",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Create", 
          onPress: async (name) => {
            if (name?.trim()) {
              await api.createFolder(name.trim());
              cache.invalidate('library_folders');
              loadFolders(true);
            }
          }
        }
      ],
      "plain-text"
    );
  };

  const [actionFolder, setActionFolder] = useState<any>(null);

  const filteredFolders = folders.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-6 mt-10">
          <View>
            <Text className="text-foreground text-3xl font-bold tracking-tight">Library</Text>
            <Text className="text-muted-foreground text-[15px] mt-1">{folders.length} Folders</Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity 
              className={`w-11 h-11 rounded-full items-center justify-center border ${searchVisible ? 'bg-foreground border-foreground' : 'bg-card border-border shadow-sm'}`}
              onPress={() => {
                setSearchVisible(!searchVisible);
                if (searchVisible) setSearchQuery('');
              }}
            >
              {searchVisible ? <X size={20} color={isDark ? '#121212' : '#FFFFFF'} /> : <Search size={20} color={iconColor} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="w-11 h-11 rounded-full bg-blue-500 items-center justify-center shadow-md shadow-blue-500/30"
              onPress={handleUpload}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Upload size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        {searchVisible && (
          <View className="px-6 mb-6">
            <View className="flex-row items-center bg-card rounded-xl border border-border h-[48px] px-4 shadow-sm">
              <Search size={18} color={mutedIconColor} className="mr-3" />
              <TextInput
                className="flex-1 text-foreground text-base h-full"
                placeholder="Search folders..."
                placeholderTextColor={mutedIconColor}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>
          </View>
        )}

        {/* Folder List */}
        {loading && !refreshing ? (
          <LibrarySkeleton />
        ) : (
          <View className="flex-1 px-6">
            <FlashList
              data={filteredFolders}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={iconColor} />}
              estimatedItemSize={76}
              ItemSeparatorComponent={() => <View className="h-[14px]" />}
              ListFooterComponent={() => <View className="h-[120px]" />}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
                  <TouchableOpacity
                    className="flex-row items-center bg-card rounded-2xl p-4 border border-border shadow-sm"
                    activeOpacity={0.7}
                    onPress={() => router.push(`/library/${item.id}`)}
                    onLongPress={() => setActionFolder(item)}
                  >
                    <View className="w-11 h-11 bg-primary/5 rounded-xl items-center justify-center mr-4">
                      <Folder size={22} color={iconColor} />
                    </View>
                    <View className="flex-1 justify-center">
                      <Text className="text-foreground font-semibold text-[17px] mb-1" numberOfLines={1}>{item.name}</Text>
                      <Text className="text-muted-foreground text-[13px]">{item.file_count ?? item.notes_count ?? 0} notes</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              )}
            />
          </View>
        )}
      </SafeAreaView>

      {/* FAB - Create Folder */}
      <TouchableOpacity 
        className="absolute right-6 bottom-8 w-14 h-14 bg-foreground rounded-full justify-center items-center shadow-lg shadow-foreground/30 z-50"
        onPress={handleCreateFolder}
      >
        <Folder size={28} color={isDark ? '#E0E0E0' : '#121212'} />
      </TouchableOpacity>

      <MobileSidebar />

      {/* Folder Action Sheet */}
      {actionFolder && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, justifyContent: 'flex-end' }}>
          <TouchableOpacity 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} 
            activeOpacity={1} 
            onPress={() => setActionFolder(null)} 
          />
          <Animated.View 
            entering={FadeInDown.duration(300).springify()}
            className="bg-card rounded-t-3xl pt-2 pb-10 px-6 border-t border-border shadow-2xl"
          >
            <View className="w-12 h-1.5 bg-muted rounded-full self-center mb-6" />
            
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 bg-primary/10 rounded-xl justify-center items-center mr-4">
                <Folder size={24} color={iconColor} />
              </View>
              <View>
                <Text className="text-foreground text-xl font-bold">{actionFolder.name}</Text>
                <Text className="text-muted-foreground text-[14px]">{(actionFolder.file_count ?? actionFolder.notes_count ?? 0)} notes</Text>
              </View>
            </View>

            <View className="gap-2">
              <TouchableOpacity 
                className="bg-background border border-border p-4 rounded-xl flex-row items-center"
                onPress={() => {
                  const id = actionFolder.id;
                  setActionFolder(null);
                  router.push(`/library/${id}`);
                }}
              >
                <Text className="text-foreground text-base font-semibold ml-2">Open Folder</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="bg-background border border-border p-4 rounded-xl flex-row items-center"
                onPress={async () => {
                  const f = actionFolder;
                  setActionFolder(null);
                  await api.updateFolder(f.id, { is_pinned: !f.is_pinned });
                  cache.invalidate('library_folders', 'home_data');
                  loadFolders(true);
                }}
              >
                <Text className="text-foreground text-base font-semibold ml-2">{actionFolder.is_pinned ? 'Unpin from Home' : 'Pin to Home'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex-row items-center mt-2"
                onPress={() => {
                  const f = actionFolder;
                  Alert.alert('Delete folder?', 'Notes inside will be kept.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: async () => {
                      setActionFolder(null);
                      await api.deleteFolder(f.id, true);
                      cache.invalidate('library_folders', 'home_data');
                      loadFolders(true);
                    }}
                  ]);
                }}
              >
                <Text className="text-red-500 text-base font-semibold ml-2">Delete Folder</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </>
  );
}
