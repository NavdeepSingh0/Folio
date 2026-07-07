// Refactored with NativeWind
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemeStore } from '../../src/store/themeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Shield, Moon, Bell, Database, LogOut, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import MobileSidebar from '../../src/components/MobileSidebar';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');
  
  const iconColor = isDark ? '#E0E0E0' : '#121212';
  const mutedIconColor = isDark ? '#8C8C91' : '#6B6B70';

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: () => router.replace('/') }
      ]
    );
  };

  const SettingRow = ({ icon: Icon, title, value, hasSwitch, switchValue, onPress, danger }: any) => (
    <TouchableOpacity 
      className="flex-row items-center p-4"
      onPress={onPress} 
      activeOpacity={onPress || hasSwitch ? 0.7 : 1}
      disabled={!onPress && !hasSwitch}
    >
      <View className={`w-9 h-9 rounded-[10px] justify-center items-center mr-4 ${danger ? 'bg-red-500/10' : 'bg-muted'}`}>
        <Icon size={20} color={danger ? '#ef4444' : mutedIconColor} />
      </View>
      <Text className={`flex-1 text-base font-medium ${danger ? 'text-red-500' : 'text-foreground'}`}>{title}</Text>
      
      {value && <Text className="text-muted-foreground text-[15px] mr-2">{value}</Text>}
      
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onPress}
          trackColor={{ false: isDark ? '#2C2C2E' : '#E8E8EB', true: isDark ? '#3b82f6' : '#121212' }}
          thumbColor="#FFFFFF"
        />
      ) : onPress ? (
        <ChevronRight size={20} color={mutedIconColor} />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <>
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
        <View className="px-6 pt-4 pb-6 mt-10">
          <Text className="absolute left-20 text-foreground text-3xl font-bold tracking-tight">Settings</Text>
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          
          <Animated.View entering={FadeInDown.duration(400).delay(100)} className="mb-8">
            <Text className="text-muted-foreground text-[13px] font-semibold tracking-widest ml-3 mb-2">ACCOUNT</Text>
            <View className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <SettingRow icon={User} title="Profile Details" onPress={() => router.push('/settings/profile')} />
              <View className="h-[1px] bg-border ml-[68px]" />
              <SettingRow icon={Shield} title="Security & Privacy" onPress={() => {}} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(200)} className="mb-8">
            <Text className="text-muted-foreground text-[13px] font-semibold tracking-widest ml-3 mb-2">PREFERENCES</Text>
            <View className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <SettingRow 
                icon={Moon} 
                title="Dark Mode" 
                hasSwitch 
                switchValue={isDark} 
                onPress={(value: boolean) => setTheme(value ? 'dark' : 'light')} 
              />
              <View className="h-[1px] bg-border ml-[68px]" />
              <SettingRow 
                icon={Bell} 
                title="Notifications" 
                hasSwitch 
                switchValue={true} 
                onPress={() => {}} 
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(300)} className="mb-8">
            <Text className="text-muted-foreground text-[13px] font-semibold tracking-widest ml-3 mb-2">SYSTEM</Text>
            <View className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <SettingRow icon={Database} title="API Configuration" value="Connected" onPress={() => {}} />
              <View className="h-[1px] bg-border ml-[68px]" />
              <SettingRow icon={LogOut} title="Log Out" danger onPress={handleLogout} />
            </View>
          </Animated.View>

          <Text className="text-center text-muted-foreground text-[13px] mt-4 mb-10">Folio v1.0.0 (Build 56)</Text>
        </ScrollView>
      </SafeAreaView>

      <MobileSidebar />
    </>
  );
}
