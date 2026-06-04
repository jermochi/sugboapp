/**
 * Icon — the single-stroke, rounded icon set from the Sugbo design system.
 *
 * Ported from the design handoff's `Icon` (sugbo-ui.jsx) to `react-native-svg`.
 * All glyphs are drawn on a 24×24 viewBox with `currentColor`-style stroking:
 * `stroke`, `fill="none"`, `strokeWidth`, and the round line caps/joins are set
 * on the root <Svg> and inherited by each child, matching the original SVG.
 *
 * Only the glyphs used by the "Meet Giya" home screen are included; extend
 * {@link IconName} and {@link PATHS} together as new screens need more.
 */

import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'search'
  | 'mic'
  | 'plus'
  | 'send'
  | 'chevron'
  | 'clock'
  | 'permit'
  | 'tax'
  | 'report'
  | 'hotline'
  | 'pin'
  | 'help'
  | 'medical'
  | 'seniors'
  | 'document'
  | 'budget'
  | 'keyboard'
  | 'calendar'
  | 'home'
  | 'services'
  | 'news'
  | 'emergency'
  | 'account';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const PATHS: Record<IconName, React.ReactNode> = {
  search: (
    <>
      <Circle cx={11} cy={11} r={7} />
      <Path d="M20 20l-3.5-3.5" />
    </>
  ),
  mic: (
    <>
      <Rect x={9} y={3} width={6} height={11} rx={3} />
      <Path d="M5 11a7 7 0 0014 0M12 18v3" />
    </>
  ),
  plus: <Path d="M12 5v14M5 12h14" />,
  send: <Path d="M4 12l16-7-7 16-2.5-6.5L4 12z" />,
  chevron: <Path d="M9 5l7 7-7 7" />,
  clock: (
    <>
      <Circle cx={12} cy={12} r={8} />
      <Path d="M12 7.5V12l3 2" />
    </>
  ),
  permit: (
    <>
      <Rect x={5} y={3} width={14} height={18} rx={2} />
      <Path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  tax: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M9.7 16.5V8h3a2.4 2.4 0 010 4.8H9.7" />
      <Path d="M8 11.4h6.4M8 13.4h6.4" strokeWidth={1.3} />
    </>
  ),
  report: (
    <>
      <Path d="M6 21V4" />
      <Path d="M6 4.4h11l-2.3 3.6L17 11.6H6" />
    </>
  ),
  hotline: <Path d="M5 4h3l1.6 4-2 1.4a11 11 0 005 5l1.4-2 4 1.6V18a2 2 0 01-2.2 2A15 15 0 015 6.2 2 2 0 015 4z" />,
  pin: (
    <>
      <Path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" />
      <Circle cx={12} cy={10} r={2.5} />
    </>
  ),
  help: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M9.6 9.3a2.5 2.5 0 014.3 1.7c0 1.8-2.1 2-2.1 3.4" />
      <Path d="M11.9 17.4v.01" strokeWidth={1.9} />
    </>
  ),
  medical: <Path d="M9.5 3.5h5v6h6v5h-6v6h-5v-6h-6v-5h6z" />,
  seniors: (
    <>
      <Circle cx={10} cy={4.6} r={2.3} />
      <Path d="M10.6 7.4c-2.2.2-3.5 1.8-3.7 4L6 21" />
      <Path d="M10.6 7.4c1.6.1 2.4 1.2 3 2.6l1.7 3.5" />
      <Path d="M16 13.5V21" strokeWidth={1.5} />
    </>
  ),
  document: (
    <>
      <Path d="M6 3h8l4 4v11a1.5 1.5 0 01-1.5 1.5H6z" />
      <Path d="M14 3v4h4" />
      <Circle cx={12} cy={12.5} r={2.3} />
      <Path d="M10.5 14.4l-1 3.4 2.5-1.4 2.5 1.4-1-3.4" strokeWidth={1.4} />
    </>
  ),
  budget: (
    <>
      <Path d="M4 4v16h16" />
      <Rect x={7.4} y={12} width={2.8} height={5} rx={0.6} />
      <Rect x={12.3} y={9} width={2.8} height={8} rx={0.6} />
      <Rect x={17.2} y={6} width={2.8} height={11} rx={0.6} strokeWidth={1.6} />
    </>
  ),
  calendar: (
    <>
      <Rect x={4} y={5} width={16} height={15} rx={2} />
      <Path d="M4 9.2h16M8 3v4M16 3v4" />
      <Path d="M8.5 13h3M8.5 16.4h6" strokeWidth={1.4} />
    </>
  ),
  keyboard: (
    <>
      <Rect x={2.5} y={6} width={19} height={12} rx={2} />
      <Path
        d="M6 9.5h0M9.5 9.5h0M13 9.5h0M16.5 9.5h0M6 12.8h0M9.5 12.8h0M13 12.8h0M16.5 12.8h0M8 15.6h8"
        strokeWidth={1.7}
      />
    </>
  ),
  home: (
    <>
      <Path d="M4 11l8-7 8 7" />
      <Path d="M6 10v9h12v-9" />
      <Path d="M10 19v-5h4v5" strokeWidth={1.4} />
    </>
  ),
  services: (
    <>
      <Circle cx={7} cy={7} r={2.4} />
      <Circle cx={17} cy={7} r={2.4} />
      <Circle cx={7} cy={17} r={2.4} />
      <Circle cx={17} cy={17} r={2.4} />
    </>
  ),
  news: (
    <>
      <Rect x={4} y={4} width={16} height={16} rx={2} />
      <Path d="M8 9h8M8 13h8M8 17h5" strokeWidth={1.4} />
    </>
  ),
  emergency: (
    <>
      <Path d="M12 4l9 16H3z" />
      <Path d="M12 9v5" strokeWidth={1.7} />
      <Path d="M12 17.5v.01" strokeWidth={2.2} />
    </>
  ),
  account: (
    <>
      <Circle cx={12} cy={8} r={3.5} />
      <Path d="M5 20a7 7 0 0114 0" />
    </>
  ),
};

export function Icon({
  name,
  size = 24,
  color = '#2A2A2A',
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </Svg>
  );
}
