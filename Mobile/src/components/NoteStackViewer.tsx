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
import { ArrowLeft, Plus, Search, Paperclip, MessageSquare } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MobileMarkdown from './mobile/MobileMarkdown';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Geometry ───────────────────────────────────────────────────────────────
export const CARD_SCALE = 0.75;
// The step is the physical layout distance between items in the ScrollView.
export const STEP = SCREEN_W * CARD_SCALE + 16;
// Padding to center the wrapper slot on the screen
const PAD_H = (SCREEN_W - STEP) / 2;

// ─── Types ──────────────────────────────────────────────────────────────────
interface Note { id: string | number; name?: string; content_preview?: string; content?: string; [k: string]: any; }

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
  onSelect,
  onDismiss,
}: {
  note: Note;
  onSelect: () => void;
  onDismiss: () => void;
}) {
  const { theme } = useThemeStore();
  const sys = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sys === 'dark');
  const iconColor = isDark ? '#E0E0E0' : '#121212';

  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetY([-10, 10]) // Require vertical movement to activate, allows horizontal scroll to pass through
    .onUpdate((e) => {
      if (e.translationY < 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY < -100 || e.velocityY < -800) {
        translateY.value = withTiming(-SCREEN_H, { duration: 200 }, (finished) => {
          if (finished) runOnJS(onDismiss)();
        });
      } else {
        translateY.value = withTiming(0, { duration: 250 });
      }
    });

  return (
    <View style={{ width: STEP, height: SCREEN_H, justifyContent: 'center', alignItems: 'center' }}>
      {/* ── Visual card (literally screen sized, scaled down statically) ── */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            {
              width: SCREEN_W,
              height: SCREEN_H,
              backgroundColor: isDark ? '#1C1C1E' : '#F8F8F8',
              borderWidth: 1,
              borderColor: isDark ? '#333' : '#DDD',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 5, 
              borderRadius: 28,
              overflow: 'hidden',
            },
            useAnimatedStyle(() => ({
              transform: [
                { scale: CARD_SCALE },
                { translateY: translateY.value }
              ]
            }))
          ]}
        >
        <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#FFFFFF' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: isDark ? '#2C2C2E' : '#E8E8EB', backgroundColor: isDark ? '#121212' : '#FFFFFF' }}>
              <View style={{ padding: 8 }}>
                <ArrowLeft size={24} color={iconColor} />
              </View>
              <View style={{ flex: 1, paddingHorizontal: 6, justifyContent: 'center' }}>
                <Text style={{ color: isDark ? '#E0E0E0' : '#121212', fontSize: 17, fontWeight: '600' }} numberOfLines={1}>
                  {note.name || 'Untitled'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ padding: 8 }}><Plus size={22} color={iconColor} /></View>
                <View style={{ padding: 8 }}><Search size={22} color={iconColor} /></View>
                <View style={{ padding: 8 }}><Paperclip size={22} color={iconColor} /></View>
                <View style={{ padding: 8 }}><MessageSquare size={22} color={iconColor} /></View>
              </View>
            </View>
            
            <View style={{ flex: 1 }} pointerEvents="none">
              {note.content ? (
                <MobileMarkdown content={note.content} />
              ) : (
                <View style={{ padding: 24 }}>
                  <Text style={{ fontSize: 14, lineHeight: 22, color: isDark ? '#888' : '#666' }} numberOfLines={15}>
                    {note.content_preview || "No content..."}
                  </Text>
                </View>
              )}
            </View>
        </View>
      </Animated.View>
      </GestureDetector>

      {/* ── Invisible hit area for cards to select them ── */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onSelect}
        style={{ position: 'absolute', width: SCREEN_W * CARD_SCALE, height: SCREEN_H * CARD_SCALE }}
      />
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

  const activeIndex = orderedNotes.findIndex(n => n.id.toString() === activeNoteId?.toString());

  // Only scroll when the switcher is actually opening — never needed in fullscreen
  useEffect(() => {
    if (isOpen) {
      const targetX = Math.max(0, activeIndex) * STEP;
      scrollRef.current?.scrollTo({ x: targetX, animated: false });
    }
  }, [isOpen]);

  // Transparent backdrop style
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: switcherProgress.value,
    pointerEvents: switcherProgress.value > 0 ? 'auto' : 'none',
  }));

  // Fullscreen layer crossfade style
  const fullscreenStyle = useAnimatedStyle(() => ({
    opacity: interpolate(switcherProgress.value, [0, 0.3], [1, 0], 'clamp'),
    transform: [{ scale: interpolate(switcherProgress.value, [0, 1], [1, CARD_SCALE], 'clamp') }],
    borderRadius: interpolate(switcherProgress.value, [0, 1], [0, 28], 'clamp'),
    overflow: 'hidden'
  }));

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      
      {/* 1. FULLSCREEN LAYER — always mounted at x=0, completely independent of scroll */}
      <Animated.View
        pointerEvents={isOpen ? 'none' : 'auto'}
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, elevation: 10 },
          fullscreenStyle,
        ]}
      >
        {activeCardContent}
      </Animated.View>

      {/* 2. CAROUSEL LAYER — faded in when switcher opens */}
      <Animated.View 
        style={[{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5, elevation: 5 }, backdropStyle]} 
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        {/* Transparent tap-to-close backdrop */}
        <TouchableOpacity style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} activeOpacity={1} onPress={onClose} />
        
        <View style={{ flex: 1, justifyContent: 'center' }} pointerEvents="box-none">
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={STEP}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal: PAD_H,
              alignItems: 'center',
            }}
          >
            {orderedNotes.map((note) => {
              return (
                <NoteCard
                  key={note.id.toString()}
                  note={note}
                  onSelect={() => { onNoteSelect(note.id.toString()); }}
                  onDismiss={() => onDismissNote(note.id.toString())}
                />
              );
            })}
          </Animated.ScrollView>

          {/* Close All */}
          <View style={{ position: 'absolute', bottom: 64, width: '100%', alignItems: 'center' }}>
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
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
