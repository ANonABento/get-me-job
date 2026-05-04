"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonProps["variant"];
}

export interface ConfirmDialogState extends Required<
  Omit<ConfirmDialogOptions, "confirmVariant">
> {
  confirmVariant: ButtonProps["variant"];
}

const DEFAULT_CONFIRM_DIALOG_STATE: ConfirmDialogState = {
  title: "",
  description: "",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  confirmVariant: "destructive",
};

export function ConfirmDialog({
  open,
  options,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  options: ConfirmDialogState;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{options.title}</DialogTitle>
          <DialogDescription>{options.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel} autoFocus>
            {options.cancelLabel}
          </Button>
          <Button
            type="button"
            variant={options.confirmVariant}
            onClick={onConfirm}
          >
            {options.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useConfirmDialog() {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmDialogState>(
    DEFAULT_CONFIRM_DIALOG_STATE,
  );
  const resolverRef = React.useRef<((confirmed: boolean) => void) | null>(null);

  const close = React.useCallback((confirmed: boolean) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setOpen(false);
  }, []);

  const confirm = React.useCallback((nextOptions: ConfirmDialogOptions) => {
    resolverRef.current?.(false);
    setOptions({
      title: nextOptions.title,
      description: nextOptions.description,
      confirmLabel:
        nextOptions.confirmLabel ?? DEFAULT_CONFIRM_DIALOG_STATE.confirmLabel,
      cancelLabel:
        nextOptions.cancelLabel ?? DEFAULT_CONFIRM_DIALOG_STATE.cancelLabel,
      confirmVariant:
        nextOptions.confirmVariant ??
        DEFAULT_CONFIRM_DIALOG_STATE.confirmVariant,
    });
    setOpen(true);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  React.useEffect(() => {
    return () => {
      resolverRef.current?.(false);
      resolverRef.current = null;
    };
  }, []);

  const dialog = (
    <ConfirmDialog
      open={open}
      options={options}
      onCancel={() => close(false)}
      onConfirm={() => close(true)}
    />
  );

  return { confirm, dialog };
}
