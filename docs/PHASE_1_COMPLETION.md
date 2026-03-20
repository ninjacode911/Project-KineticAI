# Phase 1 — Foundation & Core Infrastructure

**Status:** COMPLETE
**Date Completed:** 2026-03-20
**Duration:** Week 1 (of 9)

---

## Objective

Set up the complete project foundation: Vite + React 19 + TypeScript (strict), Tailwind CSS v4 + shadcn/ui, MediaPipe Tasks Vision integration, camera access with WebRTC, real-time pose detection inference loop, skeleton overlay rendering on HTML5 Canvas, FPS tracking, and the split-screen session layout.

---

## What Was Built

### 1. Project Scaffolding

| Component | Technology | Version |
|-----------|-----------|---------|
| Build Tool | Vite | 8.0.1 |
| Framework | React | 19.2.4 |
| Language | TypeScript (strict mode) | 5.9.3 |
| Styling | Tailwind CSS v4 | 4.2.2 |
| UI Components | shadcn/ui | Latest (Button, Card, Badge, Progress, Separator) |
| Icons | Lucide React | 0.577.0 |
| State Management | Zustand | 5.0.12 |
| Routing | React Router DOM | 7.13.1 |
| Pose Estimation | @mediapipe/tasks-vision | 0.10.33 |

**Path alias `@/`** configured across `tsconfig.json`, `tsconfig.app.json`, and `vite.config.ts` for clean imports throughout the codebase.

### 2. Core Type System (`src/types/`)

Four type definition files establish the project's data model:

- **`pose.ts`** — `Landmark`, `WorldLandmark`, `JointAngle`, `PoseAnalysis`, `JointPair`, and `LandmarkIndex` (all 33 MediaPipe keypoint indices as a const object with derived type).
- **`exercise.ts`** — `ExerciseConfig`, `ExerciseCategory`, `ModelPreference`, `GoldenRanges`, `JointConfig`, `CoachingCues`.
- **`session.ts`** — `SessionData`, `SessionStatus`, `RepPhase`, `RepLog`, `FPSData`.
- **`coaching.ts`** — `CoachingCue`, `GeminiFeedback`.
- **`mediapipe.d.ts`** — Type declarations for `@mediapipe/tasks-vision` (PoseLandmarker, FilesetResolver, NormalizedLandmark).

**Design decision:** TypeScript's `erasableSyntaxOnly` option (enabled by Vite's default tsconfig) prohibits regular `enum` declarations. `LandmarkIndex` uses a `const` object with a derived type union instead, which is more tree-shakeable and works at runtime.

### 3. MediaPipe Pose Loader (`src/lib/pose/mediapipeLoader.ts`)

Manages the lifecycle of the MediaPipe PoseLandmarker:

- **Model loading** — Downloads the pose model from Google Cloud Storage (~5-12MB depending on variant). Supports three variants: `lite` (fastest), `full` (balanced), `heavy` (most accurate).
- **GPU delegate** — Uses WebGL GPU acceleration by default.
- **Model caching** — Returns cached instance if the same variant is already loaded. Closes previous instance before switching models.
- **WASM CDN** — Pinned to `@mediapipe/tasks-vision@0.10.33` to match the installed npm version, preventing WASM/JS version mismatches.
- **Cleanup** — `closePoseLandmarker()` properly releases resources on unmount.

**Key workaround:** MediaPipe's `package.json` has a malformed `exports` field that mixes subpath keys (starting with `.`) with condition keys (not starting with `.`). Vite 8's bundler (Rolldown) strictly enforces the Node.js specification and rejects this. The fix is a Vite resolve alias that points directly to the ESM bundle file (`vision_bundle.mjs`).

### 4. Keypoint Mapper (`src/lib/pose/keypointMapper.ts`)

Maps MediaPipe's 33 numeric landmark indices to human-readable names. Provides:

- `getLandmarkName(index)` — Returns "Left Knee", "Right Shoulder", etc.
- `BODY_LANDMARK_INDICES` — Array of indices 11-32 (body landmarks only, excluding face).
- `getLandmark(landmarks, index)` — Safe accessor for landmark by index.

### 5. Confidence Filter (`src/lib/pose/confidenceFilter.ts`)

Filters unreliable keypoints based on MediaPipe's visibility score:

- `isLandmarkConfident(landmark)` — Returns `true` if visibility >= 0.3 threshold.
- `areJointLandmarksConfident(landmarks, a, b, c)` — Checks all three points in a joint triplet.
- `getJointConfidence(landmarks, a, b, c)` — Returns minimum confidence across three landmarks.

### 6. Math Utilities (`src/lib/utils/math.ts`)

Core angle calculation functions using the law of cosines:

- **`calculateAngle(A, B, C)`** — Computes the angle at vertex B formed by points A-B-C in 2D (x, y). Returns degrees (0-180). Handles edge cases: zero-length vectors return 0, cosine values are clamped to [-1, 1] to prevent NaN from floating point errors.
- **`calculateAngle3D(A, B, C)`** — Same calculation using all three axes (x, y, z) for more accurate results with MediaPipe world coordinates.

### 7. Formatters (`src/lib/utils/formatters.ts`)

Display formatting utilities:

- `formatAngle(angle)` — Rounds to integer with degree symbol (e.g., "90°").
- `formatTime(seconds)` — Formats to mm:ss (e.g., "02:30").
- `getScoreColor(score)` — Returns hex color: green (≥80), yellow (≥60), red (<60).
- `getJointColor(angle, targetMin, targetMax)` — Returns hex color based on deviation from target range: green (in range), yellow (within 15°), red (>15° off).

### 8. Skeleton Renderer (`src/lib/rendering/skeletonRenderer.ts`)

Canvas 2D rendering engine for the pose skeleton overlay:

- **`renderSkeleton(ctx, landmarks, width, height, options)`** — Draws the full skeleton:
  - **Bones:** Lines connecting joints per the `SKELETON_CONNECTIONS` array (18 connections covering torso, arms, and legs). Confident connections drawn in green at 80% opacity; low-confidence connections drawn in grey at 30% opacity.
  - **Joints:** Circles at each keypoint. Confident joints are larger (5px radius) in green; low-confidence joints are smaller (3px) in grey. All joints have a white border for visibility against any background.
  - **Angle labels:** Optional rounded-rect background pills with angle text, positioned next to joints.
- **`renderNoPose(ctx, width, height)`** — Shows "No pose detected" message when no landmarks are found.

Landmarks are in normalized coordinates (0-1) and scaled to actual canvas dimensions at render time.

### 9. Constants (`src/data/constants.ts`)

Centralized configuration:

- `MIN_CONFIDENCE` — 0.3 threshold for keypoint filtering.
- `MEDIAPIPE_WASM_CDN` — CDN path for MediaPipe WASM files, pinned to installed version.
- `POSE_MODEL_PATHS` — Google Cloud Storage URLs for lite/full/heavy model variants.
- `SKELETON_CONNECTIONS` — 18 joint-to-joint pairs defining which bones to draw.
- `JOINT_PAIRS` — 12 joint angle definitions (left/right knee, hip, elbow, shoulder, ankle + spine, neck).

### 10. Zustand Stores (`src/stores/`)

**`sessionStore.ts`** — Manages session lifecycle and real-time metrics:
- Session status (idle → calibrating → active → paused → resting → completed)
- Rep counter, set counter, targets
- Per-rep form scores and rep log array
- FPS data (current, average, backend name)
- Current coaching cue
- Actions: startSession, pauseSession, resumeSession, endSession, resetSession, incrementRep, setFPS, etc.

**`settingsStore.ts`** — User preferences with localStorage persistence via Zustand's `persist` middleware:
- Model variant (lite/full/heavy)
- Show angles toggle
- Voice coaching toggle
- Camera device ID

### 11. React Hooks (`src/hooks/`)

**`useCamera.ts`** — Camera access management:
- Status state machine: idle → requesting → active | denied | error
- `startCamera(deviceId?)` — Requests getUserMedia with 1280x720 @ 30fps, user-facing camera
- `stopCamera()` — Stops all tracks and releases the MediaStream
- `switchCamera(deviceId)` — Stops current camera and starts a new device
- Device enumeration after first successful camera access
- Proper cleanup on component unmount (stops all tracks)

**`usePoseDetection.ts`** — MediaPipe inference loop:
- Loads PoseLandmarker asynchronously on mount (with loading/error states)
- Runs `detectForVideo()` inside a `requestAnimationFrame` loop
- Uses `detectRef` pattern to always call the latest detection function without recreating the rAF loop
- Uses Zustand store subscriptions (not React state) for hot-path values (`showAngles`, `setFPS`) to avoid unnecessary loop recreations
- FPS calculation: counts frames per second, maintains a 10-sample rolling average
- Normalizes MediaPipe's `NormalizedLandmark` (optional `visibility`) to our `Landmark` type (required `visibility`, defaulting to 0)
- Properly cancels animation frame on cleanup, closes PoseLandmarker on unmount

### 12. React Components

**`CameraView.tsx`** — Main camera + pose overlay component:
- Renders `<video>` element mirrored (-scale-x-100) for selfie view
- Renders `<canvas>` overlay positioned absolutely on top of video, also mirrored
- Top bar with FPS counter, show-angles toggle, camera toggle
- Status overlays for each camera state (idle, requesting, denied, error)
- Model loading indicator (spinner + "Loading pose model...")
- Model error display (red banner)
- Auto-starts camera on mount
- Uses `aspect-video` class for proper 16:9 aspect ratio

**`MetricsPanel.tsx`** — Right-side metrics display:
- Rep counter (large text, visible from 2m away)
- Form score with color-coded value and progress bar
- Duration timer (mm:ss)
- Coaching cue card (color-coded by severity: info/warning/critical)
- Idle state hint text

**`FPSCounter.tsx`** — Performance indicator:
- Backend badge ("GPU (WebGL)" / "loading")
- FPS number with color coding: green (≥25), yellow (≥15), red (<15)

**`App.tsx`** — Root layout:
- Header with KineticAI branding
- Split-screen main area: 70% CameraView, 30% MetricsPanel
- Separator between panels
- Full-height layout (h-screen) with no body scrolling

---

## Issues Encountered & Resolved

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| `enum LandmarkIndex` TypeScript error | Vite's `erasableSyntaxOnly` config prohibits regular enums (they emit runtime code) | Changed to `const` object with derived type union |
| `Cannot find module '@mediapipe/tasks-vision'` | Package ships types but the `exports` field has `"types"` as a sibling of `"import"` instead of nested | Created `mediapipe.d.ts` type declaration file |
| Vite build fails: "exports cannot contain some keys starting with '.' and some not" | MediaPipe's `package.json` has malformed `exports` mixing subpath keys with condition keys | Added Vite resolve alias pointing directly to `vision_bundle.mjs` |
| Form Score "--" showing in red when session is idle | `getScoreColor(0)` returns red; score is 0 when idle | Applied color only when `status === 'active'`, otherwise use default text color |
| MediaPipe `NormalizedLandmark.visibility` is optional but our `Landmark.visibility` is required | Type mismatch between MediaPipe output and our internal type | Added `normalizeLandmark()` function that defaults `visibility` to 0 |
| WASM version mismatch potential | CDN path used `@latest` which could drift from installed npm version | Pinned CDN path to `@0.10.33` matching installed package |

---

## Test Results

| Test | Result |
|------|--------|
| TypeScript type check (`tsc -b`) | PASS — 0 errors |
| ESLint (`npm run lint`) | PASS — 0 errors, 0 warnings |
| Production build (`npm run build`) | PASS — 389KB JS (120KB gzip), 35KB CSS (7KB gzip), built in ~1s |
| Browser render (Playwright) | PASS — Layout renders correctly, all components visible |
| Console errors | PASS — 0 errors, 0 warnings |
| Camera request flow | PASS — Shows "Requesting camera access..." with spinner |
| Camera denied flow | VERIFIED in code — Shows denial message with instructions |
| Model loading indicator | VERIFIED in code — Shows spinner + "Loading pose model..." |
| FPS counter | VERIFIED in code — Updates every second with rolling 10-sample average |

**Note:** Full camera → pose detection → skeleton overlay testing requires a real camera (not available in Playwright). This flow should be tested manually by running `npm run dev` and opening `http://localhost:5173` in a browser with camera access.

---

## Build Output

```
dist/index.html                      0.48 kB │ gzip:   0.32 kB
dist/assets/index.css               34.77 kB │ gzip:   6.93 kB
dist/assets/index.js               388.98 kB │ gzip: 120.32 kB
+ 3 font files (Geist Variable)     58.39 kB total
```

---

## Files Created/Modified (27 source files)

```
src/
├── App.tsx                              # Root layout (split-screen)
├── main.tsx                             # React entry point
├── index.css                            # Tailwind v4 + shadcn theme
├── components/
│   ├── common/
│   │   └── FPSCounter.tsx               # FPS + backend badge
│   ├── session/
│   │   ├── CameraView.tsx               # Camera feed + canvas overlay
│   │   └── MetricsPanel.tsx             # Rep count, form score, timer
│   └── ui/
│       ├── badge.tsx                    # shadcn/ui
│       ├── button.tsx                   # shadcn/ui
│       ├── card.tsx                     # shadcn/ui
│       ├── progress.tsx                 # shadcn/ui
│       └── separator.tsx               # shadcn/ui
├── data/
│   └── constants.ts                     # Skeleton connections, joint pairs, thresholds
├── hooks/
│   ├── useCamera.ts                     # Camera permission + MediaStream
│   └── usePoseDetection.ts             # MediaPipe inference loop
├── lib/
│   ├── utils.ts                         # shadcn cn() utility
│   ├── pose/
│   │   ├── confidenceFilter.ts          # Keypoint confidence filtering
│   │   ├── keypointMapper.ts            # 33 landmark name mapping
│   │   └── mediapipeLoader.ts           # PoseLandmarker lifecycle
│   ├── rendering/
│   │   └── skeletonRenderer.ts          # Canvas 2D skeleton drawing
│   └── utils/
│       ├── formatters.ts                # Angle, time, color formatters
│       └── math.ts                      # calculateAngle (2D + 3D)
├── stores/
│   ├── sessionStore.ts                  # Session lifecycle + metrics
│   └── settingsStore.ts                 # User preferences (persisted)
└── types/
    ├── coaching.ts                      # CoachingCue, GeminiFeedback
    ├── exercise.ts                      # ExerciseConfig, GoldenRanges
    ├── mediapipe.d.ts                   # @mediapipe/tasks-vision types
    ├── pose.ts                          # Landmark, JointAngle, LandmarkIndex
    └── session.ts                       # SessionData, RepLog, FPSData
```

---

## Architecture Diagram (Phase 1)

```
Camera (WebRTC getUserMedia)
  ↓
<video> element (mirrored, 1280x720 @ 30fps)
  ↓
usePoseDetection hook (requestAnimationFrame loop)
  ↓
MediaPipe PoseLandmarker.detectForVideo()
  ↓
33 Landmarks (x, y, z, visibility) — normalized 0-1
  ↓
skeletonRenderer → <canvas> overlay (bones + joints + labels)
  ↓
Zustand sessionStore ← FPS data
  ↓
MetricsPanel (Reps, Form Score, Duration, Coaching Cue)
```

---

## Manual Testing Checklist (For Developer)

Before proceeding to Phase 2, run `npm run dev` and verify in a real browser:

- [ ] Camera permission prompt appears
- [ ] Granting permission shows live camera feed (mirrored)
- [ ] Skeleton overlay appears on top of camera feed within 3-5 seconds (model download)
- [ ] 33 keypoints tracked — joints visible as green circles with white borders
- [ ] Bones (lines) connect the correct body parts
- [ ] Low-confidence keypoints appear smaller and greyer
- [ ] FPS counter shows actual inference speed (target: 30+ FPS)
- [ ] Backend badge shows "GPU (WebGL)"
- [ ] "Loading pose model..." indicator appears while model downloads
- [ ] Toggle "Show angles" button works (currently no angles computed — that's Phase 2)
- [ ] Camera toggle button stops/starts the camera
- [ ] Denying camera permission shows the denial message
- [ ] No console errors during normal operation

---

*Phase 1 Complete — Ready for Phase 2: Joint Angle Engine*
