"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  User, Mail, Phone, School, Image, ArrowLeft, 
  Check, Loader2, AlertCircle, ShieldAlert 
} from "lucide-react";
import { StarryBackground } from "@/components/StarryBackground";
import LoadingAnimation from "@/components/shared/LoadingAnimation";

const PRESET_AVATARS = [
  { name: "Orion", url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=150&q=80" },
  { name: "Andromeda", url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=150&q=80" },
  { name: "Pegasus", url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=150&q=80" },
  { name: "Cassiopeia", url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=150&q=80" },
];

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [college, setCollege] = React.useState("");
  const [profilePictureUrl, setProfilePictureUrl] = React.useState("");

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Load current user profile details
  React.useEffect(() => {
    async function loadProfile() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/v1/users/${session.user.id}`);
        if (res.ok) {
          const json = await res.json();
          const u = json.data;
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setCollege(u.college || "");
          setProfilePictureUrl(u.profilePictureUrl || "");
        }
      } catch (err) {
        console.error("Failed to load profile details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (session) {
      loadProfile();
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate profile picture URL if entered
      if (profilePictureUrl && !profilePictureUrl.startsWith("http")) {
        setError("Profile picture must be a valid HTTP/HTTPS URL");
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/v1/users/${session.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          college: college || null,
          profilePictureUrl: profilePictureUrl || null,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setSuccess(true);
        // Force refresh session tokens
        await updateSession();
      } else {
        setError(json.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to communicate with server");
    } finally {
      setSaving(false);
    }
  };

  const getBackPath = () => {
    if (!session?.user?.role) return "/login";
    if (session.user.role === "PARTICIPANT") return "/dashboard";
    if (session.user.role === "ADMIN") return "/admin";
    return "/organiser";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center relative overflow-hidden">
        <StarryBackground />
        <LoadingAnimation message="Syncing profile details..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-4">
      <StarryBackground />
      
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full filter blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Navigation */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push(getBackPath())}
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="glass border-white/10 shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-indigo-950/20 py-8">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Profile Avatar Frame */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-500/50 flex items-center justify-center overflow-hidden shadow-lg">
                  {profilePictureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={profilePictureUrl} 
                      alt={name} 
                      className="w-full h-full object-cover animate-fade-in"
                    />
                  ) : (
                    <User className="w-10 h-10 text-indigo-400" />
                  )}
                </div>
              </div>

              <div className="text-center sm:text-left space-y-1">
                <CardTitle className="text-2xl font-bold">{name}</CardTitle>
                <CardDescription className="flex items-center justify-center sm:justify-start gap-2">
                  <span>{email}</span>
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 capitalize bg-indigo-500/5 font-semibold text-[10px]">
                    {session?.user?.role?.toLowerCase()}
                  </Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger text-sm p-3 rounded-md flex items-center gap-2 mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-success/10 border border-success/20 text-success text-sm p-3 rounded-md flex items-center gap-2 mb-6">
                <Check className="w-4 h-4 shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* Read Only Details Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Account Details (Locked)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Full Name
                    </label>
                    <Input 
                      disabled
                      value={name}
                      className="bg-white/[0.02] border-white/5 text-muted-foreground cursor-not-allowed select-none text-sm h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Phone Number
                    </label>
                    <Input 
                      disabled
                      value={phone}
                      className="bg-white/[0.02] border-white/5 text-muted-foreground cursor-not-allowed select-none text-sm h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <Input 
                    disabled
                    value={email}
                    className="bg-white/[0.02] border-white/5 text-muted-foreground cursor-not-allowed select-none text-sm h-10"
                  />
                </div>
              </div>

              {/* Editable Fields Section */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Personal Information (Editable)</h4>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5" /> College Name
                  </label>
                  <Input 
                    placeholder="Enter your college/university name"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="bg-background/50 border-white/10 text-sm h-10 focus:border-indigo-500/50"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5" /> Profile Picture URL
                  </label>
                  <Input 
                    placeholder="Enter custom image URL (https://...)"
                    value={profilePictureUrl}
                    onChange={(e) => setProfilePictureUrl(e.target.value)}
                    className="bg-background/50 border-white/10 text-sm h-10 focus:border-indigo-500/50"
                  />
                  
                  {/* Preset Avatar Selection */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Or select a celestial theme preset:</p>
                    <div className="grid grid-cols-4 gap-3">
                      {PRESET_AVATARS.map((avatar) => {
                        const isSelected = profilePictureUrl === avatar.url;
                        return (
                          <button
                            key={avatar.name}
                            type="button"
                            onClick={() => setProfilePictureUrl(avatar.url)}
                            className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group shrink-0 ${
                              isSelected 
                                ? "border-indigo-500 scale-95 shadow-[0_0_15px_rgba(79,70,229,0.4)]" 
                                : "border-white/10 hover:border-white/30"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={avatar.url} 
                              alt={avatar.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-[8px] text-center font-medium truncate">
                              {avatar.name}
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_20px_rgba(79,70,229,0.3)] h-11 text-sm font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving Changes...
                    </>
                  ) : "Save Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 h-11 text-sm"
                  onClick={() => router.push(getBackPath())}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
