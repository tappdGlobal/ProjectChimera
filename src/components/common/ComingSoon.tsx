import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, GRADIENT_COLORS } from '../../styles/Theme';
import { LinearGradient } from 'expo-linear-gradient';

interface ComingSoonProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Helper to satisfy expo-linear-gradient tuple typing
 * WITHOUT touching Theme.ts
 */
const asGradient = (
  colors: string[]
): readonly [ColorValue, ColorValue, ...ColorValue[]] => {
  return colors as unknown as readonly [
    ColorValue,
    ColorValue,
    ...ColorValue[]
  ];
};

const ComingSoon: React.FC<ComingSoonProps> = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close */}
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Ionicons
              name="close"
              size={22}
              color={Theme.colors.mutedForeground}
            />
          </TouchableOpacity>

          {/* Icon/Emoji */}
          <View style={styles.centerContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.emoji}>🚀✨</Text>
            </View>

            <Text style={styles.title}>Coming Soon</Text>
            
            <Text style={styles.message}>
              We're working hard to bring you this amazing feature! Stay tuned for updates. 
              {"\n\n"}
              Something exciting is on the way! 💫
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity 
            activeOpacity={0.85} 
            onPress={onClose}
          >
            <LinearGradient
              colors={asGradient(GRADIENT_COLORS.primaryHover)}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Got it!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.l,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  closeIcon: {
    position: "absolute",
    top: Theme.spacing.m,
    right: Theme.spacing.m,
    zIndex: 10,
  },
  centerContent: {
    alignItems: "center",
    marginVertical: Theme.spacing.l,
    width: "100%",
  },
  iconContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 50,
  },
  emoji: {
    fontSize: 50,
  },
  title: {
    color: Theme.colors.foreground,
    fontSize: 20,
    fontWeight: Theme.fontWeights.medium,
    marginBottom: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  message: {
    color: Theme.colors.mutedForeground,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  primaryButton: {
    width: '100%',
    minWidth: 150,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Theme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: Theme.fontWeights.medium,
  },
});

export default ComingSoon;
