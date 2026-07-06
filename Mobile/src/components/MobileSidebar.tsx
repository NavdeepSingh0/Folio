// Refactored with NativeWind
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, TextInput, useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemeStore } from '../../src/store/themeStore';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { Menu, Search, Folder, FileText, Clock, Settings, ChevronDown, ChevronRight, BookOpen } from 'lucide-react-native';
import { api } from '../api';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.8;

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const router = useRouter();
  const { theme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');
  const iconColor = isDark ? '#E0E0E0' : '#121212';
  const mutedIconColor = isDark ? '#8C8C91' : '#6B6B70';

  const [searchQuery, setSearchQuery] = useState('');
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const allFiles = await api.getAllFiles();
      setRecentNotes(allFiles.slice(0, 6)); 
      
      const allFolders = await api.getFolders();
      setFolders(allFolders);
    } catch (error) {
      console.error("Failed to load sidebar data:", error);
    }
  };

  const animatedSidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const toggleSidebar = () => {
    if (isOpen) {
      translateX.value = withTiming(-SIDEBAR_WIDTH, { duration: 250, easing: Easing.out(Easing.cubic) });
      setIsOpen(false);
    } else {
      translateX.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) });
      setIsOpen(true);
    }
  };

  const toggleFolder = (id: string) => {
    const next = new Set(expandedFolders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedFolders(next);
  };

  return (
    <>
      {!isOpen && (
        <TouchableOpacity 
          onPress={toggleSidebar} 
          className="absolute left-5 top-14 z-40 w-11 h-11 justify-center items-center bg-card rounded-full border border-border shadow-sm"
        >
          <Menu size={24} color={iconColor} />
        </TouchableOpacity>
      )}

      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 z-[90]"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={toggleSidebar}
            className="flex-1 bg-black/10 dark:bg-black/30"
          />
        </Animated.View>
      )}

      <Animated.View 
        style={[{ position: 'absolute', top: 0, left: 0, width: SIDEBAR_WIDTH, height, zIndex: 100 }, animatedSidebarStyle]}
        className="bg-background border-r border-border"
      >
        <SafeAreaView edges={['top', 'bottom']} className="flex-1">
          
          <View className="px-6 py-5 border-b border-border">
            <TouchableOpacity onPress={() => { toggleSidebar(); router.push('/'); }}>
              <Text className="text-foreground text-[22px] font-bold tracking-tight">Folio</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
            

            {/* Recent Notes */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3 px-2 gap-2">
                <Clock size={16} color={mutedIconColor} />
                <Text className="text-muted-foreground text-xs font-semibold tracking-widest">RECENT NOTES</Text>
              </View>
              {recentNotes.map(note => (
                <TouchableOpacity 
                  key={note.id} 
                  className="flex-row items-center py-2.5 px-2 rounded-lg gap-3"
                  onPress={() => {
                    toggleSidebar();
                    router.push(`/note/${note.id}`);
                  }}
                >
                  <FileText size={18} color={iconColor} />
                  <Text className="text-foreground text-[15px] font-medium flex-1" numberOfLines={1}>{note.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Library / Hierarchy */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3 px-2 gap-2">
                <BookOpen size={16} color={mutedIconColor} />
                <Text className="text-muted-foreground text-xs font-semibold tracking-widest">LIBRARY</Text>
              </View>
              
              <TouchableOpacity className="flex-row items-center py-2.5 px-2 rounded-lg gap-3" onPress={() => { toggleSidebar(); router.replace('/library'); }}>
                <Folder size={18} color={iconColor} />
                <Text className="text-foreground text-[15px] font-medium flex-1">Browse All</Text>
              </TouchableOpacity>

              {folders.map(folder => (
                <View key={folder.id}>
                  <TouchableOpacity 
                    className="flex-row items-center py-2.5 px-2 rounded-lg gap-3"
                    onPress={() => toggleFolder(folder.id.toString())}
                  >
                    {expandedFolders.has(folder.id.toString()) ? (
                      <ChevronDown size={16} color={mutedIconColor} />
                    ) : (
                      <ChevronRight size={16} color={mutedIconColor} />
                    )}
                    <Folder size={18} color={mutedIconColor} />
                    <Text className="text-foreground text-[15px] font-medium flex-1" numberOfLines={1}>{folder.name}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

          </ScrollView>

          {/* Settings */}
          <View className="p-4 border-t border-border">
            <TouchableOpacity 
              className="flex-row items-center py-2.5 px-2 rounded-lg gap-3"
              onPress={() => {
                toggleSidebar();
                router.replace('/settings');
              }}
            >
              <Settings size={20} color={iconColor} />
              <Text className="text-foreground text-[15px] font-medium flex-1">Settings</Text>
            </TouchableOpacity>
          </View>
          
        </SafeAreaView>
      </Animated.View>
    </>
  );
}
