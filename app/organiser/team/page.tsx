"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, UserPlus, Mail, ShieldAlert } from "lucide-react";
import * as React from "react";

export default function OrganiserTeamPage() {
  const members = [
    { name: "David Chen", role: "Organiser", event: "Best Manager", email: "david@ushus.in", status: "Active" },
    { name: "Sarah Williams", role: "Volunteer", event: "Best Manager", email: "sarah@ushus.in", status: "Active" },
    { name: "Michael Chang", role: "Volunteer", event: "Finance Quiz", email: "michael@ushus.in", status: "Inactive" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Directory</h1>
          <p className="text-muted-foreground mt-1">Manage volunteers and organisers in your vertical.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          <UserPlus className="w-4 h-4 mr-2" /> Add Member
        </Button>
      </div>

      <Card className="glass border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Members</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search team..." className="pl-9 h-9 bg-background/50" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 text-sm font-medium text-muted-foreground border-b border-white/10">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Role & Event</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
            <div className="divide-y divide-white/5">
              {members.map((member, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-white/5 transition-colors">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <span className="font-medium">{member.name}</span>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      {member.role === 'Organiser' && <ShieldAlert className="w-3 h-3 text-indigo-400" />}
                      <span className={member.role === 'Organiser' ? 'text-indigo-400 font-medium' : ''}>{member.role}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{member.event}</p>
                  </div>
                  <div className="col-span-3 flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <Badge variant="outline" className={member.status === 'Active' ? 'border-success/50 text-success bg-success/10' : 'border-white/20 text-muted-foreground'}>
                      {member.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
