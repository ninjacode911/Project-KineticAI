import { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSessionStore } from '@/stores/sessionStore';

/**
 * Speaks coaching cues aloud using the Web Speech API.
 * Only speaks when voice coaching is enabled in settings.
 * Throttled to prevent overlapping speech.
 */
export function useVoiceCoaching() {
  const voiceEnabled = useSettingsStore((s) => s.voiceCoaching);
  const currentCue = useSessionStore((s) => s.currentCue);
  const lastSpokenRef = useRef('');
  const lastSpokenTimeRef = useRef(0);

  useEffect(() => {
    if (!voiceEnabled || !currentCue) return;
    if (!('speechSynthesis' in window)) return;

    const now = Date.now();

    // Don't repeat the same cue, and throttle to every 5 seconds
    if (
      currentCue.message === lastSpokenRef.current &&
      now - lastSpokenTimeRef.current < 5000
    ) {
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentCue.message);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    window.speechSynthesis.speak(utterance);

    lastSpokenRef.current = currentCue.message;
    lastSpokenTimeRef.current = now;
  }, [voiceEnabled, currentCue]);
}
