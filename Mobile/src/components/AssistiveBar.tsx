import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Image, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { X, FileText, Code } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const PANEL_WIDTH = width * 0.85;

interface AssistiveBarProps {
  activeAttachment: any | null;
  onCloseAttachment: () => void;
}

export default function AssistiveBar({ activeAttachment, onCloseAttachment }: AssistiveBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const translateX = useSharedValue(PANEL_WIDTH);

  const animatedPanelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const togglePanel = () => {
    if (isOpen) {
      translateX.value = withSpring(PANEL_WIDTH, { damping: 18, stiffness: 200 });
      setIsOpen(false);
    } else {
      translateX.value = withSpring(0, { damping: 18, stiffness: 200 });
      setIsOpen(true);
    }
  };

  const closeEntirely = () => {
    if (isOpen) {
      translateX.value = withSpring(PANEL_WIDTH, { damping: 18, stiffness: 200 });
      setIsOpen(false);
    }
    onCloseAttachment();
  };

  // If no attachment is active, render absolutely nothing
  if (!activeAttachment) return null;

  return (
    <>
      {/* Edge Tab Handle (only visible when panel is closed) */}
      {!isOpen && (
        <TouchableOpacity
          onPress={togglePanel}
          style={styles.tab}
          activeOpacity={0.7}
        >
          <View style={styles.tabIndicator} />
          <Text style={styles.tabText} numberOfLines={1}>
            {activeAttachment.filename.slice(0, 3)}
          </Text>
        </TouchableOpacity>
      )}

      {/* Full Attachment Panel */}
      <Animated.View style={[styles.panel, animatedPanelStyle]}>
        <View style={styles.panelHeader}>
          <TouchableOpacity onPress={togglePanel} style={styles.headerBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.panelTitle} numberOfLines={1}>{activeAttachment.filename}</Text>
          <TouchableOpacity onPress={closeEntirely} style={styles.headerBtn}>
            <X size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.panelBody} contentContainerStyle={styles.panelContent}>
          {activeAttachment.filename.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <Image 
              source={{ uri: activeAttachment.public_url }} 
              style={styles.previewImage} 
              resizeMode="contain" 
            />
          ) : (
            <View style={styles.fileFallback}>
              <FileText size={48} color="#71717a" />
              <Text style={styles.fallbackText}>Cannot preview this file type directly in mobile.</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  tab: {
    position: 'absolute',
    right: 0,
    top: '40%',
    width: 32,
    height: 80,
    backgroundColor: '#3b82f6',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  tabIndicator: {
    width: 4,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 2,
    marginBottom: 4,
  },
  tabText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    transform: [{ rotate: '-90deg' }],
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: PANEL_WIDTH,
    height,
    backgroundColor: '#18181b',
    zIndex: 100,
    borderLeftWidth: 1,
    borderLeftColor: '#27272a',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: '#27272a',
    borderBottomWidth: 1,
    borderBottomColor: '#3f3f46',
  },
  headerBtn: { padding: 8 },
  backText: { color: '#60a5fa', fontWeight: 'bold', fontSize: 16 },
  panelTitle: { color: '#fff', fontWeight: '600', fontSize: 16, flex: 1, textAlign: 'center', marginHorizontal: 8 },
  panelBody: { flex: 1 },
  panelContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  fileFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  fallbackText: {
    color: '#71717a',
    fontSize: 15,
    textAlign: 'center',
  }
});
