"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "destructive";
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const variantClasses = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

const circularProgressColorClasses = {
  success: "text-success",
  warning: "text-warning",
  default: "text-primary",
  destructive: "text-destructive",
};

function clampProgressValue(value: number, max: number) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Number.isFinite(value) ? value : 0;
  const clampedValue = Math.min(Math.max(safeValue, 0), safeMax);

  return {
    value: clampedValue,
    max: safeMax,
    percentage: (clampedValue / safeMax) * 100,
  };
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      showLabel = false,
      size = "md",
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const progress = clampProgressValue(value, max);

    return (
      <div className="space-y-1">
        {showLabel && (
          <div className="flex justify-between text-sm [letter-spacing:var(--letter-spacing)]">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {Math.round(progress.percentage)}%
            </span>
          </div>
        )}
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={progress.value}
          aria-valuemin={0}
          aria-valuemax={progress.max}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-muted",
            sizeClasses[size],
            className,
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-out",
              variantClasses[variant],
            )}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>
    );
  },
);

Progress.displayName = "Progress";

// Circular progress for scores/matches
interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
}

function CircularProgress({
  value,
  size = 80,
  strokeWidth = 8,
  className,
  showValue = true,
}: CircularProgressProps) {
  const progress = clampProgressValue(value, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress.percentage / 100) * circumference;

  const getColorClass = () => {
    if (progress.value >= 80) return circularProgressColorClasses.success;
    if (progress.value >= 60) return circularProgressColorClasses.warning;
    if (progress.value >= 40) return circularProgressColorClasses.default;
    return circularProgressColorClasses.destructive;
  };

  return (
    <div className={cn("relative inline-flex", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-all duration-500 ease-out",
            getColorClass(),
          )}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold [letter-spacing:var(--letter-spacing)]">
            {Math.round(progress.value)}
          </span>
        </div>
      )}
    </div>
  );
}

export { Progress, CircularProgress };
