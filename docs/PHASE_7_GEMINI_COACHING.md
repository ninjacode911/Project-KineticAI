# Phase 7 — Gemini AI Coaching

**Status:** COMPLETE
**Date Completed:** 2026-03-20

---

## Objective

Integrate Gemini 2.0 Flash API for post-set coaching feedback and session summaries. Implement voice coaching via Web Speech API. Ensure graceful fallback when the API is unavailable.

---

## What Was Built

### 1. Gemini Coach: `src/lib/coaching/geminiCoach.ts`

#### `generatePostSetCoaching(exercise, repLog, setNumber)`

Called after each set completes. Sends session statistics to Gemini 2.0 Flash and returns structured coaching feedback.

**Data sent to Gemini (numbers only — no video, no images, no PII):**
- Exercise name
- Set number, rep count
- Average form score
- Average primary joint angle vs target range
- Symmetry percentage
- Depth achievement percentage
- Top issue description

**Prompt architecture:**
The prompt instructs Gemini to act as "an expert movement coach and physiotherapist" and return exactly 3 lines: an overall assessment, a priority correction, and a secondary tip. The response is parsed into a `GeminiCoachingResult` with `overallAssessment`, `priorityCorrection`, and `tips[]`.

**Configuration:**
- API endpoint: Gemini 2.0 Flash (`generativelanguage.googleapis.com/v1beta`)
- Temperature: 0.7 (balanced creativity/precision)
- Max tokens: 300 (keeps responses concise)
- API key: read from `import.meta.env.VITE_GEMINI_API_KEY`

#### `generateSessionSummary(exercise, repLog, totalSets, durationSeconds)`

Called when the full session ends. Generates a 3-4 sentence summary mentioning one thing done well and one area to focus on next time.

#### Cost Management

Gemini 2.0 Flash free tier provides 1M+ tokens/day. A typical session uses ~1,500-2,500 tokens across all API calls — the daily quota supports 400+ full workout sessions.

#### Graceful Fallback

If `VITE_GEMINI_API_KEY` is not set, both functions return `null` immediately (no API call attempted). The UI shows "AI coaching unavailable. Set VITE_GEMINI_API_KEY in .env.local to enable." The rule-based coaching cues (Phase 5) continue to provide real-time feedback regardless.

### 2. Voice Coaching: `src/hooks/useVoiceCoaching.ts`

Speaks coaching cues aloud using the browser's built-in Web Speech API:

- Only activates when `voiceCoaching` is enabled in settings
- Uses `SpeechSynthesisUtterance` with: rate 1.1, pitch 1.0, volume 0.8
- Throttled: same cue won't repeat within 5 seconds
- Cancels any ongoing speech before speaking a new cue
- Checks for `speechSynthesis` support before attempting

### 3. Privacy Architecture

The Gemini API call sends only aggregated statistics:
- Exercise name, rep count, angle averages, symmetry percentages
- **Never** sends: video frames, images, raw landmarks, names, or any PII
- This makes KineticAI inherently GDPR-compliant for the AI coaching feature

---

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/coaching/geminiCoach.ts` | Gemini 2.0 Flash API integration + prompt builder |
| `src/hooks/useVoiceCoaching.ts` | Web Speech API voice coaching |

---

## Verification

- TypeScript: 0 errors
- Functions return `null` gracefully when no API key is set
- Prompt includes all required session metrics
- Response parsing handles edge cases (empty response, missing lines)
