// ============================================================
// Module 4: useSarvamSTT.ts
// Speech-to-Text hook.
// Primary:  Sarvam AI /speech-to-text → transcription
// Fallback: window.SpeechRecognition (browser built-in)
// ============================================================

"use client";

import { useCallback, useRef, useState } from "react";
import type { Language } from "./types";

const SARVAM_LANG_CODE: Record<Language, string> = {
  en: "en-IN",
  hi: "hi-IN",
};

const BROWSER_LANG_CODE: Record<Language, string> = {
  en: "en-US",
  hi: "hi-IN",
};

export interface UseSarvamSTTReturn {
  startRecording: (language: Language) => Promise<void>;
  stopRecording: () => Promise<string>;
  cancelRecording: () => void;
  isRecording: boolean;
  transcript: string;
  error: string | null;
  hasMicPermission: boolean | null; // null = unknown, true/false = determined
}

export function useSarvamSTT(): UseSarvamSTTReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);

  // Prevent infinite retry loops if API is consistently failing
  const lastFailedAtRef = useRef<number | null>(null);

  // MediaRecorder approach (for Sarvam API upload)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const activeLanguageRef = useRef<Language>("en");

  // Browser SpeechRecognition fallback
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // ---- Sarvam flow ----

  const startMediaRecorder = useCallback(
    async (language: Language): Promise<void> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setHasMicPermission(true);

        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current = recorder;
        activeLanguageRef.current = language;
        recorder.start(100); // collect chunks every 100ms
        setIsRecording(true);
        setError(null);
      } catch (err) {
        setHasMicPermission(false);
        setError("Microphone permission denied");
        throw err;
      }
    },
    []
  );

  const stopMediaRecorder = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve("");
        return;
      }

      recorder.onstop = async () => {
        // Stop all tracks
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setIsRecording(false);

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];

        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");
          formData.append("language", SARVAM_LANG_CODE[activeLanguageRef.current]);

          const response = await fetch("/api/sarvam/stt", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error(`STT API ${response.status}`);

          const data = await response.json();
          const text: string = data.transcript ?? "";
          setTranscript(text);
          resolve(text);
        } catch (err) {
          const timeSinceFailure = lastFailedAtRef.current ? Date.now() - lastFailedAtRef.current : 0;
          if (lastFailedAtRef.current === null || timeSinceFailure >= 30000) {
            console.warn("[STT] Sarvam failed:", err);
          }
          lastFailedAtRef.current = Date.now();
          setError("Using browser STT (Sarvam unavailable)");
          resolve(""); // browser fallback is handled separately
        }
      };

      recorder.stop();
    });
  }, []);

  // ---- Browser SpeechRecognition fallback ----

  const startBrowserSTT = useCallback(
    (language: Language): Promise<string> => {
      return new Promise((resolve, reject) => {
        const SpeechRecognition =
          (typeof window !== "undefined" &&
            (window.SpeechRecognition ||
              (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition)) ||
          null;

        if (!SpeechRecognition) {
          reject(new Error("SpeechRecognition not supported"));
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = BROWSER_LANG_CODE[language];
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognitionRef.current = recognition;
        setIsRecording(true);
        setError(null);

        recognition.onresult = (event) => {
          const text = event.results[0]?.[0]?.transcript ?? "";
          setTranscript(text);
          setIsRecording(false);
          resolve(text);
        };

        recognition.onerror = (event) => {
          setIsRecording(false);
          reject(new Error(event.error));
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
      });
    },
    []
  );

  // ---- Public API ----

  const startRecording = useCallback(
    async (language: Language): Promise<void> => {
      try {
        if (lastFailedAtRef.current !== null) {
          const timeSinceFailure = Date.now() - lastFailedAtRef.current;
          if (timeSinceFailure < 30000) {
            throw new Error("Skipping Sarvam STT (waiting for 30s cooldown)");
          }
        }
        await startMediaRecorder(language);
        
        if (lastFailedAtRef.current !== null) {
          console.log("[STT] Sarvam API recovered successfully.");
          lastFailedAtRef.current = null;
        }
      } catch {
        // Mic denied — try browser STT directly (it has its own permission flow)
        try {
          await startBrowserSTT(language);
        } catch (browserErr) {
          setError("Voice input not available");
          console.warn("[STT] All methods failed:", browserErr);
        }
      }
    },
    [startMediaRecorder, startBrowserSTT]
  );

  const stopRecording = useCallback(async (): Promise<string> => {
    // If MediaRecorder is running, stop it (returns transcript)
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      const text = await stopMediaRecorder();
      if (text) return text;

      // If Sarvam STT returned empty, try browser STT
      try {
        const browserText = await startBrowserSTT(activeLanguageRef.current);
        return browserText;
      } catch {
        return "";
      }
    }

    // If browser recognition is running, stop it
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    return transcript;
  }, [stopMediaRecorder, startBrowserSTT, transcript]);

  const cancelRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setTranscript("");
  }, []);

  return {
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording,
    transcript,
    error,
    hasMicPermission,
  };
}
