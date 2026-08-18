"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { TeamMemberFieldset, emptyTeamMember, isTeamMemberComplete } from "@/components/registration/TeamMemberFieldset";
import { getVerticalLogo } from "@/lib/logos";
import Image from "next/image";
import type { TeamMemberInfo } from "@/lib/validations/registration.schema";

interface EventData {
  id: string;
  name: string;
  teamSize: number;
  status: string;
  vertical: { name: string; colorCode: string };
}

type Phase = "loading" | "intro" | "wizard" | "payment" | "done";

export default function PublicContingentRegisterPage() {
  const router = useRouter();

  const [phase, setPhase] = React.useState<Phase>("loading");
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [events, setEvents] = React.useState<EventData[]>([]);
  const [paymentLink, setPaymentLink] = React.useState("");

  // Step 0: account + institution details, captured once.
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [collegeName, setCollegeName] = React.useState("");
  const [city, setCity] = React.useState("");
  const [facultyName, setFacultyName] = React.useState("");
  const [facultyEmail, setFacultyEmail] = React.useState("");
  const [facultyPhone, setFacultyPhone] = React.useState("");

  const [rosters, setRosters] = React.useState<Record<string, TeamMemberInfo[]>>({});
  const [eventIndex, setEventIndex] = React.useState(0);

  const [regError, setRegError] = React.useState<string | null>(null);
  const [submittingReg, setSubmittingReg] = React.useState(false);

  const [contingentId] = React.useState(() => uuidv4());
  const [transactionRef, setTransactionRef] = React.useState("");
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = React.useState("");
  const [paymentError, setPaymentError] = React.useState<string | null>(null);
  const [submittingPayment, setSubmittingPayment] = React.useState(false);
  const [registeredCount, setRegisteredCount] = React.useState(0);

  React.useEffect(() => {
    async function load() {
      try {
        const [eventsRes, configRes] = await Promise.all([
          fetch("/api/v1/events?status=REGISTRATION_OPEN"),
          fetch("/api/v1/config"),
        ]);
        if (!eventsRes.ok) {
          setLoadError("Couldn't load the event list. Please try again.");
          return;
        }
        const eventsJson = await eventsRes.json();
        const openEvents: EventData[] = eventsJson.data || [];
        setEvents(openEvents);

        if (configRes.ok) {
          const configJson = await configRes.json();
          setPaymentLink(configJson.data?.paymentLink || "");
        }

        const initialRosters: Record<string, TeamMemberInfo[]> = {};
        for (const evt of openEvents) {
          initialRosters[evt.id] = Array.from({ length: evt.teamSize }, () => emptyTeamMember());
        }
        setRosters(initialRosters);
        setPhase("intro");
      } catch {
        setLoadError("Something went wrong loading the contingent registry. Please try again.");
      }
    }
    load();
  }, []);

  const accountComplete = Boolean(name.trim() && email.trim() && phone.trim() && password && confirmPassword);
  const institutionComplete = Boolean(
    accountComplete && collegeName.trim() && city.trim() && facultyName.trim() && facultyEmail.trim() && facultyPhone.trim()
  );

  function updateMember(eventId: string, index: number, field: keyof TeamMemberInfo, value: string | boolean) {
    setRosters((prev) => {
      const next = { ...prev };
      const roster = [...(next[eventId] ?? [])];
      roster[index] = { ...roster[index], [field]: value };
      next[eventId] = roster;
      return next;
    });
  }

  function startWizard() {
    if (!institutionComplete) return;
    if (password !== confirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }
    setRegError(null);
    setEventIndex(1);
    setPhase("wizard");
  }

  const currentEvent = phase === "wizard" ? events[eventIndex - 1] : null;
  const currentRoster = currentEvent ? rosters[currentEvent.id] ?? [] : [];
  const currentEventComplete = currentRoster.length > 0 && currentRoster.every(isTeamMemberComplete);

  function goNext() {
    if (eventIndex < events.length) {
      setEventIndex((i) => i + 1);
    } else {
      submitContingent();
    }
  }

  function goBack() {
    if (eventIndex > 1) {
      setEventIndex((i) => i - 1);
    } else {
      setPhase("intro");
    }
  }

  async function submitContingent() {
    setSubmittingReg(true);
    setRegError(null);
    try {
      const entries = events.map((evt) => ({
        eventId: evt.id,
        teamMembers: (rosters[evt.id] ?? []).map((m) => ({
          ...m,
          college: collegeName.trim(),
          city: city.trim(),
        })),
      }));

      const res = await fetch("/api/v1/public-registrations/contingent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          college: collegeName.trim(),
          password,
          confirmPassword,
          contingentId,
          collegeName: collegeName.trim(),
          city: city.trim(),
          facultyName: facultyName.trim(),
          facultyEmail: facultyEmail.trim(),
          facultyPhone: facultyPhone.trim(),
          entries,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setRegError(json.error || "Failed to submit the contingent registration.");
        setPhase("intro");
        setEventIndex(0);
        return;
      }

      const signInRes = await signIn("credentials", { redirect: false, email: email.trim(), password });
      if (signInRes?.error) {
        console.error("Auto sign-in failed after contingent registration:", signInRes.error);
      }

      setRegisteredCount(json.data.registrationCount);
      setPhase("payment");
    } catch {
      setRegError("Network error. Please try again.");
      setPhase("intro");
      setEventIndex(0);
    } finally {
      setSubmittingReg(false);
    }
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!transactionRef.trim()) return;
    setSubmittingPayment(true);
    setPaymentError(null);
    try {
      const res = await fetch(`/api/v1/registrations/contingent/${contingentId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionRef: transactionRef.trim(),
          paymentScreenshotUrl: paymentScreenshotUrl.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to submit payment");
      setPhase("done");
    } catch (err: any) {
      setPaymentError(err.message);
    } finally {
      setSubmittingPayment(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B132B]" style={{ color: "#F5ECD7" }}>
      <Navbar />
      <main className="flex-grow pt-28 pb-24 px-4">
        <div className="container mx-auto max-w-2xl">
          {phase === "loading" && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
              <p className="text-sm">Loading contingent registry...</p>
            </div>
          )}

          {loadError && phase !== "loading" && (
            <Card className="max-w-lg mx-auto glass border-danger/30">
              <CardContent className="p-8 text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-danger mx-auto" />
                <p>{loadError}</p>
                <Link href="/register"><Button variant="outline">Back to Registration</Button></Link>
              </CardContent>
            </Card>
          )}

          {phase === "done" && (
            <Card className="max-w-lg mx-auto glass border-success/30 bg-success/5">
              <CardContent className="p-8 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
                <h2 className="text-xl font-bold">Contingent Payment Submitted</h2>
                <p className="text-sm text-neutral-300">
                  Your registrations for {registeredCount} events are pending payment verification.
                  You'll get an email once they're processed.
                </p>
                <Button className="w-full" onClick={() => router.push("/dashboard")}>Go to My Dashboard</Button>
              </CardContent>
            </Card>
          )}

          {phase === "payment" && (
            <div className="space-y-6">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Complete Contingent Payment</CardTitle>
                  <CardDescription>One payment covers all {registeredCount} registered events.</CardDescription>
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
                      <Input id="txn-ref" placeholder="e.g. UPI/TXN/123456789" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="txn-screenshot">Screenshot URL (optional)</Label>
                      <Input id="txn-screenshot" placeholder="Link to your payment screenshot" value={paymentScreenshotUrl} onChange={(e) => setPaymentScreenshotUrl(e.target.value)} />
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
          )}

          {phase === "intro" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Register a Full Contingent</h1>
                <p className="text-sm text-neutral-300 mt-1">
                  {`One flow to register your college's delegation across all ${events.length} events. Create your account and enter your college details once — you'll pick each event's team next, and pay once at the end.`}
                </p>
              </div>
              {regError && (
                <div className="bg-danger/10 border border-danger/20 text-danger text-sm p-3 rounded-md flex items-center gap-2" role="alert">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {regError}
                </div>
              )}
              <Card className="glass border-white/10">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Your Account</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input placeholder="Your Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                      <Input placeholder="Your Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      <Input placeholder="Your Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      <div />
                      <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                      <Input placeholder="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-400">College Details</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input placeholder="e.g. IIM Bangalore" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} />
                      <Input placeholder="e.g. Bengaluru" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Faculty Coordinator</p>
                    <div className="grid sm:grid-cols-3 gap-2">
                      <Input placeholder="Faculty Name" value={facultyName} onChange={(e) => setFacultyName(e.target.value)} />
                      <Input placeholder="Faculty Email" type="email" value={facultyEmail} onChange={(e) => setFacultyEmail(e.target.value)} />
                      <Input placeholder="Faculty Phone" value={facultyPhone} onChange={(e) => setFacultyPhone(e.target.value)} />
                    </div>
                  </div>
                  <Button className="w-full" disabled={!institutionComplete} onClick={startWizard}>
                    Start Team Rosters <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  <p className="text-xs text-neutral-500 text-center">
                    Already have an account?{" "}
                    <Link href="/login" className="text-amber-400 hover:underline">Sign in</Link> to register from your dashboard instead.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {phase === "wizard" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-sm text-neutral-400 mb-1">
                  <span className="font-semibold text-foreground">Event {eventIndex} of {events.length}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-amber-500 transition-all" style={{ width: `${(eventIndex / events.length) * 100}%` }} />
                </div>
                <div className="flex items-center gap-2.5">
                  {currentEvent && getVerticalLogo(currentEvent.vertical) && (
                    <span className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0 bg-black/30">
                      <Image src={getVerticalLogo(currentEvent.vertical)!.src} alt="" width={40} height={40} className="w-full h-full object-contain p-0.5" />
                    </span>
                  )}
                  <h1 className="text-2xl font-bold" style={{ color: currentEvent?.vertical.colorCode }}>{currentEvent?.name}</h1>
                </div>
                <p className="text-sm text-neutral-300">
                  {currentEvent?.teamSize === 1
                    ? "This is a solo event — one competitor."
                    : `This event needs exactly ${currentEvent?.teamSize} competitors.`}
                </p>
              </div>

              {regError && (
                <div className="bg-danger/10 border border-danger/20 text-danger text-sm p-3 rounded-md flex items-center gap-2" role="alert">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {regError}
                </div>
              )}

              <div className="space-y-3">
                {currentEvent &&
                  currentRoster.map((m, i) => (
                    <TeamMemberFieldset
                      key={`${currentEvent.id}-${i}`}
                      index={i}
                      value={m}
                      onChange={(idx, field, value) => updateMember(currentEvent.id, idx, field, value)}
                      disabled={submittingReg}
                      hideCollegeCity
                    />
                  ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1" disabled={!currentEventComplete || submittingReg} onClick={goNext}>
                  {submittingReg ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {eventIndex < events.length ? "Next Event" : "Review & Submit"} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button type="button" variant="outline" onClick={goBack} disabled={submittingReg}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
