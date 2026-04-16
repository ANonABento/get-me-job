"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { BANK_CATEGORIES, type BankCategory } from "@/types";
import {
  CATEGORY_CONFIG,
  CATEGORY_FIELDS,
  FieldEditor,
  cleanContent,
} from "./chunk-card";

interface AddEntryDialogProps {
  onCreate: (category: BankCategory, content: Record<string, unknown>) => void;
}

export function AddEntryDialog({ onCreate }: AddEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<BankCategory>("experience");
  const [content, setContent] = useState<Record<string, unknown>>({});

  const fields = CATEGORY_FIELDS[category];

  function handleCategoryChange(newCategory: BankCategory) {
    setCategory(newCategory);
    setContent({});
  }

  function handleFieldChange(key: string, value: unknown) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const cleaned = cleanContent(content, fields);
    onCreate(category, cleaned);
    setOpen(false);
    setContent({});
    setCategory("experience");
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setContent({});
      setCategory("experience");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Entry</DialogTitle>
          <DialogDescription>
            Manually add an entry to your profile bank.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Category picker */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <div className="flex flex-wrap gap-2">
              {BANK_CATEGORIES.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                const Icon = cfg.icon;
                const isActive = cat === category;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic fields */}
          {fields.map((field) => (
            <FieldEditor
              key={field.key}
              field={field}
              value={content[field.key]}
              onChange={handleFieldChange}
            />
          ))}

          <div className="flex justify-end pt-2">
            <Button onClick={handleSubmit}>
              <Plus className="h-3 w-3 mr-1" />
              Add Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
