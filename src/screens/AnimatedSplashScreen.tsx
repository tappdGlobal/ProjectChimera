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
const DOOR_WIDTH = width / 2;

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onAnimationComplete,
}) => {
  // Door swing animations (0 → 1, then interpolated to rotation degrees)
  const leftDoorProgress = useRef(new Animated.Value(0)).current;
  const rightDoorProgress = useRef(new Animated.Value(0)).current;

  // Content behind doors
  const contentScale = useRef(new Animated.Value(0.6)).current;

  // Text animations
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const welcomeTranslateY = useRef(new Animated.Value(30)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;

  // Dots
  const dotOpacity1 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity2 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity3 = useRef(new Animated.Value(0.3)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  // Sparkles
  const sparkle1Opacity = useRef(new Animated.Value(0)).current;
  const sparkle2Opacity = useRef(new Animated.Value(0)).current;

  // Interpolate door progress to rotation angles
  // Left door: hinged on LEFT edge, right edge swings TOWARD viewer = negative rotateY
  const leftDoorRotation = leftDoorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-85deg'],
  });

  // Right door: hinged on RIGHT edge, left edge swings TOWARD viewer = positive rotateY
  const rightDoorRotation = rightDoorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '85deg'],
  });

  useEffect(() => {
    // ================================================
    // PHASE 1 (0ms - 1300ms): Doors closed.
    // Logo and tagline appear behind doors.
    // ================================================

    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(700),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),
    ]).start();

    // Sparkles
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(sparkle1Opacity, {
        toValue: 0.7,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(900),
      Animated.timing(sparkle2Opacity, {
        toValue: 0.5,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // ================================================
    // PHASE 2 (1300ms): Doors swing TOWARD viewer like pulling real doors open
    // ================================================
    const doorOpenDelay = 1300;
    const doorDuration = 800; // Fast, snappy 800ms swing

    Animated.sequence([
      Animated.delay(doorOpenDelay),
      Animated.parallel([
        // Left door swings toward viewer
        Animated.timing(leftDoorProgress, {
          toValue: 1,
          duration: doorDuration,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic), // Fast start, smooth deceleration
        }),
        // Right door swings toward viewer
        Animated.timing(rightDoorProgress, {
          toValue: 1,
          duration: doorDuration,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        // Content zooms outward as doors open
        Animated.timing(contentScale, {
          toValue: 1,
          duration: doorDuration + 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]),
    ]).start();

    // ================================================
    // PHASE 3: Dots + Welcome text (after doors finish)
    // ================================================
    const afterDoorsOpen = doorOpenDelay + doorDuration;

    Animated.sequence([
      Animated.delay(afterDoorsOpen + 200),
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      const pulseDot = (dotAnim: Animated.Value, delay: number) =>
        Animated.loop(
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

      pulseDot(dotOpacity1, 0).start();
      pulseDot(dotOpacity2, 200).start();
      pulseDot(dotOpacity3, 400).start();
    }, afterDoorsOpen + 400);

    Animated.sequence([
      Animated.delay(afterDoorsOpen + 500),
      Animated.parallel([
        Animated.timing(welcomeOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(welcomeTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),
    ]).start();

    // ================================================
    // PHASE 4: Fade sparkles & complete
    // ================================================
    Animated.sequence([
      Animated.delay(3500),
      Animated.parallel([
        Animated.timing(sparkle1Opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkle2Opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setTimeout(() => {
      onAnimationComplete();
    }, 4500);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0322" />

      {/* Background */}
      <LinearGradient
        colors={['#0A0322', '#1a0b3f', '#0A0322']}
        style={StyleSheet.absoluteFill}
      />

      {/* Content Behind Doors */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.content,
          {
            transform: [{ scale: contentScale }],
          },
        ]}
      >
        {/* Sparkle 1 */}
        <Animated.View
          style={[
            styles.sparkle,
            styles.sparkle1,
            { opacity: sparkle1Opacity },
          ]}
        />

        {/* Sparkle 2 */}
        <Animated.View
          style={[
            styles.sparkle,
            styles.sparkle2,
            { opacity: sparkle2Opacity },
          ]}
        />

        {/* Logo */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <Text style={styles.logo}>
            <Text style={styles.logoT}>T</Text>
            <Text style={styles.logoA}>A</Text>
            <Text style={styles.logoPP}>PP</Text>
            <Text style={styles.logoD}>D</Text>
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={{
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslateY }],
          }}
        >
          <Text style={styles.tagline}>
            <Text style={styles.taglineWhite}>Your door to </Text>
            <Text style={styles.taglinePink}>endless </Text>
            <Text style={styles.taglineWhite}>opportunities</Text>
          </Text>
        </Animated.View>

        {/* Loading Dots */}
        <Animated.View style={[styles.dotsContainer, { opacity: dotsOpacity }]}>
          <Animated.View style={[styles.dot, { opacity: dotOpacity1 }]} />
          <Animated.View style={[styles.dot, { opacity: dotOpacity2 }]} />
          <Animated.View style={[styles.dot, { opacity: dotOpacity3 }]} />
        </Animated.View>

        {/* Welcome Text */}
        <Animated.View
          style={[
            styles.welcomeContainer,
            {
              opacity: welcomeOpacity,
              transform: [{ translateY: welcomeTranslateY }],
            },
          ]}
        >
          <Text style={styles.welcomeText}>WELCOME TO TAPPD</Text>
        </Animated.View>
      </Animated.View>

      {/* Left Door — 3D swing outward, hinged on LEFT edge */}
      <Animated.View
        style={[
          styles.door,
          styles.leftDoor,
          {
            transform: [
              { perspective: 800 },
              // Shift pivot to LEFT edge (move left by half door width)
              { translateX: -(DOOR_WIDTH / 2) },
              // Swing outward
              { rotateY: leftDoorRotation },
              // Shift back
              { translateX: DOOR_WIDTH / 2 },
            ],
          },
        ]}
      >
        <View style={styles.doorBg}>
          <View style={styles.doorFrame}>
            <View style={styles.doorInner}>
              <View style={[styles.doorHandle, styles.leftHandle]} />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Right Door — 3D swing outward, hinged on RIGHT edge */}
      <Animated.View
        style={[
          styles.door,
          styles.rightDoor,
          {
            transform: [
              { perspective: 800 },
              // Shift pivot to RIGHT edge (move right by half door width)
              { translateX: DOOR_WIDTH / 2 },
              // Swing outward
              { rotateY: rightDoorRotation },
              // Shift back
              { translateX: -(DOOR_WIDTH / 2) },
            ],
          },
        ]}
      >
        <View style={styles.doorBg}>
          <View style={styles.doorFrame}>
            <View style={styles.doorInner}>
              <View style={[styles.doorHandle, styles.rightHandle]} />
            </View>
          </View>
        </View>
      </Animated.View>
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
    zIndex: 5,
    position: 'absolute',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 72,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 24,
  },
  logoT: {
    color: '#FFFFFF',
  },
  logoA: {
    color: '#C026D3',
  },
  logoPP: {
    color: '#C026D3',
  },
  logoD: {
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  taglineWhite: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  taglinePink: {
    color: '#C026D3',
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
  welcomeContainer: {
    position: 'absolute',
    bottom: -height * 0.3,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 3,
  },
  sparkle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C026D3',
  },
  sparkle1: {
    top: -30,
    left: -10,
  },
  sparkle2: {
    top: -15,
    right: -20,
  },
  door: {
    position: 'absolute',
    width: DOOR_WIDTH,
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
  doorBg: {
    flex: 1,
    backgroundColor: '#110728',
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
