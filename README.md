<div align="center">

# KineticAI

**Real-time pose estimation and AI form coaching — running entirely in your browser**

[![Live Demo](https://img.shields.io/badge/Live_Demo-projectkineticai.vercel.app-8b5cf6?style=for-the-badge&logo=vercel)](https://projectkineticai.vercel.app/)
[![Tests](https://img.shields.io/badge/Tests-26_passing-22c55e?style=for-the-badge&logo=vitest)](tests/)
[![License](https://img.shields.io/badge/License-Source_Available-f59e0b?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?style=for-the-badge&logo=typescript)](src/)

Zero backend. Zero data uploads. Zero subscriptions.

</div>

---

## Overview

KineticAI tracks 33 body keypoints in real-time using Google MediaPipe directly in your browser. It counts reps, scores form quality across 5 components, detects fatigue, and delivers AI-powered coaching feedback via the Gemini 2.0 Flash API — all without sending video data to any server.

Supports 10 exercises including squats, push-ups, Romanian deadlifts, overhead press, bicep curls, glute bridges, and yoga poses.

---

## Pipeline

```
Camera Feed (30+ FPS)
        |
        v
+----------------------+
|  MediaPipe Vision    |  33 keypoints + 3D coordinates
|  (WASM in-browser)   |
+----------+-----------+
           |
    +------v----------------------------------------------+
    |                  Analysis Layer                      |
    |  Joint Angle Calculator  ->  Rep State Machine       |
    |  Form Scorer (5 components)  ->  Fatigue Meter       |
    +-------------------------------+---------------------+
                                    |
           +------------------------v-----------------------+
           |              Coaching Engine                    |
           |  Gemini 2.0 Flash API                          |
           |  + Rule-Based Fallback Cues                    |
           |  + Web Speech API (TTS voice feedback)         |
           +------------------------+-----------------------+
                                    |
                                    v
                       Canvas Overlay + Session Dashboard
```

---

## Features

| Feature | Details |
|---------|---------|
| **Real-time tracking** | 33 keypoints at 30+ FPS using MediaPipe Tasks Vision (WASM) |
| **Rep counting** | Finite state machine with configurable angle thresholds per exercise |
| **Form scoring** | 5-component score: depth 30%, alignment 25%, symmetry 20%, control 15%, ROM 10% |
| **Fatigue detection** | Monitors depth fade, symmetry collapse, and speed collapse |
| **AI coaching** | Gemini 2.0 Flash API with rule-based micro-cues as fallback |
| **Voice coaching** | Web Speech API TTS reads coaching feedback aloud |
| **PDF reports** | Client-side session report generation with pdfmake |
| **10 exercises** | Squat, push-up, RDL, OHP, bicep curl, shoulder rotation, glute bridge, knee extension, Warrior II, tree pose |
| **Privacy-first** | Zero backend, zero data uploads — all ML runs in-browser |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19, TypeScript (strict), Vite 8 |
| Pose Estimation | MediaPipe Tasks Vision (WASM) |
| Styling | Tailwind CSS v4, shadcn/ui, Framer Motion |
| State Management | Zustand (persisted localStorage) |
| AI Coaching | Gemini 2.0 Flash API |
| PDF Generation | pdfmake (client-side) |
| Testing | Vitest (26 unit tests) |
| CI/CD | GitHub Actions (tsc + lint + test + build) |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── pages/              # Route pages (Home, Session, Review, Settings)
├── components/         # React UI components
├── hooks/              # Custom hooks (camera, pose detection, session)
├── lib/
│   ├── analysis/       # Joint angles, rep counter, form scorer, fatigue
│   ├── coaching/       # Gemini API + rule-based cues
│   ├── pose/           # MediaPipe loader, keypoint mapper
│   ├── rendering/      # Canvas skeleton renderer
│   └── report/         # PDF generation
├── data/exercises/     # 10 exercise configuration files
├── stores/             # Zustand state management
└── types/              # TypeScript interfaces
```

---

## Quick Start

```bash
git clone https://github.com/ninjacode911/Project-KineticAI.git
cd Project-KineticAI
npm install
```

Create a `.env.local` file:

```
VITE_GEMINI_API_KEY=your_gemini_api_key
```

```bash
npm run dev       # http://localhost:5173
npm run test      # run 26 unit tests
npm run build     # production build
```

> **Privacy note:** Your webcam feed never leaves the browser. MediaPipe runs entirely as a WASM module. AI coaching requests send only JSON (joint angles, rep counts) — no images or video.

---

## License

Source Available — All Rights Reserved. See [LICENSE](LICENSE) for details.
