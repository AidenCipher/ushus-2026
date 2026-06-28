"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, Copy, Check, MoreVertical } from "lucide-react";
import * as React from "react";
import { motion } from "framer-motion";

export default function TeamPage() {
  const [copied, setCopied] = React.useState(false);
  const teamCode = "USHUS-BM-7X29P";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(teamCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const teamMembers = [
    { id: 1, name: "John Doe", email: "john@college.edu", role: "Team Leader", isMe: true },
    { id: 2, name: "Jane Smith", email: "jane@college.edu", role: "Member", isMe: false },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
        <p className="text-muted-foreground mt-1">Manage your team members for the Best Manager event.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="glass border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Team Members (2/4)</CardTitle>
                <CardDescription>Your registered team</CardDescription>
              </div>
              <Users className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                {teamMembers.map((member, i) => (
                  <motion.div 
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm flex items-center gap-2">
                          {member.name}
                          {member.isMe && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-bold">You</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.role} • {member.email}</p>
                      </div>
                    </div>
                    {!member.isMe && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Invite Members</CardTitle>
              <CardDescription>Share this code with your teammates to let them join.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input readOnly value={teamCode} className="font-mono text-center bg-background/50 border-primary/20" />
                  <Button variant="outline" size="icon" onClick={handleCopyCode} className="shrink-0">
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Or enter teammate's email to invite directly
                </p>
                <div className="flex gap-2">
                  <Input placeholder="Email address" type="email" className="bg-background/50 text-sm" />
                  <Button size="icon" className="shrink-0"><UserPlus className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
