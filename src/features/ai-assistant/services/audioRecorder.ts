/**
 * Audio helpers for voice input.
 *
 * Recording is driven by the expo-audio `useAudioRecorder` hook inside
 * useVoiceCapture; this module converts the recorded file into the inline
 * base64 payload Gemini expects, and maps the file extension to a MIME type.
 */

import { readAsStringAsync } from 'expo-file-system/legacy';

export interface AudioPayload {
  /** base64-encoded audio bytes (no data: prefix). */
  data: string;
  /** MIME type Gemini should interpret the bytes as. */
  mimeType: string;
}

/** Map a recording file URI's extension to a Gemini-compatible audio MIME type. */
function mimeTypeForUri(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase().split('?')[0] ?? '';
  switch (ext) {
    case 'm4a':
    case 'mp4':
    case 'aac':
      return 'audio/mp4';
    case 'wav':
      return 'audio/wav';
    case 'caf':
      return 'audio/x-caf';
    case '3gp':
      return 'audio/3gpp';
    default:
      return 'audio/mp4';
  }
}

/** Read a recorded audio file into an inline base64 payload for Gemini. */
export async function audioFileToBase64(uri: string): Promise<AudioPayload> {
  const data = await readAsStringAsync(uri, { encoding: 'base64' });
  return { data, mimeType: mimeTypeForUri(uri) };
}
