import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme as useSystemColorScheme } from 'react-native';
import { useColorScheme } from 'nativewind';

export default function TestTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const sysColorScheme = useSystemColorScheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>
        NativeWind: {colorScheme}
      </Text>
      <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>
        System: {sysColorScheme}
      </Text>
      
      <TouchableOpacity onPress={() => setColorScheme('light')} style={{ margin: 10, padding: 10, backgroundColor: 'blue' }}>
        <Text style={{color: 'white'}}>Set Light</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setColorScheme('dark')} style={{ margin: 10, padding: 10, backgroundColor: 'blue' }}>
        <Text style={{color: 'white'}}>Set Dark</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setColorScheme('system')} style={{ margin: 10, padding: 10, backgroundColor: 'blue' }}>
        <Text style={{color: 'white'}}>Set System</Text>
      </TouchableOpacity>
    </View>
  );
}
