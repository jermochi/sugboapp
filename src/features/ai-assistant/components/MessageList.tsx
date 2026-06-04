/**
 * MessageList — the scrollable conversation, pinned to the latest message.
 */

import React, { useRef } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import type { ChatMessage, RouteAction } from '../store/giyaChatStore';
import { MessageBubble } from './MessageBubble';

export function MessageList({
  messages,
  onChoose,
  onRoute,
}: {
  messages: ChatMessage[];
  onChoose?: (option: string) => void;
  onRoute?: (action: RouteAction) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
    >
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} onChoose={onChoose} onRoute={onRoute} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
});
