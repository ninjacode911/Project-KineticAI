# Phase 5 — Form Scorer + Fatigue Detection

**Status:** COMPLETE
**Date Completed:** 2026-03-20
**Builds On:** Phase 4 (Rep Counter)

---

## Objective

Score every rep on a 0-100 scale using a 5-component weighted formula. Detect fatigue through rep-over-rep degradation analysis. Generate real-time coaching micro-cues based on current joint angles without any API call.

---

## What Was Built

### 1. Form Scorer: `src/lib/analysis/formScorer.ts`

#### The 5-Component Formula

Every completed rep receives a form score (0-100) computed as a weighted average of five components:

```
Total = Depth × 0.30
      + Alignment × 0.25
      + Symmetry × 0.20
      + Control × 0.15
      + ROM × 0.10
```

The `scoreRep()` function takes: the bottom angle reached, all joint angles at bottom, the exercise config, eccentric phase duration, and whether the user fully returned to the starting position.

#### Component 1: Depth Achievement (30% weight)

**What it measures:** Did the primary joint reach the target angle range?

**Scoring logic (`scoreDepth`):**

| Condition | Score |
|-----------|-------|
| Angle is within the golden bottom range (e.g., 70-100° for squat) | **100** |
| Angle went below the range minimum (too deep) | **70-100** — slight penalty, capped at 70 minimum. Formula: `100 - overDepth × 2` |
| Angle didn't reach the range (too shallow) | **0-100** — proportional to how far short. Formula: `100 - (shortfall / 40) × 100` |

Example for squat (`bottomAngle: { min: 70, max: 100 }`):
- Knee at 85° → 100 (in range)
- Knee at 55° → 100 - (70-55)×2 = 70 (too deep, mild penalty)
- Knee at 120° → 100 - ((120-85)/40)×100 = 12.5 (way too shallow)

The 30% weight is the highest because depth is the most fundamental measure of rep quality — a half-rep is never a good rep regardless of other factors.

#### Component 2: Alignment Deviation (25% weight)

**What it measures:** Were secondary joints in their correct positions? Spine neutral, knees tracking over toes, neck in line.

**Scoring logic (`scoreAlignment`):**

Iterates through all golden ranges in the exercise config:

1. **Spine check** — If the exercise has a `spine.max` value (e.g., 15° for squat), compares the actual spine angle. Within max = 100. Each degree over max costs 5 points.

2. **Joint range checks** — For each golden range entry (bottom/top/hold), finds the matching joint angle by name and scores based on deviation from the midpoint of the range. Within half the range width = 100. Deviations beyond that are penalized proportionally.

3. **Default** — If no ranges could be checked (no matching angles found), returns 85 (neutral-positive) to avoid unfair penalty.

#### Component 3: Symmetry (20% weight)

**What it measures:** Were both sides of the body within acceptable deviation throughout the rep?

Uses `computeSymmetryScore()` from the Joint Angle Engine (Phase 2). Maps L/R joint pairs and computes average angular deviation:
- 0° deviation → 100 (perfectly symmetric)
- 15° deviation → 50 (moderate asymmetry)
- 30°+ deviation → 0 (severe asymmetry — likely compensation)

The 20% weight reflects that asymmetry is a key injury risk indicator and a strong signal for fatigue-induced compensation.

#### Component 4: Control / Speed (15% weight)

**What it measures:** Was the eccentric (descending) phase controlled?

**Scoring logic (`scoreControl`):**

| Eccentric Duration | Score | Interpretation |
|-------------------|-------|----------------|
| ≥ 2000ms (2s) | **100** | Ideal controlled tempo |
| ≥ 1500ms (1.5s) | **90** | Good control |
| ≥ 1000ms (1s) | **70** | Acceptable |
| ≥ 500ms (0.5s) | **50** | Rushed |
| < 500ms | **30** | Dangerous — likely bouncing or dropping |

This component discourages "dive-bombing" into the bottom position, which is a common cause of injury under load.

#### Component 5: Full Range of Motion (10% weight)

**What it measures:** Did the joint fully return to the starting position?

Simple binary check: if `primaryAngle >= exercise.standingAngle.min` at rep completion → 100. Otherwise → 60.

Incomplete return to start (e.g., not fully standing between squats) indicates fatigue and reduces effective range of motion.

#### Return Value

`scoreRep()` returns a `FormScoreComponents` object:
```typescript
{ depth: 100, alignment: 92, symmetry: 85, control: 90, rom: 100, total: 94 }
```

The `total` is what's stored in the rep log and displayed to the user. Individual components are available for detailed breakdown in the session report (Phase 8).

---

### 2. Fatigue Detector: `src/lib/analysis/fatigueDetector.ts`

#### Overview

The fatigue detector analyses the rep log after each completed rep. It runs 4 sequential checks, returning the first fatigue alert found (most critical first).

#### Check 1: Depth Fade

**Trigger condition:** Bottom angle increases by > 3° per rep for 3 consecutive reps, with total increase > 10°.

**What it detects:** The user is progressively failing to reach full depth. This is the most common fatigue signal — muscles can no longer produce enough force to achieve full range of motion.

**Example:**
- Rep 5: bottom angle = 88°
- Rep 6: bottom angle = 93° (+5°)
- Rep 7: bottom angle = 99° (+6°)
- Total increase: 11° > 10° threshold → **Alert fires**

**Message:** "Depth fading — you're not going as deep. Consider resting."
**Severity:** warning

#### Check 2: Symmetry Collapse

**Trigger condition:** Symmetry score < 70 for 2 consecutive reps.

**What it detects:** Compensation pattern where one side of the body takes over from the fatigued side. This is an injury risk — the stronger side absorbs more load than it should.

**Message:** "Asymmetry detected — one side is compensating. Check your form."
**Severity:** warning

#### Check 3: Speed Collapse

**Trigger condition:** Latest rep duration < 70% of baseline (average of first 3 reps). Requires at least 4 reps.

**What it detects:** The user is rushing through reps — either dropping faster on the eccentric or bouncing out of the bottom. Both increase injury risk.

**Example:**
- Baseline (reps 1-3 avg): 2000ms
- Rep 8 duration: 1200ms (60% of baseline < 70% threshold) → **Alert fires**

**Message:** "Rushing reps — slow down and control the movement."
**Severity:** warning

#### Check 4: Form Trend

**Trigger condition:** Rolling 5-rep average form score drops below 70. Requires at least 5 reps.

**What it detects:** Overall form degradation across multiple quality dimensions. This is the most serious indicator because it means multiple aspects of form are breaking down simultaneously.

**Message:** "Form declining — consider taking a rest before your next set."
**Severity:** **critical** (the only `critical` severity alert)

#### `findFatigueOnset(repLog)`

Scans the full rep log to identify the rep number where fatigue first appeared. Uses a rolling 3-rep average below 75 as the onset threshold. Used in session reports to tell the user "fatigue onset at rep 7 of 10."

---

### 3. Rule-Based Coaching Cues: `src/lib/coaching/ruleBasedCues.ts`

#### Overview

Generates real-time coaching feedback during the workout. These are simple rule-based checks (< 5ms execution, no API call) that display as text overlays in the MetricsPanel. Throttled to max one cue every 3 seconds to avoid overwhelming the user.

#### `generateCue(angles, exercise, phase, symmetryScore)`

Checks are prioritized (most important first):

**1. Symmetry check** — If `symmetryScore < 70`, returns: "Uneven — balance both sides equally" (warning).

**2. Depth check during descending/bottom** — If the primary angle is still > 20° above the bottom range, uses the exercise's coaching cues to find a matching message. Tries keys in order: `tooShallow` → `incompleteRange` → `tooUpright`. Falls back to a generic "Go deeper for full range of motion" if no key matches.

**3. Spine alignment check** — If the exercise defines a `spine.max` golden range and the current spine angle exceeds it by > 10°, looks for: `forwardLean` → `backRounded` → `leaningForward`. Falls back to "Maintain a neutral spine."

**4. Good form confirmation** — When the user is in the BOTTOM phase with acceptable angles, shows the exercise's `goodForm` cue as positive reinforcement.

#### Helper Functions

- `getPrimaryJointName(exercise)` — Maps the vertex landmark index to a joint name string for angle lookup (e.g., index 25 → "Knee").
- `findMatchingCue(exercise, ...keys)` — Finds the first matching key in the exercise's `coachingCues` object.

---

### 4. Integration: `useExerciseSession` Hook

The session hook orchestrates all three systems. During an active session, a `setInterval` at 100ms (10Hz):

1. Reads `jointAnglesRef.current` from the pose detection loop
2. Extracts the primary joint angle via `getPrimaryAngle()`
3. Feeds it through `processAngle()` (rep counter state machine)
4. On rep completion: calls `scoreRep()`, `incrementRep()`, `detectFatigue()`
5. Every 3 seconds: calls `generateCue()` for real-time coaching
6. All results flow into the Zustand session store → UI updates

---

## Complete Data Pipeline (Phases 1-5)

```
Camera (WebRTC, 30fps)
  ↓
MediaPipe PoseLandmarker.detectForVideo()     [Phase 1]
  ↓
33 Landmarks (x, y, z, visibility)
  ↓
computeJointAngles() → 12 JointAngle[]        [Phase 2]
  ↓
exerciseConfig from library                    [Phase 3]
  ↓
processAngle() → RepEvent | null               [Phase 4]
  ↓ (on rep complete)
├── scoreRep() → FormScoreComponents           [Phase 5]
│   ├── Depth (30%)
│   ├── Alignment (25%)
│   ├── Symmetry (20%)
│   ├── Control (15%)
│   └── ROM (10%)
│
├── detectFatigue() → FatigueAlert | null      [Phase 5]
│   ├── Depth fade (3 reps increasing)
│   ├── Symmetry collapse (2 reps asymmetric)
│   ├── Speed collapse (30% below baseline)
│   └── Form trend (5-rep avg < 70)
│
└── generateCue() → CoachingCue | null         [Phase 5]
    ├── Symmetry warning
    ├── Depth guidance
    ├── Spine alignment
    └── Good form confirmation
  ↓
Zustand sessionStore → MetricsPanel UI
```

---

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/analysis/formScorer.ts` | 5-component weighted form scoring |
| `src/lib/analysis/fatigueDetector.ts` | Rep-over-rep fatigue detection (4 checks) |
| `src/lib/coaching/ruleBasedCues.ts` | Real-time rule-based coaching cues |

---

## Verification

| Check | Result |
|-------|--------|
| TypeScript (`tsc -b`) | 0 errors |
| ESLint (`npm run lint`) | 0 errors, 0 warnings |
| Vite build (`npm run build`) | 412KB JS (127KB gzip), built in 898ms |
| Browser test (Playwright) | Exercise selection → session view renders correctly |
| Console errors | 0 errors, 0 warnings |

---

## What's Next

Phase 5 completes the core analysis pipeline. The system can now:
- Detect a pose in real-time (Phase 1)
- Compute joint angles (Phase 2)
- Know what exercise the user is doing (Phase 3)
- Count repetitions accurately (Phase 4)
- Score each rep's quality and detect fatigue (Phase 5)

Remaining phases build on this foundation:
- **Phase 6:** Calibration + model variant switching
- **Phase 7:** AI coaching via Gemini API
- **Phase 8:** PDF session reports
- **Phase 9:** Polish, accessibility, deployment
