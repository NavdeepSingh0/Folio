// Refactored with NativeWind
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemeStore } from '../../src/store/themeStore';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, ArrowLeft, GripVertical, MoreVertical, Trash2 } from 'lucide-react-native';
import { api } from '../../src/api';
import { cache } from '../../src/cache';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function FolderScreen() {
  const { folderId } = useLocalSearchParams();
  const [files, setFiles] = useState<any[]>([]);
  const [folder, setFolder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');
  const iconColor = isDark ? '#E0E0E0' : '#121212';
  const mutedIconColor = isDark ? '#8C8C91' : '#6B6B70';

  useEffect(() => {
    loadData();
  }, [folderId]);

  const loadData = async () => {
    const cacheKeyFiles = `folder_files_${folderId}`;
    const cacheKeyFolders = `library_folders`;

    try {
      const [foldersData, filesData] = await Promise.all([
        api.getFolders(),
        api.getFilesByFolder(folderId as string)
      ]);
      
      const currentFolder = foldersData.find((f: any) => f.id.toString() === folderId);
      if (currentFolder) setFolder(currentFolder);
      
      setFiles(filesData);
      cache.set(cacheKeyFiles, filesData);
    } catch (error) {
      console.error("Failed to load folder data:", error);
      // OFFLINE FALLBACK
      const foldersFallback = cache.getOfflineFallback<any[]>(cacheKeyFolders);
      if (foldersFallback) {
        const currentFolder = foldersFallback.find((f: any) => f.id.toString() === folderId);
        if (currentFolder) setFolder(currentFolder);
      }
      const filesFallback = cache.getOfflineFallback<any[]>(cacheKeyFiles);
      if (filesFallback) {
        setFiles(filesFallback);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDeleteFolder = () => {
    Alert.alert("Delete Folder", "Are you sure you want to delete this folder?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: () => { /* Logic here */ } }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border bg-background">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#121212'} />
          </TouchableOpacity>
        </View>
        <Text className="flex-1 text-foreground text-xl font-semibold text-center" numberOfLines={1}>
          {folder ? folder.name : 'Loading...'}
        </Text>
        <View className="w-10" />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={iconColor} />
        </View>
      ) : (
        <View className="flex-1 px-6">
          {files.length === 0 ? (
            <View className="p-10 items-center">
              <Text className="text-muted-foreground text-base">This folder is empty.</Text>
            </View>
          ) : (
            <DraggableFlatList
              data={files}
              onDragEnd={({ data }) => {
                setFiles(data);
                // Here we would typically send an API request to update the order
                cache.set(`folder_files_${folderId}`, data);
              }}
              keyExtractor={(item: any) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
              ItemSeparatorComponent={() => <View className="h-3" />}
              renderItem={({ item: file, drag, isActive, getIndex }) => (
                <ScaleDecorator>
                  <Animated.View entering={FadeInDown.duration(300).delay((getIndex() || 0) * 50)}>
                    <TouchableOpacity 
                      className={`flex-row items-center bg-card rounded-2xl p-4 border shadow-sm ${isActive ? 'border-blue-500 bg-blue-500/5' : 'border-border'}`}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (!isActive) router.push(`/note/${file.id}`);
                      }}
                      onLongPress={drag}
                    >
                      <View className="mr-2">
                        <GripVertical size={20} color={mutedIconColor} />
                      </View>
                      <View className="w-10 h-10 rounded-[10px] bg-muted justify-center items-center mr-4">
                        <FileText size={20} color={iconColor} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground text-base font-medium mb-1" numberOfLines={1}>{file.name}</Text>
                        <Text className="text-muted-foreground text-[13px]">{formatDate(file.created_at)}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <TouchableOpacity onPress={handleDeleteFolder} className="p-2">
                          <Trash2 size={20} color="#ef4444" />
                        </TouchableOpacity>
                        <TouchableOpacity className="p-2">
                          <MoreVertical size={20} color={isDark ? '#E0E0E0' : '#121212'} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                </ScaleDecorator>
              )}
            />
          )}
        </View>
      )}

    </SafeAreaView>
  );
}
