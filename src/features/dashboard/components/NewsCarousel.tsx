/**
 * NewsCarousel — the swipeable, wrap-around Featured-News peek carousel.
 *
 * Faithful port of the design's carousel using RN's built-in Animated +
 * PanResponder (no reanimated/gesture-handler setup needed):
 *  - the active card is centered; neighbors render at scale 0.92 / opacity 0.5
 *  - drag past ±45px advances; it wraps around to cycle
 *  - tapping an inactive card focuses it; a dot jumps to that card
 *  - horizontal drags are claimed only when they out-pace vertical movement, so
 *    the parent vertical scroll still works
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { BrandColors } from '@/core/theme';
import { CARD_WIDTH, NewsCard } from './NewsCard';
import type { NewsItem } from '../data';

const GAP = 14;
const STEP = CARD_WIDTH + GAP;
const THRESHOLD = 45;
const EASE = Easing.bezier(0.22, 0.8, 0.28, 1);

interface NewsCarouselProps {
  items: NewsItem[];
}

export function NewsCarousel({ items }: NewsCarouselProps) {
  const [width, setWidth] = useState(Dimensions.get('window').width);
  const [active, setActive] = useState(0);

  // Side offset that centers the active card, leaving symmetric peeks.
  const SIDE = (width - CARD_WIDTH) / 2;

  const tx = useRef(new Animated.Value(SIDE)).current;
  const sideRef = useRef(SIDE);
  sideRef.current = SIDE;
  const activeRef = useRef(0);
  const movedRef = useRef(false);
  const nRef = useRef(items.length);
  nRef.current = items.length;

  // Resting translateX for a given active index (reads the latest SIDE).
  const restingFor = useRef((a: number) => sideRef.current - a * STEP).current;

  const animateTo = useRef((a: number) => {
    Animated.timing(tx, {
      toValue: restingFor(a),
      duration: 420,
      easing: EASE,
      useNativeDriver: true,
    }).start();
  }).current;

  const goActive = useRef((a: number) => {
    const n = nRef.current;
    const wrapped = ((a % n) + n) % n;
    activeRef.current = wrapped;
    setActive(wrapped);
    animateTo(wrapped);
  }).current;

  // Re-center if the measured viewport width changes.
  useEffect(() => {
    tx.setValue(restingFor(activeRef.current));
  }, [width, tx, restingFor]);

  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 6,
      onPanResponderGrant: () => {
        movedRef.current = false;
      },
      onPanResponderMove: (_e, g) => {
        if (Math.abs(g.dx) > 4) movedRef.current = true;
        tx.setValue(restingFor(activeRef.current) + g.dx);
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dx <= -THRESHOLD) goActive(activeRef.current + 1);
        else if (g.dx >= THRESHOLD) goActive(activeRef.current - 1);
        else animateTo(activeRef.current);
      },
      onPanResponderTerminate: () => animateTo(activeRef.current),
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== width) setWidth(w);
  };

  const handleCardPress = (i: number) => {
    if (movedRef.current) return;
    if (i !== activeRef.current) goActive(i);
    // Tapping the active card opens the article — wired when News exists.
  };

  return (
    <View style={styles.viewport} onLayout={onLayout} {...responder.panHandlers}>
      <Animated.View style={[styles.row, { transform: [{ translateX: tx }] }]}>
        {items.map((item, i) => {
          const center = SIDE - i * STEP; // tx value when card i is centered
          const inputRange = [center - STEP, center, center + STEP];
          const scale = tx.interpolate({
            inputRange,
            outputRange: [0.92, 1, 0.92],
            extrapolate: 'clamp',
          });
          const opacity = tx.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
          });
          // Neighbors hug the active card (origin toward it); active scales from center.
          const transformOrigin =
            i === active ? '50% 50%' : i < active ? '100% 50%' : '0% 50%';
          return (
            <Animated.View
              key={item.title}
              style={[styles.cardWrap, { opacity, transform: [{ scale }], transformOrigin }]}
            >
              <NewsCard item={item} onPress={() => handleCardPress(i)} />
            </Animated.View>
          );
        })}
      </Animated.View>

      <View style={styles.dots}>
        {items.map((item, i) => (
          <Pressable
            key={item.title}
            onPress={() => goActive(i)}
            accessibilityRole="button"
            accessibilityLabel={`News ${i + 1}`}
            hitSlop={6}
            style={[styles.dot, i === active ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    // Full-bleed within the 20px-padded content sheet.
    marginHorizontal: -20,
    marginTop: 2,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
  },
  cardWrap: {
    width: CARD_WIDTH,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    marginTop: 15,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    width: 20,
    backgroundColor: BrandColors.gold,
  },
  dotInactive: {
    width: 7,
    backgroundColor: BrandColors.warmGray,
  },
});
