import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModelPreference } from '@/types/exercise';

interface SettingsState {
  modelVariant: ModelPreference;
  showAngles: boolean;
  voiceCoaching: boolean;
  cameraDeviceId: string | null;
  setModelVariant: (variant: ModelPreference) => void;
  setShowAngles: (show: boolean) => void;
  setVoiceCoaching: (enabled: boolean) => void;
  setCameraDeviceId: (deviceId: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      modelVariant: 'lite',
      showAngles: false,
      voiceCoaching: false,
      cameraDeviceId: null,
      setModelVariant: (variant) => set({ modelVariant: variant }),
      setShowAngles: (show) => set({ showAngles: show }),
      setVoiceCoaching: (enabled) => set({ voiceCoaching: enabled }),
      setCameraDeviceId: (deviceId) => set({ cameraDeviceId: deviceId }),
    }),
    { name: 'kineticai-settings' },
  ),
);
