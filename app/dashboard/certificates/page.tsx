"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Lock } from "lucide-react";

export default function CertificatesPage() {
  const eventStatus = "IN_PROGRESS"; // Mock status

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
        <p className="text-muted-foreground mt-1">Download your participation and achievement certificates.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass border-white/10 relative overflow-hidden">
          {eventStatus === "IN_PROGRESS" && (
            <div className="absolute inset-0 z-20 backdrop-blur-md bg-background/50 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Not Yet Available</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Certificates will be generated and unlocked after the valedictory ceremony on Jan 21.
              </p>
            </div>
          )}
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
              <Award className="w-6 h-6" />
            </div>
            <CardTitle>Certificate of Participation</CardTitle>
            <CardDescription>USHUS 2026 - Best Manager</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled={eventStatus === "IN_PROGRESS"}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
