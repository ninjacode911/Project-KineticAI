# Phase 6 — Calibration + Model Options

**Status:** COMPLETE
**Date Completed:** 2026-03-20

---

## Objective

Add auto-calibration for personalised golden angle ranges, model variant selection (Lite/Full/Heavy), camera device selection, and a full Settings page.

---

## What Was Built

### 1. Calibration Engine: `src/lib/analysis/calibration.ts`

#### `CalibrationCapture` Class

Captures the user's standing baseline angles over a configurable duration (default 5 seconds):

1. `start()` — begins capture, resets internal frame buffer
2. `addFrame(landmarks)` — adds one frame of landmarks. Internally calls `computeJointAngles()` to compute angles. Returns progress (0-1).
3. `isComplete()` — returns true when the capture duration has elapsed
4. `getResult()` — averages all captured frames per joint. Requires minimum 10 frames for valid data. Returns `CalibrationData` with `baselineAngles` (Record of joint name → average angle).

This allows personalising the golden ranges to the user's anatomy. For example, if a user's natural standing knee angle is 172° instead of the assumed 175°, all rep counting thresholds shift by -3°.

#### `adjustGoldenRanges(exerciseStandingAngle, baselineAngle, defaultStanding)`

Computes the offset between the user's actual standing angle and the default, then adjusts the exercise's standing angle range accordingly. The max is capped at 180° to prevent invalid ranges.

### 2. Settings Page: `src/pages/SettingsPage.tsx`

Full settings page accessible at `/settings` with three sections:

#### Pose Model Selection
- **Lite** — Fastest, best for compound movements (squat, push-up)
- **Full** — Balanced, good for rehab and precision exercises
- **Heavy** — Most accurate, best for slow movements and yoga

Each option is a clickable card with the currently active model showing an "Active" badge. Selection is persisted in localStorage via Zustand.

#### Camera Selection
- Enumerates all available video input devices via `navigator.mediaDevices.enumerateDevices()`
- Lists each camera by label with an "Active" badge on the selected one
- "Auto (default)" option that uses the system default camera
- Requires brief camera access permission to get device labels

#### Display Settings
- **Show angle labels on skeleton** — toggle checkbox
- **Voice coaching** — toggle with description: "Speak coaching cues aloud via Web Speech API"

### 3. Route Integration

Added `/settings` route to `App.tsx`. Back arrow in the settings header navigates to the home page.

---

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/analysis/calibration.ts` | Created | Calibration capture + golden range adjustment |
| `src/pages/SettingsPage.tsx` | Created | Full settings page with model/camera/display options |
| `src/App.tsx` | Modified | Added `/settings` route |

---

## Verification

- Settings page renders correctly with all three sections
- Model variant selection updates Zustand store (persisted in localStorage)
- Display toggles work correctly
- Zero console errors
