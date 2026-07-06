import '../global.css';
import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, useColorScheme as useSystemColorScheme, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
// import * as Notifications from 'expo-notifications';
import { startServerKeepalive } from '../src/api';

LogBox.ignoreLogs(['A props object containing a "key" prop is being spread into JSX']);

// Wake up Render server immediately on app launch, keep it alive
startServerKeepalive();

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
  const { theme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');
  const [splashFinished, setSplashFinished] = useState(false);

  const router = useRouter();
  const segments = useSegments();
  const { initialized, initialize, session } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

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
