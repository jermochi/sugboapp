/**
 * RadialGlow — a soft radial-gradient blob used as warm decorative glow.
 *
 * Replaces the design's CSS `radial-gradient(circle, <color> a%, transparent b%)`
 * decorations (gold glows behind the Ask Giya button, survey CTA, header).
 * Render it absolutely-positioned inside an `overflow: 'hidden'` parent.
 */

import React, { useId } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface RadialGlowProps {
  /** Diameter of the glow circle in px. */
  size: number;
  /** Base color (alpha applied via the stops). */
  color: string;
  /** Opacity at the center. */
  innerOpacity?: number;
  /** 0–1 offset where the glow fully fades to transparent. */
  edge?: number;
  /** Absolute positioning (top/left/right/bottom). */
  style?: StyleProp<ViewStyle>;
}

export function RadialGlow({
  size,
  color,
  innerOpacity = 0.55,
  edge = 0.66,
  style,
}: RadialGlowProps) {
  // useId() can contain ':' which is invalid in SVG id references — strip it.
  const id = `glow-${useId().replace(/:/g, '')}`;
  return (
    <Svg
      width={size}
      height={size}
      style={[{ position: 'absolute' }, style]}
      pointerEvents="none"
    >
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset={0} stopColor={color} stopOpacity={innerOpacity} />
          <Stop offset={edge} stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
    </Svg>
  );
}
