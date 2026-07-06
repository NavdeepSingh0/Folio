import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Dimensions, TouchableOpacity, useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemeStore } from '../../src/store/themeStore';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  ZoomIn,
  FadeOut,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { FileText } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// CoverFlow Metrics
export const CARD_W = SCREEN_WIDTH * 0.75;
export const CARD_H = SCREEN_HEIGHT * 0.75;
export const STEP = CARD_W * 0.45; // 45% step = 55% overlap
const SIDE_PADDING = (SCREEN_WIDTH - CARD_W) / 2;

interface NoteStackViewerProps {
  notes: any[];
  onNoteSelect: (id: string) => void;
  onCloseAll?: () => void;
  isOpen: boolean;
  onClose: () => void;
  activeNoteId?: string;
  onDismissNote?: (id: string) => void;
  sharedScrollX: Animated.SharedValue<number>;
  sharedTranslateY: Animated.SharedValue<number>;
  sharedOpacity: Animated.SharedValue<number>;
}

// A single note card — no GestureDetector, just a plain TouchableOpacity so taps work reliably on Android
function NoteCard({ note, index, isSpacer, scrollX, onSelect }: {
  note: any;
  index: number;
  isSpacer?: boolean;
  scrollX: Animated.SharedValue<number>;
  onSelect: () => void;
}) {
  const sysColorScheme = useSystemColorScheme();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');

  const animatedStyle = useAnimatedStyle(() => {
    const position = scrollX.value / STEP - index;
    const scale = interpolate(position, [-1, 0, 1], [0.88, 1, 0.88], Extrapolation.CLAMP);
    return {
      transform: [{ scale }],
      opacity: isSpacer ? 0 : 1,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: CARD_W,
          height: CARD_H,
          marginLeft: index > 0 ? -(CARD_W - STEP) : 0,
          zIndex: index,
          borderRadius: 32,
          overflow: 'hidden',
          backgroundColor: isSpacer ? 'transparent' : (isDark ? '#1C1C1E' : '#FFFFFF'),
          borderWidth: isSpacer ? 0 : 1,
          borderColor: isDark ? '#2C2C2E' : '#E8E8EB',
        },
        animatedStyle,
      ]}
    >
      {!isSpacer && (
        <TouchableOpacity
          style={{ flex: 1, padding: 24 }}
          activeOpacity={0.85}
          onPress={onSelect}
        >
          {/* Note header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: isDark ? '#2C2C2E' : '#E8E8EB' }}>
            <FileText size={18} color="#3b82f6" />
            <Text
              style={{ flex: 1, fontSize: 17, fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' }}
              numberOfLines={1}
            >
              {note.name || 'Untitled'}
            </Text>
          </View>

          {/* Note preview */}
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 13, lineHeight: 22, color: isDark ? '#8C8C91' : '#6B7280' }}
              numberOfLines={20}
            >
              {note.content_preview || ''}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

export default function NoteStackViewer({
  notes,
  onNoteSelect,
  onCloseAll,
  isOpen,
  onClose,
  activeNoteId,
  onDismissNote,
  sharedScrollX,
  sharedTranslateY,
  sharedOpacity,
}: NoteStackViewerProps) {
  const [visibleNotes, setVisibleNotes] = useState<any[]>([]);
  const scrollRef = useRef<Animated.ScrollView>(null);

  useEffect(() => {
    if (isOpen) {
      // Reverse so oldest is on the left (index 0), newest active note is on the right (index N-1)
      setVisibleNotes([...notes].reverse());

      // Jump to the active (rightmost) note immediately on open
      setTimeout(() => {
        if (scrollRef.current && notes.length > 0) {
          const targetX = (notes.length - 1) * STEP;
          scrollRef.current.scrollTo({ x: targetX, animated: false });
          sharedScrollX.value = targetX;
        }
      }, 50);
    }
  }, [isOpen, notes]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      sharedScrollX.value = event.contentOffset.x;
    },
  });

  if (!isOpen) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Transparent backdrop — tapping empty space closes the switcher */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        activeOpacity={1}
        onPress={onClose}
      />

      <Animated.View
        entering={ZoomIn.duration(300).springify()}
        exiting={FadeOut.duration(200)}
        style={{ flex: 1, justifyContent: 'center' }}
        pointerEvents="box-none"
      >
        {/* CoverFlow Carousel */}
        <View style={{ height: CARD_H, width: '100%' }}>
          {visibleNotes.length > 0 && (
            <Animated.ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={STEP}
              decelerationRate="fast"
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              contentContainerStyle={{
                paddingLeft: SIDE_PADDING,
                paddingRight: SIDE_PADDING,
                alignItems: 'center',
              }}
            >
              {visibleNotes.map((item, index) => {
                const isSpacer = item.id.toString() === activeNoteId?.toString();
                return (
                  <NoteCard
                    key={item.id.toString()}
                    note={item}
                    index={index}
                    isSpacer={isSpacer}
                    scrollX={sharedScrollX}
                    onSelect={() => {
                      onClose();
                      onNoteSelect(item.id.toString());
                    }}
                  />
                );
              })}
            </Animated.ScrollView>
          )}
        </View>

        {/* Close All button */}
        <View style={{ position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#FFFFFF', borderRadius: 999, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 }}
            onPress={() => { onClose(); onCloseAll?.(); }}
          >
            <Text style={{ color: '#000', fontSize: 12, fontWeight: '700', letterSpacing: 2 }}>CLOSE ALL</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
