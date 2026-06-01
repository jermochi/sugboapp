/**
 * AIHelperButton — the small floating "?" button for in-context AI help.
 *
 * Shell only — no AI logic. The AI module (M1) will wire the onPress
 * to open the helper sheet with the provided context.
 */

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { AppColors, BorderRadius, Spacing } from '@/core/theme';

interface AIHelperButtonProps {
  /** Context string passed to the AI when opened (e.g. "transparency:sector:infra") */
  context?: string;
  /** Called when pressed — M1 will provide the real implementation */
  onPress?: (context?: string) => void;
}

export function AIHelperButton({ context, onPress }: AIHelperButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={() => onPress?.(context)}
      accessibilityLabel="Ask AI for help"
      accessibilityRole="button"
    >
      <ThemedText type="button" color="#FFFFFF" style={styles.text}>
        ?
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  text: {
    fontSize: 22,
    fontWeight: '700',
  },
});
