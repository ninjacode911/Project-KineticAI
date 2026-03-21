<div align="center">

# KineticAI

**Real-Time AI Pose Coaching — Entirely In Your Browser**

*Track your form. Count your reps. Get coached by AI.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![License](https://img.shields.io/badge/License-Source%20Available-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-26%20passing-brightgreen)](tests/)
[![Vercel](https://img.shields.io/badge/%E2%96%B2%20Vercel-Live%20Demo-000000?style=flat&logo=vercel&logoColor=white)](https://projectkineticai.vercel.app/)

[**Live Demo →**](https://projectkineticai.vercel.app/)

</div>

---

## Overview

KineticAI is a production-grade, browser-native AI fitness coaching platform built entirely without a backend. It uses Google MediaPipe to track 33 body keypoints at 30+ FPS directly in the browser via WebAssembly, then runs a full analysis pipeline — rep counting, 5-component form scoring, fatigue detection, and AI coaching — entirely client-side.

**What makes this different from typical fitness apps:**
- **Zero backend** — MediaPipe runs as WASM in-browser; no video or pose data ever leaves the device.
- **5-component form scoring** — depth, alignment, symmetry, control, and range of motion scored independently and weighted into a single grade.
- **Fatigue detection** — monitors depth fade, symmetry collapse, and speed collapse across reps to warn before injury.
- **AI coaching with fallback** — Gemini 2.0 Flash API generates personalized cues; rule-based micro-cues fire instantly when offline.
- **Voice coaching** — Web Speech API reads coaching feedback aloud so users can stay eyes-forward.

---

## Architecture

```
Camera Feed (30+ FPS)
      |
      v
+-------------------------+
|  MediaPipe Tasks Vision  |  33 keypoints + 3D coordinates
|  (WASM, fully in-browser)|
+----------+--------------+
           |
    +------v----------------------------------------------+
    |                  Analysis Layer                      |
    |                                                      |
    |  Joint Angle Calculator                              |
    |      |                                               |
    |      v                                               |
    |  Rep State Machine     ->   Rep Count + Phase        |
    |      |                                               |
    |      v                                               |
    |  Form Scorer (5 components)                          |
    |      depth | alignment | symmetry | control | ROM    |
    |      |                                               |
    |      v                                               |
    |  Fatigue Detector      ->   depth/symmetry/speed     |
    +------+-----------------------------------------------+
           |
    +------v----------------------------------------------+
    |              Coaching Engine                         |
    |  Gemini 2.0 Flash API  ->  Personalized AI cues     |
    |  Rule-Based Fallback   ->  Instant offline cues     |
    |  Web Speech API        ->  TTS voice coaching       |
    +------+-----------------------------------------------+
           |
           v
  Canvas Overlay + Session Dashboard + PDF Report
```

---

## Features

| Feature | Detail |
|---------|--------|
| **Real-time tracking** | 33 keypoints at 30+ FPS using MediaPipe Tasks Vision (WASM) |
| **Rep counting** | Finite state machine with configurable angle thresholds per exercise |
| **Form scoring** | 5-component: depth 30%, alignment 25%, symmetry 20%, control 15%, ROM 10% |
| **Fatigue detection** | Monitors depth fade, symmetry collapse, and speed collapse across reps |
| **AI coaching** | Gemini 2.0 Flash API with rule-based micro-cues as instant fallback |
| **Voice coaching** | Web Speech API TTS reads coaching feedback aloud |
| **Session history** | Zustand state persisted in localStorage across sessions |
| **PDF reports** | Client-side session report generation via pdfmake |
| **10 exercises** | Squat, push-up, RDL, OHP, bicep curl, shoulder rotation, glute bridge, knee extension, Warrior II, tree pose |
| **Privacy-first** | Zero backend, zero data uploads — all ML inference runs in-browser |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19, TypeScript (strict), Vite 8 | UI components and build toolchain |
| **Pose Estimation** | MediaPipe Tasks Vision (WASM) | 33-keypoint body tracking at 30+ FPS |
| **Styling** | Tailwind CSS v4, shadcn/ui, Framer Motion | Design system and animations |
| **State** | Zustand (persisted localStorage) | Session and settings state management |
| **AI Coaching** | Gemini 2.0 Flash API | Personalized coaching cue generation |
| **Voice** | Web Speech API | TTS readback of coaching feedback |
| **PDF** | pdfmake | Client-side session report generation |
| **Testing** | Vitest (26 unit tests) | Analysis logic and form scoring tests |
| **CI/CD** | GitHub Actions | tsc + lint + test + build on every push |
| **Deployment** | Vercel | Zero-config frontend hosting |

---

## Project Structure

```
src/
├── pages/              # Route pages (Home, Session, Review, Settings)
├── components/         # React UI components
├── hooks/              # Custom hooks (useCamera, usePoseDetection, useSession)
├── lib/
│   ├── analysis/
│   │   ├── joint_angles.ts      # 33-keypoint angle computation
│   │   ├── rep_counter.ts       # FSM-based rep counting
│   │   ├── form_scorer.ts       # 5-component form scoring
│   │   └── fatigue_detector.ts  # Depth/symmetry/speed fatigue
│   ├── coaching/
│   │   ├── gemini_coach.ts      # Gemini 2.0 Flash API client
│   │   └── rule_cues.ts         # Rule-based offline fallback
│   ├── pose/
│   │   ├── mediapipe_loader.ts  # WASM model loading
│   │   └── keypoint_mapper.ts   # 33 landmark name mapping
│   ├── rendering/
│   │   └── canvas_renderer.ts   # Skeleton overlay on canvas
│   └── report/
│       └── pdf_generator.ts     # pdfmake session report
├── data/exercises/     # 10 exercise configuration files
├── stores/             # Zustand state (session, settings)
└── types/              # TypeScript interfaces
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- A Gemini API key ([free at aistudio.google.com](https://aistudio.google.com))

### 1. Clone and install

```bash
git clone https://github.com/ninjacode911/Project-KineticAI.git
cd Project-KineticAI
npm install
```

### 2. Configure secrets

```bash
cp .env.example .env.local
# Edit .env.local and add:
# VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run

```bash
npm run dev
# Open http://localhost:5173
```

### 4. Use it

1. Allow camera access when prompted
2. Select an exercise from the sidebar
3. Step into frame — pose tracking starts automatically
4. Perform reps — the dashboard tracks count, form score, and fatigue in real time
5. Ask for AI coaching feedback at any time via the coaching panel

---

## Running Tests

```bash
npm run test
# Expected: 26 passed
```

Tests cover joint angle computation, rep state machine transitions, form scoring weights, and fatigue detection thresholds.

---

## License

**Source Available — All Rights Reserved.** See [LICENSE](LICENSE) for full terms.

The source code is publicly visible for viewing and educational purposes. Any use in personal, commercial, or academic projects requires explicit written permission from the author.

To request permission: navnitamrutharaj1234@gmail.com

**Author:** Navnit Amrutharaj
