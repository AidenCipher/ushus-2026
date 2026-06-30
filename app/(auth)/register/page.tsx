"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { RegisterSchema } from "@/lib/validations/auth.schema";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, CheckCircle2, ShieldCheck, RefreshCw, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  
  const [step, setStep] = React.useState<"FORM" | "OTP">("FORM");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Verification state
  const [emailOtp, setEmailOtp] = React.useState("");
  const [phoneOtp, setPhoneOtp] = React.useState("");
  const [devCodes, setDevCodes] = React.useState<{ emailOtp: string; phoneOtp: string } | null>(null);

  // Clear any existing active session (like Admin) when hitting the registration page
  React.useEffect(() => {
    signOut({ redirect: false });
  }, []);

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      college: "",
    },
  });

  // Step 1: Send OTP request
  async function handleSendOtp(values: z.infer<typeof RegisterSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          phone: values.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send verification codes. Try again.");
      } else {
        // Save developer mode OTP codes to display on UI
        if (data.devOtp) {
          setDevCodes(data.devOtp);
        }
        setStep("OTP");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Resend OTP trigger
  async function handleResendOtp() {
    setIsLoading(true);
    setError(null);
    try {
      const email = form.getValues("email");
      const phone = form.getValues("phone");
      const res = await fetch("/api/v1/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.devOtp) {
          setDevCodes(data.devOtp);
        }
        setError(null);
      } else {
        setError(data.error || "Failed to resend verification codes.");
      }
    } catch {
      setError("Failed to communicate with server.");
    } finally {
      setIsLoading(false);
    }
  }

  // Step 2: Submit registration with verification codes
  async function onVerifyAndRegister() {
    if (!emailOtp.trim() || !phoneOtp.trim()) {
      setError("Both email and phone verification codes are required.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const values = form.getValues();

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          emailOtp: emailOtp.trim(),
          phoneOtp: phoneOtp.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to register. Please try again.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login?registered=true");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="glass border-white/10 w-full shadow-2xl">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Registration Successful!</h2>
          <p className="text-muted-foreground">
            Your account has been verified and created. Redirecting to login...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-white/10 w-full shadow-2xl max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {step === "FORM" ? "Create an account" : "Verify Details"}
        </CardTitle>
        <CardDescription>
          {step === "FORM" 
            ? "Enter your details below to register for the fest" 
            : "Enter the OTP codes sent to verify your identity"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-md flex flex-col gap-2 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            {error.includes("already exists") && (
              <Link href={`/login?email=${encodeURIComponent(form.getValues("email"))}`} className="mt-1">
                <Button variant="link" className="p-0 h-auto text-primary underline text-xs">
                  Sign In instead &rarr;
                </Button>
              </Link>
            )}
          </div>
        )}

        {step === "FORM" ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSendOtp)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" disabled={isLoading} className="bg-background/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@college.edu" type="email" disabled={isLoading} className="bg-background/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+91..." disabled={isLoading} className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="college"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College</FormLabel>
                      <FormControl>
                        <Input placeholder="Christ University" disabled={isLoading} className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" disabled={isLoading} className="bg-background/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" disabled={isLoading} className="bg-background/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full mt-6 shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-all bg-indigo-600 hover:bg-indigo-700" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP verification...
                  </>
                ) : (
                  "Verify & Create Account"
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            {/* Developer OTP Help Card */}
            {devCodes && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 space-y-2">
                <p className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Developer Sandbox Mode (Auto-Generated Codes)
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-[#0b0f19] border border-white/5 p-2 rounded">
                    <span className="text-muted-foreground block text-[10px]">Email Code:</span>
                    <span className="text-indigo-200 font-bold select-all">{devCodes.emailOtp}</span>
                  </div>
                  <div className="bg-[#0b0f19] border border-white/5 p-2 rounded">
                    <span className="text-muted-foreground block text-[10px]">Phone Code:</span>
                    <span className="text-indigo-200 font-bold select-all">{devCodes.phoneOtp}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Email Verification OTP</label>
                <Input 
                  placeholder="Enter 6-digit Email code" 
                  value={emailOtp} 
                  onChange={(e) => setEmailOtp(e.target.value)} 
                  disabled={isLoading}
                  maxLength={6}
                  className="bg-background/50 font-mono text-center tracking-widest text-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Phone Verification OTP</label>
                <Input 
                  placeholder="Enter 6-digit Phone code" 
                  value={phoneOtp} 
                  onChange={(e) => setPhoneOtp(e.target.value)} 
                  disabled={isLoading}
                  maxLength={6}
                  className="bg-background/50 font-mono text-center tracking-widest text-lg"
                />
              </div>
            </div>

            <Button 
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all" 
              onClick={onVerifyAndRegister} 
              disabled={isLoading || !emailOtp || !phoneOtp}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying codes...
                </>
              ) : (
                "Verify & Complete Registration"
              )}
            </Button>

            <div className="flex gap-2 justify-between items-center mt-2 pt-2 border-t border-white/5">
              <Button variant="ghost" size="sm" onClick={() => setStep("FORM")} className="text-xs text-muted-foreground">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Edit details
              </Button>
              <Button variant="ghost" size="sm" onClick={handleResendOtp} disabled={isLoading} className="text-xs text-indigo-400 hover:text-indigo-300">
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Resend OTPs
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center border-t border-white/5 pt-6 pb-6">
        <div className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
