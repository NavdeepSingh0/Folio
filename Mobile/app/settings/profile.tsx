import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemeStore } from '../../src/store/themeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Camera, Save } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');
  const iconColor = isDark ? '#E0E0E0' : '#121212';
  const mutedIconColor = isDark ? '#8C8C91' : '#6B6B70';
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load from MMKV or fallback to defaults
    const storedUsername = storage.getString('user.username') || 'Alex Student';
    const storedEmail = storage.getString('user.email') || 'alex@folio.com';
    setUsername(storedUsername);
    setEmail(storedEmail);
    setLoading(false);
  }, []);

  const handleSave = () => {
    setSaving(true);
    // Simulate network delay
    setTimeout(() => {
      storage.set('user.username', username);
      storage.set('user.email', email);
      setSaving(false);
      Alert.alert("Success", "Profile updated successfully!");
    }, 800);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={iconColor} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-6 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2 w-10 items-center justify-center">
          <ArrowLeft size={24} color={iconColor} />
        </TouchableOpacity>
        <Text className="flex-1 text-foreground text-xl font-semibold text-center">
          Edit Profile
        </Text>
        <TouchableOpacity onPress={handleSave} className="w-10 items-center justify-center">
          {saving ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <Text className="text-blue-500 font-semibold text-base">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-1 p-6">
        {/* Avatar Section */}
        <View className="flex-row items-center border-b border-border pb-4 mb-4">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mr-4">
            <User size={32} color={isDark ? '#FFFFFF' : '#121212'} />
          </View>
          <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full justify-center items-center border-2 border-background">
            <Camera size={14} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text className="text-foreground text-xl font-bold">{storage.getString('user.username') || 'Alex Student'}</Text>
            <Text className="text-muted-foreground text-sm">{storage.getString('user.email') || 'alex@folio.com'}</Text>
          </View>
        </View>

        {/* Form */}
        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mb-6">
          <View className="mb-4">
            <Text className="text-muted-foreground text-xs font-semibold tracking-widest mb-2 ml-1">FULL NAME</Text>
            <View className="bg-background rounded-xl border border-border h-12 px-4 justify-center">
              <TextInput
                className="text-foreground text-base h-full"
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your name"
                placeholderTextColor={mutedIconColor}
              />
            </View>
          </View>

          <View>
            <Text className="text-muted-foreground text-xs font-semibold tracking-widest mb-2 ml-1">EMAIL ADDRESS</Text>
            <View className="bg-background rounded-xl border border-border h-12 px-4 justify-center">
              <TextInput
                className="text-foreground text-base h-full"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={mutedIconColor}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}
