"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseVoiceInputOptions {
  onResult?: (transcript: string) => void;
  onInterimResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  language?: string;
}

interface VoiceInputState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

// Extend Window to include SpeechRecognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const {
    onResult,
    onInterimResult,
    onError,
    continuous = false,
    language = "en-US",
  } = options;

  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    isSupported: false,
    transcript: "",
    interimTranscript: "",
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const manualStopRef = useRef(false);

  // Check browser support
  useEffect(() => {
    const isSupported =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

    setState((prev) => ({ ...prev, isSupported }));

    if (isSupported) {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [continuous, language]);

  // Setup event handlers
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onstart = () => {
      setState((prev) => ({
        ...prev,
        isListening: true,
        error: null,
      }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setState((prev) => ({
          ...prev,
          transcript: prev.transcript + finalTranscript,
          interimTranscript: "",
        }));
        onResult?.(finalTranscript);
      }

      if (interimTranscript) {
        setState((prev) => ({
          ...prev,
          interimTranscript,
        }));
        onInterimResult?.(interimTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = getErrorMessage(event.error);
      setState((prev) => ({
        ...prev,
        isListening: false,
        error: errorMessage,
      }));
      onError?.(errorMessage);
    };

    recognition.onend = () => {
      // Restart if continuous mode and not manually stopped
      if (continuous && !manualStopRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          setState((prev) => ({ ...prev, isListening: false }));
        }
      } else {
        setState((prev) => ({ ...prev, isListening: false }));
      }
      manualStopRef.current = false;
    };
  }, [continuous, onResult, onInterimResult, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      onError?.("Speech recognition not supported");
      return;
    }

    manualStopRef.current = false;
    setState((prev) => ({
      ...prev,
      transcript: "",
      interimTranscript: "",
      error: null,
    }));

    try {
      recognitionRef.current.start();
    } catch (error) {
      // Recognition might already be running
      console.error("Speech recognition start error:", error);
    }
  }, [onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      manualStopRef.current = true;
      recognitionRef.current.stop();
    }
    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  const resetTranscript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transcript: "",
      interimTranscript: "",
    }));
  }, []);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}

function getErrorMessage(error: string): string {
  switch (error) {
    case "no-speech":
      return "No speech detected. Please try again.";
    case "audio-capture":
      return "Microphone not found. Please check your audio settings.";
    case "not-allowed":
      return "Microphone permission denied. Please allow microphone access.";
    case "network":
      return "Network error. Please check your connection.";
    case "aborted":
      return "Speech recognition aborted.";
    case "language-not-supported":
      return "Language not supported.";
    case "service-not-allowed":
      return "Speech recognition service not allowed.";
    default:
      return `Speech recognition error: ${error}`;
  }
}

// Hook for simple one-shot voice input
export function useSimpleVoiceInput() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    isSupported,
    startListening: start,
    stopListening: stop,
    resetTranscript,
    isListening: listening,
    transcript: voiceTranscript,
    error: voiceError,
  } = useVoiceInput({
    onResult: (text) => {
      setTranscript((prev) => prev + " " + text);
    },
    onError: setError,
  });

  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  useEffect(() => {
    if (voiceError) setError(voiceError);
  }, [voiceError]);

  const clear = useCallback(() => {
    setTranscript("");
    setError(null);
    resetTranscript();
  }, [resetTranscript]);

  return {
    transcript: transcript.trim(),
    interimTranscript: voiceTranscript,
    isListening,
    isSupported,
    error,
    start,
    stop,
    clear,
  };
}
