/**
 * NoteStackViewer — Android Recent Apps-style CoverFlow
 *
 * Architecture:
 * - Cards are laid out in a ScrollView with width=STEP per slot (native snap + momentum).
 * - Each card is rendered ABSOLUTELY inside its slot at width=CARD_W, centered over the slot.
 * - To fix Android's "overflow-is-untouchable" rule, we use a SECOND invisible hit-area View
 *   that is CARD_W wide and intercepts the tap, then calls onSelect.
 * - Scale + translateX interpolation from scrollX creates the depth illusion.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  useColorScheme as useSystemColorScheme,
} from 'react-native';
import Animated, {
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useThemeStore } from '../../src/store/themeStore';
import { FileText, X } from 'lucide-react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Geometry ───────────────────────────────────────────────────────────────
export const CARD_W = SCREEN_W * 0.72;   // card visual width
export const CARD_H = SCREEN_H * 0.72;   // card visual height
export const STEP   = SCREEN_W * 0.28;   // scroll step between cards (narrower = more peek)
const PAD_H = (SCREEN_W - CARD_W) / 2;  // horizontal centering padding

// ─── Types ──────────────────────────────────────────────────────────────────
interface Note { id: string | number; name?: string; content_preview?: string; [k: string]: any; }

interface Props {
  notes: Note[];
  isOpen: boolean;
  activeNoteId?: string;
  onClose: () => void;
  onNoteSelect: (id: string) => void;
  onDismissNote?: (id: string) => void;
  onCloseAll?: () => void;
  // Shared values wired to the main screen behind
  sharedScrollX: Animated.SharedValue<number>;
  sharedTranslateY: Animated.SharedValue<number>;
  sharedOpacity:    Animated.SharedValue<number>;
}

// ─── NoteCard ────────────────────────────────────────────────────────────────
function NoteCard({
  note,
  index,
  isSpacer,
  totalCards,
  scrollX,
  onSelect,
  onDismiss,
}: {
  note: Note;
  index: number;
  isSpacer: boolean;
  totalCards: number;
  scrollX: Animated.SharedValue<number>;
  onSelect: () => void;
  onDismiss: () => void;
}) {
  const { theme } = useThemeStore();
  const sys = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sys === 'dark');

  /**
   * position = 0   → this card is the "focused" one (centred in viewport)
   * position < 0   → card is to the LEFT of focus  (older notes)
   * position > 0   → card is to the RIGHT of focus (not used; active is rightmost)
   */
  const cardStyle = useAnimatedStyle(() => {
    const position = scrollX.value / STEP - index;

    const scale = interpolate(
      position,
      [-2, -1, 0, 1],
      [0.78, 0.88, 1.0, 0.88],
      Extrapolation.CLAMP,
    );

    // Cards to the left get pushed further left (peeks) so the focus card covers them more
    const translateX = interpolate(
      position,
      [-2, -1, 0, 1],
      [-CARD_W * 0.08, -CARD_W * 0.04, 0, CARD_W * 0.04],
      Extrapolation.CLAMP,
    );

    const opacity = isSpacer
      ? 0 // invisible — the real active note shows through behind
      : interpolate(Math.abs(position), [0, 2.5], [1, 0.4], Extrapolation.CLAMP);

    return {
      transform: [{ translateX }, { scale }],
      opacity,
      // Cards closer to the right should render on top
      zIndex: index,
    };
  });

  return (
    <View style={{ width: STEP, height: CARD_H }}>
      {/* ── Visual card (absolutely positioned, CARD_W wide) ── */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: -(CARD_W - STEP) / 2,   // centre the wide card inside the narrow slot
            width: CARD_W,
            height: CARD_H,
            borderRadius: 28,
            overflow: 'hidden',
            backgroundColor: isSpacer
              ? 'transparent'
              : isDark ? '#1C1C1E' : '#F8F8F8',
            borderWidth: isSpacer ? 0 : 1,
            borderColor: isDark ? '#333' : '#DDD',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isSpacer ? 0 : 0.25,
            shadowRadius: 16,
            elevation: isSpacer ? 0 : 8,
          },
          cardStyle,
        ]}
        pointerEvents={isSpacer ? 'none' : 'box-none'}
      >
        {!isSpacer && (
          <>
            {/* Dismiss X button */}
            <TouchableOpacity
              style={{
                position: 'absolute', top: 12, right: 12, zIndex: 10,
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: isDark ? '#3A3A3C' : '#E0E0E0',
                alignItems: 'center', justifyContent: 'center',
              }}
              onPress={onDismiss}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <X size={14} color={isDark ? '#FFF' : '#555'} />
            </TouchableOpacity>

            {/* Note header */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              marginTop: 50, marginHorizontal: 20, paddingBottom: 12,
              borderBottomWidth: 1, borderColor: isDark ? '#2C2C2E' : '#E8E8EB',
            }}>
              <FileText size={16} color="#3b82f6" />
              <Text
                style={{ flex: 1, fontSize: 15, fontWeight: '600', color: isDark ? '#FFF' : '#111' }}
                numberOfLines={1}
              >
                {note.name || 'Untitled'}
              </Text>
            </View>

            {/* Note preview */}
            <View style={{ flex: 1, marginHorizontal: 20, marginTop: 12 }}>
              <Text
                style={{ fontSize: 12, lineHeight: 20, color: isDark ? '#8C8C91' : '#888' }}
                numberOfLines={18}
              >
                {note.content_preview || ''}
              </Text>
            </View>
          </>
        )}
      </Animated.View>

      {/* ── Invisible full-width hit area (CARD_W wide, positioned same as visual card) ──
          This is the Android fix: the touchable is inside its full-size parent, so
          Android's overflow-clip rule doesn't cut off the touch zone.          */}
      {!isSpacer && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onSelect}
          style={{
            position: 'absolute',
            left: -(CARD_W - STEP) / 2,
            width: CARD_W,
            height: CARD_H,
          }}
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
  sharedScrollX,
  sharedTranslateY,
  sharedOpacity,
}: Props) {
  // Reverse so oldest=left (index 0), newest=right (index N-1)
  const orderedNotes = [...notes].reverse();

  const scrollRef = useRef<Animated.ScrollView>(null);
  const activeIndex = orderedNotes.findIndex(n => n.id.toString() === activeNoteId?.toString());
  const targetX = Math.max(0, activeIndex) * STEP;

  useEffect(() => {
    if (!isOpen) return;
    // Jump to active card without animation on open
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: targetX, animated: false });
      sharedScrollX.value = targetX;
    }, 30);
  }, [isOpen]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: e => { sharedScrollX.value = e.contentOffset.x; },
  });

  if (!isOpen) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(180)}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      pointerEvents="box-none"
    >
      {/* Transparent tap-to-close backdrop */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* ── Card Carousel ── */}
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center' }}
        pointerEvents="box-none"
      >
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={STEP}
          decelerationRate="fast"
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: PAD_H + (CARD_W - STEP) / 2,
            alignItems: 'center',
          }}
        >
          {orderedNotes.map((note, index) => {
            const isSpacer = note.id.toString() === activeNoteId?.toString();
            return (
              <NoteCard
                key={note.id.toString()}
                note={note}
                index={index}
                isSpacer={isSpacer}
                totalCards={orderedNotes.length}
                scrollX={sharedScrollX}
                onSelect={() => { onClose(); onNoteSelect(note.id.toString()); }}
                onDismiss={() => onDismissNote?.(note.id.toString())}
              />
            );
          })}
        </Animated.ScrollView>

        {/* Close All */}
        <View style={{ position: 'absolute', bottom: 32, width: '100%', alignItems: 'center' }}>
          <TouchableOpacity
            style={{
              paddingVertical: 13, paddingHorizontal: 32,
              backgroundColor: '#FFF', borderRadius: 999,
              shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 10, elevation: 8,
            }}
            onPress={() => { onClose(); onCloseAll?.(); }}
          >
            <Text style={{ color: '#000', fontSize: 11, fontWeight: '700', letterSpacing: 2 }}>
              CLOSE ALL
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}
