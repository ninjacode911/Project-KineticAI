import type { ExerciseConfig } from '@/types/exercise';
import { squatConfig } from './squat';
import { pushupConfig } from './pushup';
import { romanianDeadliftConfig } from './romanianDeadlift';
import { overheadPressConfig } from './overheadPress';
import { bicepCurlConfig } from './bicepCurl';
import { shoulderExternalRotationConfig } from './shoulderExternalRotation';
import { kneeExtensionConfig } from './kneeExtension';
import { gluteBridgeConfig } from './gluteBridge';
import { warriorIIConfig } from './warriorII';
import { treePoseConfig } from './treePose';

export const EXERCISE_REGISTRY: Record<string, ExerciseConfig> = {
  [squatConfig.id]: squatConfig,
  [pushupConfig.id]: pushupConfig,
  [romanianDeadliftConfig.id]: romanianDeadliftConfig,
  [overheadPressConfig.id]: overheadPressConfig,
  [bicepCurlConfig.id]: bicepCurlConfig,
  [shoulderExternalRotationConfig.id]: shoulderExternalRotationConfig,
  [kneeExtensionConfig.id]: kneeExtensionConfig,
  [gluteBridgeConfig.id]: gluteBridgeConfig,
  [warriorIIConfig.id]: warriorIIConfig,
  [treePoseConfig.id]: treePoseConfig,
};

export const EXERCISE_LIST: ExerciseConfig[] = Object.values(EXERCISE_REGISTRY);

export function getExerciseById(id: string): ExerciseConfig | undefined {
  return EXERCISE_REGISTRY[id];
}

export const EXERCISE_CATEGORIES = [
  { id: 'all', label: 'All Exercises' },
  { id: 'lower-body-strength', label: 'Lower Body' },
  { id: 'upper-body-strength', label: 'Upper Body' },
  { id: 'physio-rehab', label: 'Physio & Rehab' },
  { id: 'yoga-mobility', label: 'Yoga & Mobility' },
] as const;
