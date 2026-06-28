"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TaskApprovalButtonsProps {
  onApprove: () => void;
  onReject: (reason: string) => void;
  isProcessing?: boolean;
}

export function TaskApprovalButtons({
  onApprove,
  onReject,
  isProcessing = false,
}: TaskApprovalButtonsProps) {
  const [showRejectForm, setShowRejectForm] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState("");

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || reason.trim().length === 0) {
      setError("Rejection reason is required");
      return;
    }
    setError("");
    onReject(reason.trim());
  };

  return (
    <div className="space-y-4" data-testid="task-approval-container">
      {!showRejectForm ? (
        <div className="flex gap-2">
          <Button
            onClick={onApprove}
            disabled={isProcessing}
            className="bg-success hover:bg-success/90 text-white"
          >
            Approve
          </Button>
          <Button
            onClick={() => setShowRejectForm(true)}
            disabled={isProcessing}
            variant="destructive"
          >
            Reject
          </Button>
        </div>
      ) : (
        <form onSubmit={handleRejectSubmit} className="space-y-3 p-4 bg-zinc-950 border border-danger/20 rounded-md">
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason" className="text-danger">Rejection Reason</Label>
            <Textarea
              id="reject-reason"
              placeholder="Why is this update being rejected?"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              className="bg-background border-white/10 text-sm"
              disabled={isProcessing}
            />
            {error && <p className="text-xs text-danger font-medium" data-testid="reject-error">{error}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowRejectForm(false);
                setReason("");
                setError("");
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={isProcessing}
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
