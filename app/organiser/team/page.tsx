"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, UserPlus, Mail, Phone, ShieldAlert, Loader2, Trash2, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as React from "react";
import { useSession } from "next-auth/react";
import LoadingAnimation from "@/components/shared/LoadingAnimation";
import { motion, AnimatePresence } from "framer-motion";

interface TeamMemberData {
  id: string;
  roleInTeam: string;
  addedAt: string;
  eventId: string;
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
  verticalId: string;
}

interface UserDropdownItem {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function OrganiserTeamPage() {
  const { data: session } = useSession();
  const [members, setMembers] = React.useState<TeamMemberData[]>([]);
  const [events, setEvents] = React.useState<EventData[]>([]);
  const [selectedEventId, setSelectedEventId] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Add Member Dialog state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [availableUsers, setAvailableUsers] = React.useState<UserDropdownItem[]>([]);
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState("VOLUNTEER");
  const [submittingAdd, setSubmittingAdd] = React.useState(false);
  const [modalError, setModalError] = React.useState<string | null>(null);

  const userRole = session?.user?.role;
  const isAdmin = userRole === "ADMIN";

  // Load events
  React.useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/v1/events");
        if (res.ok) {
          const json = await res.json();
          const allEvts = json.data || [];
          const matched = isAdmin
            ? allEvts
            : allEvts.filter((e: any) => e.verticalId === session?.user?.verticalId);
          setEvents(matched);
          if (matched.length > 0) {
            setSelectedEventId(matched[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    }
    if (session) {
      loadEvents();
    }
  }, [isAdmin, session]);

  // Load team members
  const fetchTeam = React.useCallback(async () => {
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
  }, [selectedEventId]);

  React.useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // Load eligible users for roster dropdown
  React.useEffect(() => {
    async function fetchUsers() {
      if (!isAddModalOpen) return;
      try {
        const res = await fetch("/api/v1/users");
        if (res.ok) {
          const json = await res.json();
          // Filter to volunteers or other participants within scope
          const filtered = (json.data || []).filter(
            (u: any) => u.role === "VOLUNTEER" || u.role === "ORGANISER"
          );
          setAvailableUsers(filtered);
          if (filtered.length > 0) {
            setSelectedUserId(filtered[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch available users:", err);
      }
    }
    fetchUsers();
  }, [isAddModalOpen]);

  // Handle member creation
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedEventId) {
      setModalError("Please select a user and event");
      return;
    }
    setSubmittingAdd(true);
    setModalError(null);

    try {
      const res = await fetch("/api/v1/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          eventId: selectedEventId,
          roleInTeam: selectedRole,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setIsAddModalOpen(false);
        setSelectedUserId("");
        await fetchTeam();
      } else {
        setModalError(json.error || "Failed to add member");
      }
    } catch (err) {
      setModalError("Failed to communicate with server");
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Handle member role change
  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/v1/teams/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleInTeam: newRole }),
      });
      if (res.ok) {
        await fetchTeam();
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  // Handle member deletion
  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this event roster?`)) return;
    try {
      const res = await fetch(`/api/v1/teams/${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchTeam();
      }
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

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

  const isOrganiser = userRole === "ORGANISER" || isAdmin;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Directory</h1>
          <p className="text-muted-foreground mt-1">Manage volunteers and organisers in your vertical.</p>
        </div>
        <div className="flex items-center gap-3">
          {events.length > 0 && (
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
          {isOrganiser && selectedEventId && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.3)] gap-2 shrink-0"
            >
              <UserPlus className="w-4 h-4" /> Add Member
            </Button>
          )}
        </div>
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
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 text-sm font-medium text-muted-foreground border-b border-white/10">
                <div className="col-span-4">Name</div>
                <div className="col-span-4">Role</div>
                <div className="col-span-3">Contact</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              {/* Table Rows */}
              <div className="divide-y divide-white/5">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-white/5 transition-colors">
                    {/* Name */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                        {member.user.name.charAt(0)}
                      </div>
                      <span className="font-medium truncate">{member.user.name}</span>
                    </div>
                    {/* Role selector / display */}
                    <div className="col-span-4">
                      {isOrganiser && member.roleInTeam !== "EVENT_HEAD" ? (
                        <Select
                          value={member.roleInTeam}
                          onValueChange={(val) => handleRoleChange(member.id, val)}
                        >
                          <SelectTrigger className="w-[160px] h-8 bg-background/50 border-white/10 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUB_HEAD">Sub Head</SelectItem>
                            <SelectItem value="CORE_VOLUNTEER">Core Volunteer</SelectItem>
                            <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className={getRoleBadgeColor(member.roleInTeam)}>
                          {member.roleInTeam === "EVENT_HEAD" && <ShieldAlert className="w-3.5 h-3.5 mr-1 text-danger" />}
                          {member.roleInTeam.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                    {/* Contacts */}
                    <div className="col-span-3 flex flex-col gap-1 text-xs text-muted-foreground">
                      <a href={`mailto:${member.user.email}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors truncate">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{member.user.email}</span>
                      </a>
                      {member.user.phone && (
                        <a href={`tel:${member.user.phone}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{member.user.phone}</span>
                        </a>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="col-span-1 text-right">
                      {isOrganiser && member.roleInTeam !== "EVENT_HEAD" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMember(member.id, member.user.name)}
                          className="h-8 w-8 text-danger hover:text-danger hover:bg-danger/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Member Dialog Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-md p-6 overflow-hidden relative z-10 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight">Add Roster Member</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="bg-danger/10 border border-danger/20 text-danger text-xs p-3 rounded-md flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Select Volunteer</label>
                  {availableUsers.length === 0 ? (
                    <div className="text-xs text-muted-foreground p-3 border border-dashed border-white/10 rounded-lg text-center">
                      No matching volunteers found in your vertical.
                    </div>
                  ) : (
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="bg-background/50 border-white/10">
                        <SelectValue placeholder="Choose Volunteer" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Assigned Role</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="bg-background/50 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUB_HEAD">Sub Head</SelectItem>
                      <SelectItem value="CORE_VOLUNTEER">Core Volunteer</SelectItem>
                      <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={submittingAdd || availableUsers.length === 0}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {submittingAdd ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Add to Roster
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
