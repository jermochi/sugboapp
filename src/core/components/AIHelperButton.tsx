/**
 * AIHelperButton — the small floating Giya helper button for in-context AI help.
 *
 * Shows Giya's face (zoomed in). Tapping calls onPress (the screen wires it to
 * open a helper sheet). An optional `hint` shows a brief speech-bubble on mount,
 * then fades — a low-clutter, conversational nudge.
 */

import React from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';

import { BorderRadius, BrandColors, Spacing } from '@/core/theme';
import { useTourTarget } from '@/core/tour/TourContext';
import { ThemedText } from './ThemedText';

const GIYA_HEAD = require('../../../assets/images/giya-head.png');

const SIZE = 56;
// giya-head.png is ~338×200; oversize it so the face fills the circular button.
const IMG_W = SIZE * 1.7;
const IMG_H = IMG_W * (200 / 338);

interface AIHelperButtonProps {
  /** Context string passed to the AI when opened (e.g. "permit"). */
  context?: string;
  /** Called when pressed — the screen opens the relevant helper sheet. */
  onPress?: (context?: string) => void;
  /** Optional conversational hint shown briefly on mount, then faded out. */
  hint?: string;
  /** Optional walkthrough target id so a tour can spotlight this button. */
  tourId?: string;
}

export function AIHelperButton({ context, onPress, hint, tourId }: AIHelperButtonProps) {
  const fade = React.useRef(new Animated.Value(0)).current;
  const [hintShown, setHintShown] = React.useState(Boolean(hint));
  const tourRef = useTourTarget(tourId ?? '');

  React.useEffect(() => {
    if (!hint) return;
    setHintShown(true);
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setHintShown(false);
      });
    }, 4000);
    return () => clearTimeout(timer);
  }, [hint, fade]);

  return (
    <View ref={tourRef} collapsable={false} style={styles.wrap} pointerEvents="box-none">
      {hint && hintShown ? (
        <Animated.View style={[styles.hintBubble, { opacity: fade }]} pointerEvents="none">
          <ThemedText type="caption" color={BrandColors.charcoal} style={styles.hintText}>
            {hint}
          </ThemedText>
        </Animated.View>
      ) : null}
      <Pressable
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}
        onPress={() => onPress?.(context)}
        accessibilityLabel={hint ?? 'Ask Giya for help'}
        accessibilityRole="button"
      >
        <Image source={GIYA_HEAD} resizeMode="contain" style={styles.face} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  hintBubble: {
    maxWidth: 220,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)',
  },
  hintText: {
    fontWeight: '600',
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: 'hidden',
    backgroundColor: BrandColors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BrandColors.white,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
  },
  face: {
    width: IMG_W,
    height: IMG_H,
    // Nudge up slightly to frame Giya's face inside the circle.
    transform: [{ translateY: -IMG_H * 0.06 }],
  },
});
