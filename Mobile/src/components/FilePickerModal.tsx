import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, useColorScheme as useSystemColorScheme, ScrollView, Modal, Pressable } from 'react-native';
import { useThemeStore } from '../../src/store/themeStore';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  SlideInDown,
  SlideOutDown,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { FileText, X } from 'lucide-react-native';

interface FilePickerModalProps {
  notes: any[];
  onNoteSelect: (id: string) => void;
  onCloseAll?: () => void;
  isOpen: boolean;
  onClose: () => void;
  activeNoteId?: string;
}

export default function FilePickerModal({ notes, onNoteSelect, onCloseAll, isOpen, onClose, activeNoteId }: FilePickerModalProps) {
  const [visibleNotes, setVisibleNotes] = React.useState(notes);
  const { theme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');

  useEffect(() => {
    setVisibleNotes(notes.filter(n => n.id.toString() !== activeNoteId));
  }, [notes, activeNoteId]);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable 
          className="bg-card w-full rounded-t-3xl border-t border-border"
          style={{ maxHeight: '70%' }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-border">
            <Text className="text-lg font-bold text-foreground">Open Note</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-muted rounded-full">
              <X size={20} color={isDark ? '#E0E0E0' : '#121212'} />
            </TouchableOpacity>
          </View>

          {/* List of files */}
          <ScrollView className="p-4 flex-1">
            {visibleNotes.length === 0 ? (
              <Text className="text-muted-foreground text-center mt-8">No other notes available.</Text>
            ) : (
              visibleNotes.map((note) => (
                <TouchableOpacity
                  key={note.id}
                  className="flex-row items-center p-4 mb-3 bg-muted rounded-2xl border border-border"
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onNoteSelect(note.id.toString());
                  }}
                >
                  <View className="bg-background p-3 rounded-full mr-4 border border-border">
                    <FileText size={20} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold text-base mb-1" numberOfLines={1}>
                      {note.name || 'Untitled'}
                    </Text>
                    <Text className="text-muted-foreground text-sm" numberOfLines={1}>
                      {note.content_preview || 'Empty note...'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Close All Button */}
          {onCloseAll && (
            <View className="p-4 border-t border-border">
              <TouchableOpacity
                className="w-full py-4 rounded-xl bg-destructive/10 border border-destructive/20 items-center"
                onPress={() => {
                  onClose();
                  onCloseAll();
                }}
              >
                <Text className="text-destructive font-bold">Close All Tabs</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
