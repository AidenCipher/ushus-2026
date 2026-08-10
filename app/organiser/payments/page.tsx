"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  CreditCard,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentQueueItem {
  id: string;
  registrationId: string;
  transactionRef: string;
  paymentScreenshotUrl: string | null;
  paymentSubmittedAt: string;
  paymentStatus: "NOT_SUBMITTED" | "SUBMITTED" | "VERIFIED" | "REJECTED";
  rejectionReason: string | null;
  registration: {
    id: string;
    status: string;
    confirmationCode: string;
    user: { name: string; email: string; college: string | null };
    event: {
      id: string;
      name: string;
      vertical: { id: string; name: string };
    };
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PaymentQueuePage() {
  const { data: session } = useSession();

  const [payments, setPayments] = React.useState<PaymentQueueItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Rejection modal state
  const [rejectingId, setRejectingId] = React.useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  // Filter
  const [filterEvent, setFilterEvent] = React.useState("");

  const fetchPayments = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/payments/queue");
      if (!res.ok) throw new Error("Failed to load payment queue");
      const json = await res.json();
      setPayments(json.data ?? []);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Real-time: listen for new payment submissions via Pusher
  React.useEffect(() => {
    // Only import pusher-js on client
    let channel: any;
    import("pusher-js").then((mod) => {
      const PusherClient = mod.default;
      const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
      const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
      if (!key || !cluster) return;
      const pusherClient = new PusherClient(key, { cluster, forceTLS: true });
      channel = pusherClient.subscribe("organiser-payment-queue");
      channel.bind("payment-submitted", () => {
        // Refresh the list when a new payment is submitted
        fetchPayments();
      });
    });
    return () => {
      if (channel) channel.unbind_all();
    };
  }, [fetchPayments]);

  async function handleVerify(registrationId: string, paymentId: string) {
    setActionLoading(paymentId);
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/registrations/${registrationId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to verify");
      await fetchPayments();
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(registrationId: string, paymentId: string) {
    if (!rejectionReason.trim()) return;
    setActionLoading(paymentId);
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/registrations/${registrationId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", rejectionReason: rejectionReason.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to reject");
      setRejectingId(null);
      setRejectionReason("");
      await fetchPayments();
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  // Filter by event name (scoped to organiser's vertical already at API level)
  const filteredPayments = filterEvent.trim()
    ? payments.filter((p) =>
        p.registration.event.name
          .toLowerCase()
          .includes(filterEvent.toLowerCase())
      )
    : payments;

  const submittedCount = payments.filter(
    (p) => p.paymentStatus === "SUBMITTED"
  ).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Verification Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and verify participant payment submissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {submittedCount > 0 && (
            <Badge variant="secondary" className="text-sm">
              {submittedCount} pending
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPayments}
            disabled={loading}
            id="btn-refresh-payments"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Event filter */}
      <div className="max-w-xs">
        <Input
          id="input-event-filter"
          placeholder="Filter by event name…"
          value={filterEvent}
          onChange={(e) => setFilterEvent(e.target.value)}
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <CreditCard className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">No payment submissions found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Participant</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Event</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Transaction Ref</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Screenshot</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Submitted</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{payment.registration.user.name}</div>
                    <div className="text-xs text-muted-foreground">{payment.registration.user.email}</div>
                    {payment.registration.user.college && (
                      <div className="text-xs text-muted-foreground/70">{payment.registration.user.college}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{payment.registration.event.name}</div>
                    <div className="text-xs text-muted-foreground">{payment.registration.event.vertical.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {payment.transactionRef}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    {payment.paymentScreenshotUrl ? (
                      <a
                        href={payment.paymentScreenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                        id={`btn-screenshot-${payment.id}`}
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(payment.paymentSubmittedAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={payment.paymentStatus} />
                    {payment.paymentStatus === "REJECTED" && payment.rejectionReason && (
                      <div className="text-xs text-destructive mt-1 max-w-[160px]">
                        {payment.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {payment.paymentStatus === "SUBMITTED" && (
                      <div className="flex items-center gap-2">
                        <Button
                          id={`btn-verify-${payment.id}`}
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 border-green-600/40 text-green-500 hover:bg-green-600/10"
                          disabled={actionLoading === payment.id}
                          onClick={() => handleVerify(payment.registrationId, payment.id)}
                        >
                          {actionLoading === payment.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Verify
                            </>
                          )}
                        </Button>
                        <Button
                          id={`btn-reject-${payment.id}`}
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 border-destructive/40 text-destructive hover:bg-destructive/10"
                          disabled={actionLoading === payment.id}
                          onClick={() => {
                            setRejectingId(payment.id);
                            setRejectionReason("");
                            setActionError(null);
                          }}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {payment.paymentStatus !== "SUBMITTED" && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}

                    {/* Inline rejection reason form */}
                    {rejectingId === payment.id && (
                      <div className="mt-2 space-y-2 min-w-[220px]">
                        <Input
                          id={`input-rejection-reason-${payment.id}`}
                          placeholder="Reason for rejection…"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="text-xs h-8"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            id={`btn-confirm-reject-${payment.id}`}
                            size="sm"
                            variant="destructive"
                            className="text-xs h-7"
                            disabled={!rejectionReason.trim() || actionLoading === payment.id}
                            onClick={() => handleReject(payment.registrationId, payment.id)}
                          >
                            Confirm Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7"
                            onClick={() => setRejectingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "SUBMITTED":
      return (
        <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-500 bg-amber-500/10">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      );
    case "VERIFIED":
      return (
        <Badge variant="outline" className="text-xs border-green-600/40 text-green-500 bg-green-500/10">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="outline" className="text-xs border-destructive/40 text-destructive bg-destructive/10">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          Not Submitted
        </Badge>
      );
  }
}
