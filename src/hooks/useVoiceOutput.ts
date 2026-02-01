"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseVoiceOutputOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface VoiceOutputState {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  error: string | null;
}

export function useVoiceOutput(options: UseVoiceOutputOptions = {}) {
  const {
    voice,
    rate = 1,
    pitch = 1,
    volume = 1,
    onStart,
    onEnd,
    onError,
  } = options;

  const [state, setState] = useState<VoiceOutputState>({
    isSpeaking: false,
    isPaused: false,
    isSupported: false,
    availableVoices: [],
    currentVoice: null,
    error: null,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support and load voices
  useEffect(() => {
    const isSupported =
      typeof window !== "undefined" && "speechSynthesis" in window;

    setState((prev) => ({ ...prev, isSupported }));

    if (!isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(
        (v) => v.lang.startsWith("en") || v.lang === "en-US"
      );

      // Prefer English voices, but include all
      const sortedVoices = [
        ...englishVoices,
        ...voices.filter((v) => !v.lang.startsWith("en")),
      ];

      // Find the selected voice or default to first English voice
      let selectedVoice = sortedVoices.find((v) => v.name === voice);
      if (!selectedVoice && englishVoices.length > 0) {
        selectedVoice = englishVoices[0];
      }

      setState((prev) => ({
        ...prev,
        availableVoices: sortedVoices,
        currentVoice: selectedVoice || null,
      }));
    };

    // Voices may load asynchronously
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [voice]);

  const speak = useCallback(
    (text: string) => {
      if (!state.isSupported) {
        onError?.("Speech synthesis not supported");
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Configure utterance
      if (state.currentVoice) {
        utterance.voice = state.currentVoice;
      }
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Event handlers
      utterance.onstart = () => {
        setState((prev) => ({
          ...prev,
          isSpeaking: true,
          isPaused: false,
          error: null,
        }));
        onStart?.();
      };

      utterance.onend = () => {
        setState((prev) => ({
          ...prev,
          isSpeaking: false,
          isPaused: false,
        }));
        onEnd?.();
      };

      utterance.onerror = (event) => {
        const errorMessage = `Speech synthesis error: ${event.error}`;
        setState((prev) => ({
          ...prev,
          isSpeaking: false,
          isPaused: false,
          error: errorMessage,
        }));
        onError?.(errorMessage);
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);
    },
    [state.isSupported, state.currentVoice, rate, pitch, volume, onStart, onEnd, onError]
  );

  const pause = useCallback(() => {
    if (state.isSpeaking && !state.isPaused) {
      window.speechSynthesis.pause();
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, [state.isSpeaking, state.isPaused]);

  const resume = useCallback(() => {
    if (state.isSpeaking && state.isPaused) {
      window.speechSynthesis.resume();
      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, [state.isSpeaking, state.isPaused]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setState((prev) => ({
      ...prev,
      isSpeaking: false,
      isPaused: false,
    }));
  }, []);

  const togglePause = useCallback(() => {
    if (state.isPaused) {
      resume();
    } else {
      pause();
    }
  }, [state.isPaused, pause, resume]);

  const setVoice = useCallback((voiceName: string) => {
    const newVoice = state.availableVoices.find((v) => v.name === voiceName);
    if (newVoice) {
      setState((prev) => ({ ...prev, currentVoice: newVoice }));
    }
  }, [state.availableVoices]);

  return {
    ...state,
    speak,
    pause,
    resume,
    stop,
    togglePause,
    setVoice,
  };
}

// Simplified hook for reading text aloud
export function useReadAloud() {
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const {
    isSupported,
    availableVoices,
    currentVoice,
    speak,
    pause,
    resume,
    stop,
    setVoice,
    isSpeaking,
    isPaused: paused,
  } = useVoiceOutput({
    rate: 0.9, // Slightly slower for clarity
    onStart: () => setIsReading(true),
    onEnd: () => {
      setIsReading(false);
      setIsPaused(false);
    },
  });

  useEffect(() => {
    setIsReading(isSpeaking);
    setIsPaused(paused);
  }, [isSpeaking, paused]);

  const read = useCallback(
    (text: string) => {
      if (isReading) {
        stop();
        setIsReading(false);
      } else {
        speak(text);
      }
    },
    [isReading, speak, stop]
  );

  const togglePause = useCallback(() => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isPaused, pause, resume]);

  return {
    isSupported,
    isReading,
    isPaused,
    availableVoices,
    currentVoice,
    read,
    stop,
    pause: togglePause,
    setVoice,
  };
}

// Hook for interview question reading
export function useInterviewReader() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [questions, setQuestions] = useState<string[]>([]);

  const {
    isSupported,
    isReading,
    isPaused,
    availableVoices,
    currentVoice,
    read,
    stop,
    pause,
    setVoice,
  } = useReadAloud();

  const readQuestion = useCallback(
    (question: string, index: number) => {
      setCurrentQuestionIndex(index);
      read(question);
    },
    [read]
  );

  const readAllQuestions = useCallback(
    (questionList: string[]) => {
      setQuestions(questionList);
      if (questionList.length > 0) {
        readQuestion(questionList[0], 0);
      }
    },
    [readQuestion]
  );

  const readNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      readQuestion(questions[nextIndex], nextIndex);
    }
  }, [currentQuestionIndex, questions, readQuestion]);

  const stopReading = useCallback(() => {
    stop();
    setCurrentQuestionIndex(-1);
  }, [stop]);

  return {
    isSupported,
    isReading,
    isPaused,
    currentQuestionIndex,
    availableVoices,
    currentVoice,
    readQuestion,
    readAllQuestions,
    readNextQuestion,
    stopReading,
    pause,
    setVoice,
  };
}
