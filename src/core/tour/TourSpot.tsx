/**
 * TourSpot — wraps a control so a walkthrough can spotlight it.
 *
 * Renders a non-flattening host `View` (so `measureInWindow` works on Android)
 * and registers it under `id`. Purely a measurement anchor — it doesn't change
 * layout or intercept touches.
 */
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTourTarget } from './TourContext';

interface TourSpotProps {
  id: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function TourSpot({ id, children, style }: TourSpotProps) {
  const ref = useTourTarget(id);
  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}
