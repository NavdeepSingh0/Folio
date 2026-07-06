// Refactored with NativeWind
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Folder, FileText, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../src/store/authStore';
import { api } from '../src/api';
import { cache } from '../src/cache';
import { useRouter, useFocusEffect } from 'expo-router';
import MobileSidebar from '../src/components/MobileSidebar';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemeStore } from '../src/store/themeStore';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();

function SkeletonBlock({ width, height, className }: { width: number | string; height: number; className?: string }) {
  return <View style={{ width, height }} className={`bg-muted rounded-lg ${className}`} />;
}

function HomeSkeleton() {
  return (
    <View className="px-6 pt-20 gap-4">
      <SkeletonBlock width="55%" height={20} />
      <SkeletonBlock width="40%" height={16} className="mb-4" />
      <SkeletonBlock width="100%" height={40} className="rounded-2xl" />
      <SkeletonBlock width="50%" height={20} className="mt-8" />
      <View className="flex-row gap-4">
        <SkeletonBlock width={140} height={100} className="rounded-2xl" />
        <SkeletonBlock width={140} height={100} className="rounded-2xl" />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedFolders, setPinnedFolders] = useState<any[]>([]);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState('Alex');
  const { theme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');
  const iconColor = isDark ? '#E0E0E0' : '#121212';
  const mutedIconColor = isDark ? '#8C8C91' : '#6B6B70';
  const router = useRouter();

  const loadData = useCallback(async (forceRefresh = false) => {
    const cacheKey = 'home_data';
    if (!forceRefresh) {
      const cached = cache.get<any>(cacheKey);
      if (cached) {
        setPinnedFolders(cached.pinned);
        setRecentFiles(cached.recent);
        setLoading(false);
        return;
      }
    }

    try {
      const [folders, files] = await Promise.all([
        api.getFolders(),
        api.getAllFiles(),
      ]);
      const pinned = folders.filter((f: any) => f.is_pinned);
      const recent = files.slice(0, 6);
      cache.set(cacheKey, { pinned, recent });
      setPinnedFolders(pinned);
      setRecentFiles(recent);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // OFFLINE FALLBACK
      const fallback = cache.getOfflineFallback<any>(cacheKey);
      if (fallback) {
        setPinnedFolders(fallback.pinned);
        setRecentFiles(fallback.recent);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const { initialized, session } = useAuthStore();

  useFocusEffect(useCallback(() => {
    setUsername(storage.getString('user.username') || 'Alex');
    if (initialized && session) {
      loadData();
    }
  }, [initialized, session]));

  const handleRefresh = () => {
    setRefreshing(true);
    cache.invalidate('home_data');
    loadData(true);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
        {loading && !refreshing ? (
          <HomeSkeleton />
        ) : (
          <ScrollView
            contentContainerStyle={{ padding: 24, paddingTop: 72, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={iconColor} />
            }
          >
            {/* Greeting */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)} className="mb-8">
              <Text className="text-foreground text-2xl font-bold mb-1">{greeting}, {username.split(' ')[0]}</Text>
              <Text className="text-muted-foreground text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
            </Animated.View>

            {/* Hero / Search */}
            <Animated.View entering={FadeInDown.duration(400).delay(200)} className="mb-10">
              <Text className="text-foreground text-4xl font-bold leading-[42px] mb-5 tracking-tight">What are we{'\n'}studying today?</Text>
              <View className="flex-row items-center bg-card rounded-2xl border border-border h-[52px] px-4 shadow-sm">
                <Search size={20} color={mutedIconColor} className="mr-2" />
                <TextInput
                  className="flex-1 text-foreground text-base h-full"
                  placeholder="Search subjects, notes..."
                  placeholderTextColor={mutedIconColor}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </Animated.View>

            {/* Pinned Folders */}
            {pinnedFolders.length > 0 && (
              <Animated.View entering={FadeInDown.duration(400).delay(300)} className="mb-8">
                <Text className="text-foreground font-semibold text-lg mb-3">Pinned</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
                  {pinnedFolders.map((folder) => (
                    <TouchableOpacity
                      key={folder.id}
                      className="bg-card w-[140px] p-4 rounded-2xl border border-border"
                      activeOpacity={0.7}
                      onPress={() => router.push(`/library/${folder.id}`)}
                    >
                      <View className="bg-primary/5 w-10 h-10 rounded-full items-center justify-center mb-4">
                        <Folder size={22} color={iconColor} />
                      </View>
                      <Text className="text-foreground font-medium text-base mb-1" numberOfLines={1}>{folder.name}</Text>
                      <Text className="text-muted-foreground text-sm">{folder.file_count ?? 0} notes</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            )}

            {/* Recently Opened */}
            {recentFiles.length > 0 && (
              <Animated.View entering={FadeInDown.duration(400).delay(400)} className="mb-8">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-foreground font-semibold text-lg">Recent Notes</Text>
                  <TouchableOpacity onPress={() => router.push('/library')} className="flex-row items-center">
                    <Text className="text-blue-500 text-sm font-medium mr-1">See all</Text>
                    <ArrowRight size={14} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
                <View className="gap-4">
                  {recentFiles.map((file) => (
                    <TouchableOpacity
                      key={file.id}
                      className="flex-row items-center bg-card p-5 rounded-3xl border border-border shadow-sm"
                      activeOpacity={0.6}
                      onPress={() => router.push(`/note/${file.id}`)}
                    >
                      <View className="w-12 h-12 bg-blue-500/10 rounded-2xl items-center justify-center mr-4">
                        <FileText size={22} color="#3b82f6" />
                      </View>
                      <View className="flex-1 justify-center">
                        <Text className="text-foreground font-semibold text-[17px] mb-1" numberOfLines={1}>{file.name}</Text>
                        <Text className="text-muted-foreground text-sm">Tap to view note</Text>
                      </View>
                      <View className="w-8 h-8 rounded-full bg-muted justify-center items-center">
                        <ArrowRight size={16} color={iconColor} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}

            {pinnedFolders.length === 0 && recentFiles.length === 0 && (
              <View className="flex-1 justify-center items-center py-10">
                <Text className="text-foreground text-xl font-semibold mb-2">Ready to study?</Text>
                <Text className="text-muted-foreground text-center">Open the sidebar to browse your library and add notes.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Global Sidebar Overlay */}
      <MobileSidebar />
    </>
  );
}
