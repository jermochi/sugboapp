/**
 * TourOverlay — the spotlight + coaching tooltip for the active walkthrough.
 *
 * Rendered once near the app root (above the navigator). When a tour is active
 * it dims the screen, cuts a rounded "spotlight" hole over the current target,
 * pulses a ring around it, and floats a tooltip with guidance and Back / Next /
 * Skip controls. The dimmed area is touch-locked so the user can only advance
 * (hybrid: tap the highlighted target OR Next), making it clear they're being
 * walked through a feature. Includes a global "Don't show walkthroughs" opt-out.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';

import { BrandColors, Fonts } from '@/core/theme';
import { useTour } from './TourContext';
import type { TargetRect } from './types';

const TOOLTIP_MAX_W = 360;
const HOLE_RADIUS = 14;
const TOOLTIP_GAP = 14;

export function TourOverlay() {
  const { isActive, step, stepIndex, stepCount, activeTour, measure, next, back, skip, disableAll } =
    useTour();
  const insets = useSafeAreaInsets();
  const overlayRef = useRef<View>(null);
  const [dims, setDims] = useState(() => Dimensions.get('window'));
  // The overlay's own window box, so target rects can be made overlay-relative.
  // Without this the spotlight is offset by the overlay's origin (status bar /
  // safe-area), which is exactly the misalignment seen on device.
  const [box, setBox] = useState({ ox: 0, oy: 0, w: 0, h: 0 });
  const [rect, setRect] = useState<TargetRect | null>(null);
  const [tooltipH, setTooltipH] = useState(170);

  const pulse = useSharedValue(0);

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setDims(window));
    return () => sub.remove();
  }, []);

  // Drive the pulse ring while a tour is active.
  useEffect(() => {
    if (!isActive) return;
    pulse.value = 0;
    pulse.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [isActive, pulse]);

  // Measure the overlay's window box + the current target (with retries — layout
  // may not be ready), then express the target relative to the overlay origin.
  const targetId = step?.targetId;
  useEffect(() => {
    if (!isActive) return;
    let cancelled = false;
    let tries = 0;
    const attempt = () => {
      const ov = overlayRef.current;
      if (!ov) {
        if (!cancelled && tries++ < 8) setTimeout(attempt, 90);
        return;
      }
      ov.measureInWindow((ox, oy, ow, oh) => {
        if (cancelled) return;
        if (ow > 0) setBox({ ox, oy, w: ow, h: oh });
        if (!targetId) {
          setRect(null);
          return;
        }
        measure(targetId, (r) => {
          if (cancelled) return;
          if (r && r.width > 0) {
            setRect({ x: r.x - ox, y: r.y - oy, width: r.width, height: r.height });
          } else if (tries++ < 8) {
            setTimeout(attempt, 90);
          } else {
            setRect(null);
          }
        });
      });
    };
    attempt();
    return () => {
      cancelled = true;
    };
  }, [isActive, targetId, stepIndex, dims, measure]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.5,
    transform: [{ scale: 1 + pulse.value * 0.04 }],
  }));

  if (!isActive || !step) return null;

  const W = box.w || dims.width;
  const H = box.h || dims.height;
  const pad = step.padding ?? 8;
  // Clamp the spotlight (and a 3px margin for the pulse ring) inside the screen
  // so full-width highlights never bleed off either edge.
  const M = 3;
  const hole = rect
    ? (() => {
        const x0 = Math.max(M, rect.x - pad);
        const y0 = Math.max(M, rect.y - pad);
        const x1 = Math.min(W - M, rect.x + rect.width + pad);
        const y1 = Math.min(H - M, rect.y + rect.height + pad);
        return { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) };
      })()
    : null;

  // Decide tooltip vertical placement around the hole.
  const tooltipW = Math.min(W - 32, TOOLTIP_MAX_W);
  const tooltipLeft = (W - tooltipW) / 2;
  let tooltipTop: number;
  if (hole) {
    const below = hole.y + hole.h + TOOLTIP_GAP;
    const above = hole.y - tooltipH - TOOLTIP_GAP;
    const preferTop = step.placement === 'top';
    const fitsBelow = below + tooltipH <= H - insets.bottom - 12;
    const fitsAbove = above >= insets.top + 12;
    if (preferTop && fitsAbove) tooltipTop = above;
    else if (fitsBelow) tooltipTop = below;
    else if (fitsAbove) tooltipTop = above;
    else tooltipTop = (H - tooltipH) / 2;
  } else {
    tooltipTop = (H - tooltipH) / 2;
  }
  tooltipTop = Math.min(Math.max(tooltipTop, insets.top + 12), H - tooltipH - insets.bottom - 12);

  const isLast = stepIndex >= stepCount - 1;

  return (
    <View ref={overlayRef} style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Visual dim with a spotlight hole. */}
      <Svg width={W} height={H} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <Mask id="tour-hole">
            <Rect x={0} y={0} width={W} height={H} fill="#fff" />
            {hole ? (
              <Rect x={hole.x} y={hole.y} width={hole.w} height={hole.h} rx={HOLE_RADIUS} ry={HOLE_RADIUS} fill="#000" />
            ) : null}
          </Mask>
        </Defs>
        <Rect x={0} y={0} width={W} height={H} fill="rgba(18,10,6,0.76)" mask="url(#tour-hole)" />
      </Svg>

      {/* Full-screen touch lock (taps outside the target do nothing). */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => {}} />

      {/* Pulsing ring + tap-to-advance over the target. */}
      {hole ? (
        <>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ring,
              { left: hole.x - 2, top: hole.y - 2, width: hole.w + 4, height: hole.h + 4 },
              pulseStyle,
            ]}
          />
          <Pressable
            onPress={next}
            accessibilityRole="button"
            accessibilityLabel="Continue walkthrough"
            style={{ position: 'absolute', left: hole.x, top: hole.y, width: hole.w, height: hole.h, borderRadius: HOLE_RADIUS }}
          />
        </>
      ) : null}

      {/* Coaching tooltip. */}
      <View
        style={[styles.tooltip, { width: tooltipW, left: tooltipLeft, top: tooltipTop }]}
        onLayout={(e) => setTooltipH(e.nativeEvent.layout.height)}
      >
        <View style={styles.headerRow}>
          <View style={styles.namePill}>
            <Text style={styles.nameText}>{activeTour?.name} walkthrough</Text>
          </View>
          <Pressable onPress={skip} hitSlop={10} accessibilityRole="button" accessibilityLabel="Skip walkthrough">
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.body}>{step.body}</Text>

        <View style={styles.footerRow}>
          <View style={styles.dots}>
            {Array.from({ length: stepCount }, (_, i) => (
              <View key={i} style={[styles.dot, i === stepIndex && styles.dotActive]} />
            ))}
          </View>
          <View style={styles.navBtns}>
            {stepIndex > 0 ? (
              <Pressable onPress={back} hitSlop={8} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Previous step">
                <Text style={styles.backText}>Back</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={next} style={styles.nextBtn} accessibilityRole="button" accessibilityLabel={isLast ? 'Finish walkthrough' : 'Next step'}>
              <Text style={styles.nextText}>{isLast ? 'Got it' : 'Next'}</Text>
            </Pressable>
          </View>
        </View>

        <Pressable onPress={disableAll} hitSlop={6} style={styles.optOut} accessibilityRole="button" accessibilityLabel="Turn off all walkthroughs">
          <Text style={styles.optOutText}>Don&apos;t show walkthroughs</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderRadius: HOLE_RADIUS + 2,
    borderWidth: 2.5,
    borderColor: BrandColors.gold,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: BrandColors.white,
    borderRadius: 18,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  namePill: {
    backgroundColor: BrandColors.softGold,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  nameText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.3,
    color: BrandColors.garnet,
    textTransform: 'uppercase',
  },
  skipText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: BrandColors.muted,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: BrandColors.charcoal,
    marginTop: 2,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: BrandColors.charcoal,
  },
  footerRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BrandColors.warmGray,
  },
  dotActive: {
    width: 18,
    backgroundColor: BrandColors.crimson,
  },
  navBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: BrandColors.muted,
  },
  nextBtn: {
    backgroundColor: BrandColors.crimson,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 22,
  },
  nextText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: BrandColors.white,
  },
  optOut: {
    alignSelf: 'center',
    paddingTop: 4,
  },
  optOutText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: BrandColors.muted,
    textDecorationLine: 'underline',
  },
});
