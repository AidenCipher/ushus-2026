"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, UserPlus, Mail, Phone, ShieldAlert, Loader2, Trash2, X, Pencil, CheckCircle2, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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

interface VolunteerUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  college: string | null;
  isActive: boolean;
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
  const [activeTab, setActiveTab] = React.useState<"ROSTER" | "VOLUNTEERS">("ROSTER");

  // Roster Tab States
  const [members, setMembers] = React.useState<TeamMemberData[]>([]);
  const [events, setEvents] = React.useState<EventData[]>([]);
  const [selectedEventId, setSelectedEventId] = React.useState<string>("");
  const [loadingRoster, setLoadingRoster] = React.useState(true);
  const [searchRosterQuery, setSearchRosterQuery] = React.useState("");
  const [isAddRosterOpen, setIsAddRosterOpen] = React.useState(false);
  const [availableUsers, setAvailableUsers] = React.useState<UserDropdownItem[]>([]);
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState("VOLUNTEER");
  const [submittingAddRoster, setSubmittingAddRoster] = React.useState(false);
  const [rosterError, setRosterError] = React.useState<string | null>(null);

  // Volunteers Tab States
  const [volunteers, setVolunteers] = React.useState<VolunteerUserData[]>([]);
  const [loadingVolunteers, setLoadingVolunteers] = React.useState(true);
  const [searchVolQuery, setSearchVolQuery] = React.useState("");
  
  // Volunteer CRUD Dialog States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingVolId, setEditingVolId] = React.useState<string | null>(null);
  
  // Volunteer Form Fields
  const [volName, setVolName] = React.useState("");
  const [volEmail, setVolEmail] = React.useState("");
  const [volPassword, setVolPassword] = React.useState("");
  const [volPhone, setVolPhone] = React.useState("");
  const [volCollege, setVolCollege] = React.useState("");
  const [volActive, setVolActive] = React.useState(true);
  const [volCrudError, setVolCrudError] = React.useState<string | null>(null);
  const [submittingVol, setSubmittingVol] = React.useState(false);

  const userRole = session?.user?.role;
  const isAdmin = userRole === "ADMIN";
  const isOrganiser = userRole === "ORGANISER" || isAdmin;

  // Load events (Roster Tab)
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

  // Load team members (Roster Tab)
  const fetchTeam = React.useCallback(async () => {
    if (!selectedEventId) return;
    setLoadingRoster(true);
    try {
      const res = await fetch(`/api/v1/teams?eventId=${selectedEventId}`);
      if (res.ok) {
        const json = await res.json();
        setMembers(json.data || []);
      }
    } catch (error) {
      console.error("Failed to load team directory:", error);
    } finally {
      setLoadingRoster(false);
    }
  }, [selectedEventId]);

  React.useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // Load volunteers in vertical (Volunteers Tab)
  const fetchVolunteers = React.useCallback(async () => {
    if (!session?.user?.verticalId && !isAdmin) return;
    setLoadingVolunteers(true);
    try {
      // Organisers retrieve all users in vertical. Filter to VOLUNTEER.
      const url = isAdmin ? "/api/v1/users" : `/api/v1/users?verticalId=${session?.user?.verticalId || ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const list = json.data || [];
        setVolunteers(list.filter((u: any) => u.role === "VOLUNTEER"));
      }
    } catch (err) {
      console.error("Failed to fetch volunteers:", err);
    } finally {
      setLoadingVolunteers(false);
    }
  }, [session?.user?.verticalId, isAdmin]);

  React.useEffect(() => {
    if (activeTab === "VOLUNTEERS") {
      fetchVolunteers();
    }
  }, [activeTab, fetchVolunteers]);

  // Load eligible users for roster dropdown (Roster Tab)
  React.useEffect(() => {
    async function fetchEligibleUsers() {
      if (!isAddRosterOpen) return;
      try {
        const url = isAdmin ? "/api/v1/users" : `/api/v1/users?verticalId=${session?.user?.verticalId}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          // Filter to volunteers/organisers
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
    fetchEligibleUsers();
  }, [isAddRosterOpen, session?.user?.verticalId, isAdmin]);

  // Roster Tab submit handler
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedEventId) {
      setRosterError("Please select a user and event");
      return;
    }
    setSubmittingAddRoster(true);
    setRosterError(null);

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
        setIsAddRosterOpen(false);
        setSelectedUserId("");
        await fetchTeam();
      } else {
        setRosterError(json.error || "Failed to add member");
      }
    } catch (err) {
      setRosterError("Failed to communicate with server");
    } finally {
      setSubmittingAddRoster(false);
    }
  };

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

  // Volunteer CRUD handlers (Volunteers Tab)
  const handleCreateVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volName || !volEmail || !volPassword) {
      setVolCrudError("Name, Email, and Password are required.");
      return;
    }
    setSubmittingVol(true);
    setVolCrudError(null);
    try {
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: volName,
          email: volEmail,
          password: volPassword,
          role: "VOLUNTEER",
          phone: volPhone || undefined,
          college: volCollege || undefined,
          verticalId: session?.user?.verticalId || null,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setIsCreateOpen(false);
        setVolName("");
        setVolEmail("");
        setVolPassword("");
        setVolPhone("");
        setVolCollege("");
        await fetchVolunteers();
      } else {
        setVolCrudError(json.error || "Failed to create volunteer");
      }
    } catch {
      setVolCrudError("Network error occurred.");
    } finally {
      setSubmittingVol(false);
    }
  };

  const handleUpdateVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVolId || !volName || !volEmail) {
      setVolCrudError("Name and Email are required.");
      return;
    }
    setSubmittingVol(true);
    setVolCrudError(null);
    try {
      const res = await fetch(`/api/v1/users/${editingVolId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: volName,
          email: volEmail,
          phone: volPhone || null,
          college: volCollege || null,
          isActive: volActive,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setIsEditOpen(false);
        setEditingVolId(null);
        setVolName("");
        setVolEmail("");
        setVolPhone("");
        setVolCollege("");
        await fetchVolunteers();
      } else {
        setVolCrudError(json.error || "Failed to update volunteer");
      }
    } catch {
      setVolCrudError("Network error occurred.");
    } finally {
      setSubmittingVol(false);
    }
  };

  const handleDeleteVolunteer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete volunteer "${name}"?`)) return;
    try {
      const res = await fetch(`/api/v1/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchVolunteers();
      } else {
        const json = await res.json();
        alert(json.error || "Failed to delete volunteer");
      }
    } catch {
      alert("Failed to connect to server");
    }
  };

  const handleStartEdit = (vol: VolunteerUserData) => {
    setEditingVolId(vol.id);
    setVolName(vol.name);
    setVolEmail(vol.email);
    setVolPhone(vol.phone || "");
    setVolCollege(vol.college || "");
    setVolActive(vol.isActive);
    setVolCrudError(null);
    setIsEditOpen(true);
  };

  const handleStartCreate = () => {
    setVolName("");
    setVolEmail("");
    setVolPassword("");
    setVolPhone("");
    setVolCollege("");
    setVolCrudError(null);
    setIsCreateOpen(true);
  };

  // Filters
  const filteredMembers = searchRosterQuery
    ? members.filter(m =>
        m.user.name.toLowerCase().includes(searchRosterQuery.toLowerCase()) ||
        m.user.email.toLowerCase().includes(searchRosterQuery.toLowerCase())
      )
    : members;

  const filteredVolunteers = searchVolQuery
    ? volunteers.filter(v =>
        v.name.toLowerCase().includes(searchVolQuery.toLowerCase()) ||
        v.email.toLowerCase().includes(searchVolQuery.toLowerCase())
      )
    : volunteers;

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Directory</h1>
          <p className="text-muted-foreground mt-1">Manage volunteers and event rosters in your vertical scope.</p>
        </div>
        
        {activeTab === "ROSTER" ? (
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
                onClick={() => setIsAddRosterOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.3)] gap-2 shrink-0 animate-glow"
              >
                <UserPlus className="w-4 h-4" /> Add Roster Member
              </Button>
            )}
          </div>
        ) : (
          isOrganiser && (
            <Button
              onClick={handleStartCreate}
              className="bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.3)] gap-2 shrink-0 animate-glow"
            >
              <UserPlus className="w-4 h-4" /> Add Volunteer User
            </Button>
          )
        )}
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab("ROSTER")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${
            activeTab === "ROSTER"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Event Teams & Rosters
        </button>
        <button
          onClick={() => setActiveTab("VOLUNTEERS")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${
            activeTab === "VOLUNTEERS"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Vertical Volunteers (CRUD)
        </button>
      </div>

      {/* TAB 1: EVENT ROSTER */}
      {activeTab === "ROSTER" && (
        <Card className="glass border-white/10">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>Roster of students running the event operations.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search roster..."
                className="pl-9 h-9 bg-background/50 border-white/10"
                value={searchRosterQuery}
                onChange={(e) => setSearchRosterQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loadingRoster ? (
              <div className="flex items-center justify-center py-16">
                <LoadingAnimation message="Syncing team roster..." />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="font-semibold">No team members found</p>
                <p className="text-sm">Add volunteers to event rosters to get started.</p>
              </div>
            ) : (
              <div className="rounded-md border border-white/10 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 text-sm font-medium text-muted-foreground border-b border-white/10">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-4">Role</div>
                  <div className="col-span-3">Contact</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                <div className="divide-y divide-white/5">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-white/5 transition-colors">
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                          {member.user.name.charAt(0)}
                        </div>
                        <span className="font-medium truncate">{member.user.name}</span>
                      </div>
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
      )}

      {/* TAB 2: VERTICAL VOLUNTEERS CRUD */}
      {activeTab === "VOLUNTEERS" && (
        <Card className="glass border-white/10">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Volunteer Accounts</CardTitle>
              <CardDescription>Manage user accounts of volunteers assigned to your vertical.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search volunteers..."
                className="pl-9 h-9 bg-background/50 border-white/10"
                value={searchVolQuery}
                onChange={(e) => setSearchVolQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loadingVolunteers ? (
              <div className="flex items-center justify-center py-16">
                <LoadingAnimation message="Syncing volunteer accounts..." />
              </div>
            ) : filteredVolunteers.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="font-semibold">No volunteers found</p>
                <p className="text-sm">Create volunteer user accounts to allocate tasks.</p>
              </div>
            ) : (
              <div className="rounded-md border border-white/10 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 text-sm font-medium text-muted-foreground border-b border-white/10">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Phone</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="divide-y divide-white/5">
                  {filteredVolunteers.map((vol) => (
                    <div key={vol.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-white/5 transition-colors">
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                          {vol.name.charAt(0)}
                        </div>
                        <span className="font-medium truncate">{vol.name}</span>
                      </div>
                      <div className="col-span-3 truncate text-muted-foreground">{vol.email}</div>
                      <div className="col-span-2 text-muted-foreground">{vol.phone || "-"}</div>
                      <div className="col-span-2">
                        <Badge variant="outline" className={vol.isActive ? "border-success/50 text-success bg-success/10" : "border-danger/50 text-danger bg-danger/10"}>
                          {vol.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="col-span-2 text-right flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStartEdit(vol)}
                          className="h-8 w-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteVolunteer(vol.id, vol.name)}
                          className="h-8 w-8 text-danger hover:text-danger hover:bg-danger/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Roster Add Modal */}
      <AnimatePresence>
        {isAddRosterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddRosterOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-md p-6 overflow-hidden relative z-10 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight">Add Roster Member</h3>
                <button
                  onClick={() => setIsAddRosterOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {rosterError && (
                <div className="bg-danger/10 border border-danger/20 text-danger text-xs p-3 rounded-md flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{rosterError}</span>
                </div>
              )}

              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Select Volunteer</label>
                  {availableUsers.length === 0 ? (
                    <div className="text-xs text-muted-foreground p-3 border border-dashed border-white/10 rounded-lg text-center">
                      No matching volunteers found in your vertical scope.
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
                    disabled={submittingAddRoster || availableUsers.length === 0}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {submittingAddRoster ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Add to Roster
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10"
                    onClick={() => setIsAddRosterOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Volunteer Create Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-md p-6 overflow-hidden relative z-10 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight">Create Volunteer Account</h3>
                <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {volCrudError && (
                <div className="bg-danger/10 border border-danger/20 text-danger text-xs p-3 rounded-md flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{volCrudError}</span>
                </div>
              )}

              <form onSubmit={handleCreateVolunteer} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                  <Input placeholder="e.g. Liam Smith" className="bg-background/50 border-white/10" value={volName} onChange={(e) => setVolName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Email</label>
                  <Input placeholder="e.g. liam@college.edu" type="email" className="bg-background/50 border-white/10" value={volEmail} onChange={(e) => setVolEmail(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Password</label>
                  <Input placeholder="Must be at least 8 characters with numbers" type="password" className="bg-background/50 border-white/10" value={volPassword} onChange={(e) => setVolPassword(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                    <Input placeholder="+91..." className="bg-background/50 border-white/10" value={volPhone} onChange={(e) => setVolPhone(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">College</label>
                    <Input placeholder="Christ University" className="bg-background/50 border-white/10" value={volCollege} onChange={(e) => setVolCollege(e.target.value)} />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={submittingVol} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    {submittingVol ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Volunteer
                  </Button>
                  <Button type="button" variant="outline" className="border-white/10" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Volunteer Edit Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-md p-6 overflow-hidden relative z-10 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight">Edit Volunteer Account</h3>
                <button onClick={() => setIsEditOpen(false)} className="p-1.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {volCrudError && (
                <div className="bg-danger/10 border border-danger/20 text-danger text-xs p-3 rounded-md flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{volCrudError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateVolunteer} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                  <Input className="bg-background/50 border-white/10" value={volName} onChange={(e) => setVolName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Email</label>
                  <Input className="bg-background/50 border-white/10" value={volEmail} onChange={(e) => setVolEmail(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                    <Input className="bg-background/50 border-white/10" value={volPhone} onChange={(e) => setVolPhone(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">College</label>
                    <Input className="bg-background/50 border-white/10" value={volCollege} onChange={(e) => setVolCollege(e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                  <div className="space-y-0.5">
                    <label className="text-xs font-semibold text-foreground">Account Status</label>
                    <p className="text-[10px] text-muted-foreground">Inactive volunteers cannot log into the portal</p>
                  </div>
                  <Switch checked={volActive} onCheckedChange={setVolActive} />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={submittingVol} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    {submittingVol ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Updates
                  </Button>
                  <Button type="button" variant="outline" className="border-white/10" onClick={() => setIsEditOpen(false)}>
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
