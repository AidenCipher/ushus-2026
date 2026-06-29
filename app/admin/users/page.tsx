"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, UserPlus, Mail, Phone, Loader2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  vertical: { name: string } | null;
  event: { name: string } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");

  // Form State for new user
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formName, setFormName] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");
  const [formPassword, setFormPassword] = React.useState("");
  const [formRole, setFormRole] = React.useState("PARTICIPANT");
  const [formPhone, setFormPhone] = React.useState("");
  const [formCollege, setFormCollege] = React.useState("");
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

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  React.useEffect(() => {
    if (!isDialogOpen) {
      setErrorMessage(null);
    }
  }, [isDialogOpen]);

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
        setIsDialogOpen(false);
        await fetchUsers();
      } else {
        if (json.details) {
          const errors = Object.values(json.details).map((e: any) => e._errors ? e._errors.join(", ") : "").filter(Boolean);
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

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.college && u.college.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  function getRoleColor(role: string): string {
    switch (role) {
      case "ADMIN": return "border-rose-500/50 text-rose-400 bg-rose-500/10";
      case "ORGANISER": return "border-amber-500/50 text-amber-500 bg-amber-500/10";
      case "VOLUNTEER": return "border-indigo-500/50 text-indigo-400 bg-indigo-500/10";
      default: return "border-white/20 text-muted-foreground";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-rose-50">User Management</h1>
          <p className="text-muted-foreground mt-1">Create accounts, manage permissions, and toggle statuses.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              <UserPlus className="w-4 h-4 mr-2" /> Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/15">
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
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" className="border-white/10" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleCreateUser} disabled={submitting || !formName || !formEmail || !formPassword}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                <div className="col-span-2 text-right">Status</div>
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
                      {user.college && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{user.college}</p>
                      )}
                    </div>
                    <div className="col-span-3 text-xs text-muted-foreground">
                      {user.vertical && <p>Vertical: <span className="text-foreground">{user.vertical.name}</span></p>}
                      {user.event && <p className="mt-0.5">Event: <span className="text-foreground">{user.event.name}</span></p>}
                      {!user.vertical && !user.event && <span className="italic text-muted-foreground">None</span>}
                    </div>
                    <div className="col-span-2 text-right">
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        className="inline-flex focus:outline-none"
                      >
                        <Badge 
                          variant="outline" 
                          className={`cursor-pointer hover:opacity-80 transition-all ${
                            user.isActive 
                              ? 'border-success/50 text-success bg-success/10' 
                              : 'border-danger/50 text-danger bg-danger/10'
                          }`}
                        >
                          {user.isActive ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                          {user.isActive ? "Active" : "Suspended"}
                        </Badge>
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
