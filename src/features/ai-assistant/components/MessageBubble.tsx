/**
 * MessageBubble — one chat row. User messages sit right on a gold gradient;
 * Giya's replies sit left on a translucent surface. A pending Giya bubble shows
 * the typing indicator instead of text.
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
}: {
  message: ChatMessage;
  onAction?: (action: ChatAction) => void;
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

  return (
    <View style={[styles.row, styles.rowGiya]}>
      <View style={[styles.bubble, styles.bubbleGiya]}>
        {message.pending ? (
          <TypingIndicator />
        ) : (
          <Text style={[styles.text, styles.textGiya]}>{message.text}</Text>
        )}
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
  bubble: {
    maxWidth: '82%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  bubbleUser: {
    borderBottomRightRadius: 6,
  },
  bubbleGiya: {
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
