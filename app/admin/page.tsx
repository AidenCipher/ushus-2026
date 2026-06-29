"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, AlertTriangle, Trash2, ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";
import * as React from "react";
import LoadingAnimation from "@/components/shared/LoadingAnimation";

export default function AdminSettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [phase, setPhase] = React.useState("pre-event");
  const [maxReg, setMaxReg] = React.useState("50");
  const [allowReg, setAllowReg] = React.useState(true);
  const [maintenance, setMaintenance] = React.useState(false);

  const [purging, setPurging] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);

  // Load configuration on mount
  React.useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/v1/admin/config");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setPhase(json.data.phase);
            setMaxReg(String(json.data.maxReg));
            setAllowReg(json.data.allowReg);
            setMaintenance(json.data.maintenance);
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          maxReg: Number(maxReg),
          allowReg,
          maintenance,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(json.error || "Failed to save configuration");
      }
    } catch (err) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePurge = async () => {
    if (!confirm("Are you sure you want to permanently purge audit logs older than 30 days?")) return;
    setPurging(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/config/purge", {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        alert(json.message || "Audit logs purged successfully!");
      } else {
        alert(json.error || "Failed to purge logs");
      }
    } catch (err) {
      alert("Error purging transaction logs");
    } finally {
      setPurging(false);
    }
  };

  const handleReset = async () => {
    const confirmation = prompt("WARNING: This will delete all users, teams, registrations, and tasks. Type 'FACTORY RESET' to confirm:");
    if (confirmation !== "FACTORY RESET") {
      alert("Reset cancelled.");
      return;
    }
    setResetting(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/config/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        alert(json.message || "Database factory reset completed successfully. Re-seeding required.");
      } else {
        alert(json.error || "Failed to reset database");
      }
    } catch (err) {
      alert("Error performing database reset");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingAnimation message="Loading global settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-rose-50">System Configuration</h1>
        <p className="text-muted-foreground mt-1">Manage global event settings, toggles, and critical system states.</p>
      </div>

      {success && (
        <div className="bg-success/15 border border-success/30 text-success p-3 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>System configuration saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="bg-danger/15 border border-danger/30 text-danger p-3 rounded-lg flex items-center gap-2 text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Global Event Settings */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle>Event Lifecycle</CardTitle>
          <CardDescription>Control the current state of the USHUS platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Current Phase</Label>
              <Select value={phase} onValueChange={setPhase}>
                <SelectTrigger className="bg-background/50 border-white/10">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning (Organisers Only)</SelectItem>
                  <SelectItem value="pre-event">Pre-Event (Registrations Open)</SelectItem>
                  <SelectItem value="live">Live Event</SelectItem>
                  <SelectItem value="post-event">Post-Event (Certificates)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Max Registrations per Vertical</Label>
              <Input 
                type="number" 
                className="bg-background/50 border-white/10" 
                value={maxReg}
                onChange={(e) => setMaxReg(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Allow New Registrations</Label>
                <p className="text-xs text-muted-foreground">Open or close the public registration portal.</p>
              </div>
              <Switch checked={allowReg} onCheckedChange={setAllowReg} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">Locks out all participants and volunteers. Admin access only.</p>
              </div>
              <Switch checked={maintenance} onCheckedChange={setMaintenance} />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button 
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Configuration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-rose-500/30 bg-rose-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <ShieldAlert className="w-32 h-32 text-rose-500" />
        </div>
        <CardHeader>
          <CardTitle className="text-rose-500 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-rose-500/80">
            Irreversible actions that affect the entire database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-rose-500/20 bg-rose-500/10">
            <div>
              <h4 className="font-semibold text-rose-50">Purge Transaction Logs</h4>
              <p className="text-xs text-rose-200/70 mt-1">Permanently delete all system audit logs older than 30 days.</p>
            </div>
            <Button 
              variant="outline" 
              className="border-rose-500/50 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 whitespace-nowrap text-xs"
              onClick={handlePurge}
              disabled={purging}
            >
              {purging ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Purge Logs
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-rose-500/20 bg-rose-500/10">
            <div>
              <h4 className="font-semibold text-rose-50">Reset Database</h4>
              <p className="text-xs text-rose-200/70 mt-1">Deletes all users, teams, and tasks. Requires superadmin confirmation.</p>
            </div>
            <Button 
              variant="destructive" 
              className="bg-rose-600 hover:bg-rose-700 text-rose-50 text-xs shadow-[0_0_15px_rgba(220,38,38,0.3)] whitespace-nowrap"
              onClick={handleReset}
              disabled={resetting}
            >
              {resetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Factory Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
