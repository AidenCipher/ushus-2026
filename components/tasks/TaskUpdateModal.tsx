"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TaskUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { progressPercent: number; note: string }) => void;
  currentProgress: number;
}

export function TaskUpdateModal({
  isOpen,
  onClose,
  onSubmit,
  currentProgress,
}: TaskUpdateModalProps) {
  const [progress, setProgress] = React.useState(currentProgress);
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note || note.trim().length === 0) {
      setError("Note is required");
      return;
    }
    if (note.trim().length < 20) {
      setError("Note must be at least 20 characters");
      return;
    }
    setError("");
    onSubmit({ progressPercent: progress, note: note.trim() });
  };

  const remaining = Math.max(0, 20 - note.trim().length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" data-testid="task-update-modal">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold">Update Task Progress</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="progress">Progress: {progress}%</Label>
            <input
              id="progress"
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Update Note</Label>
            <Textarea
              id="note"
              placeholder="Describe what has been completed..."
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (error) setError("");
              }}
              className="bg-background border-white/10 text-sm min-h-[100px]"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
              <span>Min. 20 characters required</span>
              <span data-testid="char-counter">
                {note.trim().length}/20 {remaining > 0 ? `(${remaining} remaining)` : ""}
              </span>
            </div>
            {error && <p className="text-xs text-danger font-medium" data-testid="error-message">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Submit Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
