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
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [allowReg, setAllowReg] = React.useState(true);
  const [configLoading, setConfigLoading] = React.useState(true);

  // Clear any existing active session (like Admin) when hitting the registration page
  React.useEffect(() => {
    signOut({ redirect: false });
    
    async function checkRegistrations() {
      try {
        const res = await fetch("/api/v1/admin/config");
        if (res.ok) {
          const json = await res.json();
          setAllowReg(json.data.allowReg);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setConfigLoading(false);
      }
    }
    checkRegistrations();
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

  async function onSubmit(values: z.infer<typeof RegisterSchema>) {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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

  if (configLoading) {
    return (
      <Card className="glass border-white/10 w-full shadow-2xl max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Checking registration status...</p>
        </CardContent>
      </Card>
    );
  }

  if (!allowReg) {
    return (
      <Card
        className="w-full shadow-2xl max-w-md mx-auto"
        style={{
          background: "rgba(28, 15, 0, 0.85)",
          border: "1px solid rgba(201, 168, 76, 0.25)",
          backdropFilter: "blur(16px)",
        }}
      >
        <CardHeader className="space-y-1 text-center">
          <CardTitle
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "'Cinzel', serif", color: "#F5ECD7" }}
          >
            Registrations Closed
          </CardTitle>
          <CardDescription style={{ color: "#A89070" }}>
            The registration portal is currently inactive
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
            style={{
              background: "rgba(201, 168, 76, 0.1)",
              border: "1px solid rgba(201, 168, 76, 0.3)",
            }}
          >
            <AlertCircle className="w-8 h-8" style={{ color: "#C9A84C" }} />
          </div>
          <p className="text-sm leading-relaxed text-neutral-300">
            USHUS 2026: IMPERIUM registration has closed or been suspended by the organising committee.
            Contact the Christ University CUSB Organising Committee if you believe this is in error.
          </p>
        </CardContent>
        <CardFooter
          className="flex justify-center pt-6 pb-6 border-t border-amber-500/20"
        >
          <Link
            href="/login"
            className="text-sm font-medium hover:underline text-amber-400"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Sign in with existing account
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="glass border-amber-500/30 bg-[#101A36]/90 w-full shadow-2xl">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#F5ECD7]">Registration Successful!</h2>
          <p className="text-neutral-300">
            Your account has been verified and created. Redirecting to login...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="w-full shadow-2xl max-w-md mx-auto bg-[#101A36]/90 border border-amber-500/30 backdrop-blur-xl"
    >
      <CardHeader className="space-y-1 text-center">
        <CardTitle
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "'Cinzel', serif", color: "#F5ECD7" }}
        >
          Enter the Arena
        </CardTitle>
        <CardDescription className="text-neutral-300">
          Register your details to compete at USHUS 2026: IMPERIUM
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <Button
              className="w-full mt-6 transition-all font-bold"
              type="submit"
              disabled={isLoading}
              style={{
                background: isLoading ? "rgba(201, 168, 76, 0.4)" : "linear-gradient(135deg, #C9A84C, #8B6914)",
                color: "#1A0A00",
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.06em",
                boxShadow: isLoading ? "none" : "0 0 20px rgba(201, 168, 76, 0.25)",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter
        className="flex flex-col items-center justify-center pt-6 pb-6"
        style={{ borderTop: "1px solid rgba(201, 168, 76, 0.1)" }}
      >
        <div className="text-sm text-center" style={{ color: "#A89070" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium hover:underline"
            style={{ color: "#C9A84C" }}
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
