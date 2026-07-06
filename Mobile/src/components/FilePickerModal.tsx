import React, { useEffect, useState } from 'react';
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
import { FileText, X, Folder as FolderIcon, ArrowLeft } from 'lucide-react-native';

interface FilePickerModalProps {
  notes: any[];
  folders?: any[];
  onNoteSelect: (id: string) => void;
  onCloseAll?: () => void;
  isOpen: boolean;
  onClose: () => void;
  activeNoteId?: string;
}

export default function FilePickerModal({ notes, folders = [], onNoteSelect, onCloseAll, isOpen, onClose, activeNoteId }: FilePickerModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [visibleNotes, setVisibleNotes] = useState(notes);
  
  const { theme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');

  useEffect(() => {
    setVisibleNotes(notes.filter(n => n.id.toString() !== activeNoteId));
  }, [notes, activeNoteId]);

  // Reset folder view when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setSelectedFolderId(null), 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentFolder = selectedFolderId ? folders.find(f => f.id.toString() === selectedFolderId) : null;
  const currentFolderNotes = visibleNotes.filter(n => String(n.folder_id) === String(selectedFolderId));
  const unassignedNotes = visibleNotes.filter(n => !n.folder_id);

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable 
          className="bg-card w-full rounded-t-3xl border-t border-border"
          style={{ maxHeight: '70%', height: '70%' }} 
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-border">
            <View className="flex-row items-center">
              {selectedFolderId && (
                <TouchableOpacity onPress={() => setSelectedFolderId(null)} className="mr-3 p-2 -ml-2 rounded-full bg-muted">
                  <ArrowLeft size={20} color={isDark ? '#E0E0E0' : '#121212'} />
                </TouchableOpacity>
              )}
              <Text className="text-lg font-bold text-foreground">
                {selectedFolderId ? currentFolder?.name : 'Library'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-muted rounded-full">
              <X size={20} color={isDark ? '#E0E0E0' : '#121212'} />
            </TouchableOpacity>
          </View>

          {/* List of files and folders */}
          <ScrollView className="flex-1 px-4 py-2">
            {!selectedFolderId ? (
              // Root Library View
              <>
                {folders.map(folder => (
                  <TouchableOpacity
                    key={`folder-${folder.id}`}
                    className={`flex-row items-center p-4 mb-3 rounded-2xl border ${isDark ? 'bg-[#1C1C1E] border-[#2C2C2E]' : 'bg-white border-[#E8E8EB]'}`}
                    onPress={() => setSelectedFolderId(folder.id.toString())}
                    activeOpacity={0.7}
                  >
                    <View className={`w-12 h-12 rounded-xl justify-center items-center mr-4 ${isDark ? 'bg-[#2C2C2E]' : 'bg-[#F2F2F7]'}`}>
                      <FolderIcon size={24} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
                        {folder.name}
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-[#8C8C91]' : 'text-gray-500'}`}>
                        {visibleNotes.filter(n => String(n.folder_id) === String(folder.id)).length} notes
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {unassignedNotes.length > 0 && folders.length > 0 && (
                  <Text className="text-muted-foreground font-semibold mt-2 mb-3 px-1 uppercase text-xs tracking-wider">Unassigned Notes</Text>
                )}

                {unassignedNotes.map((note) => (
                  <TouchableOpacity
                    key={`note-${note.id}`}
                    className={`flex-row items-center p-4 mb-3 rounded-2xl border ${isDark ? 'bg-[#151516] border-[#2C2C2E]' : 'bg-[#FAFAFC] border-[#E8E8EB]'}`}
                    onPress={() => {
                      onClose();
                      onNoteSelect(note.id.toString());
                    }}
                    activeOpacity={0.7}
                  >
                    <View className={`w-12 h-12 rounded-xl justify-center items-center mr-4 ${isDark ? 'bg-[#1A1A1B]' : 'bg-white shadow-sm'}`}>
                      <FileText size={24} color={isDark ? '#E0E0E0' : '#121212'} />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
                        {note.name || note.original_filename || 'Untitled'}
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-[#8C8C91]' : 'text-gray-500'}`}>
                        {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Just now'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {folders.length === 0 && unassignedNotes.length === 0 && (
                  <View className="flex-1 justify-center items-center py-10 mt-10">
                    <FileText size={48} color={isDark ? '#4B4B50' : '#A0A0A0'} />
                    <Text className="text-muted-foreground text-center mt-4 px-6 text-lg font-medium">
                      Your library is empty.
                    </Text>
                  </View>
                )}
              </>
            ) : (
              // Inside a Folder View
              <>
                {currentFolderNotes.length === 0 ? (
                  <View className="flex-1 justify-center items-center py-10 mt-10">
                    <FileText size={48} color={isDark ? '#4B4B50' : '#A0A0A0'} />
                    <Text className="text-muted-foreground text-center mt-4 px-6 text-lg font-medium">
                      This folder is empty.
                    </Text>
                  </View>
                ) : (
                  currentFolderNotes.map((note) => (
                    <TouchableOpacity
                      key={`folder-note-${note.id}`}
                      className={`flex-row items-center p-4 mb-3 rounded-2xl border ${isDark ? 'bg-[#151516] border-[#2C2C2E]' : 'bg-[#FAFAFC] border-[#E8E8EB]'}`}
                      onPress={() => {
                        onClose();
                        onNoteSelect(note.id.toString());
                      }}
                      activeOpacity={0.7}
                    >
                      <View className={`w-12 h-12 rounded-xl justify-center items-center mr-4 ${isDark ? 'bg-[#1A1A1B]' : 'bg-white shadow-sm'}`}>
                        <FileText size={24} color={isDark ? '#E0E0E0' : '#121212'} />
                      </View>
                      <View className="flex-1">
                        <Text className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
                          {note.name || note.original_filename || 'Untitled'}
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-[#8C8C91]' : 'text-gray-500'}`}>
                          {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Just now'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}
          </ScrollView>

          {/* Close All Button */}
          {onCloseAll && !selectedFolderId && (
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
