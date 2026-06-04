/**
 * MessageBubble — one chat row. User messages sit right on a gold gradient;
 * Giya's replies sit left on a translucent surface. A pending Giya bubble shows
 * the typing indicator. A Giya reply may also carry tappable clarification chips
 * and/or a gold "Go to …" button (the user taps to navigate — no auto-redirect).
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandColors, Fonts } from '@/core/theme';

import type { ChatMessage, RouteAction } from '../store/giyaChatStore';
import { TypingIndicator } from './TypingIndicator';

export function MessageBubble({
  message,
  onChoose,
  onRoute,
}: {
  message: ChatMessage;
  onChoose?: (option: string) => void;
  onRoute?: (action: RouteAction) => void;
}) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={[styles.row, styles.rowUser]}>
        <LinearGradient
          colors={['rgba(255,221,150,0.96)', 'rgba(218,165,32,0.92)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.bubbleUser]}
        >
          {message.transcribing ? (
            <TypingIndicator color="#7c0d0d" />
          ) : (
            <Text style={[styles.text, styles.textUser]}>{message.text}</Text>
          )}
        </LinearGradient>
      </View>
    );
  }

  const options = message.options ?? [];
  const routeAction = message.routeAction;

  return (
    <View style={[styles.row, styles.rowGiya]}>
      <View style={styles.giyaColumn}>
        <View style={[styles.bubble, styles.bubbleGiya]}>
          {message.pending ? (
            <TypingIndicator />
          ) : (
            <Text style={[styles.text, styles.textGiya]}>{message.text}</Text>
          )}
        </View>

        {options.length > 0 ? (
          <View style={styles.options}>
            {options.map((option) => (
              <Pressable
                key={option}
                onPress={() => onChoose?.(option)}
                accessibilityRole="button"
                accessibilityLabel={option}
                style={({ pressed }) => [styles.choiceChip, pressed && styles.pressed]}
              >
                <Text style={styles.choiceText}>{option}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {routeAction ? (
          <Pressable
            onPress={() => onRoute?.(routeAction)}
            accessibilityRole="button"
            accessibilityLabel={`Go to ${routeAction.label}`}
            style={({ pressed }) => [styles.routeButton, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={['#ffd98a', BrandColors.gold, '#b8860b']}
              locations={[0, 0.6, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.routeGradient}
            >
              <Text style={styles.routeText}>{`Go to ${routeAction.label}`}</Text>
              <Text style={styles.routeArrow}>→</Text>
            </LinearGradient>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    marginBottom: 10,
    flexDirection: 'row',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowGiya: {
    justifyContent: 'flex-start',
  },
  giyaColumn: {
    maxWidth: '86%',
    alignItems: 'flex-start',
    gap: 8,
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  bubbleUser: {
    maxWidth: '82%',
    borderBottomRightRadius: 6,
  },
  bubbleGiya: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,236,196,0.24)',
    borderBottomLeftRadius: 6,
  },
  text: {
    fontFamily: Fonts.body,
    fontSize: 14.5,
    lineHeight: 20,
  },
  textUser: {
    color: '#5a0b0b',
  },
  textGiya: {
    color: '#FFF3E0',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,236,196,0.30)',
  },
  choiceText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13.5,
    color: '#FFE7B8',
  },
  routeButton: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  routeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  routeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: '#7c0d0d',
  },
  routeArrow: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: '#7c0d0d',
  },
  pressed: {
    opacity: 0.78,
  },
});
