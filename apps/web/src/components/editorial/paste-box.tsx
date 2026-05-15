"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface PasteBoxHandle {
  focus: () => void;
  clear: () => void;
  setValue: (value: string) => void;
}

interface PasteBoxSource {
  /** Stable id for React keys. */
  id: string;
  label: string;
  /** Optional icon component (lucide-react). */
  icon?: ElementType;
}

interface PasteBoxProps {
  /** Icon component shown in the head's accent-soft tile (e.g. `Clipboard`). */
  icon: ElementType;
  title: string;
  subtitle?: string;
  /**
   * Placeholder text inside the box. Falls back to a generic
   * "Paste a URL or the full JD text…" if not provided.
   */
  placeholder?: string;
  /**
   * Controlled value. If omitted, the textarea is uncontrolled — read
   * the value via `onSubmit` or a ref.
   */
  value?: string;
  onChange?: (next: string) => void;
  onSubmit?: (value: string) => void;
  /**
   * Disables the submit button until at least N characters are present.
   * Defaults to 10 — short enough to allow a URL paste, long enough to
   * reject empty / fat-finger submits.
   */
  minLength?: number;
  submitLabel?: string;
  /**
   * Right-aligned source chips (URL hints, "from extension", etc.).
   * Decorative; not interactive.
   */
  sources?: ReadonlyArray<PasteBoxSource>;
  /** Optional left-aligned helper text shown next to the submit button. */
  helper?: ReactNode;
  className?: string;
}

export const PasteBox = forwardRef<PasteBoxHandle, PasteBoxProps>(
  function PasteBox(
    {
      icon: Icon,
      title,
      subtitle,
      placeholder = "Paste here — a URL or the full JD text. Slothing extracts role, level, must-haves, nice-to-haves, and compensation if listed.",
      value,
      onChange,
      onSubmit,
      minLength = 10,
      submitLabel = "Score this",
      sources,
      helper,
      className,
    },
    handleRef,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [internalValue, setInternalValue] = useState("");
    const isControlled = typeof value === "string";
    const current = isControlled ? value : internalValue;

    useImperativeHandle(
      handleRef,
      () => ({
        focus: () => textareaRef.current?.focus(),
        clear: () => {
          if (!isControlled) setInternalValue("");
          onChange?.("");
        },
        setValue: (next) => {
          if (!isControlled) setInternalValue(next);
          onChange?.(next);
        },
      }),
      [isControlled, onChange],
    );

    // Autosize the textarea to its content up to a soft max height.
    useEffect(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
    }, [current]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    };

    const handleSubmit = () => {
      const trimmed = current.trim();
      if (trimmed.length < minLength) return;
      onSubmit?.(trimmed);
    };

    const canSubmit = current.trim().length >= minLength;

    return (
      <div
        className={cn(
          "rounded-lg border border-rule bg-paper p-[18px]",
          className,
        )}
        style={{ borderRadius: "var(--r-lg)" }}
      >
        <div className="mb-3 flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid h-[30px] w-[30px] place-items-center rounded-sm bg-brand-soft text-brand"
            style={{ borderRadius: "var(--r-sm)" }}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="font-display text-[16px] font-semibold tracking-tight text-ink">
              {title}
            </div>
            {subtitle ? (
              <div className="text-[12.5px] leading-snug text-ink-3">
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={current}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            "block w-full resize-none rounded-md border border-rule bg-page px-4 py-3.5 font-mono text-[12px] leading-[1.55] text-ink-2 placeholder:text-ink-3 focus:border-rule-strong focus:outline-none",
          )}
          style={{ borderRadius: "var(--r-md)", minHeight: 110 }}
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors",
              canSubmit
                ? "bg-ink text-page hover:bg-brand-dark"
                : "cursor-not-allowed bg-rule-strong-bg text-ink-3",
            )}
            style={{ borderRadius: "var(--r-md)" }}
          >
            {submitLabel}
          </button>
          {helper ? (
            <span className="text-[12px] text-ink-3">{helper}</span>
          ) : null}
          {sources && sources.length > 0 ? (
            <div className="ml-auto flex flex-wrap gap-1">
              {sources.map(({ id, label, icon: SourceIcon }) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full border border-rule bg-page px-2 py-0.5 font-mono text-[10.5px] text-ink-2"
                >
                  {SourceIcon ? (
                    <SourceIcon className="h-3 w-3" aria-hidden="true" />
                  ) : null}
                  {label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);
