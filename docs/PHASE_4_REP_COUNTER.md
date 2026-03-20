# Phase 4 — Rep Counter & State Machine

**Status:** COMPLETE
**Date Completed:** 2026-03-20
**Builds On:** Phase 3 (Exercise Library)

---

## Objective

Implement an accurate repetition counter using a finite state machine driven by the primary joint angle of each exercise. Build session lifecycle management (start/pause/resume/end), per-rep data logging, and session control UI components.

---

## What Was Built

### Core File: `src/lib/analysis/repCounter.ts`

#### The State Machine

The rep counter uses a 4-state finite state machine. Each exercise has a primary joint (e.g., left knee for squat) whose angle drives all transitions. The states are:

```
┌──────────┐    angle < standing - 15°    ┌─────────────┐
│ STANDING │ ──────────────────────────── │ DESCENDING  │
│ (READY)  │                              │   (DOWN)    │
└──────────┘                              └─────────────┘
     ↑                                          │
     │                                          │ angle ≤ bottom.max
     │                                          ↓
┌──────────┐    angle > bottom.max + 10°  ┌─────────────┐
│ASCENDING │ ←─────────────────────────── │   BOTTOM    │
│   (UP)   │                              │   (HOLD)    │
└──────────┘                              └─────────────┘
     │
     │ angle ≥ standing.min → REP COUNTED
     ↓
┌──────────┐
│ STANDING │  (cycle repeats)
└──────────┘
```

#### State: STANDING (initial)

The user is in the starting position. The primary angle is at or near full extension (e.g., knee at 170° for squat).

**Transition to DESCENDING:** When the primary angle drops below `standingAngle.min - 15°`. The 15° buffer prevents noise-triggered transitions — the user must clearly begin descending.

When transitioning, the current angle is recorded as `bottomAngleReached` to begin tracking the deepest point.

#### State: DESCENDING

The user is moving into the exercise (e.g., squatting down). The deepest angle reached is continuously tracked by comparing each new angle against `bottomAngleReached`.

**Transition to BOTTOM:** When the angle drops into the golden bottom range (e.g., ≤ 100° for squat). This means the user has reached adequate depth.

**Transition back to STANDING:** If the angle rises back above `standingAngle.min` without reaching the bottom — this was a false start or partial rep. No rep is counted; the state resets.

#### State: BOTTOM

The user has reached the target depth. Continues tracking the deepest angle. For hold exercises (yoga poses), the user stays in this state.

**Transition to ASCENDING:** When the angle increases past `bottomAngle.max + 10°`. The 10° buffer prevents premature transition from small angle fluctuations at the bottom of the rep.

#### State: ASCENDING

The user is returning to the starting position.

**Transition to STANDING (REP COUNTED):** When the angle exceeds `standingAngle.min`. At this point:

1. Check `minRepDuration` — if the time since the last rep is below the minimum (e.g., 1200ms for squat), the rep is rejected as a bounced/partial rep. The state resets to STANDING without counting.
2. If duration passes, increment `repCount` and emit a `RepEvent` containing: `{ repNumber, duration, bottomAngle, timestamp }`.
3. Reset `bottomAngleReached` to 180° for the next rep.

#### Key Design Decisions

1. **Mutates state in place** — `processAngle()` modifies the `RepCounterState` object directly rather than returning a new object. This is a deliberate performance decision: the function is called every 100ms (10Hz) during an active session, and avoiding object allocation reduces GC pressure.

2. **Buffer zones** — The 15° entry buffer and 10° exit buffer prevent noise in the angle signal from causing false transitions. Without these, small fluctuations from MediaPipe's per-frame jitter would cause phantom reps.

3. **First rep exception** — `lastTransitionTime === 0` bypasses the duration check for the first rep since there's no prior reference point.

#### `getPhaseLabel(phase)`

Maps internal phase names to user-friendly display labels:
- 'standing' → 'READY'
- 'descending' → 'DOWN'
- 'bottom' → 'HOLD'
- 'ascending' → 'UP'

### Session Controller: `src/hooks/useExerciseSession.ts`

The central hook that orchestrates the entire analysis pipeline during an active session.

#### Data Flow Per Frame (100ms interval)

```
jointAnglesRef.current (from usePoseDetection)
  ↓
getPrimaryAngle(angles, exercise)  → extract primary joint angle by name
  ↓
processAngle(state, angle, exercise, now)  → rep counter state machine
  ↓
If rep completed:
  ├── scoreRep()  → 5-component form score (Phase 5)
  ├── incrementRep()  → add to Zustand session store
  ├── detectFatigue()  → check rep-over-rep degradation (Phase 5)
  └── setCurrentCue()  → display fatigue warning if detected
  ↓
Every 3 seconds:
  └── generateCue()  → rule-based coaching micro-cue (Phase 5)
```

#### Why 10Hz (100ms interval)?

Rep counting doesn't need 30+ FPS resolution. A squat rep takes 1200ms minimum, so sampling every 100ms gives 12 data points per rep — more than sufficient to detect all state transitions. Running at 10Hz instead of 30+ FPS reduces CPU usage by ~70% for the analysis layer while the rendering layer continues at full speed.

#### `getPrimaryAngle(angles, exercise)`

Maps the exercise's primary joint vertex landmark index to a joint name, then looks it up in the angles array:

```
Vertex Index 25 (LEFT_KNEE) → "Left Knee" → getAngleByName(angles, "Left Knee")
Vertex Index 23 (LEFT_HIP) → "Left Hip" → getAngleByName(angles, "Left Hip")
Vertex Index 13 (LEFT_ELBOW) → "Left Elbow" → getAngleByName(angles, "Left Elbow")
```

### Session Store Updates

The `sessionStore` (from Phase 1) receives these updates during an active session:
- `incrementRep(repData)` — appends to `repLog[]`, recalculates `avgFormScore`
- `setCurrentFormScore(score)` — updates the live form score display
- `setCurrentCue(cue)` — updates the coaching cue card in MetricsPanel

### UI Components

#### `SessionControls.tsx`

Context-aware session control buttons:

| Session Status | Buttons Shown |
|---------------|---------------|
| idle | **Start** (primary, large) |
| active | **Pause** (outline) + **End** (destructive) |
| paused | **Resume** (primary) + **End** (destructive) |
| completed | **New Session** (outline with reset icon) |

All buttons have `min-w-[120px]` and use `size="lg"` for easy tapping during exercise.

#### `RepDots.tsx`

A row of small colored circles representing the quality of each completed rep:
- Green dot: form score ≥ 80
- Yellow dot: form score ≥ 60
- Red dot: form score < 60

Shows the last 20 reps. Each dot has a tooltip: "Rep 3: 85/100". Provides at-a-glance visual feedback on session quality.

---

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/analysis/repCounter.ts` | **Created** | 4-state finite state machine for rep counting |
| `src/hooks/useExerciseSession.ts` | **Created** | Session controller — orchestrates analysis pipeline |
| `src/components/session/SessionControls.tsx` | **Created** | Start/Pause/End/Reset buttons |
| `src/components/common/RepDots.tsx` | **Created** | Per-rep quality indicator dots |
| `src/App.tsx` | **Modified** | Integrated session controls + rep dots |

---

## Example: Squat Rep Lifecycle

For a Back Squat with `standingAngle: { min: 165, max: 180 }`, `bottomAngle: { min: 70, max: 100 }`, `minRepDuration: 1200ms`:

1. **t=0s** — User stands upright. Knee angle = 175°. State = STANDING.
2. **t=0.3s** — User begins squatting. Knee drops to 148°. Crosses `165 - 15 = 150°` threshold. State → DESCENDING.
3. **t=0.8s** — User at parallel. Knee = 95°. Crosses `bottomAngle.max = 100°`. State → BOTTOM.
4. **t=1.0s** — User at deepest point. Knee = 82°. `bottomAngleReached = 82°`.
5. **t=1.3s** — User begins standing up. Knee = 112°. Crosses `100 + 10 = 110°`. State → ASCENDING.
6. **t=1.8s** — User stands up. Knee = 168°. Crosses `standingAngle.min = 165°`.
7. **Duration check:** 1800ms ≥ 1200ms (minRepDuration). PASS.
8. **REP COUNTED.** RepEvent: `{ repNumber: 1, duration: 1800, bottomAngle: 82, timestamp }`.
9. State → STANDING. Ready for next rep.

---

## Verification

- TypeScript: 0 errors
- ESLint: 0 warnings (fixed `repCounterRef.current` render access issue by returning ref instead)
- Session controls render correctly for each status
- Exercise selection → session view transition works with back navigation
- RepDots component renders colored circles based on form scores
