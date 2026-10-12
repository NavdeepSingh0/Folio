import '../global.css';
import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState, LogBox, useColorScheme as useSystemColorScheme, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
// import * as Notifications from 'expo-notifications';
import { startServerKeepalive } from '../src/api';

LogBox.ignoreLogs(['A props object containing a "key" prop is being spread into JSX']);

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

import { vars } from 'nativewind';
import { useThemeStore } from '../src/store/themeStore';
import { useAuthStore } from '../src/store/authStore';
import AnimatedSplashScreen from '../src/components/AnimatedSplashScreen';
import { setupLocalNotifications } from '../src/services/notifications';

const lightTheme = vars({
  '--color-background': '#FAFAFC',
  '--color-foreground': '#121212',
  '--color-card': '#FFFFFF',
  '--color-card-foreground': '#121212',
  '--color-primary': '#121212',
  '--color-primary-foreground': '#FFFFFF',
  '--color-secondary': '#F0F0F2',
  '--color-secondary-foreground': '#121212',
  '--color-muted': '#F5F5F7',
  '--color-muted-foreground': '#6B6B70',
  '--color-border': '#E8E8EB',
  '--color-input': '#E8E8EB',
});

const darkTheme = vars({
  '--color-background': '#151516',
  '--color-foreground': '#E0E0E0',
  '--color-card': '#1A1A1B',
  '--color-card-foreground': '#E0E0E0',
  '--color-primary': '#FFFFFF',
  '--color-primary-foreground': '#151516',
  '--color-secondary': '#242426',
  '--color-secondary-foreground': '#FFFFFF',
  '--color-muted': '#2C2C2E',
  '--color-muted-foreground': '#8C8C91',
  '--color-border': '#2C2C2E',
  '--color-input': '#2C2C2E',
});

export default function Layout() {
  const theme = useThemeStore(s => s.theme);
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');
  const [splashFinished, setSplashFinished] = useState(false);

  const router = useRouter();
  const segments = useSegments();
  const initialized = useAuthStore(s => s.initialized);
  const initialize = useAuthStore(s => s.initialize);
  const session = useAuthStore(s => !!s.session);

  useEffect(() => {
    initialize();
    setupLocalNotifications();
  }, []);

  // Keep the Render server warm only while signed in and in the foreground
  const userId = useAuthStore(s => s.user?.id);
  useEffect(() => {
    if (!userId) return;
    let stop: (() => void) | null = AppState.currentState === 'active' ? startServerKeepalive() : null;
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        if (!stop) stop = startServerKeepalive();
      } else if (stop) {
        stop();
        stop = null;
      }
    });
    return () => {
      sub.remove();
      if (stop) stop();
    };
  }, [userId]);

  useEffect(() => {
    if (!initialized || !splashFinished) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      router.replace('/auth');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [session, initialized, splashFinished, segments]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[{ flex: 1 }, isDark ? darkTheme : lightTheme]}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          {!splashFinished && (
            <AnimatedSplashScreen onFinish={() => setSplashFinished(true)} />
          )}
          <Slot />
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
