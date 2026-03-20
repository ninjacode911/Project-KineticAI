# KineticAI

**Real-time pose estimation & AI form coaching — entirely in your browser.**

KineticAI uses Google's MediaPipe Pose Landmarker to track 33 body keypoints at 30+ FPS, compute joint angles, count reps, score form quality, detect fatigue, and deliver AI-powered coaching feedback — all running client-side with zero data leaving your device.

## Features

- **Real-Time Pose Tracking** — 33 keypoints with 3D coordinates via MediaPipe, rendered as a skeleton overlay on your camera feed
- **Rep Counting** — Finite state machine tracks exercise phases (standing → descending → bottom → ascending) with configurable angle thresholds
- **Form Scoring** — 5-component weighted score (depth, alignment, symmetry, control, ROM) per rep
- **Fatigue Detection** — Monitors depth fade, symmetry collapse, speed collapse, and form trend across reps
- **AI Coaching** — Post-set feedback via Gemini 2.0 Flash API with rule-based real-time micro-cues as fallback
- **Voice Coaching** — Speaks cues aloud via Web Speech API
- **PDF Reports** — Client-side session reports with rep-by-rep breakdown, generated via pdfmake
- **10 Exercises** — Squat, push-up, Romanian deadlift, overhead press, bicep curl, shoulder external rotation, knee extension, glute bridge, Warrior II, tree pose
- **Privacy-First** — Zero backend, zero data uploads. All inference runs on your device.
- **Zero Cost** — No subscription, no sign-up, no app download

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19, TypeScript (strict), Vite 8 |
| Pose Estimation | MediaPipe Tasks Vision (@mediapipe/tasks-vision) |
| Styling | Tailwind CSS v4, shadcn/ui |
| Animation | Framer Motion |
| State | Zustand (persisted in localStorage) |
| AI Coaching | Gemini 2.0 Flash API (free tier) |
| PDF Reports | pdfmake (client-side) |
| Testing | Vitest |
| Deployment | Vercel |

## Getting Started

```bash
git clone https://github.com/ninjacode911/kineticai.git
cd kineticai
npm install
```

### Set up Gemini API key (optional — app works without it)

```bash
cp .env.example .env.local
# Edit .env.local and add your free Gemini API key from https://ai.google.dev/
```

### Run locally

```bash
npm run dev
# Open http://localhost:5173 and allow camera access
```

### Build for production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── pages/              # Route pages (Home, Session, Review, Settings)
├── components/         # React components (UI, exercise, session, layout)
├── hooks/              # Custom hooks (camera, pose detection, session)
├── lib/
│   ├── analysis/       # Joint angles, rep counter, form scorer, fatigue
│   ├── coaching/       # Gemini API + rule-based cues
│   ├── pose/           # MediaPipe loader, keypoint mapper
│   ├── rendering/      # Canvas skeleton renderer
│   └── report/         # PDF generation
├── data/
│   └── exercises/      # 10 exercise configs with golden angle ranges
├── stores/             # Zustand state (session, settings, history)
└── types/              # TypeScript interfaces
```

## How It Works

1. **Camera** captures video at 720p/30fps via WebRTC
2. **MediaPipe PoseLandmarker** detects 33 keypoints per frame (GPU-accelerated via WebGL)
3. **Joint Angle Engine** computes 12 joint angles using the law of cosines
4. **Rep Counter** state machine tracks exercise phases and counts valid reps
5. **Form Scorer** evaluates each rep on depth, alignment, symmetry, control, and ROM
6. **Fatigue Detector** monitors rep-over-rep degradation patterns
7. **Coaching Engine** generates real-time cues (rule-based) and post-set feedback (Gemini API)
8. **PDF Generator** creates downloadable session reports entirely client-side

## License

MIT

## Author

Navnit Amrutharaj — [GitHub](https://github.com/ninjacode911)
