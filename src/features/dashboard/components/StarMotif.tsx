/**
 * StarMotif — the Sinulog sunburst texture layered faintly behind the header.
 *
 * Ported from the design's `StarMotif`: 12 petals (every 30°) around a filled
 * center dot and an outline ring, on a 200×200 viewBox. Position + opacity are
 * supplied by the caller via `style` (absolute).
 */

import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

interface StarMotifProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const PETALS = Array.from({ length: 12 }, (_, i) => i * 30);
const PETAL_PATH = 'M0 0 C 16 -11, 30 -11, 70 0 C 30 11, 16 11, 0 0 Z';

export function StarMotif({ size = 220, color = '#DAA520', style }: StarMotifProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={[{ position: 'absolute' }, style]}
      pointerEvents="none"
    >
      <G transform="translate(100, 100)" fill="none" stroke={color} strokeWidth={2.4}>
        {PETALS.map((a) => (
          <Path key={a} d={PETAL_PATH} transform={`rotate(${a})`} />
        ))}
        <Circle r={10} fill={color} stroke="none" />
        <Circle r={22} />
      </G>
    </Svg>
  );
}
