import React from 'react';
import { View, Text, Dimensions, TouchableOpacity, useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemeStore } from '../../src/store/themeStore';
import { FlashList } from '@shopify/flash-list';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  withSpring,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { FileText } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Each card takes 75% of screen width with gap peeking at the next one
const CARD_W = SCREEN_WIDTH * 0.72;
const CARD_H = SCREEN_HEIGHT * 0.75;
const CARD_GAP = 16;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_W) / 2;

interface NoteStackViewerProps {
  notes: any[];
  onNoteSelect: (id: string) => void;
  onCloseAll?: () => void;
  isOpen: boolean;
  onClose: () => void;
  activeNoteId?: string;
  onDismissNote?: (id: string) => void;
}

// Single swipeable note card
function NoteCard({ note, onSelect, onDismiss }: { note: any; onSelect: () => void; onDismiss: () => void }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY < 0) { // only allow upward swipe
        translateY.value = e.translationY;
        opacity.value = 1 + e.translationY / (SCREEN_HEIGHT * 0.3); // fade as you swipe up
      }
    })
    .onEnd((e) => {
      if (e.translationY < -120 || e.velocityY < -800) {
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 250 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(onDismiss)();
      } else {
        translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
        opacity.value = withSpring(1);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View 
        style={[{ width: CARD_W, height: CARD_H, borderRadius: 32, overflow: 'hidden' }, cardStyle]} 
        className="bg-card shadow-2xl border border-border"
      >
        {/* Card body — tappable to open note */}
        <TouchableOpacity className="flex-1 p-6 bg-card rounded-[32px]" activeOpacity={0.9} onPress={onSelect}>
          <View className="flex-row items-center gap-2.5 mb-4 pb-4 border-b border-border">
            <FileText size={18} color="#3b82f6" />
            <Text className="flex-1 text-lg font-semibold text-foreground" numberOfLines={1}>{note.name || 'Untitled'}</Text>
          </View>

          <View className="flex-1">
            <Text className="text-muted-foreground text-sm leading-6" numberOfLines={20}>
              {note.content_preview || ''}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

export default function NoteStackViewer({ notes, onNoteSelect, onCloseAll, isOpen, onClose, activeNoteId, onDismissNote }: NoteStackViewerProps) {
  const [visibleNotes, setVisibleNotes] = React.useState(notes);
  const { theme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');

  React.useEffect(() => {
    setVisibleNotes(notes.filter(n => n.id.toString() !== activeNoteId));
  }, [notes, activeNoteId]);

  const dismissNote = (id: string) => {
    if (onDismissNote) onDismissNote(id);
    else setVisibleNotes(prev => prev.filter(n => n.id.toString() !== id.toString()));
  };

  if (!isOpen) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      {/* Backdrop (Transparent so the scaled active note remains bright) */}
      <Animated.View 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' }}
      >
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
      </Animated.View>

      <Animated.View 
        entering={ZoomIn.duration(300).springify()}
        exiting={ZoomOut.duration(200)}
        style={{ flex: 1 }}
        pointerEvents="box-none"
      >
        <View className="h-[100px]" pointerEvents="none" />

        {/* Horizontal scroll of cards */}
        <View className="flex-1 w-full">
          {visibleNotes.length > 0 && (
            <FlashList
              data={visibleNotes}
              keyExtractor={(item: any) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_W + CARD_GAP}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: SIDE_PADDING, alignItems: 'center' }}
              ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
              estimatedItemSize={CARD_W}
              renderItem={({ item }) => (
                <NoteCard
                  note={item}
                  onSelect={() => { onClose(); onNoteSelect(item.id.toString()); }}
                  onDismiss={() => dismissNote(item.id.toString())}
                />
              )}
            />
          )}
        </View>

        {/* Close All */}
        <View className="absolute bottom-10 w-full items-center">
          <TouchableOpacity 
            className="py-2.5 px-5 bg-foreground rounded-full shadow-lg"
            onPress={() => { onClose(); onCloseAll?.(); }}
          >
            <Text className="text-background text-xs font-bold tracking-widest">CLOSE ALL</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
