"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
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

type Step = "loading" | "closed" | "account" | "payment" | "done" | "error";

export default function PublicEventRegisterPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const router = useRouter();

  const [step, setStep] = React.useState<Step>("loading");
  const [event, setEvent] = React.useState<EventData | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [paymentLink, setPaymentLink] = React.useState("");

  // Account fields — this creates the login used to check registration status later.
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [college, setCollege] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [members, setMembers] = React.useState<TeamMemberInfo[]>([]);
  const [teamName, setTeamName] = React.useState("");
  const [facultyName, setFacultyName] = React.useState("");
  const [facultyEmail, setFacultyEmail] = React.useState("");
  const [facultyPhone, setFacultyPhone] = React.useState("");
  const [regError, setRegError] = React.useState<string | null>(null);
  const [submittingReg, setSubmittingReg] = React.useState(false);

  const [registrationId, setRegistrationId] = React.useState<string | null>(null);
  const [transactionRef, setTransactionRef] = React.useState("");
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = React.useState("");
  const [paymentError, setPaymentError] = React.useState<string | null>(null);
  const [submittingPayment, setSubmittingPayment] = React.useState(false);

  React.useEffect(() => {
    if (!eventId) return;

    async function load() {
      try {
        const [eventRes, configRes] = await Promise.all([
          fetch(`/api/v1/events/${eventId}`),
          fetch("/api/v1/config"),
        ]);

        if (!eventRes.ok) {
          setLoadError("This event could not be found.");
          setStep("error");
          return;
        }
        const eventJson = await eventRes.json();
        const evt: EventData = eventJson.data;
        setEvent(evt);

        if (configRes.ok) {
          const configJson = await configRes.json();
          setPaymentLink(configJson.data?.paymentLink || "");
        }

        if (evt.status !== "REGISTRATION_OPEN") {
          setStep("closed");
          return;
        }

        setMembers(Array.from({ length: evt.teamSize }, () => emptyTeamMember()));
        setStep("account");
      } catch {
        setLoadError("Something went wrong loading this event. Please try again.");
        setStep("error");
      }
    }
    load();
  }, [eventId]);

  function updateMember(index: number, field: keyof TeamMemberInfo, value: string | boolean) {
    setMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  const accountComplete = Boolean(
    name.trim() && email.trim() && phone.trim() && college.trim() && password && confirmPassword
  );
  const allMembersComplete = members.length > 0 && members.every(isTeamMemberComplete);
  const facultyComplete = Boolean(facultyName.trim() && facultyEmail.trim() && facultyPhone.trim());
  const canSubmit = accountComplete && allMembersComplete && facultyComplete;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    if (password !== confirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }

    setSubmittingReg(true);
    setRegError(null);
    try {
      const res = await fetch("/api/v1/public-registrations/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          college: college.trim(),
          password,
          confirmPassword,
          eventId,
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

      // Sign in immediately with the credentials just created so the
      // payment step (and the dashboard afterwards) can use the session.
      const signInRes = await signIn("credentials", { redirect: false, email: email.trim(), password });
      if (signInRes?.error) {
        // Registration succeeded even if auto-login didn't — don't block on it.
        console.error("Auto sign-in failed after registration:", signInRes.error);
      }

      setRegistrationId(json.data.registrationId);
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

  const crest = event ? getVerticalLogo(event.vertical) : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0B132B]" style={{ color: "#F5ECD7" }}>
      <Navbar />
      <main className="flex-grow pt-28 pb-24 px-4">
        <div className="container mx-auto max-w-2xl">
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
              <p className="text-sm">Loading event...</p>
            </div>
          )}

          {step === "error" && (
            <Card className="max-w-lg mx-auto glass border-danger/30">
              <CardContent className="p-8 text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-danger mx-auto" />
                <p>{loadError}</p>
                <Link href="/register"><Button variant="outline">Back to Registration</Button></Link>
              </CardContent>
            </Card>
          )}

          {step === "closed" && (
            <Card className="max-w-lg mx-auto glass border-white/10">
              <CardContent className="p-8 text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <p className="font-semibold">Registration for {event?.name} is closed.</p>
                <Link href="/register"><Button variant="outline">Back to Registration</Button></Link>
              </CardContent>
            </Card>
          )}

          {step === "done" && (
            <Card className="max-w-lg mx-auto glass border-success/30 bg-success/5">
              <CardContent className="p-8 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
                <h2 className="text-xl font-bold">Payment Submitted</h2>
                <p className="text-sm text-neutral-300">
                  Our team will verify your payment and confirm your registration for {event?.name}.
                  You'll get an email once it's processed — you can also check your status any time by signing in.
                </p>
                <Button className="w-full" onClick={() => router.push("/dashboard")}>Go to My Dashboard</Button>
              </CardContent>
            </Card>
          )}

          {step === "payment" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-neutral-400">
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

          {step === "account" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-sm text-neutral-400 mb-1">
                  <span className="font-semibold text-foreground">Step 1 of 2</span> — Your Account &amp; Team
                </div>
                <div className="flex items-center gap-2.5">
                  {crest && (
                    <span className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0 bg-black/30">
                      <Image src={crest.src} alt="" width={40} height={40} className="w-full h-full object-contain p-0.5" />
                    </span>
                  )}
                  <h1 className="text-2xl font-bold">{event?.name}</h1>
                </div>
                <p className="text-sm text-neutral-300 mt-1">
                  {event?.teamSize === 1
                    ? "This is a solo event — fill in your own details below."
                    : `This event needs exactly ${event?.teamSize} competitors. Every field for every person is required.`}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {regError && (
                  <div className="bg-danger/10 border border-danger/20 text-danger text-sm p-3 rounded-md flex items-center gap-2" role="alert">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {regError}
                  </div>
                )}

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Your Account</p>
                  <p className="text-[11px] text-neutral-400">
                    This creates your USHUS login — you'll use it to check your registration status later.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="acct-name">Full Name</Label>
                      <Input id="acct-name" placeholder="As per college ID" value={name} onChange={(e) => setName(e.target.value)} disabled={submittingReg} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="acct-email">Email</Label>
                      <Input id="acct-email" type="email" placeholder="name@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} disabled={submittingReg} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="acct-phone">Phone</Label>
                      <Input id="acct-phone" placeholder="+91..." value={phone} onChange={(e) => setPhone(e.target.value)} disabled={submittingReg} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="acct-college">College</Label>
                      <Input id="acct-college" placeholder="e.g. IIM Bangalore" value={college} onChange={(e) => setCollege(e.target.value)} disabled={submittingReg} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="acct-password">Password</Label>
                      <Input id="acct-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={submittingReg} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="acct-confirm">Confirm Password</Label>
                      <Input id="acct-confirm" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={submittingReg} required />
                    </div>
                  </div>
                </div>

                {event && event.teamSize > 1 && (
                  <div className="space-y-1">
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input id="team-name" placeholder="e.g. Tactical Unit Alpha" value={teamName} onChange={(e) => setTeamName(e.target.value)} disabled={submittingReg} />
                  </div>
                )}

                <div className="space-y-3">
                  {members.map((m, i) => (
                    <TeamMemberFieldset key={i} index={i} value={m} onChange={updateMember} disabled={submittingReg} />
                  ))}
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Faculty Coordinator</p>
                  <p className="text-[11px] text-neutral-400">Your college's faculty contact for verification.</p>
                  <div className="grid sm:grid-cols-3 gap-2">
                    <Input placeholder="Faculty Name" value={facultyName} onChange={(e) => setFacultyName(e.target.value)} disabled={submittingReg} required />
                    <Input placeholder="Faculty Email" type="email" value={facultyEmail} onChange={(e) => setFacultyEmail(e.target.value)} disabled={submittingReg} required />
                    <Input placeholder="Faculty Phone" value={facultyPhone} onChange={(e) => setFacultyPhone(e.target.value)} disabled={submittingReg} required />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1" disabled={!canSubmit || submittingReg}>
                    {submittingReg ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Continue to Payment <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/register")}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                </div>
                <p className="text-xs text-neutral-500 text-center">
                  Already have an account?{" "}
                  <Link href="/login" className="text-amber-400 hover:underline">Sign in</Link> to register from your dashboard instead.
                </p>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
