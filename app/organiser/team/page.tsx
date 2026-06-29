"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, UserPlus, Mail, Phone, ShieldAlert, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as React from "react";
import { useSession } from "next-auth/react";
import LoadingAnimation from "@/components/shared/LoadingAnimation";

interface TeamMemberData {
  id: string;
  roleInTeam: string;
  addedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    profilePictureUrl: string | null;
  };
}

interface EventData {
  id: string;
  name: string;
}

export default function OrganiserTeamPage() {
  const { data: session } = useSession();
  const [members, setMembers] = React.useState<TeamMemberData[]>([]);
  const [events, setEvents] = React.useState<EventData[]>([]);
  const [selectedEventId, setSelectedEventId] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  const userRole = session?.user?.role;
  const isAdmin = userRole === "ADMIN";

  // Load events (if Admin)
  React.useEffect(() => {
    async function loadEvents() {
      if (!isAdmin) return;
      try {
        const res = await fetch("/api/v1/events");
        if (res.ok) {
          const json = await res.ok ? await res.json() : { data: [] };
          setEvents(json.data || []);
          if (json.data && json.data.length > 0) {
            setSelectedEventId(json.data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load events for admin team view:", err);
      }
    }
    loadEvents();
  }, [isAdmin]);

  // Set selected event for regular organiser
  React.useEffect(() => {
    if (!isAdmin && session?.user?.eventId) {
      setSelectedEventId(session.user.eventId);
    }
  }, [isAdmin, session]);

  // Load team members
  React.useEffect(() => {
    async function fetchTeam() {
      if (!selectedEventId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/teams?eventId=${selectedEventId}`);
        if (res.ok) {
          const json = await res.json();
          setMembers(json.data || []);
        }
      } catch (error) {
        console.error("Failed to load team directory:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, [selectedEventId]);

  const filteredMembers = searchQuery
    ? members.filter(m => 
        m.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.roleInTeam.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : members;

  function getRoleBadgeColor(role: string): string {
    switch (role) {
      case "EVENT_HEAD": return "border-danger/50 text-danger bg-danger/10 font-bold";
      case "SUB_HEAD": return "border-amber-500/50 text-amber-500 bg-amber-500/10";
      case "CORE_VOLUNTEER": return "border-indigo-500/50 text-indigo-400 bg-indigo-500/10";
      case "VOLUNTEER": return "border-white/20 text-muted-foreground";
      default: return "border-white/20";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Directory</h1>
          <p className="text-muted-foreground mt-1">Manage volunteers and organisers in your vertical.</p>
        </div>
        {isAdmin && events.length > 0 && (
          <div className="w-64">
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="bg-background/50 border-white/10">
                <SelectValue placeholder="Select Event" />
              </SelectTrigger>
              <SelectContent>
                {events.map(ev => (
                  <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Card className="glass border-white/10">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>Roster of students running the event operations.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search team..." 
              className="pl-9 h-9 bg-background/50 border-white/10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingAnimation message="Syncing team roster..." />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="font-semibold">No team members found</p>
              <p className="text-sm">Add organisers or volunteers to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border border-white/10 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 text-sm font-medium text-muted-foreground border-b border-white/10">
                <div className="col-span-5 sm:col-span-4">Name</div>
                <div className="col-span-4 sm:col-span-4">Role</div>
                <div className="col-span-3 sm:col-span-4">Contact</div>
              </div>
              {/* Rows */}
              <div className="divide-y divide-white/5">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-white/5 transition-colors">
                    <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                        {member.user.name.charAt(0)}
                      </div>
                      <span className="font-medium truncate">{member.user.name}</span>
                    </div>
                    <div className="col-span-4 sm:col-span-4">
                      <Badge variant="outline" className={getRoleBadgeColor(member.roleInTeam)}>
                        {member.roleInTeam === "EVENT_HEAD" && <ShieldAlert className="w-3.5 h-3.5 mr-1 text-danger" />}
                        {member.roleInTeam.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="col-span-3 sm:col-span-4 flex flex-col gap-1 text-xs text-muted-foreground">
                      <a href={`mailto:${member.user.email}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors truncate">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline truncate">{member.user.email}</span>
                      </a>
                      {member.user.phone && (
                        <a href={`tel:${member.user.phone}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{member.user.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
