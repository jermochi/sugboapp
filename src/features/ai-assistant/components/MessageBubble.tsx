/**
 * MessageBubble — one chat row. User messages sit right on a gold gradient;
 * Giya's replies sit left on a translucent surface. A pending Giya bubble shows
 * the typing indicator. A Giya reply may carry tappable clarification chips
 * (options); a standalone deep-link message renders as a gold button (action).
 * In both cases the user taps to act — Giya never auto-redirects.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/core/components';
import { BrandColors, Fonts } from '@/core/theme';

import type { ChatAction, ChatMessage } from '../store/giyaChatStore';
import { TypingIndicator } from './TypingIndicator';

export function MessageBubble({
  message,
  onAction,
  onChoose,
}: {
  message: ChatMessage;
  onAction?: (action: ChatAction) => void;
  onChoose?: (option: string) => void;
}) {
  const isUser = message.role === 'user';

  // A deep-link message renders as a tappable button rather than a text bubble.
  if (message.action) {
    return <ActionChip action={message.action} onPress={onAction} />;
  }

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
            <Text style={styles.optionsHint}>TAP TO CHOOSE</Text>
            <View style={styles.optionRow}>
              {options.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => onChoose?.(option)}
                  accessibilityRole="button"
                  accessibilityLabel={option}
                  style={({ pressed }) => [styles.choiceChip, pressed && styles.choiceChipPressed]}
                >
                  <Text style={styles.choiceText}>{option}</Text>
                  <Text style={styles.choiceChevron}>›</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** A gold pill button that sits on Giya's side and deep-links into the app. */
function ActionChip({
  action,
  onPress,
}: {
  action: ChatAction;
  onPress?: (action: ChatAction) => void;
}) {
  return (
    <View style={[styles.row, styles.rowGiya]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={action.label}
        onPress={() => onPress?.(action)}
        style={({ pressed }) => [styles.actionWrap, pressed && styles.actionPressed]}
      >
        <LinearGradient
          colors={['#ffd98a', BrandColors.gold, '#b8860b']}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.actionChip}
        >
          {action.icon ? (
            <Icon name={action.icon} size={17} color="#7c0d0d" strokeWidth={2} />
          ) : null}
          <Text style={styles.actionLabel} numberOfLines={2}>
            {action.label}
          </Text>
          <Icon name="chevron" size={16} color="#7c0d0d" strokeWidth={2.4} />
        </LinearGradient>
      </Pressable>
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
    width: '100%',
    gap: 6,
  },
  optionsHint: {
    fontFamily: Fonts.bodyBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
    color: 'rgba(255,221,150,0.72)',
    marginLeft: 4,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: 'rgba(255,221,150,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,221,150,0.55)',
  },
  choiceChipPressed: {
    opacity: 0.78,
    backgroundColor: 'rgba(255,221,150,0.22)',
  },
  choiceText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13.5,
    color: '#FFE7B8',
  },
  choiceChevron: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    lineHeight: 16,
    color: 'rgba(255,221,150,0.85)',
    marginTop: -1,
  },
  actionWrap: {
    maxWidth: '82%',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionPressed: {
    opacity: 0.82,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  actionLabel: {
    flexShrink: 1,
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: '#7c0d0d',
    letterSpacing: 0.2,
  },
});
