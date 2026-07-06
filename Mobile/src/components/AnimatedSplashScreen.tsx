import React, { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { useThemeStore } from '../store/themeStore';
import { useColorScheme as useSystemColorScheme } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export default function AnimatedSplashScreen({ onFinish }: Props) {
  const { theme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');

  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.9);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    // 1. Fade in and scale up logo text
    textOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    textTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.back(1.5)) });
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });

    // 2. Wait a bit, then fade out the whole screen
    opacity.value = withDelay(
      1500, // hold for 1.5 seconds
      withTiming(0, { duration: 400 }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      })
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      { translateY: textTranslateY.value },
      { scale: scale.value }
    ]
  }));

  return (
    <Animated.View 
      style={[
        { 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0, 
          zIndex: 9999, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: isDark ? '#151516' : '#FAFAFC'
        }, 
        containerStyle
      ]}
    >
      <Animated.Text 
        style={[
          {
            fontSize: 42,
            fontWeight: 'bold',
            letterSpacing: 2,
            color: isDark ? '#FFFFFF' : '#121212',
          },
          textStyle
        ]}
      >
        Folio
      </Animated.Text>
    </Animated.View>
  );
}
