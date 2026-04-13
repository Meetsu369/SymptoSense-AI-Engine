# 🤝 SymptoSense Team Integration Guide

This guide ensures any teammate can plug the `AIQuestionEngine` into their part of the app within minutes.

## 🧠 What this Component Does
The `AIQuestionEngine` is a **high-context, voice-enabled health survey engine**. It handles the data collection phase of the assessment using a hybrid AI/Deterministic approach.

- **AI-driven logic**: Automatically generates follow-up questions using Gemini 1.5 Flash.
- **Voice-enabled**: Native TTS (Text-to-Speech) and STT (Speech-to-Text) via Sarvam AI.
- **Multilingual**: Supports English, Hindi, and Hinglish out of the box.
- **Structured Data**: Returns a clean JSON object ready for clinical scoring.

---

## 🧩 Architecture

The engine is designed to be the "Input Layer" of the SymptoSense lifecycle:

```text
[Frontend App]
     ↓ 
[AIQuestionEngine Component] (Step collection)
     ↓ (onComplete)
[/api/analyze] (Deterministic Scoring Engine)
     ↓
[Result UI] (Result Dashboard / Narrative Story)
```

---

## 🔌 Integration Steps

### 1. Import the Component
Simply drop the component into your page. It requires an `initialSymptom` to start the context.

```tsx
import { AIQuestionEngine } from "@/components/ai-question-engine/AIQuestionEngine";

export default function MyAssessmentPage() {
  const handleComplete = (data) => {
    // 1. Send the structured data to the scoring API
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
      // 2. Pass result to your dashboard component
      console.log("Risk Score:", result.score);
      console.log("Urgency:", result.urgency);
    });
  };

  return (
    <div className="p-8">
      <AIQuestionEngine
        initialSymptom="fever"
        defaultLanguage="hi" // Optional: Start in Hindi
        onComplete={handleComplete}
      />
    </div>
  );
}
```

### 2. Output Format (The Contract)
The `onComplete` callback returns:
```json
{
  "symptom": "fever",
  "severity": "severe",
  "duration": "3 days",
  "additional": "chills",
  "history": "diabetes",
  "language": "hi"
}
```

---

## 🛠 Maintenance
- **To add follow-up logic**: Update `services/questionService.ts`.
- **To add static steps**: Update `questionFlow.ts`.
- **To change voice settings**: Update hooks in `components/ai-question-engine/`.
