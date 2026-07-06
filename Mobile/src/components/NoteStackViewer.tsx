import React, { useEffect, useRef } from 'react';
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  useColorScheme as useSystemColorScheme,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useThemeStore } from '../../src/store/themeStore';
import { FileText, X } from 'lucide-react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Geometry ───────────────────────────────────────────────────────────────
export const CARD_SCALE = 0.85;
// The step is the physical layout distance between items in the ScrollView.
export const STEP = SCREEN_W * CARD_SCALE + 16;
// Padding to center the wrapper slot on the screen
const PAD_H = (SCREEN_W - STEP) / 2;

// ─── Types ──────────────────────────────────────────────────────────────────
interface Note { id: string | number; name?: string; content_preview?: string; [k: string]: any; }

interface Props {
  notes: Note[];
  isOpen: boolean;
  activeNoteId: string;
  onClose: () => void;
  onNoteSelect: (id: string) => void;
  onDismissNote: (id: string) => void;
  onCloseAll: () => void;
  activeCardContent: React.ReactNode;
}

// ─── NoteCard ────────────────────────────────────────────────────────────────
function NoteCard({
  note,
  isActive,
  switcherProgress,
  activeCardContent,
  onSelect,
  onDismiss,
}: {
  note: Note;
  isActive: boolean;
  switcherProgress: Animated.SharedValue<number>;
  activeCardContent: React.ReactNode;
  onSelect: () => void;
  onDismiss: () => void;
}) {
  const { theme } = useThemeStore();
  const sys = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sys === 'dark');

  const cardStyle = useAnimatedStyle(() => {
    // When switcherProgress is 0 (fullscreen):
    // active card -> scale 1.0, opacity 1
    // inactive card -> scale CARD_SCALE, opacity 0
    
    // When switcherProgress is 1 (switcher open):
    // ALL cards -> scale CARD_SCALE, opacity 1

    const currentScale = interpolate(
      switcherProgress.value,
      [0, 1],
      [isActive ? 1.0 : CARD_SCALE, CARD_SCALE]
    );

    const currentOpacity = interpolate(
      switcherProgress.value,
      [0, 1],
      [isActive ? 1 : 0, 1]
    );

    const currentRadius = interpolate(
      switcherProgress.value,
      [0, 1],
      [isActive ? 0 : 28, 28]
    );

    return {
      transform: [{ scale: currentScale }],
      opacity: currentOpacity,
      borderRadius: currentRadius,
      overflow: 'hidden',
    };
  });

  return (
    <View style={{ width: STEP, height: SCREEN_H, justifyContent: 'center', alignItems: 'center' }}>
      {/* ── Visual card (literally screen sized, scaled down) ── */}
      <Animated.View
        style={[
          {
            width: SCREEN_W,
            height: SCREEN_H,
            backgroundColor: isDark ? '#121212' : '#FFF', // Match active screen bg
            borderWidth: 1,
            borderColor: isDark ? 'transparent' : 'transparent', // We can animate this if needed
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: isActive ? 10 : 5, 
          },
          cardStyle,
        ]}
      >
        {isActive ? (
          <View style={{ flex: 1 }} pointerEvents={switcherProgress.value === 0 ? 'auto' : 'none'}>
            {activeCardContent}
          </View>
        ) : (
          <View style={{ flex: 1, backgroundColor: isDark ? '#1C1C1E' : '#F8F8F8', paddingTop: 60, paddingHorizontal: 20 }}>
            {/* ── Dismiss X button (only visible in switcher, inside scaled card) ── */}
            <TouchableOpacity
              style={{
                position: 'absolute', top: 50, right: 20, zIndex: 10,
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: isDark ? 'rgba(58,58,60,0.8)' : 'rgba(224,224,224,0.8)',
                alignItems: 'center', justifyContent: 'center',
              }}
              onPress={onDismiss}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <X size={20} color={isDark ? '#FFF' : '#555'} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 12, borderBottomWidth: 1, borderColor: isDark ? '#2C2C2E' : '#E8E8EB' }}>
              <FileText size={16} color="#3b82f6" />
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: isDark ? '#FFF' : '#111' }} numberOfLines={1}>
                {note.name || 'Untitled'}
              </Text>
            </View>
            <Text style={{ marginTop: 12, fontSize: 14, color: isDark ? '#888' : '#666' }} numberOfLines={15}>
               {note.content_preview || note.markdown_content || "No content..."}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* ── Invisible hit area for inactive cards to select them ── */}
      {!isActive && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onSelect}
          style={{ position: 'absolute', width: SCREEN_W * CARD_SCALE, height: SCREEN_H * CARD_SCALE }}
        />
      )}
    </View>
  );
}

// ─── NoteStackViewer ─────────────────────────────────────────────────────────
export default function NoteStackViewer({
  notes,
  isOpen,
  activeNoteId,
  onClose,
  onNoteSelect,
  onDismissNote,
  onCloseAll,
  activeCardContent,
}: Props) {
  // Reverse so oldest=left (index 0), newest=right (index N-1)
  const orderedNotes = [...notes].reverse();

  const scrollRef = useRef<Animated.ScrollView>(null);
  
  // switcherProgress: 0 = Fullscreen, 1 = Switcher Open
  const switcherProgress = useSharedValue(isOpen ? 1 : 0);

  useEffect(() => {
    switcherProgress.value = withTiming(isOpen ? 1 : 0, { duration: 300 });
  }, [isOpen]);

  // We must always ensure the scrollview is snapped to the active card, 
  // even if closed, so that when a new note is opened from the picker, 
  // it is perfectly centered in the fullscreen view.
  useEffect(() => {
    const activeIndex = orderedNotes.findIndex(n => n.id.toString() === activeNoteId?.toString());
    const targetX = Math.max(0, activeIndex) * STEP;
    scrollRef.current?.scrollTo({ x: targetX, animated: false });
  }, [isOpen, activeNoteId, orderedNotes]);

  // Transparent backdrop style
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: switcherProgress.value,
    pointerEvents: switcherProgress.value > 0 ? 'auto' : 'none',
  }));

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {/* Transparent tap-to-close backdrop */}
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' }, backdropStyle]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      {/* ── Card Carousel ── */}
      <View style={{ flex: 1, justifyContent: 'center' }} pointerEvents="box-none">
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={STEP}
          decelerationRate="fast"
          scrollEnabled={isOpen} // Only scrollable when open!
          contentContainerStyle={{
            paddingHorizontal: PAD_H,
            alignItems: 'center',
          }}
        >
          {orderedNotes.map((note) => {
            const isActive = note.id.toString() === activeNoteId?.toString();
            return (
              <NoteCard
                key={note.id.toString()}
                note={note}
                isActive={isActive}
                switcherProgress={switcherProgress}
                activeCardContent={activeCardContent}
                onSelect={() => { onNoteSelect(note.id.toString()); }}
                onDismiss={() => onDismissNote(note.id.toString())}
              />
            );
          })}
        </Animated.ScrollView>

        {/* Close All */}
        <Animated.View style={[{ position: 'absolute', bottom: 32, width: '100%', alignItems: 'center' }, backdropStyle]}>
          <TouchableOpacity
            style={{
              paddingVertical: 13, paddingHorizontal: 32,
              backgroundColor: '#FFF', borderRadius: 999,
              shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 10, elevation: 8,
            }}
            onPress={() => { onCloseAll(); }}
          >
            <Text style={{ color: '#000', fontSize: 11, fontWeight: '700', letterSpacing: 2 }}>
              CLOSE ALL
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
