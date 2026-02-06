import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onAnimationComplete,
}) => {
  const [showContent, setShowContent] = React.useState(false);
  const leftDoorAnim = useRef(new Animated.Value(0)).current;
  const rightDoorAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const dotOpacity1 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity2 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Phase 1: Show closed doors for 1.5 seconds
    setTimeout(() => {
      // Phase 2: Open doors
      Animated.parallel([
        Animated.timing(leftDoorAnim, {
          toValue: -width,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smoother bezier curve
        }),
        Animated.timing(rightDoorAnim, {
          toValue: width,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
      ]).start();
    }, 1500);

    // Phase 3: Show content AFTER doors are fully open
    setTimeout(() => {
      setShowContent(true);
      
      // Fade in content
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }).start();
    }, 3000); // 1.5s wait + 1.5s door opening

    // Phase 4: Start pulsing dots
    setTimeout(() => {
      const createDotAnimation = (dotAnim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(dotAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease),
              delay,
            }),
            Animated.timing(dotAnim, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease),
            }),
          ])
        );
      };

      createDotAnimation(dotOpacity1, 0).start();
      createDotAnimation(dotOpacity2, 200).start();
      createDotAnimation(dotOpacity3, 400).start();
    }, 3200);

    // Phase 5: Complete animation and transition
    setTimeout(() => {
      onAnimationComplete();
    }, 5500);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0322" />
      
      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#0A0322', '#1a0b3f', '#0A0322']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Left Door */}
      <Animated.View
        style={[
          styles.door,
          styles.leftDoor,
          {
            transform: [{ translateX: leftDoorAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#1a0b3f', '#0a0322']}
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.doorFrame}>
            <View style={styles.doorInner}>
              <View style={[styles.doorHandle, styles.leftHandle]} />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Right Door */}
      <Animated.View
        style={[
          styles.door,
          styles.rightDoor,
          {
            transform: [{ translateX: rightDoorAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#1a0b3f', '#0a0322']}
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.doorFrame}>
            <View style={styles.doorInner}>
              <View style={[styles.doorHandle, styles.rightHandle]} />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Content - Logo and Text (only render after doors start opening) */}
      {showContent && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.content,
            {
              opacity: contentOpacity,
            },
          ]}
        >
          <Text style={styles.logo}>
            <Text style={styles.logoTA}>TA</Text>
            <Text style={styles.logoPP}>PP</Text>
            <Text style={styles.logoD}>D</Text>
          </Text>
          
          <Text style={styles.tagline}>Your door to endless opportunities</Text>
          
          <View style={styles.dotsContainer}>
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dotOpacity1,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dotOpacity2,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dotOpacity3,
                },
              ]}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0322',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    zIndex: 15,
    position: 'absolute',
  },
  logo: {
    fontSize: 72,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 24,
  },
  logoTA: {
    color: '#FFFFFF',
  },
  logoPP: {
    color: '#C026D3',
  },
  logoD: {
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C026D3',
  },
  door: {
    position: 'absolute',
    width: width / 2,
    height: height,
    top: 0,
    zIndex: 10,
  },
  leftDoor: {
    left: 0,
  },
  rightDoor: {
    right: 0,
  },
  doorFrame: {
    flex: 1,
    margin: 20,
    marginTop: height * 0.15,
    marginBottom: height * 0.15,
    borderWidth: 2,
    borderColor: 'rgba(192, 38, 211, 0.3)',
    borderRadius: 12,
  },
  doorInner: {
    flex: 1,
    margin: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 38, 211, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doorHandle: {
    width: 10,
    height: 60,
    backgroundColor: 'rgba(150, 100, 180, 0.6)',
    borderRadius: 5,
    position: 'absolute',
  },
  leftHandle: {
    right: 30,
  },
  rightHandle: {
    left: 30,
  },
});
