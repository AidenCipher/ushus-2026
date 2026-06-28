"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, AlertTriangle, Trash2, ShieldAlert } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
        <p className="text-muted-foreground mt-1">Manage global event settings, toggles, and critical system states.</p>
      </div>

      {/* Global Event Settings */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle>Event Lifecycle</CardTitle>
          <CardDescription>Control the current state of the USHUS 2026 platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Current Phase</Label>
              <Select defaultValue="pre-event">
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
              <Input type="number" defaultValue={50} className="bg-background/50 border-white/10" />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Allow New Registrations</Label>
                <p className="text-xs text-muted-foreground">Open or close the public registration portal.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">Locks out all participants and volunteers. Admin access only.</p>
              </div>
              <Switch />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button className="bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              <Save className="w-4 h-4 mr-2" /> Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-rose-500/50 bg-rose-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldAlert className="w-32 h-32 text-rose-500" />
        </div>
        <CardHeader>
          <CardTitle className="text-rose-500 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-rose-500/80">
            Irreversible actions that affect the entire database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-rose-500/20 bg-rose-500/10">
            <div>
              <h4 className="font-semibold text-rose-50">Purge Audit Logs</h4>
              <p className="text-xs text-rose-200/70 mt-1">Permanently delete all system audit logs older than 30 days.</p>
            </div>
            <Button variant="outline" className="border-rose-500/50 text-rose-400 hover:bg-rose-500/20 whitespace-nowrap">
              <Trash2 className="w-4 h-4 mr-2" /> Purge Logs
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-rose-500/20 bg-rose-500/10">
            <div>
              <h4 className="font-semibold text-rose-50">Reset Database</h4>
              <p className="text-xs text-rose-200/70 mt-1">Deletes all users, teams, and tasks. Requires superadmin confirmation.</p>
            </div>
            <Button variant="destructive" className="bg-rose-600 hover:bg-rose-700 whitespace-nowrap">
              <Trash2 className="w-4 h-4 mr-2" /> Factory Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
