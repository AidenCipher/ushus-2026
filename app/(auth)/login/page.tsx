"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { LoginSchema } from "@/lib/validations/auth.schema";
import { getDashboardPath } from "@/lib/permissions";
import type { Role } from "@prisma/client";

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
import { AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (res?.error) {
        // NextAuth surfaces the error message from the authorize() callback
        if (res.error.includes("Too many login attempts")) {
          setError(res.error);
        } else if (res.error.includes("deactivated")) {
          setError("Your account has been deactivated. Contact the organisers.");
        } else {
          setError("Invalid email or password");
        }
      } else {
        // Fetch the fresh session to get the user's role
        const session = await getSession();
        const role = session?.user?.role as Role | undefined;
        
        // If there's a specific callbackUrl (not the default), use it
        const explicitCallback = searchParams.get("callbackUrl");
        if (explicitCallback) {
          router.push(explicitCallback);
        } else {
          // Otherwise redirect to the role-appropriate dashboard
          const dashboardPath = role ? getDashboardPath(role) : "/dashboard";
          router.push(dashboardPath);
        }
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="glass border-white/10 w-full shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-md flex items-center gap-2 mb-6 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="name@example.com" 
                      type="email" 
                      disabled={isLoading} 
                      className="bg-background/50"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link href="/forgot-password" className="text-xs text-primary hover:underline" tabIndex={-1}>
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="••••••••" 
                      type="password" 
                      disabled={isLoading}
                      className="bg-background/50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full mt-6 shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-all" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center border-t border-white/5 pt-6 pb-6 gap-3">
        <div className="text-sm text-muted-foreground text-center">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Register now
          </Link>
        </div>
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 font-medium mt-1">
          ← Back to Home
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <Card className="glass border-white/10 w-full shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <span className="text-sm text-muted-foreground">Loading login form...</span>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center border-t border-white/5 pt-6 pb-6 opacity-50 gap-3">
          <div className="text-sm text-muted-foreground text-center">
            Don't have an account? Register now
          </div>
          <div className="text-xs text-muted-foreground">
            ← Back to Home
          </div>
        </CardFooter>
      </Card>
    }>
      <LoginForm />
    </React.Suspense>
  );
}
