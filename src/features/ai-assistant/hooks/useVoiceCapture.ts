/**
 * useVoiceCapture — wraps the expo-audio recorder lifecycle for the mic button.
 *
 * toggle() starts recording on first press and, on the second press, stops,
 * reads the clip into base64, and hands it to the chat store's sendAudio, which
 * sends it to Gemini for transcription + routing. No live captioning — this
 * keeps the app runnable in Expo Go (expo-audio is bundled there).
 */

import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';

import { audioFileToBase64 } from '../services/audioRecorder';
import { useGiyaChatStore } from '../store/giyaChatStore';

export function useVoiceCapture() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const sendAudio = useGiyaChatStore((s) => s.sendAudio);
  const [isRecording, setIsRecording] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const start = useCallback(async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Microphone needed',
        'Allow microphone access to ask Giya by voice.',
      );
      return;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setIsRecording(true);
  }, [recorder]);

  const stop = useCallback(async () => {
    setIsRecording(false);
    setIsBusy(true);
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      const uri = recorder.uri;
      if (uri) {
        const payload = await audioFileToBase64(uri);
        await sendAudio(payload);
      }
    } catch (err) {
      if (__DEV__) console.warn('[Giya] voice capture failed:', err);
      Alert.alert('Voice error', 'Could not capture that — please try again.');
    } finally {
      setIsBusy(false);
    }
  }, [recorder, sendAudio]);

  const toggle = useCallback(() => {
    if (isBusy) return;
    if (isRecording) void stop();
    else void start();
  }, [isBusy, isRecording, start, stop]);

  return { isRecording, isBusy, toggle };
}
