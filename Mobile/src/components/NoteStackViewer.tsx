import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Dimensions, TouchableOpacity, useColorScheme as useSystemColorScheme, StyleSheet } from 'react-native';
import { useThemeStore } from '../../src/store/themeStore';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  withSpring,
  ZoomIn,
  FadeOut,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { FileText } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// CoverFlow Metrics
export const CARD_W = SCREEN_WIDTH * 0.75;
export const CARD_H = SCREEN_HEIGHT * 0.75;
export const STEP = CARD_W * 0.45; // 45% spacing = 55% overlap
const SIDE_PADDING = (SCREEN_WIDTH - CARD_W) / 2;
const RIGHT_PADDING = (SCREEN_WIDTH / 2) + (CARD_W / 2) - STEP;

interface NoteStackViewerProps {
  notes: any[];
  onNoteSelect: (id: string) => void;
  onCloseAll?: () => void;
  isOpen: boolean;
  onClose: () => void;
  activeNoteId?: string;
  onDismissNote?: (id: string) => void;
  sharedScrollX: Animated.SharedValue<number>;
}

// Single swipeable note card
function NoteCard({ note, index, isSpacer, scrollX, onSelect, onDismiss }: { note: any; index: number; isSpacer?: boolean; scrollX: Animated.SharedValue<number>; onSelect: () => void; onDismiss: () => void }) {
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

  const sysColorScheme = useSystemColorScheme();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');

  const animatedStyle = useAnimatedStyle(() => {
    const position = (scrollX.value / STEP) - index;
    const scale = interpolate(
      position,
      [-1, 0, 1],
      [0.9, 1, 0.9],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateY: translateY.value },
        { scale }
      ],
      opacity: isSpacer ? 0 : opacity.value, // Spacer is invisible so the background screen shows through!
    };
  });

  return (
    <View style={{ width: STEP, height: CARD_H, zIndex: index }}>
      <GestureDetector gesture={gesture}>
        <Animated.View 
          className={isSpacer ? "" : "shadow-2xl border"}
          style={[
            { 
              width: CARD_W, 
              height: CARD_H, 
              borderRadius: 32, 
              overflow: 'hidden', 
              position: 'absolute', 
              left: 0,
              backgroundColor: isSpacer ? 'transparent' : (isDark ? '#1C1C1E' : '#FFFFFF'),
              borderColor: isSpacer ? 'transparent' : (isDark ? '#2C2C2E' : '#E8E8EB')
            }, 
            animatedStyle
          ]}
        >
          {/* Card body — tappable to open note */}
          {!isSpacer && (
            <TouchableOpacity className="flex-1 p-6" activeOpacity={0.9} onPress={onSelect}>
              <View className="flex-row items-center gap-2.5 mb-4 pb-4 border-b border-border">
                <FileText size={18} color="#3b82f6" />
                <Text className={`flex-1 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>{note.name || 'Untitled'}</Text>
              </View>

              <View className="flex-1">
                <Text className={`text-sm leading-6 ${isDark ? 'text-[#8C8C91]' : 'text-gray-500'}`} numberOfLines={20}>
                  {note.content_preview || ''}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function NoteStackViewer({ notes, onNoteSelect, onCloseAll, isOpen, onClose, activeNoteId, onDismissNote, sharedScrollX }: NoteStackViewerProps) {
  const [visibleNotes, setVisibleNotes] = useState<any[]>([]);
  const scrollRef = useRef<Animated.ScrollView>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Reverse so oldest is on left (index 0) and newest active note is on right (index N-1)
      setVisibleNotes([...notes].reverse());
      
      // Auto scroll to the active note when opened (which is the last one in the reversed array)
      setTimeout(() => {
        if (scrollRef.current && notes.length > 0) {
          scrollRef.current.scrollTo({ x: (notes.length - 1) * STEP, animated: false });
          sharedScrollX.value = (notes.length - 1) * STEP;
        }
      }, 50);
    }
  }, [isOpen, notes]);

  const dismissNote = (id: string) => {
    if (onDismissNote) onDismissNote(id);
    else setVisibleNotes(prev => prev.filter(n => n.id.toString() !== id.toString()));
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      sharedScrollX.value = event.contentOffset.x;
    },
  });

  if (!isOpen) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      {/* Backdrop (Completely transparent so the background screen is perfectly visible) */}
      <Animated.View 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' }}
      >
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
      </Animated.View>

      <Animated.View 
        entering={ZoomIn.duration(300).springify()}
        exiting={FadeOut.duration(200)}
        style={{ flex: 1, justifyContent: 'center' }}
        pointerEvents="box-none"
      >
        {/* Horizontal CoverFlow of cards */}
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
              contentContainerStyle={{ paddingLeft: SIDE_PADDING, paddingRight: RIGHT_PADDING, alignItems: 'center' }}
            >
              {visibleNotes.map((item, index) => {
                const isSpacer = item.id.toString() === activeNoteId;
                return (
                  <NoteCard
                    key={item.id.toString()}
                    note={item}
                    index={index}
                    isSpacer={isSpacer}
                    scrollX={sharedScrollX}
                    onSelect={() => { onClose(); onNoteSelect(item.id.toString()); }}
                    onDismiss={() => dismissNote(item.id.toString())}
                  />
                );
              })}
            </Animated.ScrollView>
          )}
        </View>

        {/* Close All */}
        <View className="absolute bottom-10 w-full items-center">
          <TouchableOpacity 
            className="py-3 px-6 bg-white rounded-full shadow-lg"
            onPress={() => { onClose(); onCloseAll?.(); }}
          >
            <Text className="text-black text-xs font-bold tracking-widest">CLOSE ALL</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
