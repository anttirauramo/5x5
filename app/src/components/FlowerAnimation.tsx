import React, {useEffect, useMemo} from 'react';
import {StyleSheet, useWindowDimensions, Image} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  SharedValue,
  cancelAnimation,
} from 'react-native-reanimated';

const PETAL_COUNT = 50;
const ANIMATION_DURATION = 6000;
const LINGERING_PETALS = 10;

// Pre-require the image so it's only loaded once
const flowerImage = require('../../assets/flower.png');

interface PetalConfig {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  size: number;
  lingers: boolean;
}

function generatePetals(screenWidth: number, screenHeight: number): PetalConfig[] {
  const petals: PetalConfig[] = [];
  for (let i = 0; i < PETAL_COUNT; i++) {
    const lingers = i < LINGERING_PETALS;
    petals.push({
      x: (Math.random() - 0.5) * screenWidth * 0.9,
      y: (Math.random() - 0.5) * screenHeight * 0.8,
      rotation: Math.random() * 360,
      scale: 0.3 + Math.random() * 0.7,
      size: 20 + Math.random() * 30,
      lingers,
    });
  }
  return petals;
}

const FlowerPetal = React.memo(function FlowerPetal({config, progress}: {config: PetalConfig; progress: SharedValue<number>}) {
  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;

    const bloomProgress = interpolate(p, [0, 0.4], [0, 1], 'clamp');
    const spreadProgress = interpolate(p, [0.2, 0.7], [0, 1], 'clamp');
    const flutterProgress = interpolate(p, [0.4, 0.8], [0, 1], 'clamp');
    const fadeProgress = config.lingers
      ? 0
      : interpolate(p, [0.7, 1.0], [0, 1], 'clamp');

    const scale = bloomProgress * config.scale;
    const translateX = config.x * spreadProgress;
    const translateY = config.y * spreadProgress;
    const rotate = config.rotation + flutterProgress * 25;
    const opacity = 1 - fadeProgress;

    return {
      opacity,
      transform: [
        {translateX},
        {translateY},
        {rotate: `${rotate}deg`},
        {scale},
      ],
    };
  });

  return (
    <Animated.View style={[styles.petal, animatedStyle]}>
      <Image source={flowerImage} style={{width: config.size, height: config.size}} />
    </Animated.View>
  );
});

interface Props {
  visible: boolean;
}

export default function FlowerAnimation({visible}: Props) {
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const progress = useSharedValue(0);

  // Petals are generated once and reused across animation runs
  const petals = useMemo(
    () => generatePetals(screenWidth, screenHeight),
    [screenWidth, screenHeight],
  );

  useEffect(() => {
    if (visible) {
      cancelAnimation(progress);
      progress.value = 0.1;
      progress.value = withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      cancelAnimation(progress);
      progress.value = 0;
    }
  }, [visible, progress]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={styles.container} pointerEvents="none">
      {petals.map((petal, index) => (
        <FlowerPetal key={index} config={petal} progress={progress} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  petal: {
    position: 'absolute',
  },
});
