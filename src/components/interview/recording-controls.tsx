"use client";

import { useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Download,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAudioRecorder, formatDuration, type AudioRecording } from "@/hooks/useAudioRecorder";

interface RecordingControlsProps {
  onRecordingComplete?: (recording: AudioRecording) => void;
  className?: string;
  compact?: boolean;
}

export function RecordingControls({
  onRecordingComplete,
  className,
  compact = false,
}: RecordingControlsProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    isRecording,
    isPaused,
    duration,
    recording,
    isSupported,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
  } = useAudioRecorder({ onRecordingComplete });

  // Update audio element when recording changes
  useEffect(() => {
    if (audioRef.current && recording?.url) {
      audioRef.current.src = recording.url;
    }
  }, [recording]);

  const handleDownload = () => {
    if (!recording) return;

    const a = document.createElement("a");
    a.href = recording.url;
    a.download = `recording-${new Date().toISOString().slice(0, 19).replace(/[:-]/g, "")}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isSupported) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <AlertCircle className="h-4 w-4" />
        Audio recording not supported
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {!isRecording && !recording && (
          <Button
            variant="outline"
            size="sm"
            onClick={startRecording}
            className="gap-2"
          >
            <Mic className="h-4 w-4" />
            Record
          </Button>
        )}

        {isRecording && (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-mono">{formatDuration(duration)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={stopRecording}
            >
              <Square className="h-4 w-4" />
            </Button>
          </>
        )}

        {recording && !isRecording && (
          <>
            <audio ref={audioRef} controls className="h-8 w-40" />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearRecording}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}

        {error && (
          <span className="text-xs text-destructive">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center justify-center gap-3 mb-4">
          <span
            className={cn(
              "h-3 w-3 rounded-full",
              isPaused ? "bg-warning" : "bg-destructive animate-pulse"
            )}
          />
          <span className="text-2xl font-mono font-bold">
            {formatDuration(duration)}
          </span>
          <span className="text-sm text-muted-foreground">
            {isPaused ? "Paused" : "Recording"}
          </span>
        </div>
      )}

      {/* Playback */}
      {recording && !isRecording && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Recording</span>
            <span className="text-sm text-muted-foreground">
              {formatDuration(recording.duration)}
            </span>
          </div>
          <audio
            ref={audioRef}
            controls
            className="w-full h-10 rounded"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {!isRecording && !recording && (
          <Button
            onClick={startRecording}
            className="gap-2 gradient-bg text-primary-foreground hover:opacity-90"
          >
            <Mic className="h-4 w-4" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <>
            {isPaused ? (
              <Button
                variant="outline"
                onClick={resumeRecording}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Resume
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={pauseRecording}
                className="gap-2"
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={stopRecording}
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </>
        )}

        {recording && !isRecording && (
          <>
            <Button
              onClick={startRecording}
              variant="outline"
              className="gap-2"
            >
              <Mic className="h-4 w-4" />
              Record Again
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="ghost"
              onClick={clearRecording}
              className="gap-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
