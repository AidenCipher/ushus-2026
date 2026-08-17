"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { TeamMemberFieldset, emptyTeamMember, isTeamMemberComplete } from "@/components/registration/TeamMemberFieldset";
import type { TeamMemberInfo } from "@/lib/validations/registration.schema";
import { getVerticalLogo } from "@/lib/logos";
import Image from "next/image";

interface EventData {
  id: string;
  name: string;
  teamSize: number;
  status: string;
  vertical: { name: string; colorCode: string };
}

type Step = "loading" | "already-registered" | "closed" | "roster" | "payment" | "done";

export default function IndividualEventRegisterPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const router = useRouter();
  const { data: session } = useSession();

  const [step, setStep] = React.useState<Step>("loading");
  const [event, setEvent] = React.useState<EventData | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [members, setMembers] = React.useState<TeamMemberInfo[]>([]);
  const [teamName, setTeamName] = React.useState("");
  const [facultyName, setFacultyName] = React.useState("");
  const [facultyEmail, setFacultyEmail] = React.useState("");
  const [facultyPhone, setFacultyPhone] = React.useState("");
  const [regError, setRegError] = React.useState<string | null>(null);
  const [submittingReg, setSubmittingReg] = React.useState(false);

  const [registrationId, setRegistrationId] = React.useState<string | null>(null);
  const [paymentLink, setPaymentLink] = React.useState("");
  const [transactionRef, setTransactionRef] = React.useState("");
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = React.useState("");
  const [paymentError, setPaymentError] = React.useState<string | null>(null);
  const [submittingPayment, setSubmittingPayment] = React.useState(false);

  React.useEffect(() => {
    if (!eventId || !session?.user) return;
    const currentUser = session.user;

    async function load() {
      try {
        const [eventRes, regRes, configRes] = await Promise.all([
          fetch(`/api/v1/events/${eventId}`),
          fetch(`/api/v1/registrations?eventId=${eventId}&view=my`),
          fetch("/api/v1/config"),
        ]);

        if (!eventRes.ok) {
          setLoadError("This event could not be found.");
          return;
        }
        const eventJson = await eventRes.json();
        const evt: EventData = eventJson.data;
        setEvent(evt);

        if (configRes.ok) {
          const configJson = await configRes.json();
          setPaymentLink(configJson.data?.paymentLink || "");
        }

        if (regRes.ok) {
          const regJson = await regRes.json();
          const existing = (regJson.data || []).find((r: any) => r.event.id === eventId);
          if (existing) {
            setStep("already-registered");
            return;
          }
        }

        if (evt.status !== "REGISTRATION_OPEN") {
          setStep("closed");
          return;
        }

        // Build exactly `teamSize` competitor slots. For a solo event, prefill
        // from the account holder's own details as a convenience — still editable.
        const initial = Array.from({ length: evt.teamSize }, () => emptyTeamMember());
        if (evt.teamSize === 1) {
          initial[0] = {
            ...initial[0],
            name: currentUser.name ?? "",
            email: currentUser.email ?? "",
          };
        }
        setMembers(initial);
        setStep("roster");
      } catch {
        setLoadError("Something went wrong loading this event. Please try again.");
      }
    }
    load();
  }, [eventId, session]);

  function updateMember(index: number, field: keyof TeamMemberInfo, value: string | boolean) {
    setMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  const allMembersComplete = members.length > 0 && members.every(isTeamMemberComplete);
  const facultyComplete = facultyName.trim() && facultyEmail.trim() && facultyPhone.trim();
  const canSubmitRoster = allMembersComplete && facultyComplete;

  async function handleRosterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user || !canSubmitRoster) return;

    setSubmittingReg(true);
    setRegError(null);
    try {
      const res = await fetch("/api/v1/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          eventId,
          registrationType: "INDIVIDUAL_EVENT",
          teamName: teamName.trim() || null,
          teamMembers: members,
          facultyName: facultyName.trim(),
          facultyEmail: facultyEmail.trim(),
          facultyPhone: facultyPhone.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setRegError(json.error || "Failed to submit registration. Please check your details.");
        return;
      }
      setRegistrationId(json.data.id);
      setStep("payment");
    } catch {
      setRegError("Network error. Please try again.");
    } finally {
      setSubmittingReg(false);
    }
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!registrationId || !transactionRef.trim()) return;
    setSubmittingPayment(true);
    setPaymentError(null);
    try {
      const res = await fetch(`/api/v1/registrations/${registrationId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionRef: transactionRef.trim(),
          paymentScreenshotUrl: paymentScreenshotUrl.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to submit payment");
      setStep("done");
    } catch (err: any) {
      setPaymentError(err.message);
    } finally {
      setSubmittingPayment(false);
    }
  }

  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading event...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <Card className="max-w-lg mx-auto glass border-danger/30">
        <CardContent className="p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-danger mx-auto" />
          <p>{loadError}</p>
          <Link href="/dashboard/events"><Button variant="outline">Back to Events</Button></Link>
        </CardContent>
      </Card>
    );
  }

  if (step === "already-registered") {
    return (
      <Card className="max-w-lg mx-auto glass border-success/30">
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
          <p className="font-semibold">You&apos;re already registered for this event.</p>
          <Link href="/dashboard/events"><Button>View My Events</Button></Link>
        </CardContent>
      </Card>
    );
  }

  if (step === "closed") {
    return (
      <Card className="max-w-lg mx-auto glass border-white/10">
        <CardContent className="p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <p className="font-semibold">Registration for {event?.name} is closed.</p>
          <Link href="/dashboard/events"><Button variant="outline">Back to Events</Button></Link>
        </CardContent>
      </Card>
    );
  }

  if (step === "done") {
    return (
      <Card className="max-w-lg mx-auto glass border-success/30 bg-success/5">
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
          <h2 className="text-xl font-bold">Payment Submitted</h2>
          <p className="text-sm text-muted-foreground">
            Our team will verify your payment and confirm your registration for {event?.name}.
            You&apos;ll get an email once it&apos;s processed.
          </p>
          <Link href="/dashboard/events"><Button className="w-full">View My Events</Button></Link>
        </CardContent>
      </Card>
    );
  }

  // ─── Step: payment ───────────────────────────────────────────────────────
  if (step === "payment") {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Step 2 of 2</span> — Payment
        </div>
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle>Complete Your Payment</CardTitle>
            <CardDescription>Registration for {event?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {paymentLink ? (
                <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold">1. Pay via the official portal</p>
                  <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary underline">
                    Open Payment Portal <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-500">
                  The payment portal link hasn't been configured yet. Please check back soon or contact the organisers.
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="txn-ref">2. Transaction Reference</Label>
                <Input
                  id="txn-ref"
                  placeholder="e.g. UPI/TXN/123456789"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="txn-screenshot">Screenshot URL (optional)</Label>
                <Input
                  id="txn-screenshot"
                  placeholder="Link to your payment screenshot"
                  value={paymentScreenshotUrl}
                  onChange={(e) => setPaymentScreenshotUrl(e.target.value)}
                />
              </div>

              {paymentError && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded p-2" role="alert">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {paymentError}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!transactionRef.trim() || submittingPayment}>
                {submittingPayment ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Payment Details
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Step: roster ────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span className="font-semibold text-foreground">Step 1 of 2</span> — Team Details
        </div>
        <div className="flex items-center gap-2.5">
          {event && getVerticalLogo(event.vertical) && (
            <span className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0 bg-black/30">
              <Image src={getVerticalLogo(event.vertical)!.src} alt="" width={40} height={40} className="w-full h-full object-contain p-0.5" />
            </span>
          )}
          <h1 className="text-2xl font-bold">{event?.name}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {event?.teamSize === 1
            ? "This is a solo event — fill in your own details below."
            : `This event needs exactly ${event?.teamSize} competitors. Every field for every person is required.`}
        </p>
      </div>

      <form onSubmit={handleRosterSubmit} className="space-y-4">
        {regError && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-sm p-3 rounded-md flex items-center gap-2" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" /> {regError}
          </div>
        )}

        {event && event.teamSize > 1 && (
          <div className="space-y-1">
            <Label htmlFor="team-name">Team Name</Label>
            <Input id="team-name" placeholder="e.g. Tactical Unit Alpha" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
          </div>
        )}

        <div className="space-y-3">
          {members.map((m, i) => (
            <TeamMemberFieldset key={i} index={i} value={m} onChange={updateMember} disabled={submittingReg} />
          ))}
        </div>

        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Faculty Coordinator</p>
          <p className="text-[11px] text-muted-foreground">Your college&apos;s faculty contact for verification.</p>
          <div className="grid sm:grid-cols-3 gap-2">
            <Input placeholder="Faculty Name" value={facultyName} onChange={(e) => setFacultyName(e.target.value)} disabled={submittingReg} required />
            <Input placeholder="Faculty Email" type="email" value={facultyEmail} onChange={(e) => setFacultyEmail(e.target.value)} disabled={submittingReg} required />
            <Input placeholder="Faculty Phone" value={facultyPhone} onChange={(e) => setFacultyPhone(e.target.value)} disabled={submittingReg} required />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1" disabled={!canSubmitRoster || submittingReg}>
            {submittingReg ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Continue to Payment <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/events")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
