/**
 * MessageBubble — one chat row. User messages sit right on a gold gradient;
 * Giya's replies sit left on a translucent surface. A pending Giya bubble shows
 * the typing indicator instead of text.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/core/theme';

import type { ChatMessage } from '../store/giyaChatStore';
import { TypingIndicator } from './TypingIndicator';

export function MessageBubble({ message }: { message: ChatMessage }) {
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
});
