"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Skill } from "@/types";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface SkillTagProps {
  onChange: (skill: Skill) => void;
  onRemove: () => void;
  skill: Skill;
}

export function SkillTag({ onChange, onRemove, skill }: SkillTagProps) {
  const [editing, setEditing] = useState(!skill.name);

  if (editing) {
    return (
      <div className="inline-flex items-center gap-1 rounded-lg border bg-card p-1">
        <Input
          autoFocus
          className="h-8 w-32 text-sm"
          value={skill.name}
          onChange={(event) => onChange({ ...skill, name: event.target.value })}
          onBlur={() => skill.name && setEditing(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && skill.name) {
              setEditing(false);
            }
            if (event.key === "Escape") {
              setEditing(false);
            }
          }}
          placeholder="Skill name"
        />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
    >
      <span className="text-sm font-medium">{skill.name}</span>
      <Trash2
        className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
      />
    </button>
  );
}
