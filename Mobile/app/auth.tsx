import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../src/store/themeStore';
import { Shield, Mail, Lock, Key, ChevronRight } from 'lucide-react-native';
import { supabase } from '../src/supabase';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// Make sure this matches the API URL in src/api.ts
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://folio-g049.onrender.com/api";

export default function AuthScreen() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark' || theme === 'system';
  const router = useRouter();

  const [mode, setMode] = useState<'creator' | 'invited'>('creator');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'creator') {
        // Standard Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Navigation is handled automatically by the _layout.tsx effect
      } else {
        // Invite-Only Signup via custom Backend endpoint
        if (!secretCode) {
          Alert.alert('Error', 'You must provide the Secret Code to prove thyself.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            secret_code: secretCode
          })
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.detail || 'Failed to prove thyself.');
        }

        // Signup successful! Now log them in.
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (error: any) {
      Alert.alert('Auth Failed', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background justify-center px-6">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6 border border-primary/20">
            <Shield size={40} color="#3b82f6" />
          </View>
          <Text className="text-3xl font-black text-foreground mb-2 tracking-widest uppercase">Prove Thyself! ⚔️</Text>
          <Text className="text-muted-foreground text-center px-4">
            {mode === 'creator' 
              ? 'Welcome back, Architect. Enter your credentials.' 
              : 'Only those with the sacred code may enter this sanctuary.'}
          </Text>
        </View>

        <View className="flex-row bg-muted rounded-full p-1 mb-8">
          <TouchableOpacity 
            className={`flex-1 py-3 rounded-full items-center ${mode === 'creator' ? 'bg-background shadow-sm' : ''}`}
            onPress={() => setMode('creator')}
          >
            <Text className={`font-bold ${mode === 'creator' ? 'text-foreground' : 'text-muted-foreground'}`}>I am the Creator</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-3 rounded-full items-center ${mode === 'invited' ? 'bg-background shadow-sm' : ''}`}
            onPress={() => setMode('invited')}
          >
            <Text className={`font-bold ${mode === 'invited' ? 'text-foreground' : 'text-muted-foreground'}`}>I was Invited</Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-4 mb-8">
          <View className="flex-row items-center bg-muted/50 border border-border rounded-xl px-4 py-3">
            <Mail size={20} color="#6B6B70" className="mr-3" />
            <TextInput
              className="flex-1 text-foreground text-base"
              placeholder="Email address"
              placeholderTextColor="#6B6B70"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="flex-row items-center bg-muted/50 border border-border rounded-xl px-4 py-3">
            <Lock size={20} color="#6B6B70" className="mr-3" />
            <TextInput
              className="flex-1 text-foreground text-base"
              placeholder="Password"
              placeholderTextColor="#6B6B70"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {mode === 'invited' && (
            <Animated.View className="flex-row items-center bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
              <Key size={20} color="#3b82f6" className="mr-3" />
              <TextInput
                className="flex-1 text-foreground text-base"
                placeholder="Secret Invite Code"
                placeholderTextColor="#6B6B70"
                autoCapitalize="none"
                value={secretCode}
                onChangeText={setSecretCode}
              />
            </Animated.View>
          )}
        </View>

        <TouchableOpacity 
          className="bg-primary rounded-xl py-4 flex-row justify-center items-center"
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text className="text-primary-foreground font-bold text-lg mr-2">
                {mode === 'creator' ? 'Enter Sanctuary' : 'Submit Code'}
              </Text>
              <ChevronRight size={20} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
