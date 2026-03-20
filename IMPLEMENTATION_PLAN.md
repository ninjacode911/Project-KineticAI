# KineticAI — Complete Implementation Plan

**Project:** Real-Time Pose Estimation & Form Coach
**Author:** Ninjacode911
**Created:** 2026-03-20
**Target Completion:** 9 Weeks (May 22, 2026)
**Status:** Phase 0 — Planning Complete

---

## Research Summary & Key Tech Stack Decisions

### What Changed From the Original Plan

The original project plan (PDF) proposed TensorFlow.js + MoveNet Lightning as the primary inference engine. After thorough research into Transformers.js, MediaPipe Tasks Vision, ONNX Runtime Web, and the broader 2026 browser ML landscape, here are the key findings and decisions:

### Research Findings

#### 1. Transformers.js — Not the Right Fit for Pose Estimation
- Transformers.js (Hugging Face) uses ONNX Runtime Web under the hood
- **No built-in `pose-estimation` pipeline task** — pose must use lower-level `AutoModel` API
- ViTPose (the only pose model available) requires a **two-stage pipeline** (person detector + pose estimator) and the base model is **344 MB** (vs MoveNet's 9 MB)
- Transformers.js excels at NLP/text/image-classification, not real-time pose
- **Verdict: Not recommended for KineticAI**

#### 2. MediaPipe Tasks Vision — The New Standard (Replaces TF.js Pose)
- `@mediapipe/tasks-vision` is Google's actively maintained SDK (v0.10.32, Jan 2025, 8M+ weekly npm downloads)
- **Completely independent of TensorFlow.js** — standalone WASM + WebGL runtime
- Provides **33 keypoints with 3D world coordinates** (vs MoveNet's 17 keypoints, 2D only)
- Includes visibility/presence scores per landmark and optional segmentation masks
- TF.js `@tensorflow-models/pose-detection` is effectively in maintenance mode (last published ~2023)
- GPU delegate uses WebGL (WebGPU for vision tasks not yet available, confirmed by Google)
- **Verdict: Primary pose engine for KineticAI**

#### 3. ONNX Runtime Web + RTMPose — Best Accuracy Option
- ONNX Runtime Web has **production-ready WebGPU support** (v1.19+)
- RTMPose-T achieves **65.9 AP on COCO** (vs MoveNet Lightning's 50.6 AP) at similar model size (~3.3M params)
- RTMPose is CNN-based (CSPNeXt backbone) — clean ONNX export, excellent browser operator coverage
- Can serve as a **future upgrade path** or alternative model option
- **Verdict: Secondary/advanced model option for Phase 6+**

#### 4. TensorFlow.js + MoveNet — Still Viable but Legacy
- Development pace has slowed significantly (2024-2026)
- Google's investment is in MediaPipe Tasks / AI Edge ecosystem
- MoveNet is still fast (50-120 FPS) but lower accuracy and only 17 keypoints
- **Verdict: Not recommended as primary — MediaPipe supersedes it**

#### 5. Frontend Stack — Modern 2026 Best Practices
- **Vite + React 19 + TypeScript** (strict) — best ecosystem, portfolio signal, shadcn/ui support
- **Tailwind CSS v4 + shadcn/ui** — accessible components, customizable, no config file needed
- **Zustand** (~3KB) for state + `useRef` for hot-path pose data (never re-render at 30fps)
- **uPlot** (~50KB) for real-time charts (4x less CPU than Chart.js for streaming)
- **Recharts** for static summary charts (shadcn/ui integration)
- **pdfmake** for structured PDF reports (declarative JSON layout, tables, sections)
- **Vitest + Playwright** for testing (native Vite integration, real browser testing)
- **Vercel** for deployment (simplest DX, free tier, sufficient for portfolio)

---

## Final Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Vite + React 19 + TypeScript (strict) | Best ecosystem, TF.js/MediaPipe examples, portfolio signal |
| **Pose Estimation (Primary)** | MediaPipe Tasks Vision (`@mediapipe/tasks-vision`) | 33 keypoints, 3D, actively maintained, standalone SDK |
| **Pose Estimation (Future)** | ONNX Runtime Web + RTMPose | Higher accuracy upgrade path with WebGPU |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Best-in-class DX, accessible, customizable |
| **State Management** | Zustand (~3KB) + useRef (hot path) | Minimal overhead, selective re-renders |
| **Real-time Charts** | uPlot (~50KB) | 4x less CPU than Chart.js for streaming data |
| **Summary Charts** | Recharts | Declarative React API, shadcn/ui integration |
| **PDF Reports** | pdfmake | Declarative JSON layout for data-driven reports |
| **AI Coaching** | Gemini 2.0 Flash API (free tier) | 1M+ tokens/day free, natural language coaching |
| **Testing** | Vitest + Playwright | Native Vite integration, real browser testing |
| **Deployment** | Vercel (free hobby tier) | Zero-config CI/CD from GitHub |
| **Voice Coaching** | Web Speech API (browser built-in) | Free, no dependency, speaks coaching cues aloud |

### Cost: $0.00/month (fully free tier)

---

## Project Directory Structure

```
kineticai/
├── public/
│   ├── index.html
│   └── assets/
│       ├── icons/                    # App icons, favicon
│       └── exercises/                # Exercise thumbnail images
├── src/
│   ├── main.tsx                      # App entry point
│   ├── App.tsx                       # Root component, router
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components (Button, Card, etc.)
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── exercise/
│   │   │   ├── ExerciseCard.tsx       # Single exercise card
│   │   │   ├── ExerciseGrid.tsx       # Grid of exercises with filters
│   │   │   └── ExerciseSearch.tsx     # Search + category filter bar
│   │   ├── session/
│   │   │   ├── CameraView.tsx         # Camera feed + canvas overlay
│   │   │   ├── SkeletonOverlay.tsx    # Skeleton rendering on canvas
│   │   │   ├── MetricsPanel.tsx       # Rep count, form score, cues
│   │   │   ├── SessionControls.tsx    # Start/pause/stop buttons
│   │   │   └── CalibrationView.tsx    # 5-second standing baseline
│   │   ├── review/
│   │   │   ├── SessionSummary.tsx     # Post-session review screen
│   │   │   ├── RepTimeline.tsx        # uPlot real-time rep chart
│   │   │   ├── JointBreakdown.tsx     # Per-joint angle table
│   │   │   └── AICoachingPanel.tsx    # Gemini coaching feedback display
│   │   └── common/
│   │       ├── FPSCounter.tsx         # FPS + backend badge
│   │       ├── FormScoreBar.tsx       # Colour gradient 0-100 bar
│   │       └── Disclaimer.tsx         # Medical disclaimer modal
│   ├── hooks/
│   │   ├── useCamera.ts              # Camera permission + MediaStream
│   │   ├── usePoseDetection.ts       # MediaPipe pose detection loop
│   │   ├── useExerciseSession.ts     # Session lifecycle management
│   │   └── useVoiceCoaching.ts       # Web Speech API integration
│   ├── lib/
│   │   ├── pose/
│   │   │   ├── mediapipeLoader.ts    # MediaPipe PoseLandmarker init
│   │   │   ├── keypointMapper.ts     # Map 33 landmarks to named joints
│   │   │   └── confidenceFilter.ts   # Filter low-confidence keypoints
│   │   ├── analysis/
│   │   │   ├── jointAngleEngine.ts   # calculateAngle(), all joint pairs
│   │   │   ├── repCounter.ts         # State machine per exercise
│   │   │   ├── formScorer.ts         # Weighted 5-component form score
│   │   │   ├── fatigueDetector.ts    # Rep-over-rep degradation
│   │   │   ├── phaseDetector.ts      # Eccentric/concentric/hold
│   │   │   └── calibration.ts        # Standing baseline capture
│   │   ├── coaching/
│   │   │   ├── geminiCoach.ts        # Gemini API integration + prompt
│   │   │   └── ruleBasedCues.ts      # Offline fallback coaching table
│   │   ├── rendering/
│   │   │   ├── skeletonRenderer.ts   # Canvas 2D skeleton drawing
│   │   │   └── overlayHUD.ts         # Angle labels, joint colours
│   │   ├── report/
│   │   │   ├── pdfGenerator.ts       # pdfmake session report builder
│   │   │   └── chartCapture.ts       # Capture charts as images for PDF
│   │   └── utils/
│   │       ├── math.ts               # Vector math, angle helpers
│   │       └── formatters.ts         # Time, score, angle formatters
│   ├── data/
│   │   ├── exercises/                # Exercise config JSON files
│   │   │   ├── index.ts              # Exercise registry
│   │   │   ├── squat.ts
│   │   │   ├── pushup.ts
│   │   │   ├── deadlift.ts
│   │   │   └── ...                   # 20+ exercise configs
│   │   └── constants.ts              # Keypoint indices, thresholds
│   ├── stores/
│   │   ├── sessionStore.ts           # Zustand: session state
│   │   ├── settingsStore.ts          # Zustand: user preferences
│   │   └── historyStore.ts           # Zustand: localStorage history
│   ├── types/
│   │   ├── pose.ts                   # Keypoint, Landmark, JointAngle
│   │   ├── exercise.ts              # ExerciseConfig, GoldenRange
│   │   ├── session.ts               # SessionData, RepLog, FormScore
│   │   └── coaching.ts              # CoachingCue, GeminiFeedback
│   ├── pages/
│   │   ├── HomePage.tsx              # Landing + exercise selection
│   │   ├── SessionPage.tsx           # Active workout session
│   │   ├── ReviewPage.tsx            # Post-session review + PDF
│   │   └── SettingsPage.tsx          # Preferences, camera, model
│   └── styles/
│       └── globals.css               # Tailwind v4 imports + custom
├── tests/
│   ├── unit/                         # Vitest unit tests
│   │   ├── jointAngleEngine.test.ts
│   │   ├── repCounter.test.ts
│   │   ├── formScorer.test.ts
│   │   └── fatigueDetector.test.ts
│   └── e2e/                          # Playwright E2E tests
│       ├── exercise-selection.spec.ts
│       ├── session-flow.spec.ts
│       └── pdf-export.spec.ts
├── .env.example                      # VITE_GEMINI_API_KEY template
├── .gitignore
├── eslint.config.js                  # ESLint flat config
├── tailwind.config.ts                # Tailwind v4 config (minimal)
├── tsconfig.json                     # TypeScript strict config
├── vite.config.ts                    # Vite + React + WASM + PWA
├── vercel.json                       # Vercel deployment config
├── package.json
└── README.md
```

---

## Phase-by-Phase Implementation Plan

### Phase 1 — Foundation & Core Infrastructure (Week 1)
**Goal:** Project scaffolding, camera access, MediaPipe loaded, first skeleton on screen.

| # | Task | Deliverable | Status |
|---|------|-------------|--------|
| 1.1 | Initialize Vite + React 19 + TypeScript project | `npm create vite@latest kineticai -- --template react-ts` | [ ] |
| 1.2 | Install and configure Tailwind CSS v4 + shadcn/ui | Working component library with theme | [ ] |
| 1.3 | Set up project structure (directories, tsconfig strict, ESLint flat config) | All directories created per structure above | [ ] |
| 1.4 | Install `@mediapipe/tasks-vision` and create `mediapipeLoader.ts` | PoseLandmarker loads with GPU delegate | [ ] |
| 1.5 | Create `useCamera.ts` hook — camera permission + MediaStream | Camera feed displays in `<video>` element | [ ] |
| 1.6 | Create `CameraView.tsx` with video + canvas overlay | Split-screen layout: 70% camera, 30% panel | [ ] |
| 1.7 | Create `usePoseDetection.ts` — MediaPipe inference loop with `requestAnimationFrame` | 33 keypoints detected per frame | [ ] |
| 1.8 | Create `skeletonRenderer.ts` — draw skeleton on canvas overlay | Skeleton visible on top of camera feed | [ ] |
| 1.9 | Create `FPSCounter.tsx` — display FPS + backend badge | Real-time FPS display (target: 30+ FPS) | [ ] |
| 1.10 | Create `keypointMapper.ts` — map 33 MediaPipe landmarks to named joints | Named joint access (e.g., `joints.LEFT_KNEE`) | [ ] |
| 1.11 | Set up Zustand stores (session, settings) with TypeScript types | Typed stores for session and settings state | [ ] |
| 1.12 | Deploy to Vercel (initial empty deploy, verify CI) | Live URL on Vercel | [ ] |

**Phase 1 Tests:**
- [ ] Camera permission grant/deny flow works
- [ ] MediaPipe PoseLandmarker loads and runs at 30+ FPS
- [ ] Skeleton overlay renders correctly on canvas
- [ ] FPS counter displays accurate values
- [ ] Responsive layout works on desktop and mobile viewports
- [ ] Vercel deployment succeeds

**Phase 1 Exit Criteria:** User can open the app, grant camera access, and see their skeleton tracked in real-time at 30+ FPS with all 33 keypoints visible.

---

### Phase 2 — Joint Angle Engine (Week 2)
**Goal:** Calculate and display clinically meaningful joint angles from pose keypoints.

| # | Task | Deliverable | Status |
|---|------|-------------|--------|
| 2.1 | Create `math.ts` — vector math utilities (dot product, magnitude, cross product) | Reusable math functions with full type safety | [ ] |
| 2.2 | Create `jointAngleEngine.ts` — `calculateAngle(A, B, C)` using law of cosines | Accurate angle calculation for any 3-point joint | [ ] |
| 2.3 | Define all 12 tracked joint pairs in `constants.ts` | Joint pair definitions for hip, knee, ankle, shoulder, elbow, wrist, spine, neck | [ ] |
| 2.4 | Implement bilateral angle calculation (left + right side) | Both L/R angles computed per frame | [ ] |
| 2.5 | Add confidence filtering — exclude keypoints below 0.3 confidence | Low-confidence joints shown in grey, excluded from angles | [ ] |
| 2.6 | Render angle labels on skeleton overlay (next to each joint) | Angle values visible on canvas near joints | [ ] |
| 2.7 | Add angle label toggle (clean view vs detailed view) | User can toggle angle labels on/off | [ ] |
| 2.8 | Implement 3D angle calculation using MediaPipe world coordinates | Use z-depth for more accurate hip/spine angles | [ ] |
| 2.9 | Create `PoseAnalysis` type — structured output per frame | `{ jointAngles, confidenceScores, timestamp }` | [ ] |

**Phase 2 Tests:**
- [ ] `calculateAngle()` returns 90° for a known right-angle geometry
- [ ] `calculateAngle()` returns 180° for a straight line
- [ ] `calculateAngle()` returns 0° for overlapping vectors
- [ ] Low-confidence keypoints are excluded from angle calculations
- [ ] Bilateral angles (L/R) are computed independently
- [ ] Angle labels render correctly and don't overlap
- [ ] 3D angles differ from 2D for non-frontal poses

**Phase 2 Exit Criteria:** All 12 joint pairs display real-time angle measurements on the skeleton overlay, with confidence filtering and toggle control.

---

### Phase 3 — Exercise Library v1 (Week 3)
**Goal:** JSON-configured exercise library with 10 exercises, selection UI, and golden angle ranges.

| # | Task | Deliverable | Status |
|---|------|-------------|--------|
| 3.1 | Define `ExerciseConfig` TypeScript type in `types/exercise.ts` | Full type definition: model, joints, golden ranges, cues, category | [ ] |
| 3.2 | Create exercise config schema validation | Runtime validation for exercise configs | [ ] |
| 3.3 | Create 5 strength exercises: back squat, push-up, Romanian deadlift, overhead press, bicep curl | 5 JSON configs with researched golden angle ranges | [ ] |
| 3.4 | Create 3 physio rehab exercises: shoulder external rotation, knee extension, glute bridge | 3 JSON configs with clinical ROM ranges | [ ] |
| 3.5 | Create 2 yoga poses: warrior II, tree pose | 2 JSON configs with alignment targets | [ ] |
| 3.6 | Create `ExerciseCard.tsx` — card component with icon, category badge, difficulty | Visually appealing exercise card | [ ] |
| 3.7 | Create `ExerciseGrid.tsx` — responsive grid with category filter tabs | Filterable grid: All / Strength / Physio / Yoga | [ ] |
| 3.8 | Create `ExerciseSearch.tsx` — search bar for quick exercise lookup | Instant search across exercise names | [ ] |
| 3.9 | Create `HomePage.tsx` — landing page with exercise selection | Complete exercise selection screen | [ ] |
| 3.10 | Store recent exercises in localStorage | "Recent" section at top of grid | [ ] |
| 3.11 | Create joint colour coding — green (good), yellow (warning), red (critical) based on golden range | Joints change colour based on angle deviation | [ ] |

**Phase 3 Tests:**
- [ ] All 10 exercise configs pass schema validation
- [ ] Exercise grid renders all exercises correctly
- [ ] Category filter shows correct exercises per category
- [ ] Search filters exercises by name (case-insensitive)
- [ ] Recent exercises persist across page reloads (localStorage)
- [ ] Joint colour coding changes correctly based on angle deviation from golden range
- [ ] Exercise selection navigates to session page with correct config loaded

**Phase 3 Exit Criteria:** User can browse, search, and select from 10 exercises. Selecting an exercise loads the correct joint tracking config with golden angle ranges and colour-coded joint feedback.

---

### Phase 4 — Rep Counter & State Machine (Week 4)
**Goal:** Accurate rep counting via finite state machine, per-rep logging, and session lifecycle.

| # | Task | Deliverable | Status |
|---|------|-------------|--------|
| 4.1 | Create `repCounter.ts` — finite state machine (STANDING → DESCENDING → BOTTOM → ASCENDING) | State machine with configurable thresholds per exercise | [ ] |
| 4.2 | Implement state transitions driven by primary joint angle | Correct phase detection for squats, push-ups, curls | [ ] |
| 4.3 | Add `minRepDuration` filter — prevent counting bounced/partial reps | Reps under 1200ms ignored | [ ] |
| 4.4 | Create `phaseDetector.ts` — eccentric/concentric/hold phase classification | Phase indicator (DOWN / HOLD / UP) displayed in UI | [ ] |
| 4.5 | Create rep event system — emit events on rep completion | `onRepComplete(repData)` callback with angle data, duration, timestamp | [ ] |
| 4.6 | Create session lifecycle: start → active → rest → next set → complete | Session state management in Zustand | [ ] |
| 4.7 | Build `SessionControls.tsx` — start/pause/stop/reset buttons | Large tap-friendly buttons for during-exercise use | [ ] |
| 4.8 | Build `MetricsPanel.tsx` — large rep counter, set counter, timer | Metrics visible from 2 metres away | [ ] |
| 4.9 | Create per-rep log array — store angles, duration, timestamp per rep | `RepLog[]` in session store | [ ] |
| 4.10 | Add audio feedback — beep on rep completion | Satisfying audio cue when rep is counted | [ ] |
| 4.11 | Implement configurable target reps/sets with rest timer | Rest countdown between sets with audio alert | [ ] |

**Phase 4 Tests:**
- [ ] State machine transitions correctly: STANDING → DESCENDING → BOTTOM → ASCENDING → STANDING = 1 rep
- [ ] Bounced reps (< 1200ms) are not counted
- [ ] Partial reps (not reaching bottom angle) are not counted
- [ ] Phase detector correctly identifies eccentric/concentric phases
- [ ] Rep counter works for all 10 exercises with their respective configs
- [ ] Session lifecycle transitions correctly (start → active → rest → next set)
- [ ] Per-rep log captures all required data (angles, duration, timestamp)
- [ ] Rest timer counts down and alerts when rest period ends

**Phase 4 Exit Criteria:** User can select an exercise, start a session, and the app correctly counts reps with per-rep data logging, set management, and rest timers.

---

### Phase 5 — Form Scorer + Fatigue Detection (Week 5)
**Goal:** Per-rep quality scoring (0-100), fatigue detection, and real-time coaching micro-cues.

| # | Task | Deliverable | Status |
|---|------|-------------|--------|
| 5.1 | Create `formScorer.ts` — 5-component weighted form score formula | Per-rep score: depth (30%), alignment (25%), symmetry (20%), control (15%), ROM (10%) | [ ] |
| 5.2 | Implement depth achievement scoring | Score based on how close primary joint reaches target angle | [ ] |
| 5.3 | Implement alignment deviation scoring | Spine neutrality, knee tracking, neck alignment checked | [ ] |
| 5.4 | Implement bilateral symmetry scoring (L vs R) | Score based on L/R angle difference (< 10° = perfect) | [ ] |
| 5.5 | Implement control (speed) scoring | Eccentric phase > 1.5s scores higher; rushed reps penalized | [ ] |
| 5.6 | Implement full ROM scoring | Incomplete return to starting position penalized | [ ] |
| 5.7 | Create `FormScoreBar.tsx` — animated colour gradient bar (0-100) | Visual form score updated every frame | [ ] |
| 5.8 | Create per-rep score dots — row of coloured dots (green/yellow/red) | Visual history of recent rep quality | [ ] |
| 5.9 | Create `fatigueDetector.ts` — rep-over-rep degradation analysis | Detects depth fade, symmetry collapse, speed collapse | [ ] |
| 5.10 | Implement fatigue warnings: depth fade (>10° over 3 reps), symmetry collapse (>15° for 2 reps), speed collapse (>30% faster) | On-screen warnings when fatigue detected | [ ] |
| 5.11 | Implement rolling 5-rep average — rest recommendation when avg < 70 | "Consider resting" notification | [ ] |
| 5.12 | Create `ruleBasedCues.ts` — real-time micro-coaching cues (<5ms, no API) | Text overlays: "Knees caving — push out", "Go deeper", etc. | [ ] |
| 5.13 | Add coaching cue display to `MetricsPanel.tsx` | Latest cue shown prominently in side panel | [ ] |

**Phase 5 Tests:**
- [ ] Form score returns 95-100 for mock keypoints at perfect golden angles
- [ ] Form score returns < 50 for mock keypoints with severe deviations
- [ ] Symmetry score correctly penalizes when L/R differ by > 10°
- [ ] Control score penalizes reps with eccentric phase < 1s
- [ ] Fatigue detector fires depth-fade warning after 3 consecutive degrading reps
- [ ] Fatigue detector fires symmetry-collapse warning after 2 asymmetric reps
- [ ] Rolling average triggers rest recommendation at < 70
- [ ] Coaching cues display the correct message for each deviation type
- [ ] Form score bar animates smoothly between values

**Phase 5 Exit Criteria:** Every rep receives a 0-100 form score. Fatigue is detected in real-time. Rule-based coaching micro-cues display during the workout.

---

### Phase 6 — Calibration + Model Options (Week 6)
**Goal:** Auto-calibration for personalized golden ranges, model variant selection, and advanced pose features.

| # | Task | Deliverable | Status |
|---|------|-------------|--------|
| 6.1 | Create `calibration.ts` — 5-second standing baseline capture | Captures user's neutral joint angles for personalization | [ ] |
| 6.2 | Create `CalibrationView.tsx` — camera preview with framing guide (dashed silhouette) | Visual guide showing ideal camera distance/angle | [ ] |
| 6.3 | Implement golden range personalization — adjust targets based on baseline anatomy | Personalized angle thresholds per user | [ ] |
| 6.4 | Add MediaPipe model variant selector: Lite (fast) / Full (balanced) / Heavy (accurate) | Dropdown in settings with performance description | [ ] |
| 6.5 | Implement backend detection and display (WebGL / WASM / CPU) | Status bar shows current MediaPipe delegate | [ ] |
| 6.6 | Create `SettingsPage.tsx` — camera selection, model variant, display options | Full settings page with all user preferences | [ ] |
| 6.7 | Add camera selection dropdown (multiple cameras) | User can switch between front/back/external cameras | [ ] |
| 6.8 | Implement camera permission denied state with instructions + video upload fallback | Graceful degradation when no camera | [ ] |
| 6.9 | Add on-screen lighting guidance when keypoint confidence is consistently low | "Move to better lighting" notification | [ ] |
| 6.10 | Persist settings in localStorage via Zustand persist middleware | Settings survive page reload | [ ] |

**Phase 6 Tests:**
- [ ] Calibration captures standing angles accurately within 5 seconds
- [ ] Framing guide silhouette helps user position correctly
- [ ] Personalized golden ranges differ from defaults based on user anatomy
- [ ] Model variant switching works without page reload
- [ ] Backend badge correctly shows WebGL or WASM
- [ ] Camera selector lists all available cameras
- [ ] Permission denied state shows clear instructions
- [ ] Settings persist across sessions (localStorage)

**Phase 6 Exit Criteria:** User can calibrate their body proportions, select model quality, choose camera, and receive personalized form assessment.

---

### Phase 7 — AI Coaching with Gemini (Week 7)
**Goal:** Post-set AI coaching feedback via Gemini, offline fallback, and voice coaching.

| # | Task | Deliverable | Status |
|---|------|-------------|--------|
| 7.1 | Create `geminiCoach.ts` — Gemini 2.0 Flash API integration | API client with proper prompt architecture | [ ] |
| 7.2 | Implement post-set coaching prompt — send session stats, receive 2-3 bullet coaching tips | Coaching paragraph rendered after each set | [ ] |
| 7.3 | Implement session summary prompt — comprehensive coaching report at end of workout | Full session coaching summary with prioritized corrections | [ ] |
| 7.4 | Create `AICoachingPanel.tsx` — display Gemini responses in side panel | Formatted coaching feedback with loading state | [ ] |
| 7.5 | Implement graceful Gemini fallback — rule-based coaching when API unavailable/offline | Pre-written coaching cues mapped to detected issues | [ ] |
| 7.6 | Add API key management — `.env.local` for VITE_GEMINI_API_KEY | Secure key handling, never committed to git | [ ] |
| 7.7 | Implement rate limiting / token budgeting | Track token usage, stay within 1M/day free quota | [ ] |
| 7.8 | Create `useVoiceCoaching.ts` — Web Speech API for spoken cues | Coaching cues spoken aloud during exercise | [ ] |
| 7.9 | Add voice coaching toggle in settings | User can enable/disable voice feedback | [ ] |
| 7.10 | Implement exercise prescription — next session recommendation | "Next time, try 3x12 with focus on knee tracking" | [ ] |

**Phase 7 Tests:**
- [ ] Gemini API call succeeds with mock session data and returns coaching text
- [ ] Coaching prompt includes all required session metrics (reps, scores, angles, fatigue)
- [ ] Fallback coaching activates when Gemini is unavailable
- [ ] Voice coaching speaks cues using Web Speech API
- [ ] API key is never exposed in client-side code (Vercel env var)
- [ ] Token budget tracking stays within daily quota
- [ ] Session summary generates comprehensive coaching report

**Phase 7 Exit Criteria:** After each set, the user receives AI-generated coaching feedback. Voice coaching speaks cues during exercise. Offline fallback provides rule-based coaching.

---

### Phase 8 — PDF Session Report (Week 8)
**Goal:** Client-side PDF generation with full session data, charts, and AI coaching.

| # | Task | Deliverable | Status |
|---|------|-------------|--------|
| 8.1 | Install and configure pdfmake | pdfmake working in browser with custom fonts | [ ] |
| 8.2 | Create `pdfGenerator.ts` — session report builder | PDF with all sections defined in plan | [ ] |
| 8.3 | Implement session header section — date, exercise, duration, model used | Branded KineticAI header in PDF | [ ] |
| 8.4 | Implement summary metrics section — total reps, avg form score, best/worst rep | Key metrics table | [ ] |
| 8.5 | Implement per-rep timeline chart — form score over reps with trend line | uPlot chart captured as PNG, embedded in PDF | [ ] |
| 8.6 | Implement joint angle breakdown table — per-joint avg angle, target, deviation, pass/fail | Detailed angle analysis table | [ ] |
| 8.7 | Implement best/worst rep frame capture — capture canvas at peak moments | Side-by-side annotated skeleton screenshots | [ ] |
| 8.8 | Embed AI coaching summary in PDF | Gemini response included in report | [ ] |
| 8.9 | Implement exercise prescription section | Next session recommendation in PDF | [ ] |
| 8.10 | Add progress history from localStorage (if prior sessions exist) | Form score trend across sessions chart | [ ] |
| 8.11 | Add medical disclaimer to every PDF | Legal disclaimer text in footer | [ ] |
| 8.12 | Create `ReviewPage.tsx` — post-session review with download + share | Full review screen: charts, AI feedback, PDF download, Web Share API | [ ] |
| 8.13 | Implement Web Share API for mobile sharing | Share button on supported devices | [ ] |

**Phase 8 Tests:**
- [ ] PDF generates successfully with all sections
- [ ] PDF generation completes in < 2 seconds
- [ ] Charts render correctly in PDF (not blank/broken)
- [ ] Best/worst rep frames are captured and embedded
- [ ] AI coaching text is included in PDF
- [ ] Disclaimer is present on every generated PDF
- [ ] Web Share API works on mobile (or graceful fallback)
- [ ] PDF file size is reasonable (< 2MB)

**Phase 8 Exit Criteria:** User can complete a workout and download a comprehensive PDF session report with all metrics, charts, annotated frames, and AI coaching feedback.

---

### Phase 9 — Polish, Accessibility & Launch (Week 9)
**Goal:** Remaining exercises, accessibility, mobile optimization, PWA, and production deployment.

| # | Task | Deliverable | Status |
|---|------|-------------|--------|
| 9.1 | Add remaining 10+ exercises (total 20+): diamond push-up, dip, lateral raise, tricep extension, hip abduction, clam shell, bird-dog, cat-cow, wall slide, plank, side plank, dead bug, warrior I, downward dog, chair pose, mountain pose | Full exercise library | [ ] |
| 9.2 | Implement high-contrast mode — WCAG 2.1 AA contrast ratios for all overlays | Accessible colour scheme option | [ ] |
| 9.3 | Implement ARIA live regions — rep completion and coaching cues announced to screen readers | Screen reader announces reps and cues | [ ] |
| 9.4 | Ensure all interactive elements are 44x44px minimum (mobile exercise touch targets) | Touch-friendly UI throughout | [ ] |
| 9.5 | Implement `prefers-reduced-motion` — disable skeleton animation for motion-sensitive users | Reduced motion support | [ ] |
| 9.6 | Configure `vite-plugin-pwa` — service worker, manifest, offline capability | PWA installable, works offline (except Gemini) | [ ] |
| 9.7 | Mobile-specific layout optimization — full-width camera, collapsible panel | Responsive layout for phone screens | [ ] |
| 9.8 | Create landing section on HomePage — project description, feature highlights, how-it-works | Impressive first impression for recruiters/visitors | [ ] |
| 9.9 | Add medical disclaimer modal on first use | Disclaimer shown once, acknowledged via localStorage | [ ] |
| 9.10 | Performance optimization — lazy loading, code splitting, model caching | Lighthouse score 90+ | [ ] |
| 9.11 | Cross-browser testing — Chrome, Edge, Safari, Firefox | Verified working on all major browsers | [ ] |
| 9.12 | Write comprehensive README.md | Project overview, features, tech stack, local setup, architecture | [ ] |
| 9.13 | Create `.env.example` with instructions | Gemini API key setup guide | [ ] |
| 9.14 | Final Vercel production deployment with custom domain (optional) | Live production URL | [ ] |
| 9.15 | Security audit — no API keys in code, CSP headers, no eval() | Clean security posture | [ ] |
| 9.16 | CI workflow (GitHub Actions) — lint, type check, unit tests, build | `ci.yml` passing on every push | [ ] |

**Phase 9 Tests:**
- [ ] All 20+ exercises load and track correctly
- [ ] High-contrast mode meets WCAG 2.1 AA
- [ ] Screen reader announces rep completions
- [ ] Touch targets are 44x44px minimum on mobile
- [ ] PWA installs and works offline
- [ ] Lighthouse performance score 90+
- [ ] Works on Chrome, Edge, Safari, Firefox
- [ ] CI pipeline passes (lint + types + tests + build)
- [ ] No secrets in committed code
- [ ] README is comprehensive and professional

**Phase 9 Exit Criteria:** KineticAI is a complete, polished, accessible, production-deployed application with 20+ exercises, full CI, and a compelling README/landing page.

---

## Key Architecture Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| MediaPipe over TF.js MoveNet | MediaPipe Tasks Vision | 33 keypoints (vs 17), 3D coordinates, actively maintained, standalone SDK. TF.js pose-detection is in maintenance mode. |
| MediaPipe over Transformers.js | MediaPipe Tasks Vision | Transformers.js has no pose estimation pipeline. ViTPose requires 344MB model + two-stage detection. Not practical for real-time browser use. |
| React over vanilla JS/Svelte | React 19 + TypeScript | Best ecosystem, shadcn/ui support, strongest portfolio signal, most TF.js/MediaPipe community examples |
| Zustand over Redux/Jotai | Zustand (~3KB) | Minimal overhead, selective re-renders via selectors, perfect for grouped state (session, settings, UI) |
| useRef for pose data | Direct ref access | Pose keypoints update at 30fps — must NOT trigger React re-renders. useRef bypasses React's rendering cycle. |
| uPlot over Chart.js | uPlot (~50KB) | 4x less CPU, 6x less RAM than Chart.js for streaming time-series data. Critical when ML inference runs simultaneously. |
| pdfmake over jsPDF | pdfmake | Declarative JSON layout maps naturally to session data. Better for structured reports with tables, sections, embedded images. |
| Vitest over Jest | Vitest | Native Vite integration, 6x faster cold start, stable browser mode in 2026, same transform pipeline. |
| Vercel over Cloudflare Pages | Vercel (start) | Simpler DX for development. Cloudflare Pages has unlimited bandwidth but more setup. Can migrate later if needed. |
| No Web Worker for MediaPipe | Main thread | MediaPipe Tasks Vision handles its own WASM execution efficiently. Adding a Web Worker adds complexity without significant benefit for the WASM delegate. Canvas rendering must be on main thread anyway. |

---

## Risk Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| MediaPipe WebGL slower than expected | Medium | MediaPipe Lite model variant for speed. Future: add ONNX Runtime Web + RTMPose as WebGPU-accelerated alternative. |
| Camera permission denied | Low | Clear instructions + video upload fallback option |
| Gemini API rate limit exceeded | Very Low | 1M tokens/day free = 400+ sessions. Rule-based fallback always available. |
| Inaccurate angles due to camera angle | High | Calibration step + framing guide silhouette. 3D world coordinates from MediaPipe mitigate 2D projection issues. |
| Large model download on first visit | Medium | Show loading progress bar. Models cached in browser after first load. MediaPipe Full model is ~12MB — acceptable on broadband. |
| Medical use-case misapplication | Medium | Prominent disclaimer on first use and in every PDF: "Not a medical device." |

---

## Success Metrics

### Technical
| Metric | Target |
|--------|--------|
| Inference FPS (desktop, GPU delegate) | >= 30 FPS |
| Inference FPS (mobile, CPU) | >= 20 FPS |
| Cold start (page load to first inference) | < 4 seconds |
| Rep count accuracy (test video dataset) | < 5% error |
| Form score correlation with expert | Pearson r > 0.75 |
| PDF generation time | < 2 seconds |
| Lighthouse performance score | >= 90 |

### Portfolio & Career
| Metric | Target |
|--------|--------|
| GitHub stars | >= 200 (within 4 weeks of launch) |
| Vercel unique visitors (first month) | >= 2,000 |
| Demo video views | >= 5,000 (first 2 weeks) |

---

## Weekly Progress Tracker

| Week | Phase | Status | Notes |
|------|-------|--------|-------|
| Week 1 (Mar 24 - Mar 30) | Phase 1: Foundation | Not Started | |
| Week 2 (Mar 31 - Apr 6) | Phase 2: Joint Angle Engine | Not Started | |
| Week 3 (Apr 7 - Apr 13) | Phase 3: Exercise Library v1 | Not Started | |
| Week 4 (Apr 14 - Apr 20) | Phase 4: Rep Counter | Not Started | |
| Week 5 (Apr 21 - Apr 27) | Phase 5: Form Scorer + Fatigue | Not Started | |
| Week 6 (Apr 28 - May 4) | Phase 6: Calibration + Model Options | Not Started | |
| Week 7 (May 5 - May 11) | Phase 7: Gemini Coaching | Not Started | |
| Week 8 (May 12 - May 18) | Phase 8: PDF Session Report | Not Started | |
| Week 9 (May 19 - May 25) | Phase 9: Polish + Launch | Not Started | |

---

## Appendix A: MediaPipe 33 Keypoint Map

```
0: Nose              11: Left Shoulder    23: Left Hip
1: Left Eye Inner    12: Right Shoulder   24: Right Hip
2: Left Eye          13: Left Elbow       25: Left Knee
3: Left Eye Outer    14: Right Elbow      26: Right Knee
4: Right Eye Inner   15: Left Wrist       27: Left Ankle
5: Right Eye         16: Right Wrist      28: Right Ankle
6: Right Eye Outer   17: Left Pinky       29: Left Heel
7: Left Ear          18: Right Pinky      30: Right Heel
8: Right Ear         19: Left Index       31: Left Foot Index
9: Mouth Left        20: Right Index      32: Right Foot Index
10: Mouth Right      21: Left Thumb
                     22: Right Thumb
```

## Appendix B: Key NPM Packages

```json
{
  "dependencies": {
    "@mediapipe/tasks-vision": "^0.10.32",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "zustand": "^5.0.0",
    "pdfmake": "^0.2.0",
    "uplot": "^1.6.0",
    "recharts": "^2.15.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vitest": "^3.0.0",
    "@playwright/test": "^1.50.0",
    "eslint": "^9.0.0",
    "vite-plugin-pwa": "^0.22.0"
  }
}
```

## Appendix C: Gemini Prompt Template

```
You are an expert movement coach and physiotherapist.
Analyse this exercise set data and provide 2-3 specific, actionable coaching tips.
Be encouraging but precise. Focus on the most impactful corrections only.

Exercise: {exerciseName}
Reps completed: {repCount}
Average form score: {avgFormScore}/100
Primary issue: {topIssue} (occurred in {issueFrequency}% of reps)

Joint angle data:
- {primaryJoint}: avg {avgPrimaryAngle}° (target: {goldenRange}°)
- Symmetry: {symmetryScore}% (left vs right deviation)
- Depth achieved: {depthAchieved}
- Fatigue detected: {fatigueInfo}

Response format: 2-3 bullet points, max 30 words each. Be specific to the numbers above.
```

---

*KineticAI Implementation Plan v1.0 — Navnit Amrutharaj — March 2026*
