"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, UserPlus, Mail, Phone, Loader2, ShieldCheck, CheckCircle2, XCircle, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import * as React from "react";
import LoadingAnimation from "@/components/shared/LoadingAnimation";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  college: string | null;
  isActive: boolean;
  vertical: { id: string; name: string } | null;
  event: { id: string; name: string } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");

  // Vertical and event data for drop-downs
  const [verticals, setVerticals] = React.useState<{ id: string; name: string }[]>([]);
  const [events, setEvents] = React.useState<{ id: string; name: string }[]>([]);

  // Form State for new user
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formName, setFormName] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");
  const [formPassword, setFormPassword] = React.useState("");
  const [formRole, setFormRole] = React.useState("PARTICIPANT");
  const [formPhone, setFormPhone] = React.useState("");
  const [formCollege, setFormCollege] = React.useState("");
  const [formVerticalId, setFormVerticalId] = React.useState("none");
  const [formEventId, setFormEventId] = React.useState("none");

  // Form State for edit user
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editRole, setEditRole] = React.useState("PARTICIPANT");
  const [editPhone, setEditPhone] = React.useState("");
  const [editCollege, setEditCollege] = React.useState("");
  const [editVerticalId, setEditVerticalId] = React.useState("none");
  const [editEventId, setEditEventId] = React.useState("none");
  const [editIsActive, setEditIsActive] = React.useState(true);

  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/users");
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchScopes = React.useCallback(async () => {
    try {
      const [vRes, eRes] = await Promise.all([
        fetch("/api/v1/verticals"),
        fetch("/api/v1/events"),
      ]);
      if (vRes.ok) {
        const vJson = await vRes.json();
        setVerticals(vJson.data || []);
      }
      if (eRes.ok) {
        const eJson = await eRes.json();
        setEvents(eJson.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch scopes:", err);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
    fetchScopes();
  }, [fetchUsers, fetchScopes]);

  React.useEffect(() => {
    if (!isDialogOpen) {
      setErrorMessage(null);
    }
  }, [isDialogOpen]);

  React.useEffect(() => {
    if (!isEditOpen) {
      setErrorMessage(null);
    }
  }, [isEditOpen]);

  const handleToggleStatus = async (userId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/v1/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleCreateUser = async () => {
    if (!formName || !formEmail || !formPassword) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
          phone: formPhone || undefined,
          college: formCollege || undefined,
          verticalId: formVerticalId === "none" ? null : formVerticalId,
          eventId: formEventId === "none" ? null : formEventId,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        setFormName("");
        setFormEmail("");
        setFormPassword("");
        setFormRole("PARTICIPANT");
        setFormPhone("");
        setFormCollege("");
        setFormVerticalId("none");
        setFormEventId("none");
        setIsDialogOpen(false);
        await fetchUsers();
      } else {
        if (json.details) {
          const errors = Object.values(json.details)
            .map((e: any) => (e._errors ? e._errors.join(", ") : ""))
            .filter(Boolean);
          setErrorMessage(errors.length > 0 ? errors.join(" | ") : json.error);
        } else {
          setErrorMessage(json.error || "Failed to create user");
        }
      }
    } catch (err) {
      console.error("Failed to create user:", err);
      setErrorMessage("Network error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (user: UserData) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditRole(user.role);
    setEditPhone(user.phone || "");
    setEditCollege(user.college || "");
    setEditVerticalId(user.vertical?.id || "none");
    setEditEventId(user.event?.id || "none");
    setEditIsActive(user.isActive);
    setIsEditOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUserId || !editName) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/v1/users/${editingUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          role: editRole,
          phone: editPhone || null,
          college: editCollege || null,
          verticalId: editVerticalId === "none" ? null : editVerticalId,
          eventId: editEventId === "none" ? null : editEventId,
          isActive: editIsActive,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        setIsEditOpen(false);
        setEditingUserId(null);
        await fetchUsers();
      } else {
        setErrorMessage(json.error || "Failed to update user");
      }
    } catch (err) {
      console.error("Failed to update user:", err);
      setErrorMessage("Network error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/users/${userId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await fetchUsers();
      } else {
        alert(json.error || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Error deleting user.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.college && u.college.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  function getRoleColor(role: string): string {
    switch (role) {
      case "ADMIN":
        return "border-rose-500/50 text-rose-400 bg-rose-500/10";
      case "ORGANISER":
        return "border-amber-500/50 text-amber-500 bg-amber-500/10";
      case "VOLUNTEER":
        return "border-indigo-500/50 text-indigo-400 bg-indigo-500/10";
      default:
        return "border-white/20 text-muted-foreground";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-rose-50">User Management</h1>
          <p className="text-muted-foreground mt-1">Create accounts, manage permissions, edit scopes, and delete users.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              <UserPlus className="w-4 h-4 mr-2" /> Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/15 max-w-lg">
            <DialogHeader>
              <DialogTitle>Add System User</DialogTitle>
              <DialogDescription>Create a new participant, volunteer, organiser, or administrator.</DialogDescription>
            </DialogHeader>
            {errorMessage && (
              <div className="p-3 text-xs bg-danger/10 border border-danger/25 text-danger rounded-md">
                {errorMessage}
              </div>
            )}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                  <Input
                    placeholder="e.g. John Doe"
                    className="bg-background/50 border-white/10"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="e.g. john@student.com"
                    className="bg-background/50 border-white/10"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-background/50 border-white/10"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">System Role</label>
                  <Select value={formRole} onValueChange={setFormRole}>
                    <SelectTrigger className="bg-background/50 border-white/10">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PARTICIPANT">Participant</SelectItem>
                      <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                      <SelectItem value="ORGANISER">Organiser</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Phone (optional)</label>
                  <Input
                    placeholder="e.g. +91 9988776655"
                    className="bg-background/50 border-white/10"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">College (optional)</label>
                  <Input
                    placeholder="e.g. IIM Bangalore"
                    className="bg-background/50 border-white/10"
                    value={formCollege}
                    onChange={(e) => setFormCollege(e.target.value)}
                  />
                </div>
              </div>

              {/* Scoping rules fields */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Assigned Vertical</label>
                  <Select value={formVerticalId} onValueChange={setFormVerticalId}>
                    <SelectTrigger className="bg-background/50 border-white/10">
                      <SelectValue placeholder="Select vertical" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None / Public</SelectItem>
                      {verticals.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Assigned Event</label>
                  <Select value={formEventId} onValueChange={setFormEventId}>
                    <SelectTrigger className="bg-background/50 border-white/10">
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None / Public</SelectItem>
                      {events.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" className="border-white/10" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={handleCreateUser}
                  disabled={submitting || !formName || !formEmail || !formPassword}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="glass border-white/15 max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>Modify permissions, contact scopes, and account configuration.</DialogDescription>
          </DialogHeader>
          {errorMessage && (
            <div className="p-3 text-xs bg-danger/10 border border-danger/25 text-danger rounded-md">
              {errorMessage}
            </div>
          )}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <Input
                  className="bg-background/50 border-white/10"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Email (Read Only)</label>
                <Input className="bg-background/30 border-white/5 text-muted-foreground" value={editEmail} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">System Role</label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger className="bg-background/50 border-white/10">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PARTICIPANT">Participant</SelectItem>
                    <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                    <SelectItem value="ORGANISER">Organiser</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 flex flex-col justify-end pb-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-muted-foreground">Account Status</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{editIsActive ? "Active" : "Suspended"}</span>
                    <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                <Input
                  className="bg-background/50 border-white/10"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">College</label>
                <Input
                  className="bg-background/50 border-white/10"
                  value={editCollege}
                  onChange={(e) => setEditCollege(e.target.value)}
                />
              </div>
            </div>

            {/* Edit Scoping fields */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Assigned Vertical</label>
                <Select value={editVerticalId} onValueChange={setEditVerticalId}>
                  <SelectTrigger className="bg-background/50 border-white/10">
                    <SelectValue placeholder="Select vertical" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None / Public</SelectItem>
                    {verticals.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Assigned Event</label>
                <Select value={editEventId} onValueChange={setEditEventId}>
                  <SelectTrigger className="bg-background/50 border-white/10">
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None / Public</SelectItem>
                    {events.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" className="border-white/10" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleUpdateUser} disabled={submitting || !editName}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users, email, college..."
            className="pl-9 bg-background/50 border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48 bg-background/50 border-white/10">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="ORGANISER">Organiser</SelectItem>
            <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
            <SelectItem value="PARTICIPANT">Participant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User Table Card */}
      <Card className="glass border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingAnimation message="Syncing user accounts..." />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50 text-rose-500" />
              <p className="font-semibold">No users found</p>
            </div>
          ) : (
            <div className="rounded-md border border-white/10 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 text-sm font-medium text-muted-foreground border-b border-white/10">
                <div className="col-span-4">Name & Email</div>
                <div className="col-span-3">Role / Affiliation</div>
                <div className="col-span-3">Associated Scope</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              {/* Rows */}
              <div className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-white/5 transition-colors">
                    <div className="col-span-4 min-w-0">
                      <p className="font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3.5 h-3.5 shrink-0" /> {user.email}
                      </p>
                    </div>
                    <div className="col-span-3">
                      <Badge variant="outline" className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      {user.college && <p className="text-xs text-muted-foreground mt-1 truncate">{user.college}</p>}
                    </div>
                    <div className="col-span-3 text-xs text-muted-foreground">
                      {user.vertical && (
                        <p>
                          Vertical: <span className="text-foreground">{user.vertical.name}</span>
                        </p>
                      )}
                      {user.event && (
                        <p className="mt-0.5">
                          Event: <span className="text-foreground">{user.event.name}</span>
                        </p>
                      )}
                      {!user.vertical && !user.event && <span className="italic text-muted-foreground">None</span>}
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <button onClick={() => handleToggleStatus(user.id, user.isActive)} className="inline-flex focus:outline-none">
                        <Badge
                          variant="outline"
                          className={`cursor-pointer hover:opacity-85 transition-all text-[11px] py-0.5 px-1.5 ${
                            user.isActive ? "border-success/50 text-success bg-success/10" : "border-danger/50 text-danger bg-danger/10"
                          }`}
                        >
                          {user.isActive ? "Active" : "Suspended"}
                        </Badge>
                      </button>

                      <button
                        onClick={() => handleStartEdit(user)}
                        className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-1.5 rounded-md hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
