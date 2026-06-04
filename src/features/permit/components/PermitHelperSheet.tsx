/**
 * PermitHelperSheet — the wired "?" helper. Suggested prompts + free text;
 * answers come from askPermitHelper (Gemini online, grounded fallback offline).
 */
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/core/components';
import type { PermitProfile, PermitStep } from '@/core/models/permit';
import { BorderRadius, BrandColors, Spacing } from '@/core/theme';

import { askPermitHelper } from '../services/permitHelper';

const SUGGESTED = ['What is this?', 'Why do I have this step?', 'What do I need to bring?'];

export function PermitHelperSheet({
  visible,
  step,
  profile,
  onClose,
}: {
  visible: boolean;
  step: PermitStep | null;
  profile: PermitProfile;
  onClose: () => void;
}) {
  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Reset each time the sheet opens (possibly for a different step).
  React.useEffect(() => {
    if (visible) {
      setQuestion('');
      setAnswer('');
      setLoading(false);
    }
  }, [visible, step]);

  const ask = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed || loading) return;
    setQuestion(trimmed);
    setLoading(true);
    setAnswer('');
    const reply = await askPermitHelper(trimmed, step, profile);
    setAnswer(reply);
    setLoading(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close helper"
      />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <ThemedText type="subtitle" color={BrandColors.charcoal} style={styles.heading}>
          {step ? step.title : 'Ask about this permit'}
        </ThemedText>
        <ThemedText type="caption" color={BrandColors.muted}>
          Grounded in this step’s official details.
        </ThemedText>

        <View style={styles.suggestions}>
          {SUGGESTED.map((suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => ask(suggestion)}
              accessibilityRole="button"
              accessibilityLabel={suggestion}
              style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
            >
              <ThemedText type="caption" color={BrandColors.crimson}>
                {suggestion}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={styles.answerBox}>
          {loading ? (
            <ActivityIndicator color={BrandColors.crimson} />
          ) : answer ? (
            <ScrollView>
              <ThemedText type="bodySmall" color={BrandColors.charcoal}>
                {answer}
              </ThemedText>
            </ScrollView>
          ) : (
            <ThemedText type="bodySmall" color={BrandColors.muted}>
              Pick a question above or type your own.
            </ThemedText>
          )}
        </View>

        <View style={styles.inputRow}>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Type a question…"
            placeholderTextColor={BrandColors.muted}
            style={styles.input}
            onSubmitEditing={() => ask(question)}
            returnKeyType="send"
            editable={!loading}
          />
          <Pressable
            onPress={() => ask(question)}
            disabled={!question.trim() || loading}
            accessibilityRole="button"
            accessibilityLabel="Ask"
            style={({ pressed }) => [
              styles.askButton,
              (!question.trim() || loading) && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <ThemedText type="caption" color={BrandColors.white}>
              Ask
            </ThemedText>
          </Pressable>
        </View>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
        >
          <ThemedText type="caption" color={BrandColors.muted}>
            Close
          </ThemedText>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    backgroundColor: BrandColors.white,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: BrandColors.warmGray,
    marginBottom: Spacing.sm,
  },
  heading: {
    fontWeight: '700',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  chip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
  },
  answerBox: {
    minHeight: 96,
    maxHeight: 220,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: BrandColors.paper,
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
    paddingHorizontal: Spacing.md,
    color: BrandColors.charcoal,
    fontSize: 15,
  },
  askButton: {
    minHeight: 44,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.crimson,
  },
  disabled: {
    opacity: 0.5,
  },
  closeButton: {
    alignSelf: 'center',
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  pressed: {
    opacity: 0.72,
  },
});
