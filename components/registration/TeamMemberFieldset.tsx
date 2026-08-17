"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TeamMemberInfo } from "@/lib/validations/registration.schema";

export interface TeamMemberFieldsetProps {
  index: number;
  value: TeamMemberInfo;
  onChange: (index: number, field: keyof TeamMemberInfo, value: string | boolean) => void;
  disabled?: boolean;
  label?: string;
  /** Hide college/city inputs — used in the contingent wizard, where both are captured once up front and auto-applied to every member. */
  hideCollegeCity?: boolean;
}

/**
 * One competitor's full detail block — every field is mandatory. Used
 * identically for a 1-person event's sole competitor and every slot in a
 * 3- or 4-person team, so there's exactly one code path for roster data
 * across the whole registration flow.
 */
export function TeamMemberFieldset({ index, value, onChange, disabled, label, hideCollegeCity }: TeamMemberFieldsetProps) {
  const set = (field: keyof TeamMemberInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(index, field, e.target.value);

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
        {label ?? `Competitor ${index + 1}`}
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor={`member-${index}-name`}>Full Name</Label>
          <Input
            id={`member-${index}-name`}
            placeholder="As per college ID"
            value={value.name}
            onChange={set("name")}
            disabled={disabled}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`member-${index}-regno`}>Register Number</Label>
          <Input
            id={`member-${index}-regno`}
            placeholder="As printed on your college ID"
            value={value.registerNumber}
            onChange={set("registerNumber")}
            disabled={disabled}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`member-${index}-email`}>Email</Label>
          <Input
            id={`member-${index}-email`}
            type="email"
            placeholder="name@college.edu"
            value={value.email}
            onChange={set("email")}
            disabled={disabled}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`member-${index}-phone`}>Phone</Label>
          <Input
            id={`member-${index}-phone`}
            placeholder="+91..."
            value={value.phone}
            onChange={set("phone")}
            disabled={disabled}
            required
          />
        </div>
        {!hideCollegeCity && (
          <>
            <div className="space-y-1">
              <Label htmlFor={`member-${index}-college`}>College</Label>
              <Input
                id={`member-${index}-college`}
                placeholder="e.g. IIM Bangalore"
                value={value.college}
                onChange={set("college")}
                disabled={disabled}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`member-${index}-city`}>City</Label>
              <Input
                id={`member-${index}-city`}
                placeholder="e.g. Bengaluru"
                value={value.city}
                onChange={set("city")}
                disabled={disabled}
                required
              />
            </div>
          </>
        )}
        <div className="space-y-1">
          <Label htmlFor={`member-${index}-year`}>Year</Label>
          <Select
            value={value.year}
            onValueChange={(v) => onChange(index, "year", v)}
            disabled={disabled}
          >
            <SelectTrigger id={`member-${index}-year`}>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FIRST_YEAR">First Year</SelectItem>
              <SelectItem value="SECOND_YEAR">Second Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Needs Accommodation?</Label>
          <div className="flex items-center gap-2 h-10">
            <Switch
              checked={value.accommodationRequested}
              onCheckedChange={(checked) => onChange(index, "accommodationRequested", checked)}
              disabled={disabled}
            />
            <span className="text-sm text-muted-foreground">
              {value.accommodationRequested ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function emptyTeamMember(): TeamMemberInfo {
  return {
    name: "",
    registerNumber: "",
    email: "",
    phone: "",
    college: "",
    city: "",
    year: "FIRST_YEAR",
    accommodationRequested: false,
  };
}

export function isTeamMemberComplete(m: TeamMemberInfo): boolean {
  return Boolean(
    m.name.trim() &&
    m.registerNumber.trim() &&
    m.email.trim() &&
    m.phone.trim() &&
    m.college.trim() &&
    m.city.trim() &&
    m.year
  );
}
