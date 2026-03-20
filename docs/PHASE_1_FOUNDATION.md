# Phase 1 — Foundation, Pose Pipeline & Camera Integration

**Project:** KineticAI — Real-Time Pose Estimation & Form Coach
**Phase Status:** Complete
**Date:** 2026-03-20
**Author:** Ninjacode911

---

## Table of Contents

1. [Phase Overview](#phase-overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Project Structure](#project-structure)
4. [Type System Design](#type-system-design)
5. [MediaPipe Pose Pipeline](#mediapipe-pose-pipeline)
6. [Camera Integration](#camera-integration)
7. [Pose Detection Hook](#pose-detection-hook)
8. [Skeleton Rendering](#skeleton-rendering)
9. [State Management](#state-management)
10. [UI Component Layer](#ui-component-layer)
11. [Code Quality & Audit](#code-quality--audit)
12. [Key Interview Topics](#key-interview-topics)

---

## Phase Overview

Phase 1 establishes the complete real-time pose estimation pipeline running entirely in the browser. The system captures webcam video, runs MediaPipe Pose Landmarker inference on every frame via WebGL GPU acceleration, extracts 33 body landmarks with 3D coordinates, renders a confidence-aware skeleton overlay, and displays real-time performance metrics — all at 25-30 FPS with zero backend infrastructure.

### What Was Built

| Component | File(s) | Purpose |
|-----------|---------|---------|
| Type system | `src/types/*.ts` | Full TypeScript definitions for poses, exercises, sessions, coaching |
| MediaPipe loader | `src/lib/pose/mediapipeLoader.ts` | Singleton WASM/GPU model initialization with model switching |
| Landmark utilities | `src/lib/pose/keypointMapper.ts`, `confidenceFilter.ts` | Human-readable names, body filtering, confidence validation |
| Math engine | `src/lib/utils/math.ts` | 2D/3D joint angle calculation via law of cosines |
| Skeleton renderer | `src/lib/rendering/skeletonRenderer.ts` | Canvas 2D overlay with confidence-based coloring |
| Camera hook | `src/hooks/useCamera.ts` | getUserMedia lifecycle, device switching, error handling |
| Detection hook | `src/hooks/usePoseDetection.ts` | rAF detection loop, FPS tracking, model lifecycle |
| Session store | `src/stores/sessionStore.ts` | Zustand workout state: reps, scores, timing, coaching |
| Settings store | `src/stores/settingsStore.ts` | Persisted user preferences with localStorage |
| Camera view | `src/components/session/CameraView.tsx` | Camera feed with skeleton overlay and controls |
| Metrics panel | `src/components/session/MetricsPanel.tsx` | Real-time rep count, form score, timer, coaching cues |
| FPS counter | `src/components/common/FPSCounter.tsx` | Backend label + color-coded FPS display |

---

## Architecture Decisions

### Why MediaPipe Over TensorFlow.js

| Factor | MediaPipe Tasks Vision | TF.js + MoveNet |
|--------|----------------------|-----------------|
| Keypoints | **33** (full body + hands/feet) | 17 (major joints only) |
| 3D coordinates | Yes (world landmarks in meters) | No (2D normalized only) |
| Maintenance | Active (v0.10.33, 8M+ weekly npm) | Effectively unmaintained since 2023 |
| Runtime | Standalone WASM + WebGL | Full TF.js runtime (~500KB+) |
| Visibility scores | Per-landmark visibility + presence | Basic confidence only |

**Key insight for interviews:** MediaPipe runs its own WASM inference engine independent of TensorFlow.js. This means no TF.js dependency overhead, and the GPU delegate uses WebGL directly for matrix operations. The `@mediapipe/tasks-vision` package is a self-contained ML inference SDK.

### Why Zustand Over Redux/Context

| Factor | Zustand | Redux Toolkit | React Context |
|--------|---------|---------------|---------------|
| Bundle size | ~3KB | ~40KB | 0 (built-in) |
| Boilerplate | Minimal (single `create()`) | Slices + reducers + dispatch | Provider + useContext + memo |
| Selector performance | Automatic shallow comparison | Requires `createSelector` | Re-renders all consumers |
| DevTools | Optional middleware | Built-in | None |

**Key decision:** For real-time pose data streaming at 30 FPS, we need granular subscriptions. Zustand's selector pattern (`useStore(s => s.fps)`) only re-renders components that use the specific slice that changed. React Context would re-render the entire tree on every FPS update.

**Critical performance pattern used:** The detection loop (`usePoseDetection`) never writes pose data to Zustand state directly. Instead, landmarks are stored in a `useRef` to avoid 30 re-renders per second. Only derived metrics (FPS, form scores) that change infrequently are written to the store.

### Why Refs for Hot-Path Data

In `usePoseDetection.ts`, we use a specific pattern to avoid the "stale closure" problem in recursive `requestAnimationFrame` loops:

```typescript
// Store values that change frequently in refs
const showAnglesRef = useRef(useSettingsStore.getState().showAngles);

// Sync via store subscription — no effect dependency changes
useEffect(() => {
  const unsub = useSettingsStore.subscribe((state) => {
    showAnglesRef.current = state.showAngles;
  });
  return unsub;
}, []);

// Detection loop reads from refs — always gets latest value
detectRef.current = () => {
  renderSkeleton(ctx, landmarks, w, h, { showAngles: showAnglesRef.current });
};
```

**Why this matters:** If `showAngles` were a direct dependency of the `detect` callback via `useCallback`, changing it would:
1. Create a new `detect` function reference
2. Trigger the model initialization `useEffect` to re-run (because `detect` is in its deps)
3. Cancel the animation frame, reinitialize (from cache, but still unnecessary), and restart

The ref pattern decouples the detection loop lifecycle from UI setting changes.

---

## Project Structure

```
src/
├── main.tsx                          # Entry point — StrictMode + createRoot
├── App.tsx                           # Root layout — header + split camera/metrics
├── index.css                         # Tailwind v4 + shadcn/ui theme tokens
│
├── types/                            # TypeScript type definitions
│   ├── pose.ts                       # Landmark, WorldLandmark, JointAngle, JointPair
│   ├── exercise.ts                   # ExerciseConfig, GoldenRanges, categories
│   ├── session.ts                    # SessionData, RepLog, FPSData
│   ├── coaching.ts                   # CoachingCue, GeminiFeedback
│   └── mediapipe.d.ts                # Ambient type declarations for @mediapipe/tasks-vision
│
├── data/
│   └── constants.ts                  # CDN paths, skeleton connections, joint pair defs
│
├── lib/
│   ├── utils.ts                      # shadcn/ui cn() utility
│   ├── pose/
│   │   ├── mediapipeLoader.ts        # Singleton PoseLandmarker init/close
│   │   ├── keypointMapper.ts         # Index→name mapping, body landmark filter
│   │   └── confidenceFilter.ts       # Visibility threshold checks
│   ├── rendering/
│   │   └── skeletonRenderer.ts       # Canvas 2D skeleton + angle labels
│   └── utils/
│       ├── math.ts                   # 2D/3D angle calculation (law of cosines)
│       └── formatters.ts             # Angle, time, color formatting
│
├── hooks/
│   ├── useCamera.ts                  # Camera lifecycle, device enumeration
│   └── usePoseDetection.ts           # rAF loop, model init, FPS tracking
│
├── stores/
│   ├── sessionStore.ts               # Workout state (Zustand)
│   └── settingsStore.ts              # User preferences (Zustand + persist)
│
└── components/
    ├── ui/                           # shadcn/ui primitives
    │   ├── badge.tsx
    │   ├── button.tsx
    │   ├── card.tsx
    │   ├── progress.tsx
    │   └── separator.tsx
    ├── common/
    │   └── FPSCounter.tsx            # Backend + FPS display
    └── session/
        ├── CameraView.tsx            # Camera + skeleton overlay + controls
        └── MetricsPanel.tsx          # Reps, score, timer, coaching cards
```

---

## Type System Design

### Pose Types (`src/types/pose.ts`)

The type system mirrors MediaPipe's 33-landmark model:

```typescript
export interface Landmark {
  x: number;    // Normalized [0, 1] — left edge to right edge
  y: number;    // Normalized [0, 1] — top edge to bottom edge
  z: number;    // Depth relative to hip midpoint
  visibility: number;  // [0, 1] — confidence the joint is visible
}
```

**`LandmarkIndex` enum-like const object:** We use `as const` with a derived type union rather than a TypeScript `enum`. This is a deliberate choice:

```typescript
export const LandmarkIndex = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  // ...33 entries
} as const;

export type LandmarkIndex = (typeof LandmarkIndex)[keyof typeof LandmarkIndex];
// Type: 0 | 1 | 2 | ... | 32
```

**Why not `enum`?** TypeScript enums generate runtime JavaScript objects and have quirks with reverse mappings. `as const` objects are fully erased at build time (zero runtime cost) and provide the same type safety.

### Joint Pair Definition

```typescript
export interface JointPair {
  name: string;
  proximal: LandmarkIndex;   // First bone endpoint
  vertex: LandmarkIndex;     // Joint being measured (the angle vertex)
  distal: LandmarkIndex;     // Second bone endpoint
  side: 'left' | 'right' | 'center';
}
```

This structure defines the three points needed to compute a joint angle. For example, the knee angle uses `hip → knee → ankle`, where the knee is the vertex.

### Exercise Configuration (`src/types/exercise.ts`)

Exercise configs are data-driven — each exercise is defined purely by its angle ranges and joint targets:

```typescript
export interface ExerciseConfig {
  goldenRanges: GoldenRanges;      // Ideal angle ranges per phase
  primaryJoint: JointConfig;        // Which joint to track for reps
  standingAngle: AngleRange;        // Angle range = "standing" position
  bottomAngle: AngleRange;          // Angle range = "bottom" position
  minRepDuration: number;           // Minimum time for valid rep (prevents bouncing)
}
```

**Design principle:** No exercise-specific code paths. Adding a new exercise means adding a new `ExerciseConfig` object — the engine handles the rest.

---

## MediaPipe Pose Pipeline

### Model Loading (`src/lib/pose/mediapipeLoader.ts`)

The loader implements a **singleton pattern with model switching**:

```
                    ┌──────────────────────┐
                    │  FilesetResolver     │
                    │  (loads WASM files)   │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  PoseLandmarker      │
                    │  .createFromOptions() │
                    │  (loads .task model)  │
                    └──────────┬───────────┘
                               │
              ┌────────────────▼────────────────┐
              │  Cached singleton instance       │
              │  - Reused if same model variant  │
              │  - Closed & replaced if switched │
              └─────────────────────────────────┘
```

**Key implementation details:**

1. **GPU delegate by default:** `delegate: 'GPU'` uses WebGL for matrix multiply operations on the GPU. Falls back to CPU WASM automatically if GPU unavailable.

2. **WASM CDN pinning:** The WASM files are loaded from `cdn.jsdelivr.net` with the npm version pinned (`@0.10.33`) to prevent silent breaking updates. The model `.task` files on GCS only support `/latest/` paths (no versioned endpoints).

3. **Model variants:**
   - `lite` (default): ~4MB, fastest, adequate for most exercises
   - `full`: ~10MB, better accuracy on challenging poses
   - `heavy`: ~30MB, best accuracy, only for detailed analysis

### Landmark Normalization

MediaPipe's `NormalizedLandmark` has `visibility` as an optional field (`number | undefined`). Our internal `Landmark` type requires it. The `normalizeLandmark()` function handles this:

```typescript
function normalizeLandmark(lm: NormalizedLandmark): Landmark {
  return {
    x: lm.x,
    y: lm.y,
    z: lm.z,
    visibility: lm.visibility ?? 0,  // Default to 0 (invisible) if undefined
  };
}
```

This prevents `NaN` propagation in downstream math operations like `Math.min(a.visibility, b.visibility, c.visibility)`.

### Confidence Filtering (`src/lib/pose/confidenceFilter.ts`)

Every landmark has a visibility score [0, 1]. The system filters at `MIN_CONFIDENCE = 0.3`:

- **Below 0.3:** Joint is treated as invisible — skeleton bones render gray/faded, angle calculations skip
- **Above 0.3:** Joint is reliable — green rendering, included in angle computation

The `areJointLandmarksConfident()` function checks all three points of a joint triplet before computing an angle. This prevents garbage angle values from occluded limbs.

---

## Camera Integration

### `useCamera` Hook (`src/hooks/useCamera.ts`)

Lifecycle state machine:

```
idle → requesting → active
  ↑                   │
  └───── denied ←─────┤
  └───── error ←──────┘
```

**Key behaviors:**

1. **Constraint strategy:** Requests 1280x720 at 30 FPS with `facingMode: 'user'` (front camera). Uses `ideal` constraints (not `exact`) so the browser falls back gracefully on lower-end hardware.

2. **Device switching:** `switchCamera(deviceId)` stops the current stream, then starts a new one with `deviceId: { exact: deviceId }`. The `exact` constraint ensures the specific camera is used.

3. **Cleanup:** The unmount effect stops all tracks, preventing the camera LED from staying on after navigating away.

4. **Permission handling:** Distinguishes between `NotAllowedError` (user denied) and other errors (hardware failure, no camera found) for clear user messaging.

---

## Pose Detection Hook

### `usePoseDetection` Hook (`src/hooks/usePoseDetection.ts`)

This is the most architecturally complex component. It manages three concerns:

1. **Model lifecycle** — loading, caching, cleanup
2. **Detection loop** — recursive `requestAnimationFrame` with MediaPipe inference
3. **FPS measurement** — 1-second sliding window with 10-sample history

### The `detectRef` Pattern (Avoiding Stale Closures)

The detection loop runs via recursive `requestAnimationFrame`. The classic React problem: if you create the loop callback with `useCallback`, and a dependency changes, the old callback is already scheduled and continues running with stale values.

**Solution: Mutable ref holding the detection function**

```typescript
const detectRef = useRef<() => void>(() => {});

// This assignment runs on every render — always has latest closures
detectRef.current = () => {
  // ... detection logic with current values
  animFrameRef.current = requestAnimationFrame(() => detectRef.current());
};
```

The rAF callback calls `detectRef.current()` through an arrow function, which always reads the latest function from the ref. This means:
- The rAF loop never needs to be restarted when settings change
- The model init effect only depends on `[enabled, modelVariant]`, not on detect
- No stale closure bugs

### FPS Tracking

```
Frame 1  Frame 2  Frame 3  ...  Frame N (after ≥1000ms)
  │        │        │             │
  count++  count++  count++       ├── FPS = count × 1000 / elapsed
                                  ├── Push to history (max 10 samples)
                                  ├── Average = mean(history)
                                  └── Reset count & timer
```

The sliding window prevents jittery FPS display. The 10-sample average smooths out GC pauses and tab-switching spikes.

### Monotonic Timestamp Guard

```typescript
const timestamp = performance.now();
if (timestamp <= lastTimestampRef.current) {
  // Skip — MediaPipe throws if timestamp isn't strictly increasing
  return;
}
```

MediaPipe's `detectForVideo()` requires monotonically increasing timestamps. If the browser provides the same `performance.now()` value twice (can happen on very fast frames), we skip the frame rather than crashing.

---

## Skeleton Rendering

### `renderSkeleton()` (`src/lib/rendering/skeletonRenderer.ts`)

Draws the pose skeleton on a Canvas 2D overlay positioned exactly over the video feed:

1. **Connections (bones):** 18 lines connecting adjacent joints. Color and opacity reflect confidence:
   - Both endpoints confident (≥0.3): bright green at 80% opacity
   - Either endpoint low: gray at 30% opacity

2. **Joints (keypoints):** All 33 landmarks as circles:
   - Confident: 5px green circle with white border
   - Low confidence: 3px gray circle with white border

3. **Angle labels:** When enabled, displays angle values in monospace with a semi-transparent pill background positioned at the joint vertex.

**Canvas-video sync:** The canvas size is set to match `video.videoWidth/videoHeight` (not the CSS display size), ensuring landmarks align pixel-perfectly with the video frame.

**Mirror rendering:** Both video and canvas use CSS `-scale-x-100` to mirror the view (selfie mode). The landmarks are in the original coordinate space, so the mirror flip affects both equally — alignment is preserved.

---

## State Management

### Session Store (`src/stores/sessionStore.ts`)

Manages the workout lifecycle:

```
idle → active → paused → active → completed
  ↑       │                           │
  └───── resetSession ←───────────────┘
```

**Rep tracking:** `incrementRep(repData)` appends to the rep log and recalculates the running average form score:

```typescript
incrementRep: (repData) => {
  const newLog = [...repLog, repData];
  const avgScore = newLog.reduce((sum, r) => sum + r.formScore, 0) / newLog.length;
  set({
    repCount: newLog.length,
    repLog: newLog,
    avgFormScore: Math.round(avgScore),
  });
};
```

### Settings Store (`src/stores/settingsStore.ts`)

Uses Zustand's `persist` middleware with `localStorage`:

```typescript
persist(
  (set) => ({ /* state + actions */ }),
  { name: 'kineticai-settings' },  // localStorage key
);
```

On page reload, settings are automatically restored from `localStorage`. This includes model variant, angle display preference, voice coaching toggle, and selected camera device.

---

## UI Component Layer

### shadcn/ui Integration

shadcn/ui components are **copied into the project** (not imported from a package). This means:
- Full control over component code
- No version lock-in
- Components live in `src/components/ui/`

Base UI components used: `Button`, `Card`, `Badge`, `Progress`, `Separator`

### Tailwind CSS v4

Tailwind v4 uses CSS-native `@theme` blocks instead of `tailwind.config.js`:

```css
@theme inline {
  --font-sans: 'Geist Variable', sans-serif;
  --color-primary: var(--primary);
  /* ... */
}
```

Theme tokens are CSS custom properties that shadcn/ui components reference. Dark mode uses the `.dark` class variant.

---

## Code Quality & Audit

### Issues Found and Fixed

| Issue | Severity | Root Cause | Fix |
|-------|----------|------------|-----|
| `performance.now()` during render | Critical | Called in `useRef()` initializer — impure | Initialize to `0`, set in first callback |
| `detect` self-reference before declaration | Critical | `useCallback` referenced itself recursively | Replaced with mutable `detectRef` pattern |
| `isModelLoaded`/`modelLoadError` never update UI | Critical | Returned from `useRef.current` (no re-render) | Changed to `useState` |
| `showAngles` change caused model reinit | High | `detect` callback in model init effect deps | Used refs + store subscriptions for hot-path values |
| MediaPipe `visibility` possibly `undefined` | High | Optional field cast to required type | Added `normalizeLandmark()` with `?? 0` default |
| WASM CDN using `@latest` | Medium | Non-deterministic builds | Pinned to `@0.10.33` matching npm version |
| Default export in App.tsx | Low | Convention violation | Changed to named export |
| `"use client"` in separator.tsx | Low | Copied from Next.js template | Removed |
| Missing favicon.svg | Low | Referenced in HTML but not created | Created SVG favicon |

### Verification Results

```
✓ TypeScript strict compilation — 0 errors
✓ ESLint — 0 errors, 0 warnings
✓ Vite production build — 388KB JS (120KB gzipped)
```

---

## Key Interview Topics

### 1. "How does the pose estimation work in the browser?"

MediaPipe Pose Landmarker runs a two-stage neural network entirely client-side:
1. **Person detector** — locates the bounding box of a person in the frame
2. **Landmark regressor** — predicts 33 keypoint (x, y, z, visibility) coordinates within that box

The model runs as compiled WASM with WebGL GPU acceleration. No server round-trip — inference happens in ~15-30ms per frame.

### 2. "How do you handle 30 FPS updates without killing React performance?"

Three-layer strategy:
- **Refs for hot data** — landmark arrays stored in `useRef`, never trigger re-renders
- **Zustand selectors** — only the specific store slice a component subscribes to triggers its re-render
- **Canvas for rendering** — skeleton drawn directly to Canvas 2D, bypasses React reconciliation entirely

### 3. "What's the stale closure problem and how did you solve it?"

In recursive `requestAnimationFrame` loops, the callback captures values from the render when it was created. If React creates a new callback (due to dependency changes), the old one is already scheduled and runs with outdated values.

Solution: Store the detection function in a mutable ref (`detectRef`). The rAF callback calls `detectRef.current()` through an indirection, which always reads the latest function. The ref is reassigned on every render with current closure values.

### 4. "Why pin CDN versions?"

Using `@latest` in CDN URLs means the WASM runtime files could be a different version than the npm package installed locally. If MediaPipe ships a breaking change to the WASM API, the app silently breaks in production while working fine in development. Pinning to `@0.10.33` ensures WASM and JavaScript always match.

### 5. "How does the type system prevent bugs?"

- `LandmarkIndex` is a literal union type (`0 | 1 | ... | 32`), not `number`. You can't pass an invalid index.
- `JointPair` requires `proximal`, `vertex`, `distal` — you can't compute an angle without all three points.
- `ExerciseConfig` enforces `goldenRanges` and `primaryJoint` — every exercise must define what "correct form" means.
- `visibility: number` (not optional) in `Landmark` — the normalization function guarantees this, preventing `NaN` in math operations.

---

*Next Phase: Exercise definitions, rep counting state machine, and form scoring algorithm.*
