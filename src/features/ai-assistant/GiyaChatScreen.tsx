/**
 * GiyaChatScreen — the Giya conversational assistant (voice-first).
 *
 * The welcome state leads with a large mic button under the greeting; tapping
 * "Type instead" reveals the text composer in the bottom bar. Once a
 * conversation starts, messages fill the screen and the input docks to the
 * bottom. Voice and text both route through the chat store / route_to_service.
 */

import { Icon, type IconName } from '@/core/components';
import { goBack } from '@/core/routing';
import { useConnectivityStore } from '@/core/services/connectivityService';
import { BrandColors, Fonts } from '@/core/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { MessageList } from './components/MessageList';
import { useVoiceCapture } from './hooks/useVoiceCapture';
import { useGiyaChatStore } from './store/giyaChatStore';

const GIYA_HEAD = require('../../../assets/images/giya-head.png');

function GiyaBackground() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#FFF8EC', '#F7E8CF', '#EED4A7']}
        locations={[0, 0.58, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="giya-screen-glow" cx="50%" cy="30%" r="72%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.72} />
            <Stop offset="48%" stopColor="#F6DCA9" stopOpacity={0.2} />
            <Stop offset="100%" stopColor="#F6DCA9" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="giya-screen-vignette" cx="50%" cy="36%" r="78%">
            <Stop offset="38%" stopColor="#FFFFFF" stopOpacity={0} />
            <Stop offset="74%" stopColor="#8D5E1E" stopOpacity={0.34} />
            <Stop offset="100%" stopColor="#3F2108" stopOpacity={0.58} />
          </RadialGradient>
          <RadialGradient id="giya-corner-depth" cx="50%" cy="100%" r="84%">
            <Stop offset="0%" stopColor="#5E3410" stopOpacity={0.42} />
            <Stop offset="48%" stopColor="#8D5E1E" stopOpacity={0.18} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#giya-screen-glow)" />
        <Rect width="100%" height="100%" fill="url(#giya-corner-depth)" />
        <Rect width="100%" height="100%" fill="url(#giya-screen-vignette)" />
      </Svg>
    </View>
  );
}

function ChromeButton({
  icon,
  label,
  onPress,
  rotate,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  rotate?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.chromeButton, pressed && styles.pressed]}
    >
      <View style={rotate ? { transform: [{ rotate: `${rotate}deg` }] } : undefined}>
        <Icon name={icon} size={19} color="#2A2A2A" strokeWidth={2} />
      </View>
    </Pressable>
  );
}

function GiyaPortrait({ size = 190 }: { size?: number }) {
  const float = useRef(new Animated.Value(0)).current;
  const halo = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2750,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2750,
          useNativeDriver: true,
        }),
      ]),
    );
    const haloLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(halo, {
          toValue: 1,
          duration: 2250,
          useNativeDriver: true,
        }),
        Animated.timing(halo, {
          toValue: 0,
          duration: 2250,
          useNativeDriver: true,
        }),
      ]),
    );

    floatLoop.start();
    haloLoop.start();
    return () => {
      floatLoop.stop();
      haloLoop.stop();
    };
  }, [float, halo]);

  const imageWidth = size * 1.5;
  const imageHeight = imageWidth * (200 / 338);

  return (
    <Animated.View
      style={[
        styles.portrait,
        {
          width: size,
          height: size,
          transform: [
            {
              translateY: float.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -8],
              }),
            },
          ],
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.portraitHalo,
          {
            inset: -size * 0.28,
            transform: [
              {
                scale: halo.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.07],
                }),
              },
            ],
            opacity: halo.interpolate({
              inputRange: [0, 1],
              outputRange: [0.85, 1],
            }),
          },
        ]}
      />
      <View style={styles.portraitFrame}>
        <LinearGradient
          colors={['#FFF8EC', '#F1D8A6', '#D7A53D']}
          locations={[0, 0.55, 1]}
          start={{ x: 0.5, y: 0.25 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Image
          source={GIYA_HEAD}
          resizeMode="contain"
          style={[
            styles.portraitImage,
            {
              width: imageWidth,
              height: imageHeight,
              left: size * 0.5 - imageWidth * 0.53,
              top: size * 0.5 - imageHeight * 0.56,
            },
          ]}
        />
        <View style={styles.portraitSheen} pointerEvents="none" />
      </View>
    </Animated.View>
  );
}

function ComposerButton({
  icon,
  label,
  onPress,
  active,
  disabled,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.composerButton,
        active && styles.composerButtonActive,
        (pressed || disabled) && styles.pressed,
      ]}
    >
      <Icon
        name={icon}
        size={18}
        color="#fff"
        strokeWidth={2}
      />
    </Pressable>
  );
}

/** The primary voice button — a large gold mic that pulses red while recording. */
function VoiceMic({
  recording,
  onPress,
}: {
  recording: boolean;
  onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!recording) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [recording, pulse]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={recording ? 'Stop recording' : 'Speak'}
      style={({ pressed }) => [styles.voiceMicWrap, pressed && styles.pressed]}
    >
      {recording && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.voiceMicPulse,
            {
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
              transform: [
                { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) },
              ],
            },
          ]}
        />
      )}
      <LinearGradient
        colors={
          recording
            ? ['#ff6b6b', '#d72631', '#a01722']
            : [BrandColors.crimsonBright, BrandColors.crimson, BrandColors.crimsonDeep]
        }
        locations={[0, 0.6, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.voiceMicGradient}
      >
        <Icon name="mic" size={40} color="#fff" strokeWidth={2} />
      </LinearGradient>
    </Pressable>
  );
}

export default function GiyaChatScreen() {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');

  const messages = useGiyaChatStore((s) => s.messages);
  const status = useGiyaChatStore((s) => s.status);
  const sendText = useGiyaChatStore((s) => s.sendText);
  const followAction = useGiyaChatStore((s) => s.followAction);
  const reset = useGiyaChatStore((s) => s.reset);
  const isOnline = useConnectivityStore((s) => s.isOnline);
  const voice = useVoiceCapture();

  const hasConversation = messages.length > 0;
  const isThinking = status === 'thinking';
  const isRecording = voice.isRecording;

  // Leaving the chat ends the session \u2014 start fresh next time.
  useEffect(() => reset, [reset]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || isThinking) return;
    setDraft('');
    void sendText(text);
  };

  const handleMic = () => {
    if (isThinking || voice.isBusy) return;
    voice.toggle();
  };

  const offlineNote = !isOnline ? (
    <Text style={styles.offlineNote}>{'Offline · basic routing only'}</Text>
  ) : null;

  const voiceDock = (
    <View style={styles.voiceDock}>
      <Text style={styles.voiceHint}>
        {isRecording
          ? 'Listening… tap to stop'
          : voice.isBusy
            ? 'Got it — one sec…'
            : isThinking
              ? 'Giya is thinking…'
              : 'Tap to speak'}
      </Text>
      <VoiceMic recording={isRecording} onPress={handleMic} />
      <Pressable
        onPress={() => setInputMode('text')}
        disabled={isRecording || voice.isBusy}
        accessibilityRole="button"
        accessibilityLabel="Type instead"
        style={({ pressed }) => [
          styles.keyboardToggle,
          (pressed || isRecording || voice.isBusy) && styles.pressed,
        ]}
      >
        <Icon name="keyboard" size={18} color="#fff" strokeWidth={2} />
        <Text style={styles.keyboardToggleLabel}>Type instead</Text>
      </Pressable>
    </View>
  );

  // The big mic lives up in the hero on the welcome screen; once a conversation
  // starts (or the user switches to typing) it moves to the bottom bar.
  const showBottomBar = inputMode === 'text' || hasConversation;

  return (
    <View style={styles.root}>
      <GiyaBackground />
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.topChrome, { paddingTop: insets.top + 4 }]}>
          <ChromeButton icon="chevron" label="Back" rotate={180} onPress={goBack} />
          <Text style={styles.title}>Chat with Giya</Text>
          <ChromeButton
            icon="plus"
            label="New chat"
            onPress={hasConversation ? reset : undefined}
          />
        </View>

        {hasConversation ? (
          <MessageList
            messages={messages}
            onAction={followAction}
            onChoose={(option) => void sendText(option)}
          />
        ) : (
          <View style={styles.hero}>
            <GiyaPortrait />
            <View style={styles.greeting}>
              <Text style={styles.headline}>{'How Can I Help\nYou Today?'}</Text>
              <Text style={styles.subtitle}>{'Ako si Giya \u00b7 Ask me anything'}</Text>
            </View>
            {inputMode === 'voice' && (
              <View style={styles.heroDock}>
                {offlineNote}
                {voiceDock}
              </View>
            )}
          </View>
        )}

        {showBottomBar && (
          <View style={[styles.composerWrap, { paddingBottom: Math.max(insets.bottom, 16) + 14 }]}>
            {offlineNote}
            {inputMode === 'voice' ? (
              voiceDock
            ) : (
              <View style={styles.composer}>
                <ComposerButton
                  icon="mic"
                  label={isRecording ? 'Stop recording' : 'Speak'}
                  onPress={handleMic}
                  active={isRecording}
                  disabled={isThinking || voice.isBusy}
                />
                <TextInput
                  style={styles.input}
                  value={draft}
                  onChangeText={setDraft}
                  placeholder={isRecording ? 'Listening\u2026' : 'Type what you want to know\u2026'}
                  placeholderTextColor="rgba(42,42,42,0.48)"
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                  editable={!isThinking && !isRecording}
                  autoFocus
                  multiline
                />
                <Pressable
                  onPress={handleSend}
                  disabled={!draft.trim() || isThinking}
                  accessibilityRole="button"
                  accessibilityLabel="Send"
                  style={({ pressed }) => [
                    styles.sendButton,
                    (!draft.trim() || isThinking) && styles.pressed,
                    pressed && styles.pressed,
                  ]}
                >
                  <LinearGradient
                    colors={[BrandColors.crimsonBright, BrandColors.crimson, BrandColors.crimsonDeep]}
                    locations={[0, 0.6, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sendGradient}
                  >
                    <View style={{ transform: [{ translateX: 1 }] }}>
                      <Icon name="send" size={20} color="#fff" strokeWidth={2} />
                    </View>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
      <StatusBar style="dark" translucent />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF8EC',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
  topChrome: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  chromeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(42,42,42,0.08)',
    shadowColor: '#8D5E1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
  },
  pressed: {
    opacity: 0.78,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: '#1E1E1E',
    letterSpacing: 0.2,
  },
  hero: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  portrait: {
    position: 'relative',
  },
  portraitHalo: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,214,128,0.24)',
    shadowColor: '#D7A53D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
  },
  portraitFrame: {
    position: 'absolute',
    inset: 0,
    borderRadius: 95,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,221,150,0.85)',
    shadowColor: '#8D5E1E',
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.6,
    shadowRadius: 27,
    elevation: 18,
  },
  portraitImage: {
    position: 'absolute',
  },
  portraitSheen: {
    position: 'absolute',
    left: '12%',
    right: '12%',
    top: '8%',
    height: '26%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  greeting: {
    // Clear the portrait's glowing halo so it doesn't bleed into the headline.
    marginTop: 64,
    alignItems: 'center',
  },
  headline: {
    fontFamily: Fonts.headingBlack,
    fontSize: 30,
    lineHeight: 35.4,
    fontWeight: '900',
    color: '#1E1E1E',
    letterSpacing: 0.2,
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.72)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  subtitle: {
    marginTop: 13,
    fontFamily: Fonts.bodyBold,
    fontSize: 12.5,
    color: 'rgba(42,42,42,0.64)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroDock: {
    marginTop: 34,
    alignItems: 'center',
  },
  composerWrap: {
    paddingHorizontal: 18,
  },
  offlineNote: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: 'rgba(42,42,42,0.58)',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  voiceDock: {
    alignItems: 'center',
    gap: 14,
    paddingTop: 2,
  },
  voiceHint: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: 'rgba(42,42,42,0.68)',
    letterSpacing: 0.3,
  },
  voiceMicWrap: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceMicPulse: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(215,38,49,0.45)',
  },
  voiceMicGradient: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BrandColors.crimson,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.36,
    shadowRadius: 14,
    elevation: 12,
  },
  keyboardToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: BrandColors.crimson,
    borderWidth: 1,
    borderColor: 'rgba(218,165,32,0.4)',
  },
  keyboardToggleLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12.5,
    color: '#fff',
    letterSpacing: 0.2,
  },
  composer: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 14,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(42,42,42,0.08)',
    shadowColor: '#8D5E1E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  composerButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: BrandColors.crimson,
    borderWidth: 1,
    borderColor: 'rgba(218,165,32,0.4)',
  },
  composerButtonActive: {
    backgroundColor: BrandColors.crimson,
    borderColor: BrandColors.crimson,
  },
  input: {
    flex: 1,
    minWidth: 0,
    maxHeight: 96,
    paddingVertical: 0,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: '#1E1E1E',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    flexShrink: 0,
    shadowColor: BrandColors.crimson,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 8,
  },
  sendGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
