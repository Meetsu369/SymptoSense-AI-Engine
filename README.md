<<<<<<< HEAD
# 🩺 SymptoSense AI Engine

### *AI-Powered Multilingual Health Assessment & Risk Scoring*

SymptoSense is a state-of-the-art health triage engine designed to provide immediate, accessible health assessments using a hybrid of **Generative AI** and **Deterministic Clinical Rules**. Built for accessibility, it features a full voice-first interface supporting English, Hindi, and Hinglish.

---

## 🌟 Key Features

### 🧠 1. Dynamic AI Question Engine
- **Context-Aware Follow-ups**: Uses Gemini 1.5 Flash to generate relevant medical follow-up questions tailored to the user's symptoms.
- **Robust Fallback**: Automatically switches to a deterministic clinical tree if AI APIs are unavailable, ensuring the tool is always functional.

### 🎙️ 2. Conversational Voice UX
- **Multilingual Support**: High-fidelity Text-to-Speech (TTS) and Speech-to-Text (STT) for English, Hindi, and Hinglish via Sarvam AI.
- **Natural Pacing**: AI speaks questions and options together with natural pauses for a human-like triage experience.

### 🛡️ 3. Safety-First Risk Scoring
- **Red Flag Detection**: Immediate, high-contrast emergency alerts for critical symptoms (e.g., chest pain, breathing difficulty).
- **Deterministic Scoring**: Clinical urgency is calculated using a rule-based engine, ensuring reliability and medical safety.
- **Health Narratives**: Generates a "Health Story" summary alongside the clinical breakdown for easier understanding.

### 🎨 4. Premium Plug-and-Play UI
- **Modular Component**: The `AIQuestionEngine` can be integrated into any React/Next.js application as a self-contained module.
- **Glassmorphic Design**: Modern, responsive UI with color-coded severity tiles and smooth animations.

---

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/Meetsu369/SymptoSense-AI-Engine.git
cd SymptoSense-AI-Engine
npm install
```

### 2. Configure Environment
Create a `.env.local` file (referencing `.env.example`):
```bash
SARVAM_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` to start the assessment.

---

## 🔌 Integration Guide

To use the engine in your own project:

```tsx
import { AIQuestionEngine } from "@/components/ai-question-engine/AIQuestionEngine";

<AIQuestionEngine
  initialSymptom="fever"
  defaultLanguage="hi"
  onComplete={(data) => {
    // Send structured JSON to your backend or risk analyzer
    console.log("Assessment Data:", data);
  }}
/>
```

For more details, see [TEAM_INTEGRATION_GUIDE.md](./docs/TEAM_INTEGRATION_GUIDE.md).

---

## 🛠 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **AI Models**: Google Gemini 1.5 Flash (Question Generation), Sarvam AI (Voice & Translation)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (Custom State Machine)

---

## 📈 Future Scope
- **Advanced Bio-Metrics**: Integration with wearable health data.
- **Offline Modes**: Full Edge-AI deployment for remote rural areas.
- **Clinical Dashboard**: Real-time visualization for medical professionals.

---

Developed with ❤️ for Global Health Accessibility.
=======
# SymptoSense-AI-Engine
AI-powered multilingual symptom triage engine with voice interaction
>>>>>>> 97cb72a6d9478928ddfeb0e8da5e4feb6015d210
