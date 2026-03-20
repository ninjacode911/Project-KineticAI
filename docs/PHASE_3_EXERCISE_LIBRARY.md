# Phase 3 — Exercise Library v1

**Status:** COMPLETE
**Date Completed:** 2026-03-20
**Builds On:** Phase 2 (Joint Angle Engine)

---

## Objective

Build a JSON-configured exercise library with 10 exercises across 4 categories, each defining the model to use, primary/secondary joints to track, golden angle ranges per phase, coaching cues, and session parameters. Create a searchable exercise selection UI with category filters.

---

## What Was Built

### Exercise Configuration Schema

Every exercise in KineticAI is defined by an `ExerciseConfig` TypeScript interface (`src/types/exercise.ts`). This makes the library infinitely extensible — adding a new exercise requires only a new config file, no code changes to the analysis engine.

Each config specifies:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | string | Unique identifier (URL-safe slug) |
| `name` | string | Display name shown in UI |
| `description` | string | One-sentence description |
| `category` | ExerciseCategory | One of 5 categories (used for filtering) |
| `model` | ModelPreference | 'lite' / 'full' / 'heavy' — which MediaPipe variant to use |
| `primaryJoint` | JointConfig | The joint triplet (proximal, vertex, distal) that drives rep counting |
| `secondaryJoints` | JointConfig[] | Additional joints tracked for alignment scoring |
| `goldenRanges` | GoldenRanges | Target angle ranges per joint per phase (bottom/top/hold) |
| `coachingCues` | CoachingCues | Map of issue keys to human-readable coaching messages |
| `standingAngle` | AngleRange | Angle range that defines the "standing" position (rep start/end) |
| `bottomAngle` | AngleRange | Angle range that defines the "bottom" position (rep depth target) |
| `targetReps` | number | Default reps per set |
| `targetSets` | number | Default number of sets |
| `restSeconds` | number | Default rest between sets (seconds) |
| `minRepDuration` | number | Minimum rep duration in ms — prevents counting bounced reps |

### Golden Ranges — How They Work

Golden ranges define what "good form" looks like for each joint at each phase of the movement. The form scorer (Phase 5) compares actual angles against these ranges to compute a 0-100 score.

Example — Back Squat golden ranges:
```typescript
goldenRanges: {
  knee:  { bottom: { min: 70, max: 100 }, top: { min: 165, max: 180 } },
  hip:   { bottom: { min: 60, max: 95 },  top: { min: 160, max: 180 } },
  spine: { max: 15 },  // spine deviation — lower is better
}
```

- `knee.bottom: 70-100°` — at the bottom of the squat, knee should be between 70° (below parallel) and 100° (just above parallel). 90° = thighs parallel to ground (ideal).
- `spine.max: 15` — spine deviation should not exceed 15° from neutral throughout the movement. This catches excessive forward lean.

### The 10 Exercises

#### Lower Body Strength (2)

**1. Back Squat** (`squat.ts`)
- Primary: Left Knee (Hip → Knee → Ankle)
- Secondary: Left Hip (Shoulder → Hip → Knee)
- Bottom: 70-100° knee, 60-95° hip
- Model: lite (speed priority — fast compound movement)
- Min rep: 1200ms, Rest: 90s
- Cues: tooShallow, kneeCaving, forwardLean, goodForm

**2. Romanian Deadlift** (`romanian-deadlift.ts`)
- Primary: Left Hip (Shoulder → Hip → Knee) — hip hinge movement
- Secondary: Left Knee (kept nearly straight at 155-175°)
- Bottom: 45-80° hip angle
- Model: full (needs accurate hip hinge measurement)
- Min rep: 1500ms (slow, controlled movement)
- Cues: tooUpright, kneesBent, backRounded, goodForm
- Spine max deviation: 10° (stricter than squat — flat back critical)

#### Upper Body Strength (3)

**3. Push-Up** (`pushup.ts`)
- Primary: Left Elbow (Shoulder → Elbow → Wrist)
- Secondary: Left Hip (Shoulder → Hip → Knee) — checks for hip sag/pike
- Bottom: 70-100° elbow
- Model: lite, Min rep: 1000ms
- Cues: tooShallow, hipSag, hipPike, goodForm

**4. Overhead Press** (`overhead-press.ts`)
- Primary: Left Elbow (Shoulder → Elbow → Wrist)
- Bottom: 80-100° (elbows at ~90° in rack position)
- Model: lite, Min rep: 1200ms
- Cues: incompletePress, excessiveLean, elbowFlare, goodForm

**5. Bicep Curl** (`bicep-curl.ts`)
- Primary: Left Elbow (Shoulder → Elbow → Wrist)
- Bottom: 30-50° (fully curled — smallest angle of all exercises)
- Standing: 155-175° (not fully locked out — slight bend at rest)
- Model: lite, Min rep: 1000ms
- Cues: swinging, incompleteRange, elbowDrift, goodForm

#### Physiotherapy Rehab (3)

**6. Shoulder External Rotation** (`shoulder-external-rotation.ts`)
- Primary: Left Elbow — but the movement is rotational, not flexion/extension
- Model: full (precision critical for rehab)
- Min rep: 1500ms (slow rehab tempo)
- Rest: 45s (shorter rest for rehab exercises)
- Cues: elbowDrift, tooFast, limitedRange, goodForm

**7. Seated Knee Extension** (`knee-extension.ts`)
- Primary: Left Knee (Hip → Knee → Ankle)
- Bottom: 80-100° (bent), Top: 160-180° (fully extended)
- Model: full, Min rep: 2000ms (very slow — 2s up, 2s down)
- 15 reps × 3 sets — higher volume for rehab
- Cues: incompleteExtension, tooFast, hipLifting, goodForm

**8. Glute Bridge** (`glute-bridge.ts`)
- Primary: Left Hip (Shoulder → Hip → Knee) — hip extension
- Bottom: 80-110° (hips on ground), Top: 160-180° (hips fully extended)
- Model: full, Min rep: 1500ms
- Cues: incompleteExtension, kneesCaving, lowerBackArch, goodForm

#### Yoga & Mobility (2)

**9. Warrior II** (`warrior-ii.ts`)
- Primary: Left Knee (front leg should be at ~90°)
- Secondary: Left Shoulder (arms should be horizontal)
- This is a hold exercise: targetReps = 1, minRepDuration = 15000ms (15s hold)
- Model: full (alignment precision needed)
- Cues: kneeNotOver, armsDropping, leaningForward, goodForm

**10. Tree Pose** (`tree-pose.ts`)
- Primary: Left Knee (standing leg should be nearly straight: 170-180°)
- This is a balance hold: targetReps = 1, minRepDuration = 20000ms (20s hold)
- Model: full
- Cues: standingKneeBent, hipDrop, leaningForward, goodForm

### Exercise Registry (`src/data/exercises/index.ts`)

Central registry that imports all 10 configs and provides helper functions:

- `exerciseLibrary: ExerciseConfig[]` — the full array
- `getExerciseById(id)` — lookup by slug
- `getExercisesByCategory(category)` — filter by category

### UI Components

#### `ExerciseCard.tsx`

Renders a single exercise as a clickable card:
- Category icon (Dumbbell for strength, Heart for physio, Sparkles for yoga)
- Category badge (colored pill)
- Exercise name (bold title)
- Description (muted text)
- Footer: reps, sets, rest duration

Hover effect: border changes to primary color, background highlights.

#### `ExerciseGrid.tsx`

The exercise selection screen:
- **Search bar** — filters exercises by name and description (case-insensitive)
- **Category filter tabs** — All / Lower Body / Upper Body / Physio / Yoga. Uses `useMemo` for efficient re-filtering.
- **Responsive 3-column grid** — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Empty state: "No exercises match your search."

### App Integration

`App.tsx` was restructured into two views:

1. **Exercise Selection View** (when `selectedExercise === null`): Shows header + ExerciseGrid
2. **Session View** (when exercise is selected): Shows header with exercise name + back arrow, camera feed + session controls, metrics panel + rep dots

The back arrow only appears when the session is idle or completed — prevents leaving during an active session.

---

## Architecture Flow (Phase 3 Addition)

```
App.tsx
  ├── No exercise selected → ExerciseGrid
  │     ├── Search + Category Filters
  │     └── ExerciseCard[] → onClick → setSelectedExercise()
  │
  └── Exercise selected → Session View
        ├── CameraView (camera + skeleton overlay)
        ├── SessionControls (Start/Pause/End)
        ├── MetricsPanel (reps, score, timer)
        └── RepDots (per-rep quality indicators)
```

---

## Files Created

| File | Purpose |
|------|---------|
| `src/data/exercises/index.ts` | Exercise registry + helper functions |
| `src/data/exercises/squat.ts` | Back Squat config |
| `src/data/exercises/pushup.ts` | Push-Up config |
| `src/data/exercises/romanian-deadlift.ts` | Romanian Deadlift config |
| `src/data/exercises/overhead-press.ts` | Overhead Press config |
| `src/data/exercises/bicep-curl.ts` | Bicep Curl config |
| `src/data/exercises/shoulder-external-rotation.ts` | Shoulder External Rotation config |
| `src/data/exercises/knee-extension.ts` | Seated Knee Extension config |
| `src/data/exercises/glute-bridge.ts` | Glute Bridge config |
| `src/data/exercises/warrior-ii.ts` | Warrior II config |
| `src/data/exercises/tree-pose.ts` | Tree Pose config |
| `src/components/exercise/ExerciseCard.tsx` | Exercise card component |
| `src/components/exercise/ExerciseGrid.tsx` | Grid + search + filters |
| `src/App.tsx` | **Modified** — dual-view (selection / session) |

---

## Design Decisions

1. **Exercise configs as TypeScript files, not JSON** — enables type checking at compile time, auto-completion in IDE, and `LandmarkIndex` constants instead of magic numbers.

2. **Model preference per exercise** — fast compound exercises (squat, push-up) use 'lite' model for maximum FPS; slow precision exercises (deadlift, physio, yoga) use 'full' for better accuracy.

3. **`minRepDuration` varies by exercise** — squat at 1200ms (fast), knee extension at 2000ms (slow rehab tempo), yoga holds at 15000-20000ms. This prevents false rep counts from momentary angle fluctuations.

4. **Left-side primary by default** — all exercises track the left side as primary. Symmetry is assessed by comparing left vs right. This could be made configurable in a future "mirror mode" setting.

---

## Verification

- All 10 exercise configs pass TypeScript strict type checking
- ExerciseGrid renders all 10 exercises in a responsive 3-column layout
- Category filters correctly show subset (verified: "Physio" shows 3 exercises)
- Search filters by name and description
- Clicking an exercise navigates to session view with correct exercise name in header
- Back arrow returns to exercise selection (only when session is idle/completed)
- Zero console errors
